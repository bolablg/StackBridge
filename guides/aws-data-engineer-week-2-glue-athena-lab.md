# Week 2 Lab: Glue Data Catalog and Athena

Goal: turn the Week 1 S3 landing zone into a queryable technical data catalog, learn partition discovery, and create a small Parquet-curated layer with Athena.

Related files:

- [AWS Data Engineer Study Plan](aws-data-engineer-study-plan.md)
- [Week 1 Secure S3 Lab](aws-data-engineer-week-1-lab.md)
- [DEA-C01 Blueprint](aws-dea-c01-blueprint.md)

## What this lab teaches

- S3 stores the data; the Glue Data Catalog stores table and schema metadata.
- Glue crawlers infer schemas and can register Hive-style partitions.
- Athena queries S3 through catalog metadata and writes query results back to S3.
- Partitioning and columnar formats reduce the data scanned by analytical queries.
- Workgroups can centralize query-result locations and data-usage controls.

Official references:

- Glue Data Catalog: https://docs.aws.amazon.com/glue/latest/dg/start-data-catalog.html
- Glue crawlers: https://docs.aws.amazon.com/glue/latest/dg/tutorial-add-crawler.html
- Athena and Glue Data Catalog: https://docs.aws.amazon.com/athena/latest/ug/data-sources-glue.html
- Athena query results: https://docs.aws.amazon.com/athena/latest/ug/query-results-specify-location-console.html
- Athena partitioning: https://docs.aws.amazon.com/athena/latest/ug/partitions.html
- Athena columnar formats: https://docs.aws.amazon.com/athena/latest/ug/columnar-storage.html
- Athena pricing: https://aws.amazon.com/athena/pricing/
- Glue pricing: https://aws.amazon.com/glue/pricing/

## Cost and safety boundaries

- Use only the small Week 1 CSV files and two tiny partition files.
- Run the crawler on demand; do not create a schedule.
- Set an Athena workgroup query-data limit if the console offers it. Use a conservative limit such as 100 MB per query and 1 GB per day for this lab.
- Store query results under an expiring S3 prefix such as `athena-results/`.
- Do not use `SELECT *` against a large dataset or a broad S3 prefix.
- Do not place different schemas under the same crawler include path.
- Do not run Glue ETL, EMR, Redshift, or Lake Formation configuration in this lab; those are later milestones.

Athena charges according to data scanned, and query results are stored in S3. Glue crawlers have separate charges. The dataset is tiny, but the cost controls are part of the learning objective.

## Preconditions

- [ ] Week 0 account safety is complete.
- [ ] Week 1 S3 bucket exists and contains `raw/week1-events.csv`.
- [ ] CloudShell works with the non-root identity.
- [ ] `BUCKET` is set to the exact Week 1 bucket name.
- [ ] `AWS_REGION` is set to the bucket's Region.

In CloudShell, set the variables if the previous session has expired:

```bash
export AWS_REGION=us-east-1
export BUCKET="replace-with-the-exact-week1-bucket-name"
aws s3api head-bucket --bucket "$BUCKET"
```

Do not continue if `head-bucket` fails or if the bucket name is not yours.

## Part A — Stage Hive-style partitioned data

The partition column is represented in the S3 path as `event_date=YYYY-MM-DD`. The CSV files do not repeat the partition column; the catalog supplies it as virtual metadata.

```bash
printf 'event_id,amount\n101,10.50\n102,7.25\n' > /tmp/events-2026-01-01.csv
printf 'event_id,amount\n103,12.00\n104,4.75\n' > /tmp/events-2026-01-02.csv

aws s3 cp /tmp/events-2026-01-01.csv "s3://$BUCKET/raw/events/event_date=2026-01-01/events.csv"
aws s3 cp /tmp/events-2026-01-02.csv "s3://$BUCKET/raw/events/event_date=2026-01-02/events.csv"
aws s3 ls "s3://$BUCKET/raw/events/" --recursive
```

The crawler path must end at `raw/events/`, not at the bucket root or the broader `raw/` prefix. A crawler include path should represent one table schema.

## Part B — Create and run a Glue crawler

Use the AWS Glue console in the same Region as the S3 bucket.

1. Open **AWS Glue → Crawlers → Create crawler**.
2. Name it `aws-de-learning-events-crawler`.
3. Choose an S3 data source.
4. Set the include path to `s3://<BUCKET_NAME>/raw/events/`.
5. Choose **Run on demand**; do not create a schedule.
6. Create or choose a Glue crawler IAM role with access to the specified S3 path and the Glue Data Catalog.
7. Create a database named `aws_de_learning`.
8. Leave table prefix empty or use `events_` if the console requires a prefix.
9. Review and create the crawler.
10. Run it once and wait for the status to become `Ready`.

The crawler should create a table representing the event files and discover `event_date` as a partition. Inspect the table's schema, location, classification, and partitions in the Glue console.

If the crawler creates an unexpected table or schema, do not immediately broaden permissions. First check the include path, file headers, mixed schemas, and crawler role. AWS notes that crawlers can occasionally assign metadata incorrectly; record the correction in your evidence.

