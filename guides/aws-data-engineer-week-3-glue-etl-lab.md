# Week 3 Lab: Glue ETL, Parquet, and Schema Evolution

Goal: run one small, on-demand AWS Glue Spark ETL job that reads the Week 2 cataloged S3 data, applies a typed transformation, writes Parquet, and exposes the result to Athena. Then perform an isolated schema-evolution exercise without corrupting the main table.

Related files:

- [AWS Data Engineer Study Plan](aws-data-engineer-study-plan.md)
- [Week 2 Glue and Athena Lab](aws-data-engineer-week-2-glue-athena-lab.md)
- [DEA-C01 Blueprint](aws-dea-c01-blueprint.md)

## What this lab teaches

- AWS Glue Studio is a visual interface over Glue's serverless Spark ETL engine.
- A Glue job assumes an IAM role and needs explicit source, target, catalog, and temporary-S3 permissions.
- G.1X is the general-purpose starting worker type for standard transforms; worker size is a cost and performance decision.
- Glue can write Parquet and update the Glue Data Catalog for downstream Athena queries.
- Job bookmarks, schema contracts, and isolated versioned inputs help make batch pipelines rerunnable and safe to evolve.

Official references:

- Glue Studio visual ETL: https://docs.aws.amazon.com/glue/latest/dg/edit-nodes-chapter.html
- Glue ETL IAM permissions: https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html
- Glue worker types: https://docs.aws.amazon.com/glue/latest/dg/worker-types.html
- Glue pricing: https://aws.amazon.com/glue/pricing/
- Glue job bookmarks: https://docs.aws.amazon.com/glue/latest/dg/monitor-continuations.html
- Glue S3 connections: https://docs.aws.amazon.com/glue/latest/dg/aws-glue-programming-etl-connect-s3-home.html

## Cost and safety boundaries

- Run the job on demand only. Do not create a schedule or development endpoint.
- Use the smallest available general-purpose worker configuration, normally G.1X with the minimum worker count the console allows.
- Set a short job timeout, such as 10 minutes, so a misconfiguration does not run indefinitely.
- Run the main job once. Run the bookmark comparison only if the first run is successful and the budget is healthy.
- Do not place the job in a VPC for this S3-only exercise; unnecessary networking can introduce additional resources and failure modes.
- Do not use a customer-managed KMS key in this lab. Week 8 covers KMS explicitly.
- Keep the input and output prefixes tiny and separate.

Glue ETL jobs are billed by DPU time. AWS documents G.1X as 1 DPU with 4 vCPUs, 16 GB memory, and 94 GB disk, and Glue pricing is billed by the second with a one-minute minimum. Check the current regional price before running the job.

## Preconditions

- [ ] Week 2 crawler created a catalog table, such as `aws_de_learning.events`.
- [ ] Athena can query the Week 2 table.
- [ ] The Week 1/2 S3 bucket is still available.
- [ ] Free Tier alerts and the cost budget are active.
- [ ] You know the exact S3 bucket name, Region, database, and source table name.

If you do not have an AWS account, use an AWS Skill Builder/Builder Labs sandbox for this exercise. Do not launch a Glue job in an account whose billing status is unknown.

## Part A — Prepare a small schema-evolution input

Keep the main Week 2 source untouched. Stage a separate versioned prefix with an optional column:

```bash
export AWS_REGION=us-east-1  # replace with the exact Region used by the bucket
export BUCKET="replace-with-the-exact-learning-bucket-name"

printf 'event_id,amount\n201,8.00\n' > /tmp/events-v1.csv
printf 'event_id,amount,source_system\n202,9.50,web\n' > /tmp/events-v2.csv

aws s3 cp /tmp/events-v1.csv "s3://$BUCKET/raw/events_evolution/version=v1/events.csv"
aws s3 cp /tmp/events-v2.csv "s3://$BUCKET/raw/events_evolution/version=v2/events.csv"
aws s3 ls "s3://$BUCKET/raw/events_evolution/" --recursive
```

Do not point the production-like crawler or ETL job at both versions yet. The two files intentionally have incompatible schemas so that you can reason about contract management rather than silently accepting a crawler's inference.

## Part B — Create the Glue Studio job

Open **AWS Glue Studio → ETL jobs → Visual ETL** in the same Region as the S3 bucket.

1. Create a job named `aws-de-learning-events-etl`.
2. Add an S3/Glue Data Catalog source and select the Week 2 database and source table.
3. Inspect the inferred columns and types before adding transformations.
4. Add a **Change Schema** or equivalent mapping transform:
   - Cast `event_id` to a whole-number type.
   - Cast `amount` to `double`.
   - Preserve the partition column `event_date`.
5. Add an S3 target.
6. Choose Parquet with Snappy compression if the console exposes the option.
7. Set the target path to `s3://<BUCKET_NAME>/curated/glue_events/`.
8. Enable catalog update for the target and use the `aws_de_learning` database.
9. Name the target table `events_glue_curated`.
10. Choose an IAM role whose name begins with `AWSGlueServiceRole` and whose permissions cover the source, target, Glue metadata, and the job's temporary directory.
11. In job details, use the smallest available G worker type and worker count.
12. Set a short timeout, leave scheduling disabled, and save the job.

