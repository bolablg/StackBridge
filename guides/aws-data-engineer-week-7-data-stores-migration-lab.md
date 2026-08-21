# Week 7 — Operational data stores and migration decisions

This week closes an important part of the DEA-C01 Store Management domain. The goal is not to create every AWS database. The goal is to learn to choose the right store, understand the operational tradeoffs, and know which AWS service moves which kind of data.

## Outcomes

By the end of this week, you should be able to:

- choose among S3/Athena, Redshift, RDS/Aurora, and DynamoDB from workload requirements;
- explain RDS Multi-AZ, read replicas, and the Aurora storage/compute model;
- design a DynamoDB table from access patterns rather than from a normalized relational schema;
- distinguish AWS DMS, DataSync, and AppFlow;
- explain full-load migration, change data capture (CDC), validation, and cutover;
- produce a short decision matrix and, if your account is ready, complete a tiny DynamoDB query exercise.

## Cost and account gate

Start with the no-account decision workshop. Do not create RDS, Aurora, a DMS replication resource, a DataSync agent, or an AppFlow flow until your account plan, credits, budget alerts, and Region are confirmed. Those services have different billable surfaces: database instance/storage time, migration resources, data volume, flow runs, and related storage or network charges.

The optional DynamoDB exercise is deliberately small and uses on-demand capacity, but “small” is not the same as “free.” Check the current [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/) and your account’s Free Tier/credit status first. Use the same Region and `project=aws-de-learning` tag convention from Week 0.

Do not use the root account for this exercise. If you are still using the temporary learning administrator from Week 0, treat it as a short-lived sandbox credential and remove or replace it before any real project work.

## The decision matrix

| Requirement | First choice | Why | Avoid making it the default when |
|---|---|---|---|
| Durable raw files, logs, exports, or lake zones | S3 | Cheap durable object storage, lifecycle policies, prefixes, and broad analytics integration | You need row-level transactions or low-latency point reads |
| SQL over data already in S3 | Athena + Glue Data Catalog | Serverless query layer; pay for data scanned; works well with partitioned Parquet | You need a continuously updated transactional database |
| Repeated joins, BI dashboards, governed analytical models | Redshift Serverless or provisioned Redshift | Warehouse SQL, managed analytical storage, workload-oriented performance | You need an application’s OLTP transactions or arbitrary key-value access |
| Normalized relational application data and ACID transactions | RDS or Aurora | Managed relational engine, backups, patching, SQL, constraints, and transactional semantics | The workload is primarily a lake, warehouse, or key-value lookup |
| Known-key, high-scale key-value or document access | DynamoDB | Serverless NoSQL with primary-key access patterns, optional GSIs, and predictable application reads/writes | Queries require arbitrary joins, broad scans, or relational constraints |
| Move files or objects between on-premises, other clouds, and AWS storage | DataSync | Managed, secure, high-speed file/object transfer and synchronization | You need row-level database CDC |
| Move relational/NoSQL database data, possibly with ongoing changes | AWS DMS | Source/target endpoints and full-load or full-load-plus-CDC tasks | The source is just a directory of files or a SaaS application |
| Move records between SaaS applications and AWS destinations | AppFlow | Managed connectors and scheduled/on-demand flows for services such as Salesforce, S3, and Redshift | You need a general-purpose database migration engine |

The closest GCP translations are approximate, not interchangeable products:

| GCP experience | AWS starting point | Important difference |
|---|---|---|
| Cloud SQL | RDS or Aurora | Same relational family; compare engine support, HA, networking, and cost |
| Firestore | DynamoDB | Both are NoSQL, but DynamoDB requires deliberate key/index/access-pattern design |
| BigQuery | Redshift and/or Athena | Redshift is a warehouse; Athena queries objects in S3 |
| Cloud Storage transfer workflows | DataSync | DataSync is for files/objects, not database transaction logs |
| Datastream | AWS DMS | Both can support CDC patterns, but endpoint capabilities and engine-specific prerequisites differ |
| Salesforce/other SaaS ingestion | AppFlow | AppFlow is connector-oriented and flow-run/data-volume priced |

## Part 1 — No-account decision workshop

For each scenario, write down:

1. data shape: files, relational rows, key-value/document items, or SaaS records;
2. write pattern and freshness requirement;
3. dominant read pattern: scan, join, point lookup, or change stream;
4. first-choice AWS service;
5. one rejected alternative and why;
6. one cost or operational risk.