## Part C — Configure Athena query results and a workgroup

Athena needs a query-result location unless you use managed query results. For this lab, use an S3 prefix so you can learn retention, encryption, and permissions.

1. Open **Amazon Athena** in the bucket's Region.
2. Create a workgroup named `aws-de-learning` or select the existing `primary` workgroup if account restrictions prevent creating one.
3. Set the query-result location to `s3://<BUCKET_NAME>/athena-results/`.
4. If available, enable the setting that overrides client-side query-result settings.
5. If available, set a per-query data-scanned limit of 100 MB and a daily aggregate limit of 1 GB.
6. Use SSE-S3 encryption for query results.
7. Add an S3 lifecycle rule for the `athena-results/` prefix to expire results after seven days. Use the S3 console so that you do not overwrite the Week 1 lifecycle configuration.

Save the workgroup name and result path. Athena writes output for successful, failed, and sometimes partial queries, so the result prefix needs a cleanup policy.

## Part D — Query the cataloged table

In the Athena query editor, choose the correct workgroup and database. Replace `<TABLE_NAME>` with the table name created by the crawler.

```sql
SHOW TABLES IN aws_de_learning;

DESCRIBE aws_de_learning.<TABLE_NAME>;

SHOW PARTITIONS aws_de_learning.<TABLE_NAME>;

SELECT event_date, COUNT(*) AS event_count, SUM(amount) AS total_amount
FROM aws_de_learning.<TABLE_NAME>
WHERE event_date = '2026-01-01'
GROUP BY event_date;

SELECT event_date, AVG(amount) AS average_amount
FROM aws_de_learning.<TABLE_NAME>
GROUP BY event_date
ORDER BY event_date;
```

Record the query ID, status, execution time, and data scanned shown by Athena. On a tiny dataset, the billed minimum or fixed overhead may dominate; the purpose is to learn where the metric is shown and how the query shape affects scanning.

## Part E — Create a Parquet curated table with CTAS

This is a small transformation exercise. The target prefix must be empty before the query starts. If a previous attempt partially wrote data, remove only that exact target prefix before retrying.

```sql
CREATE TABLE aws_de_learning.events_parquet
WITH (
  format = 'PARQUET',
  external_location = 's3://<BUCKET_NAME>/curated/events_parquet/',
  partitioned_by = ARRAY['event_date']
)
AS
SELECT event_id, amount, event_date
FROM aws_de_learning.<TABLE_NAME>;
```

The partition column is deliberately last in the `SELECT` list, as required for this CTAS form. Verify that the new table points to the curated S3 location and that Parquet objects exist underneath Hive-style partition paths.

Query the curated table:

```sql
SELECT event_date, COUNT(*) AS event_count, SUM(amount) AS total_amount
FROM aws_de_learning.events_parquet
WHERE event_date = '2026-01-02'
GROUP BY event_date;
```

Compare the raw CSV and curated Parquet table conceptually:

- CSV is row-oriented and typically scans more data for column-selective queries.
- Parquet is columnar, compressed, splittable, and supports predicate pushdown.
- Partition pruning works only when the query filters the partition key correctly.
- Over-partitioning and many tiny files can hurt performance, so partition design is workload-driven.

## Part F — Evidence checklist

- [ ] Two Hive-style partition paths staged in S3.
- [ ] Glue database and crawler created.
- [ ] Crawler role and its S3/catalog permissions documented.
- [ ] Table schema and discovered partitions inspected.
- [ ] Athena workgroup/result location recorded.
- [ ] Data-scanned metrics captured for at least two queries.
- [ ] Raw-to-Parquet CTAS completed and verified.
- [ ] A note explains why the crawler path is scoped to one schema.
- [ ] A note compares Glue Data Catalog to a GCP catalog/data-governance service.
- [ ] Query results and temporary curated objects cleaned up, or explicitly retained for Week 3.

## Cleanup

Choose one path.

### Continue to Week 3

Keep the raw partitioned files, catalog database, and Parquet table. Delete only temporary Athena results after saving evidence.

### Finish the lab

1. In Athena, drop the temporary tables if they are no longer needed. Dropping a table removes catalog metadata, not the S3 data.
2. Delete `s3://<BUCKET_NAME>/athena-results/`.
3. Delete `s3://<BUCKET_NAME>/curated/events_parquet/`.
4. Delete the crawler.
5. Delete the crawler IAM role only if it was created solely for this lab and has no other trusted workload.
6. Delete the `aws_de_learning` database if it is no longer needed.
7. Confirm the Glue crawler is not scheduled and no other compute service was created.

Do not delete the entire Week 1 bucket unless you are intentionally closing the lab environment.

## Week 2 check-in

```text
Week: 2
Hours studied:
AWS account status (new/existing/unknown):
Glue database:
Crawler name and status:
Table discovered:
Partitions discovered:
Athena workgroup/result location:
Queries completed:
Data scanned observed:
Parquet CTAS completed: yes/no
Most important catalog or partitioning lesson:
What broke:
Evidence saved:
Cleanup path: continued / finished
Confidence (1–5):
Next commitment:
```
