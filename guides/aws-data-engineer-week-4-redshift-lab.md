# Week 4 — Amazon Redshift Serverless lab

This lab is the first direct Redshift exercise in the AWS learning path. It is deliberately small and reversible:

`S3 CSV → Redshift Serverless COPY → warehouse tables → UNLOAD to S3`

The optional final section connects Redshift to the AWS Glue Data Catalog so you can compare a managed warehouse table with an external table over S3.

## What you will learn

- The Redshift Serverless namespace/workgroup model.
- How a Redshift service role authorizes `COPY`, `UNLOAD`, and external-schema access to S3/Glue.
- How `COPY` loads a table from an S3 prefix and how `NOLOAD` validates a load first.
- Basic warehouse modeling: a fact table, a dimension table, automatic distribution, and a date sort key.
- How Redshift reads external lake data through a Glue/Athena catalog.
- How Redshift exports a query result as Parquet to S3.
- The practical difference between Athena/S3 external queries and data loaded into Redshift-managed storage.
- How to shut down the lab and verify that no Redshift resources remain.

## Important account and cost gate

Do not create the Redshift workgroup until all of these are true:

- You know which AWS account and Region you are using.
- Week 0 billing alerts/budgets are active.
- You have confirmed that this account has not already used the Redshift Serverless trial, if you intend to rely on that trial.
- The Week 3 Glue output exists, or you have consciously chosen the no-account fallback below.
- You have a 30–60 minute uninterrupted block to run the lab and delete the resources afterward.