Do this before reading the answer key.

### Scenarios

1. An online checkout service needs atomic updates to orders, payments, and inventory. The application uses SQL joins and must fail over within one Region.
2. A pipeline receives 10 TB of daily JSON logs. Analysts query recent partitions occasionally, and the raw data must be retained cheaply.
3. A finance team runs many repeated joins and dashboard queries over curated facts and dimensions throughout the day.
4. A customer-profile API looks up one customer by `customer_id`, returns a variable document, and must scale without managing database servers.
5. Every night, Salesforce account and opportunity records should land in an analytics destination with minimal connector code.
6. An on-premises NFS share must be copied to S3 and then replicated periodically for disaster recovery.
7. A PostgreSQL database must move to Aurora PostgreSQL with a short cutover window while source writes continue during the initial copy.
8. A DynamoDB application needs downstream processing whenever an item is inserted or updated.

### Answer key

1. **RDS or Aurora PostgreSQL.** This is an OLTP workload with transactions and relational integrity. Use Multi-AZ for availability; use read replicas or Aurora readers when read scaling is the requirement. Redshift and DynamoDB are poor first choices for the transactional write path.
2. **S3, with Glue Catalog and Athena as needed.** Keep raw JSON in S3, partition by an analysis-friendly key, and create curated Parquet later. RDS is the wrong storage model for a large append-oriented log lake; Redshift may be useful for a curated serving layer, not as the raw landing zone.
3. **Redshift.** The repeated joins and analytical serving pattern fit a warehouse. Athena can still be useful for S3-resident data, but moving every dashboard query through ad hoc scans may create avoidable latency and scan cost.
4. **DynamoDB.** Design the primary key and any GSI around the API’s actual queries. Do not begin by copying a normalized SQL schema and hoping DynamoDB will provide joins later.
5. **AppFlow.** It is designed for managed flows between SaaS sources and AWS destinations such as S3 and Redshift. A custom Lambda/Glue integration may be appropriate for special transformations, but it is not the simplest first choice here.
6. **DataSync.** This is file/object movement. It is not a database CDC problem. Account for DataSync transfer charges and the destination storage/request charges.
7. **AWS DMS, usually full load plus CDC.** Prepare source permissions and engine-specific log settings, load the existing data, monitor/validate ongoing changes, then plan the cutover. Use schema conversion tooling when the source and target schemas or engines require it.
8. **DynamoDB Streams with a consumer such as Lambda.** Streams capture item changes for a limited retention window and can trigger downstream processing. The consumer still needs an idempotency and retry strategy.

## Part 2 — RDS and Aurora concepts

Amazon RDS is a managed service for supported relational database engines. AWS manages common administration such as backups, patching, failure detection, and recovery, while you still own database design, query tuning, permissions, and application behavior.

### Availability and read scaling

- A traditional RDS Multi-AZ DB instance deployment maintains a synchronous standby in another Availability Zone for failover. That standby is not a read endpoint.
- A read replica is a separate read-scaling/replication choice. Treat its replication and failover behavior as a different design concern from Multi-AZ standby.
- A Multi-AZ DB cluster deployment has a writer and reader instances and can serve reads; do not collapse every “Multi-AZ” question into one behavior.
- Aurora separates storage and compute. Aurora storage is replicated across Availability Zones, and Aurora Replicas can serve reads and participate in failover.

Use this exam heuristic:

| Question wording | Likely concept |
|---|---|
| “survive an Availability Zone failure” or “automatic failover” | Multi-AZ / Aurora high availability |
| “scale read traffic” | Read replica or Aurora reader |
| “relational transactions and constraints” | RDS/Aurora |
| “large analytical joins and BI” | Redshift |
| “raw files and lake retention” | S3 |

Do not create an RDS or Aurora instance for this week unless we explicitly confirm the account and cost plan. A conceptual architecture diagram plus the decision matrix is a valid Week 7 first pass.