The Glue job role is not the same as the human administrator identity. The human starts the job; the Glue service assumes the job role while reading and writing data.

## Part C — Inspect before running

Before the first run, inspect the generated script. Save a copy without credentials or account secrets. Look for:

- The Glue context and source table reference.
- The `transformation_ctx` values, which support job bookmarks in generated scripts.
- The mapping or type-cast logic.
- The S3 target path and Parquet format.
- The catalog-update settings.
- The temporary directory.

Write a short explanation of the difference between:

- A DynamicFrame and a Spark DataFrame.
- The human identity that starts the job and the service role that executes it.
- A catalog table and the underlying S3 objects.

## Part D — Run and validate the job

Run the job once on demand. Record:

- Job run ID and final status.
- Start/end time and duration.
- Worker type and worker count.
- DPU seconds or billed capacity shown by the console, if available.
- CloudWatch log group and any warnings.

Verify in S3 that Parquet objects exist under `curated/glue_events/`. In Athena, refresh the `aws_de_learning` database and query the new table:

```sql
DESCRIBE aws_de_learning.events_glue_curated;

SELECT event_date, COUNT(*) AS event_count, SUM(amount) AS total_amount
FROM aws_de_learning.events_glue_curated
GROUP BY event_date
ORDER BY event_date;
```

Compare the result with the Week 2 CTAS output. Explain when you would prefer Glue ETL over Athena CTAS: for example, reusable multi-step transformations, joins, data-quality logic, scheduling/orchestration, or integration with other sources.

## Part E — Job-bookmark exercise

Only do this after the first run succeeds and the cost budget is healthy.

1. Enable job bookmarks in the job settings if the console exposes the option.
2. Run the job a second time without changing the input.
3. Compare the second run's input/output behavior and logs with the first run.
4. Add one new partition to the original input path, not to `events_evolution`.
5. Run the job again and determine whether only new input was processed.
6. Record the assumptions and limitations of the bookmark behavior.

Do not treat bookmarks as a universal exactly-once guarantee. They are stateful processing assistance; correctness still requires idempotent targets, stable source paths, and an explicit replay strategy.

## Part F — Schema-evolution decision exercise

Create two isolated catalog tables for the `events_evolution/version=v1/` and `events_evolution/version=v2/` prefixes, or inspect them manually in Glue. Compare:

- Which column was added.
- Whether the new column is nullable/optional.
- Whether old consumers can ignore it safely.
- Whether downstream table schemas and Glue mappings need a version update.
- Whether a crawler should be allowed to update the existing table automatically.

Choose and document one strategy:

- **Compatible additive change:** add a nullable column and update the contract.
- **Versioned table:** expose v1 and v2 separately and migrate consumers deliberately.
- **Normalization step:** map both inputs to a stable curated schema, filling missing values explicitly.
- **Reject/quarantine:** route incompatible records to a quarantine prefix and alert the operator.

The key exam lesson is that schema discovery is not the same as schema governance. A crawler can infer metadata; it does not decide whether a change is safe for every consumer.

## Evidence checklist

- [ ] Source table and input/output S3 paths recorded.
- [ ] Glue job role and permissions documented.
- [ ] Worker type, worker count, timeout, and job version recorded.
- [ ] Generated script inspected without credentials.
- [ ] One successful ETL run recorded with duration and capacity metrics.
- [ ] Curated Parquet table queried from Athena.
- [ ] Job bookmark behavior tested or explicitly deferred with a reason.
- [ ] v1/v2 schema-evolution decision documented.
- [ ] CloudWatch log group and troubleshooting notes saved.
- [ ] Temporary input/output objects and jobs cleaned up or intentionally retained.

## Cleanup

If continuing to Week 4, keep the curated table and output prefix as the warehouse input. Otherwise:

1. Delete the Glue job.
2. Delete the `events_evolution/` prefix.
3. Delete the `curated/glue_events/` prefix if it is not needed.
4. Delete temporary Glue scripts and logs after saving evidence.
5. Delete the Glue job IAM role only if it was created solely for this lab and has no other trusted workload.
6. Confirm no schedule, development endpoint, notebook session, or VPC connection remains.

## No-account fallback

Before account access is available, complete the same reasoning exercise with the official Glue Studio documentation and a local Spark/Pandas transformation:

- Read CSV input.
- Cast `amount` to a numeric type.
- Add or preserve `event_date` as a partition column.
- Write Parquet with Snappy compression.
- Compare v1/v2 schemas and choose a compatibility strategy.
- Write down which steps are local substitutes and which AWS-specific behaviors still require a sandbox.

This fallback builds the transformation logic but does not count as AWS hands-on evidence; replace it with a Skill Builder sandbox or real AWS run later.

## Week 3 check-in

```text
Week: 3
Hours studied:
AWS account status (new/existing/unknown):
Source table:
Glue job name:
Job run status and duration:
Worker type/count:
DPU seconds or capacity metric:
Curated table:
Bookmark test: completed/deferred
Schema-evolution strategy:
Most important Glue lesson:
What broke:
Evidence saved:
Cleanup path: continued / finished
Confidence (1–5):
Next commitment:
```