Amazon Redshift Serverless has a separate trial for eligible accounts: AWS currently documents a $300 credit that expires after 90 days. This is separate from the general AWS Free Tier and is not a promise of zero cost after the credit is consumed or expires. Check the current [Redshift pricing page](https://aws.amazon.com/redshift/pricing/) immediately before activating it.

For this lab, use the smallest available base capacity—4 RPUs where the Region supports it, otherwise 8 RPUs—and set a low Redshift Serverless usage limit with a protective action. The current [capacity guidance](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-capacity.html) documents the 4-RPU minimum in supported Regions, and the [Serverless console guide](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-console.html) documents usage limits that can alert, log, or turn off user queries.

Do not create a provisioned Redshift cluster, NAT Gateway, new VPC, or customer-managed KMS key for this lab.

## Official references

- [Getting started with Redshift Serverless](https://docs.aws.amazon.com/redshift/latest/gsg/new-user-serverless.html)
- [Redshift Serverless namespace and workgroup](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-workgroup-namespace.html)
- [Getting started with IAM credentials for Redshift](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-iam-credentials.html)
- [Redshift access to other AWS resources](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-security-other-services.html)
- [COPY from Amazon S3](https://docs.aws.amazon.com/redshift/latest/dg/t_loading-tables-from-s3.html)
- [UNLOAD to Amazon S3](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html)
- [CREATE EXTERNAL SCHEMA](https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html)
- [CREATE TABLE, distribution, and sort keys](https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_TABLE_NEW.html)

## Prerequisites

You need:

- The Week 1 S3 bucket.
- CloudShell or the AWS CLI.
- Permission to create/manage a Redshift Serverless namespace and workgroup.
- Permission to create/associate one Redshift S3-access role.
- The Week 2 Glue database `aws_de_learning` and, ideally, the Week 3 table `events_glue_curated`.

If your bucket or database has a different name, substitute the actual values everywhere below. Do not guess them.

Set variables in CloudShell. Use the exact Region from your earlier labs:

```bash
export AWS_REGION=us-east-1  # replace with your exact Region
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
export BUCKET_NAME="aws-de-learning-${AWS_ACCOUNT_ID}-${AWS_REGION}"
export REDSHIFT_S3_ROLE_ARN="<fill-after-role-is-created>"

aws sts get-caller-identity
aws s3 ls "s3://${BUCKET_NAME}/"
```

If `aws sts get-caller-identity` or the S3 listing fails, stop and fix identity/Region/bucket issues before creating Redshift resources.

## Part 1 — Stage a tiny CSV in S3

This file is intentionally small. The goal is to learn the loading path and warehouse behavior, not to benchmark Redshift.

```bash
TMP_ORDERS="$(mktemp)"
printf '%s\n' \
  'order_id,customer_id,order_date,amount,region' \
  '1001,101,2026-01-01,39.95,us-central' \
  '1002,102,2026-01-01,120.00,us-east' \
  '1003,101,2026-01-02,15.50,us-central' \
  '1004,103,2026-01-02,225.75,us-west' \
  '1005,104,2026-01-03,80.00,us-east' \
  '1006,102,2026-01-03,49.99,us-east' \
  '1007,105,2026-01-04,310.10,us-west' \
  '1008,101,2026-01-04,22.25,us-central' \
  '1009,106,2026-01-05,75.00,us-south' \
  '1010,104,2026-01-05,18.75,us-east' \
  > "${TMP_ORDERS}"

aws s3 cp "${TMP_ORDERS}" \
  "s3://${BUCKET_NAME}/redshift-lab/orders/orders.csv" \
  --sse AES256

rm -f "${TMP_ORDERS}"
aws s3 ls "s3://${BUCKET_NAME}/redshift-lab/orders/"
```

Evidence to capture: the S3 URI, object size, Region, and the command output showing the object exists.

## Part 2 — Create a narrowly scoped Redshift S3 role

Redshift needs its own service role to read the CSV and write the `UNLOAD` result. This is different from the IAM identity you use to open the AWS console or Query Editor v2.

Use the Redshift console's IAM-role creation flow if it is available. Name the lab-only role something like `aws-de-learning-redshift-s3`. Restrict it to the Week 4 prefixes. The role trust relationship must allow Redshift Serverless to assume it; AWS documents `redshift-serverless.amazonaws.com` as the service principal and also documents the Redshift service principal for shared Redshift access.

The permissions should be equivalent to the following. Replace `<BUCKET_NAME>` with the actual bucket. If you use the console's generated role, inspect the attached policy and narrow it to these lab prefixes afterward when practical.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListLabPrefixes",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<BUCKET_NAME>",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "redshift-lab/orders/*",
            "redshift-lab/unload/*"
          ]
        }
      }
    },
    {
      "Sid": "ReadBucketLocation",
      "Effect": "Allow",
      "Action": "s3:GetBucketLocation",
      "Resource": "arn:aws:s3:::<BUCKET_NAME>"
    },
    {
      "Sid": "ReadOrders",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<BUCKET_NAME>/redshift-lab/orders/*"
    },
    {
      "Sid": "WriteUnloadResults",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::<BUCKET_NAME>/redshift-lab/unload/*"
    }
  ]
}
```

The role trust relationship should include the Redshift Serverless service principal:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "redshift-serverless.amazonaws.com",
          "redshift.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

For a production policy, separate the list and object statements more precisely and include only the exact operations required by the chosen load/unload options. AWS's [COPY/UNLOAD permissions guidance](https://docs.aws.amazon.com/redshift/latest/dg/copy-usage_notes-access-permissions.html) requires S3 list/get permissions for `COPY` and list/get/put permissions for `UNLOAD`.

Copy the role ARN into the CloudShell variable:

```bash
export REDSHIFT_S3_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/<actual-role-name>"
printf '%s\n' "${REDSHIFT_S3_ROLE_ARN}"
```

Do not put an access key or secret key in a SQL statement. Use `IAM_ROLE`.

## Part 3 — Create one Redshift Serverless workgroup

1. Open the [Amazon Redshift console](https://console.aws.amazon.com/redshiftv2/), in the same Region as the S3 bucket.
2. Choose **Serverless** and start the create/get-started flow.
3. Create a lab-only namespace such as `aws_de_learning` and workgroup such as `aws-de-learning-rs`.
4. Use the default database suggested by the console, or use `dev`. Record the actual database name.
5. Choose the smallest available base capacity: 4 RPUs where available, otherwise 8 RPUs.
6. Associate `REDSHIFT_S3_ROLE_ARN` with the workgroup and make it the default role if the console asks.
7. Keep the default encryption setting. Do not create a customer-managed KMS key for this lab.
8. Use the default VPC/subnet selection. Do not create a new VPC, NAT Gateway, or VPC endpoint for this exercise.
9. In **Limits**, set a low usage limit. Use an alert first; if the console permits a second threshold, set the later threshold to turn off user queries. Record the limit and action.
10. Wait until the workgroup is available before opening Query Editor v2.

A Serverless namespace holds database objects, users, and managed storage; its workgroup provides the compute endpoint and networking. AWS explains this separation in the [namespace/workgroup documentation](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-workgroup-namespace.html).

Record:

```text
Account:
Region:
Namespace:
Workgroup:
Database:
Base capacity:
Usage limit and action:
Redshift S3 role ARN:
Created at:
```

## Part 4 — Connect with Query Editor v2

Open Query Editor v2 from the Redshift console and select the new workgroup/database. Prefer IAM or temporary credentials when the console offers that option. If the console requires database credentials, use a lab-only password stored in your password manager; never put it in this Markdown file, shell history, or a screenshot.

The [Redshift IAM credentials guide](https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-iam-credentials.html) describes the first-time Serverless setup and Query Editor v2 connection flow.

Run the following statements one at a time. Replace `<REDSHIFT_S3_ROLE_ARN>` in the `COPY` statement with the actual ARN. Redshift SQL string literals use single quotes.

### 4.1 Create the warehouse tables

```sql
CREATE SCHEMA IF NOT EXISTS analytics;

DROP TABLE IF EXISTS analytics.fact_orders;
DROP TABLE IF EXISTS analytics.dim_customer;
DROP TABLE IF EXISTS analytics.orders;

CREATE TABLE analytics.orders (
  order_id BIGINT,
  customer_id BIGINT,
  order_date DATE,
  amount DECIMAL(12,2),
  region VARCHAR(32)
)
DISTSTYLE AUTO
SORTKEY (order_date)
ENCODE AUTO;
```

The table deliberately uses `DISTSTYLE AUTO` and a date sort key. Redshift can manage distribution automatically, while the date sort key makes the time-filtering rationale visible. The [CREATE TABLE reference](https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_TABLE_NEW.html) documents these table attributes.

### 4.2 Validate the S3 load without inserting rows

```sql
COPY analytics.orders
FROM 's3://<BUCKET_NAME>/redshift-lab/orders/'
IAM_ROLE '<REDSHIFT_S3_ROLE_ARN>'
CSV
IGNOREHEADER 1
DATEFORMAT 'auto'
NOLOAD;
```

`NOLOAD` checks the input and authorization path without loading data. AWS documents `COPY` with an S3 prefix and the preferred `IAM_ROLE` authorization in the [COPY guide](https://docs.aws.amazon.com/redshift/latest/dg/t_loading-tables-from-s3.html).

If the S3 bucket is in a different Region from Redshift, add `REGION '<AWS_REGION>'`. Keeping both services in the same Region is simpler and avoids unnecessary data-transfer complexity.

### 4.3 Load the rows

```sql
COPY analytics.orders
FROM 's3://<BUCKET_NAME>/redshift-lab/orders/'
IAM_ROLE '<REDSHIFT_S3_ROLE_ARN>'
CSV
IGNOREHEADER 1
DATEFORMAT 'auto';
```

Validate the result:

```sql
SELECT COUNT(*) AS row_count,
       MIN(order_date) AS first_order_date,
       MAX(order_date) AS last_order_date,
       SUM(amount) AS total_amount
FROM analytics.orders;

SELECT region,
       COUNT(*) AS order_count,
       SUM(amount) AS revenue
FROM analytics.orders
GROUP BY region
ORDER BY region;
```

Expected row count: 10. Capture the query results and query duration.

### 4.4 Build a small star-schema shape

Create one dimension and one fact table. This is intentionally simple; the point is to practice the warehouse modeling decision, not to create a production model.

```sql
CREATE TABLE analytics.dim_customer (
  customer_id BIGINT
)
DISTSTYLE AUTO
SORTKEY (customer_id)
ENCODE AUTO;

INSERT INTO analytics.dim_customer (customer_id)
SELECT DISTINCT customer_id
FROM analytics.orders;

CREATE TABLE analytics.fact_orders (
  order_id BIGINT,
  customer_id BIGINT,
  order_date DATE,
  amount DECIMAL(12,2),
  region VARCHAR(32)
)
DISTSTYLE AUTO
SORTKEY (order_date)
ENCODE AUTO;

INSERT INTO analytics.fact_orders
SELECT order_id, customer_id, order_date, amount, region
FROM analytics.orders;

SELECT d.customer_id,
       COUNT(f.order_id) AS order_count,
       SUM(f.amount) AS customer_revenue
FROM analytics.dim_customer AS d
JOIN analytics.fact_orders AS f
  ON f.customer_id = d.customer_id
GROUP BY d.customer_id
ORDER BY d.customer_id;
```

Write down the reasoning:

```text
Fact table:
Dimension table:
Chosen sort key and why:
Why DISTSTYLE AUTO is reasonable for this tiny first model:
What you would revisit at production scale:
```

### 4.5 Export a result to Parquet with UNLOAD

Use a dedicated output prefix. `ALLOWOVERWRITE` makes this small exercise repeatable; do not combine it with `CLEANPATH`.

```sql
UNLOAD ('
  SELECT region,
         COUNT(*) AS order_count,
         SUM(amount) AS revenue
  FROM analytics.fact_orders
  GROUP BY region
  ORDER BY region
')
TO 's3://<BUCKET_NAME>/redshift-lab/unload/orders_summary_'
IAM_ROLE '<REDSHIFT_S3_ROLE_ARN>'
FORMAT AS PARQUET
ALLOWOVERWRITE;
```

Verify from CloudShell:

```bash
aws s3 ls "s3://${BUCKET_NAME}/redshift-lab/unload/"
```

The [UNLOAD reference](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) documents Parquet output, the IAM role, and the fact that `CLEANPATH` and `ALLOWOVERWRITE` cannot be used together.

## Part 5 — Optional: query the Glue Catalog from Redshift

This is the bridge between your Week 2/3 lake work and the warehouse. It reads the existing Glue table over S3 without copying its rows into Redshift-managed storage.

Run this only if the Glue table exists and the Redshift S3 role also has the required read permissions for the Glue Data Catalog. Do not broaden permissions blindly if Lake Formation denies access; record the denial as a governance issue for Week 8.

```sql
CREATE EXTERNAL SCHEMA IF NOT EXISTS lake
FROM DATA CATALOG
DATABASE 'aws_de_learning'
REGION '<AWS_REGION>'
IAM_ROLE '<REDSHIFT_S3_ROLE_ARN>';

SELECT *
FROM lake.<CATALOG_TABLE_NAME>
LIMIT 10;
```

Use `events_glue_curated` if the Week 3 Glue job completed, or `events_parquet` if you are using the Week 2 CTAS output. Replace `<CATALOG_TABLE_NAME>` with the actual Glue table name.

Compare the paths:

| Operation | Data location | What Redshift is doing |
|---|---|---|
| `SELECT` from `analytics.fact_orders` | Redshift managed storage | Querying data loaded by `COPY` |
| `SELECT` from `lake.<table>` | S3, registered in Glue | Querying external lake data |
| `UNLOAD` | S3 output prefix | Exporting a Redshift query result |

The [external-schema reference](https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html) documents Glue/Athena Data Catalog integration and the minimum S3 list/get role requirements.

## Part 6 — Explain the GCP-to-AWS mapping

Write a short explanation in your notes:

| GCP concept | AWS equivalent in this lab | Key difference to remember |
|---|---|---|
| BigQuery managed table | Redshift table loaded by `COPY` | Redshift is a warehouse service with its own storage/compute model and distribution/sort concepts |
| BigQuery external table | Redshift external schema/table over S3 | The data remains in the lake; catalog and access permissions matter |
| BigQuery extract/export | Redshift `UNLOAD` | SQL results are written to S3, often as multiple files |
| Cloud Storage | S3 | S3 prefixes are object-key conventions, not real directories |
| Dataplex/Data Catalog | Glue Data Catalog/Lake Formation | Catalog metadata and data permissions can be separate concerns |

Answer these in your own words:

1. When would you leave data in S3 and query it externally instead of loading it into Redshift?
2. Why is a date sort key useful for the queries in this lab?
3. What does `DISTSTYLE AUTO` allow Redshift to decide?
4. Why should Redshift use an IAM role instead of access keys embedded in `COPY`?
5. What failure would you expect if the role had `GetObject` but not `ListBucket`?

## Evidence checklist

Save a short note or screenshot set containing:

- S3 object URI and size.
- Namespace/workgroup/database/Region.
- Base capacity and usage-limit setting.
- Redshift S3 role ARN and the exact S3 prefixes it can access.
- `NOLOAD` result.
- Loaded row count and aggregation result.
- Fact/dimension table DDL and one successful join result.
- S3 listing showing the Parquet `UNLOAD` output.
- Optional external-schema query result or the exact permission error.
- Teardown verification.

## Troubleshooting map

| Symptom | Check first |
|---|---|
| `S3ServiceException: Access Denied` during `COPY` | The role is associated with the workgroup, its trust relationship allows Redshift Serverless, and it has S3 list/get for the exact bucket/prefix |
| `COPY` finds no files | The S3 prefix is exact, the object exists in the same Region, and the prefix does not accidentally point at an empty folder |
| Query Editor v2 cannot connect | Workgroup status, Region, Query Editor permissions, and database authentication choice |
| External schema creates but table query fails | Glue table name/Region, Glue catalog permissions, S3 permissions, and Lake Formation grants |
| `UNLOAD` fails on a second run | Use a fresh prefix or `ALLOWOVERWRITE`; do not combine `ALLOWOVERWRITE` with `CLEANPATH` |
| Usage limit is reached | Stop queries, record the limit event, verify the account's trial/credit status, and do not raise the limit without checking billing |

Do not fix an access error by attaching `AdministratorAccess` to the Redshift service role. That can be a temporary diagnostic comparison only in a disposable sandbox, followed by immediate removal and policy narrowing.

## Teardown — do this in the same session

1. In Query Editor v2, drop only the lab objects:

   ```sql
   DROP SCHEMA IF EXISTS lake CASCADE;
   DROP SCHEMA IF EXISTS analytics CASCADE;
   ```

   Do not drop the shared Glue database; it belongs to the earlier labs.

2. Remove only the Week 4 S3 prefixes:

   ```bash
   aws s3 rm "s3://${BUCKET_NAME}/redshift-lab/" --recursive
   aws s3 ls "s3://${BUCKET_NAME}/redshift-lab/"
   ```

3. In the Redshift console, delete the lab workgroup and then the lab-only namespace. Confirm that you are not deleting any namespace containing other data.
4. Check for manual snapshots/recovery points created during the lab; delete only lab-only recovery artifacts if present.
5. Remove the lab-only Redshift S3 role after it is no longer associated with the namespace/workgroup. Keep the Week 0 learning-admin identity until the broader AWS learning environment is complete.
6. Recheck the Redshift Serverless console, S3, Billing/Budgets, and Cost Explorer in the same Region.

The final evidence should show no Week 4 workgroup or namespace and no `redshift-lab/` objects.

## No-account fallback

If your account is not ready, do not upgrade a plan or create Redshift just to keep moving. Use an AWS Skill Builder Redshift Serverless sandbox or a guided official lab if one is available in your account, and complete the following no-cost study exercise:

- Annotate the `COPY`, `NOLOAD`, `UNLOAD`, and `CREATE EXTERNAL SCHEMA` statements.
- Draw the identity flow: your IAM identity → Redshift console/Query Editor; Redshift workgroup → S3/Glue through a service role.
- Use the Week 2 Athena output to explain what would remain external versus what would be loaded into a managed warehouse.
- Mark the lab as “conceptual only”; do not claim Redshift hands-on completion until you execute and tear down a real or official sandbox environment.

## Week 4 check-in

```text
Week: 4 — Redshift Serverless
Account/Region:
Account status confirmed (new Free plan / existing / unknown):
Redshift Serverless trial status confirmed:
Hours studied:
Workgroup created and deleted:
COPY NOLOAD result:
Rows loaded:
UNLOAD result:
External schema attempted (yes/no):
What broke:
Most important GCP→AWS distinction learned:
Current confidence (1–5):
Next commitment:
```