Official references:

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [RDS Multi-AZ deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)
- [High availability for Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html)
- [Amazon RDS pricing](https://aws.amazon.com/rds/pricing/)

## Part 3 — Optional DynamoDB micro-lab

This is the only real data-store resource proposed for this week. It demonstrates a composite primary key and a query; it does not attempt to simulate a production application.

### 3.1 Preflight

Set and verify the learning Region first, then run these read-only checks. Stop if the identity, Region, or billing guardrail is unclear:

```bash
export AWS_REGION="<your-learning-region>"
export TABLE_NAME="aws-de-learning-customer-events"

aws sts get-caller-identity
aws configure get region
aws dynamodb list-tables --region "${AWS_REGION}"
```

Use a unique table name if a previous run left one behind:

```bash
export TABLE_NAME="aws-de-learning-customer-events"
```

If `AWS_REGION` is already set by your shell, verify it rather than blindly changing it. The commands below assume the identity has DynamoDB permissions and that a budget alert is active.

### 3.2 Create a composite-key table

The table models customer events. `customer_id` is the partition key; `event_ts` is the sort key. ISO-8601 timestamps sort chronologically as strings when they use the same format.

```bash
aws dynamodb create-table \
  --table-name "${TABLE_NAME}" \
  --attribute-definitions \
      AttributeName=customer_id,AttributeType=S \
      AttributeName=event_ts,AttributeType=S \
  --key-schema \
      AttributeName=customer_id,KeyType=HASH \
      AttributeName=event_ts,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --tags \
      Key=project,Value=aws-de-learning \
      Key=week,Value=7 \
  --region "${AWS_REGION}"

aws dynamodb wait table-exists \
  --table-name "${TABLE_NAME}" \
  --region "${AWS_REGION}"
```

Record the table ARN and status:

```bash
aws dynamodb describe-table \
  --table-name "${TABLE_NAME}" \
  --query 'Table.[TableArn,TableStatus,KeySchema,BillingModeSummary.BillingMode]' \
  --output table \
  --region "${AWS_REGION}"
```

### 3.3 Put a few items

```bash
aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "customer_id": {"S": "customer-101"},
    "event_ts": {"S": "2026-08-19T09:00:00Z"},
    "event_type": {"S": "view"},
    "amount": {"N": "0"}
  }' \
  --return-consumed-capacity TOTAL \
  --region "${AWS_REGION}"

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "customer_id": {"S": "customer-101"},
    "event_ts": {"S": "2026-08-19T09:15:00Z"},
    "event_type": {"S": "purchase"},
    "amount": {"N": "39.95"}
  }' \
  --return-consumed-capacity TOTAL \
  --region "${AWS_REGION}"

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "customer_id": {"S": "customer-101"},
    "event_ts": {"S": "2026-08-19T10:00:00Z"},
    "event_type": {"S": "refund"},
    "amount": {"N": "-10.00"}
  }' \
  --return-consumed-capacity TOTAL \
  --region "${AWS_REGION}"

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "customer_id": {"S": "customer-202"},
    "event_ts": {"S": "2026-08-19T11:00:00Z"},
    "event_type": {"S": "purchase"},
    "amount": {"N": "12.50"}
  }' \
  --return-consumed-capacity TOTAL \
  --region "${AWS_REGION}"
```

### 3.4 Query by the key you designed

This is the intended access path: one customer and a time range. `Query` uses the table key; it is not a table-wide scan.

```bash
aws dynamodb query \
  --table-name "${TABLE_NAME}" \
  --key-condition-expression 'customer_id = :cid AND event_ts BETWEEN :start_ts AND :end_ts' \
  --expression-attribute-values '{
    ":cid": {"S": "customer-101"},
    ":start_ts": {"S": "2026-08-19T00:00:00Z"},
    ":end_ts": {"S": "2026-08-19T23:59:59Z"}
  }' \
  --projection-expression 'event_ts,event_type,amount' \
  --return-consumed-capacity TOTAL \
  --region "${AWS_REGION}"
```

Now demonstrate the anti-pattern intentionally, then stop using it:

```bash
aws dynamodb scan \
  --table-name "${TABLE_NAME}" \
  --select COUNT \
  --return-consumed-capacity TOTAL \
  --region "${AWS_REGION}"
```

Explain in your notes why a `Scan` becomes risky as the table grows, and why a GSI may be better when the application needs a second query pattern. A scan is not forbidden, but it should be a deliberate choice rather than the default way to answer application queries.

### 3.5 Optional TTL observation

TTL is useful for expiring temporary items, but it is not a precise scheduler. AWS deletes expired items asynchronously, typically within a few days of the expiration time. Use a numeric Unix-epoch `expires_at` attribute if you choose to try it; never use TTL to enforce a hard real-time deadline.

Read-only inspection of backup settings is enough for this first pass:

```bash
aws dynamodb describe-continuous-backups \
  --table-name "${TABLE_NAME}" \
  --region "${AWS_REGION}"
```

Do not enable PITR, Streams, a GSI, a customer-managed KMS key, or global tables in this micro-lab unless we make that the explicit next experiment and check the cost/cleanup implications first.

### 3.6 Teardown

Delete the table in the same session unless it is being used by another planned exercise:

```bash
aws dynamodb delete-table \
  --table-name "${TABLE_NAME}" \
  --region "${AWS_REGION}"

aws dynamodb wait table-not-exists \
  --table-name "${TABLE_NAME}" \
  --region "${AWS_REGION}"

aws dynamodb list-tables \
  --region "${AWS_REGION}"
```

Save the `describe-table`, `Query`, and `Scan` outputs before deletion. Do not delete a table you did not create; verify the exact table name first.

## Part 4 — Migration service comparison

### AWS DMS

Use DMS when the source is a supported database or data store and the problem is migration or ongoing replication. A typical design has source and target endpoints plus a replication resource and migration task. The task can perform:

- full load only;
- full load plus CDC; or
- CDC only when the target already contains the initial data.

CDC reads engine-specific change logs. It is not automatically “real time,” and source prerequisites such as binlogs, logical replication, supplemental logging, or log retention depend on the source engine. Validate row counts, checksums or business totals, rejected records, latency, and target constraints before cutover.

Use DMS Schema Conversion or AWS SCT when source and target engines need schema/code conversion. Do not confuse schema conversion with data movement; they are separate decisions.

Official references:

- [AWS DMS overview](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [AWS DMS ongoing replication and CDC](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html)
- [AWS DMS pricing](https://aws.amazon.com/dms/pricing/)

### AWS DataSync

Use DataSync for file and object data: NFS, SMB, HDFS, object storage, S3, EFS, FSx, and supported other-cloud storage. It is a transfer/synchronization service, not a row-level database migration tool. For on-premises file systems, plan the agent, network access, permissions, validation, schedules, and destination storage class. Pricing is primarily tied to data transferred, with related request, storage, logging, and networking charges.

Official references:

- [What is AWS DataSync?](https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html)
- [AWS DataSync pricing](https://aws.amazon.com/datasync/pricing/)

### Amazon AppFlow

Use AppFlow for managed integrations between SaaS applications and AWS services. Flows can be on demand or scheduled, and connectors can move records to destinations such as S3 or Redshift. AppFlow is a strong fit for Salesforce-to-analytics ingestion; it is not a substitute for DMS when you need database-engine CDC or for DataSync when you need a file-system transfer.

Official references:

- [What is Amazon AppFlow?](https://docs.aws.amazon.com/appflow/latest/userguide/what-is-appflow.html)
- [Amazon AppFlow pricing](https://aws.amazon.com/appflow/pricing/)

## Migration runbook to memorize

`Inventory source → choose target → prepare permissions/network → convert schema if needed → full load → validate → enable/monitor CDC if needed → rehearse cutover → cut over → observe → decommission source or replication resources`

For the exam, add the constraint that a “low downtime” answer usually needs a staged initial load plus ongoing change capture, not a single large export followed by an unplanned outage.

## Week 7 evidence and check-in

Save one of the following:

- the completed decision matrix and scenario answers;
- DynamoDB `describe-table`, `Query`, `Scan`, and teardown evidence;
- a one-page DMS/DataSync/AppFlow migration design;
- a short explanation of RDS Multi-AZ versus read replicas and Aurora readers.

Use this check-in:

```text
Week: 7 — Operational stores and migration
Account/Region:
Account status and cost guardrails:
No-account decision workshop completed (yes/no):
DynamoDB micro-lab completed (yes/no/not attempted):
Evidence location:
Chosen store for each scenario:
DMS vs DataSync vs AppFlow distinction:
RDS Multi-AZ vs read replica explanation:
What broke or felt unclear:
Current confidence (1–5):
Next commitment:
```

If the account is not ready, mark the week **conceptual only** and complete the decision matrix, migration runbook, and service comparison in an AWS Skill Builder sandbox or on paper. It becomes **verified** only after the evidence and cleanup are reported.
