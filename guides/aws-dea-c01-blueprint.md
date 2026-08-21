# DEA-C01 Exam Blueprint and Feedback Loop

Target: AWS Certified Data Engineer – Associate (DEA-C01)

Primary source: https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html

AWS periodically revises the exam guide. Recheck the official guide before beginning final exam preparation and again before scheduling the exam.

Current-scope check: the official guide also names examples such as data APIs and rate limits, fan-in/fan-out and replayability, AWS SAM, IaC/CI/CD, LLM integration for data processing, Apache Iceberg, HNSW/IVF and vectorization concepts, DataBrew/QuickSight/Athena Spark notebooks, SageMaker Unified Studio/Data Wrangler, VPC security groups/endpoints, and role/tag/attribute-based authorization. These belong in the final recognition and tradeoff review even when they are not separate hands-on builds in this path.

## Exam shape

- Exam duration: 130 minutes.
- 65 questions total: 50 scored and 15 unscored.
- Question types: multiple choice and multiple response.
- Passing score: 720 on a 100–1,000 scaled score.
- Domain 1 — Data Ingestion and Transformation: 34%.
- Domain 2 — Data Store Management: 26%.
- Domain 3 — Data Operations and Support: 22%.
- Domain 4 — Data Security and Governance: 18%.

The exam is compensatory: the candidate does not need to pass every domain separately, but weak domains still create avoidable risk.

## What transfers from GCP

The learner already has transferable strength in ETL design, SQL, data modeling, batch/streaming concepts, data quality, distributed processing, and cloud architecture. The AWS-specific gap is not data engineering fundamentals; it is the AWS service vocabulary, permission model, operational choices, and cost behavior.

Study each topic in this order:

1. Understand the data-engineering requirement.
2. Map the requirement to the AWS service family.
3. Build a small version or complete a sandbox lab.
4. Compare the AWS choice with the closest GCP choice.
5. Explain the cost, performance, security, and operational tradeoff aloud.

## Domain blueprint

### Domain 1 — Data Ingestion and Transformation

Official task groups:

- Perform data ingestion.
- Transform and process data.
- Orchestrate data pipelines.
- Apply programming concepts.

Master deeply:

- S3 batch ingestion and event notifications.
- Kinesis Data Streams versus Firehose; partition keys, retention, replay, fan-in/fan-out, ordering, and throttling.
- Glue ETL, EMR, Lambda, Redshift, and format conversion such as CSV/JSON to Parquet.
- EventBridge, Step Functions, Glue Workflows, MWAA, SNS, and SQS.
- Python/SQL/Bash, boto3/SDK usage, testing, logging, retries, idempotency, IaC, and CI/CD.
- Data APIs, rate limits, fan-in/fan-out, replayability, AWS SAM, LLM data-processing integration, and distributed-computing/algorithm concepts at the level described by the current guide.

Demonstrate with evidence:

- A batch pipeline that can be rerun safely.
- A small streaming path with an explicit replay and failure strategy.
- A diagram showing where orchestration ends and data processing begins.

### Domain 2 — Data Store Management

Official task groups:

- Choose a data store.
- Understand data cataloging systems.
- Manage the lifecycle of data.
- Design data models and schema evolution.

Master deeply:

- S3, Athena, Glue Data Catalog, Lake Formation, Redshift, RDS/Aurora, DynamoDB, and Kinesis storage semantics.
- Redshift `COPY`, `UNLOAD`, Spectrum, federated queries, materialized views, distribution/sort choices, compression, locks, and serverless versus provisioned tradeoffs.
- Glue crawlers, schema discovery, partitions, catalog synchronization, and schema evolution.
- S3 lifecycle, versioning, retention/deletion requirements, DynamoDB TTL, resiliency, and availability.
- Open table formats, especially Apache Iceberg, at a decision-and-architecture level.
- Vector index concepts, including HNSW and IVF, at a conceptual level.
- Migration and remote-access patterns such as AWS Transfer Family, Redshift federated queries, Spectrum/materialized views, and schema conversion tools.

Demonstrate with evidence:

- A store-selection matrix for warehouse, lake, key-value, relational, streaming, and search use cases.
- A schema-evolution example and a partitioning/compression decision.
- A documented S3-to-Redshift load and unload path.

### Domain 3 — Data Operations and Support

Official task groups:

- Automate data processing.
- Analyze data.
- Maintain and monitor data pipelines.
- Ensure data quality.

Master deeply:

- Athena and Redshift SQL, views, aggregation, rolling averages, grouping, and pivoting.
- CloudWatch metrics/logs/alarms, CloudTrail API auditing, CloudTrail Lake, Logs Insights, and notifications.
- DataBrew, QuickSight, Athena Spark notebooks, SageMaker Data Wrangler/Unified Studio, and data-skew investigation at recognition/tradeoff level.
- Pipeline troubleshooting, performance bottlenecks, retries, backlogs, skew, and failure isolation.
- Data quality checks for nulls, duplicates, schema mismatches, consistency, sampling, and skew.
- Provisioned versus serverless services and their cost/performance implications.

Demonstrate with evidence:

- One intentionally broken pipeline and a written root-cause analysis.
- A quality rule that rejects or quarantines bad records.
- A cost/performance recommendation supported by observed behavior.

### Domain 4 — Data Security and Governance

Official task groups:

- Apply authentication mechanisms.
- Apply authorization mechanisms.
- Ensure data encryption and masking.
- Prepare logs for audit.
- Understand data privacy and governance.

Master deeply:

- IAM users, roles, trust policies, identity policies, resource policies, conditions, and least privilege.
- Lake Formation permissions for S3, Athena, Glue, EMR, and Redshift.
- KMS, Secrets Manager, Systems Manager Parameter Store, encryption in transit, and cross-account encryption concepts.
- CloudTrail, CloudWatch Logs, CloudTrail Lake, Athena log analysis, and AWS Config.
- Macie and PII identification, data masking/anonymization, data sovereignty, Region restrictions, and governance/data-sharing patterns.
- VPC security groups/endpoints and IP allowlists, plus role-based, tag-based, and attribute-based authorization.

Demonstrate with evidence:

- A role that can read only the intended S3 prefix.
- A data-access diagram showing identity, resource, catalog, and database authorization layers.
- An audit trail showing who changed or accessed a resource.

## Service-priority tiers

### Tier 1 — Build and explain deeply

S3, IAM, VPC basics, Glue, Glue Data Catalog, Athena, Lake Formation, Redshift, Kinesis Data Streams, Kinesis Firehose, Lambda, Step Functions, EventBridge, RDS/Aurora, DynamoDB, DMS, KMS, Secrets Manager, CloudWatch, CloudTrail, AWS Budgets, AWS CLI, CloudFormation, and CDK.

### Tier 2 — Complete a guided lab or architecture exercise

EMR, MSK, Managed Service for Apache Flink, MWAA, OpenSearch, Amazon Quick/QuickSight, DataBrew, AppFlow, DataSync, CloudTrail Lake, Config, Macie, S3 Tables/Iceberg, AWS Batch, and SAM.

### Tier 3 — Recognize use cases and tradeoffs

DocumentDB, Keyspaces, MemoryDB, Neptune, EKS/ECS, ECR, API Gateway, Bedrock, SageMaker AI, SageMaker Catalog/Unified Studio, Kendra, Transfer Family, Snow Family, CloudFront, PrivateLink, Route 53, WAF, Shield, Data Exchange, Managed Grafana, Backup, EBS, EFS, and Glacier.

Tier 3 does not mean “ignore.” It means learn the purpose, integration points, security model, and cost/performance decision without spending the limited lab budget building every service.

## No-account study session

This can be completed before AWS account access is settled:

1. Create a free AWS Skill Builder profile.
2. Open the official DEA-C01 exam guide and write the four domain weights from memory.
3. Create a table with columns: `GCP service`, `AWS candidate`, `why`, `cost concern`, `security concern`, `hands-on status`.
4. Fill the table for S3, Glue, Athena, Redshift, Dataflow/Glue, Pub/Sub/Kinesis, Composer/MWAA, IAM, KMS, Cloud Logging/CloudTrail, and BigQuery/Athena.
5. Take the official free practice question set or pretest if Skill Builder presents it.
6. Log every missed question using the error-log template below. Do not memorize the answer; write the service tradeoff that made the distractor plausible.

## Error log

Maintain one row per missed or guessed question. Paraphrase the question; do not copy proprietary exam content.

| Date | Domain | Topic | Chosen answer | Correct concept | Why I missed/guessed | Corrective action | Revisit |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

For every error, classify the cause as one of:

- `Vocabulary` — I did not know the AWS service or feature.
- `Mapping` — I chose the wrong AWS equivalent for a known GCP concept.
- `Tradeoff` — I knew both services but missed cost/performance/security implications.
- `Operations` — I missed retries, monitoring, failure, or lifecycle behavior.
- `Reading` — I overlooked a requirement, constraint, or qualifier.

The category determines the fix: flashcard, architecture comparison, lab, troubleshooting exercise, or question-reading practice.

## Weekly scorecard

```text
Week:
Study hours:
Domain 1 score:
Domain 2 score:
Domain 3 score:
Domain 4 score:
Tier 1 services built:
Artifact produced:
Errors by category:
Most important misconception:
Next week’s commitment:
```

## Readiness gates

Do not schedule solely because an average quiz score looks good. Schedule after all of these are true:

- The capstone runs end to end and can be explained without notes.
- Tier 1 service comparisons are consistently correct.
- At least three timed practice sets are at or above 80%, with no domain showing a repeated blind spot.
- The learner can troubleshoot a failed ingestion/transformation job and explain the security and cost consequences.
- The official practice exam confirms readiness after the error log has been remediated.

## Official references

- [Current DEA-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html)
- [Domain 1 — Data Ingestion and Transformation](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain1.html)
- [Domain 2 — Data Store Management](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain2.html)
- [Domain 3 — Data Operations and Support](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain3.html)
- [Domain 4 — Data Security and Governance](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain4.html)
- [AWS certification preparation](https://aws.amazon.com/certification/certification-prep/)
