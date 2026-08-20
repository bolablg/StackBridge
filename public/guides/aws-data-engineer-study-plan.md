# AWS Data Engineer Study Plan

Target: AWS Certified Data Engineer – Associate (DEA-C01)

Learner profile: Certified Google Cloud Professional Data Engineer with prior EC2/Linux experience, but limited direct experience with AWS data services.

Working assumption: 6–8 hours per week. Adjust the pace rather than skipping hands-on work.

## Certification target

- Official exam guide: https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html
- Exam domains: Ingestion and Transformation (34%), Store Management (26%), Operations and Support (22%), Security and Governance (18%).
- Do not make Cloud Practitioner or Solutions Architect Associate prerequisites. Use a short AWS fundamentals ramp, then focus on DEA-C01.

## Learning resources

- AWS Skill Builder: https://skillbuilder.aws/
- AWS Educate: https://www.awseducate.com/
- AWS Free Tier: https://aws.amazon.com/free/
- AWS certification page: https://aws.amazon.com/certification/certified-data-engineer-associate/

Exam blueprint and error log: [DEA-C01 Blueprint](aws-dea-c01-blueprint.md)

Use free Skill Builder and AWS Educate resources first. Consider a one-month Skill Builder subscription only when the official exam prep, Builder Labs, or a sandbox lab will materially accelerate the current phase.

## GCP-to-AWS translation map

| GCP | AWS | Focus |
|---|---|---|
| Cloud Storage | S3 | Object layout, lifecycle, encryption, policies |
| BigQuery | Redshift + Athena | Warehouse versus serverless querying over S3 |
| Dataflow | Glue, EMR, Lambda, Managed Flink | Batch, Spark, serverless, and streaming tradeoffs |
| Pub/Sub | Kinesis, MSK, SNS/SQS | Partitions, replay, retention, ordering, delivery |
| Dataproc | EMR | Managed Spark/Hadoop operations |
| Dataplex/Data Catalog | Glue Data Catalog + Lake Formation | Metadata, discovery, and fine-grained access |
| Cloud Composer | MWAA | Managed Airflow |
| Cloud Functions/Eventarc | Lambda + EventBridge | Event-driven processing and schedules |
| Cloud Logging/Audit Logs | CloudWatch + CloudTrail | Workload observability versus API auditing |
| IAM/KMS/Secret Manager | IAM/KMS/Secrets Manager | Roles, policies, encryption, and secrets |

## Dataform equivalent: AWS-native versus dbt

AWS does not package the exact Dataform experience—SQL-first models, dependency graph, tests, documentation, and Git-oriented deployment—into one first-party service. The closest choices are:

| Need | Recommended AWS path | How it compares with Dataform |
|---|---|---|
| AWS-native ETL | Glue Data Catalog + Glue Studio/Glue ETL + Athena or Redshift | Managed Spark/Python/visual ETL and catalog integration; powerful, but less SQLX/model-DAG-centric |
| SQL analytics engineering | dbt Core or dbt platform connected to Redshift Serverless | Closest conceptual match: SQL models, DAG dependencies, tests, documentation, and environments |
| Scheduling/orchestration | Glue Workflows, Step Functions/EventBridge, or MWAA | Supplies the workflow layer around Glue or dbt; it is not the modeling layer itself |

For this path, learn both layers. Use Glue because DEA-C01 tests AWS-native ingestion, transformation, catalog, security, and operations. Add dbt against the Week 4 Redshift Serverless warehouse because it is the most direct transfer of your Dataform experience and strengthens your portfolio. Treat dbt as a modeling/analytics-engineering layer, not as a replacement for learning Glue, IAM, S3, Redshift, Athena, Kinesis, and orchestration.

Suggested dbt extension after Week 4:

- Build `stg_orders`, `dim_customer`, and `fct_orders` models from the Redshift lab tables.
- Add source freshness, uniqueness, not-null, and relationship tests.
- Generate documentation and inspect the model DAG.
- Run the project from a separate development schema, then schedule it with a later orchestration milestone.

AWS Glue Studio provides visual ETL jobs and generates Spark/Python job scripts; dbt's Redshift connection supports a Redshift Serverless workgroup. See the [Glue visual ETL documentation](https://docs.aws.amazon.com/glue/latest/dg/author-job-glue.html) and [dbt's Redshift connection guide](https://docs.getdbt.com/docs/platform/connect-data-platform/connect-redshift).

## Week 0 — Setup and safety

- [ ] Confirm whether previous EC2 work used an AWS account personally owned by the learner.
- [ ] Create or verify free AWS Skill Builder and AWS Educate profiles.
- [ ] If eligible as a new customer, create the AWS Free account plan only when ready to use the six-month window.
- [ ] Enable root MFA; do not create root access keys.
- [ ] Do not create AWS Organizations or Control Tower in the learning account.
- [ ] Create a non-root day-to-day identity; never share credentials or MFA codes.
- [ ] Enable Free Tier alerts and create a small cost budget with actual and forecast thresholds.
- [ ] Choose one Region for learning and use a project tag such as `project=aws-de-learning`.
- [ ] Record the account-plan expiration date and credit balance.

Executable account guide: [Week 0 AWS Learning Account Setup](aws-data-engineer-week-0-account-setup.md)

## Week 1 — AWS foundations and S3

Learning:

- Regions, Availability Zones, VPC basics, IAM roles/policies, S3, AWS CLI, CloudWatch, and CloudTrail.
- Compare S3 bucket policies and IAM policies with GCS IAM and uniform bucket-level access.

Hands-on deliverable:

- Create a private S3 bucket with `raw/`, `curated/`, and `analytics/` prefixes.
- Upload a small public dataset through the CLI.
- Apply default encryption, a lifecycle rule, and a least-privilege access role.
- Confirm access and denial behavior, then delete temporary objects.

Evidence to save:

- One architecture sketch.
- A short GCP-to-AWS decision log.
- CLI commands used, without credentials.
- One paragraph explaining the difference between IAM, bucket policies, and roles.

Executable lab guide: [Week 1 Secure S3 Lab](aws-data-engineer-week-1-lab.md)

## Week 2 — Glue Data Catalog and Athena

Learning:

- Glue databases, crawlers, schemas, Hive-style partitions, Athena workgroups, query-result locations, and data scanned.
- Partition pruning, Parquet/columnar storage, CTAS, and the relationship between S3 data and catalog metadata.

Hands-on deliverable:

- Crawl a single-schema S3 prefix into a Glue table.
- Query the discovered partitions with Athena.
- Create and query a small Parquet-curated table with CTAS.
- Capture query-scanned bytes, catalog metadata, and cleanup evidence.

Executable lab guide: [Week 2 Glue and Athena Lab](aws-data-engineer-week-2-glue-athena-lab.md)

## Week 3 — Glue ETL and schema evolution

Learning:

- Glue Studio visual ETL, Spark job roles, worker sizing, Parquet targets, catalog updates, job bookmarks, and schema contracts.
- The difference between schema discovery and schema governance, including additive versus breaking changes.

Hands-on deliverable:

- Run one small on-demand Glue Spark job from the Week 2 catalog table to a curated Parquet table.
- Inspect the generated script, runtime/capacity metrics, and CloudWatch logs.
- Test or explicitly defer job bookmarks and document a v1/v2 schema-evolution strategy.

Executable lab guide: [Week 3 Glue ETL Lab](aws-data-engineer-week-3-glue-etl-lab.md)

## Week 4 — Redshift Serverless and warehouse modeling

Learning:

- Redshift Serverless namespaces/workgroups, RPUs, usage limits, Query Editor v2, and Redshift-to-S3 IAM roles.
- `COPY` with `NOLOAD`, warehouse tables, automatic distribution, date sort keys, `UNLOAD` to Parquet, and optional Glue Catalog external schemas.
- The boundary between querying S3 externally and loading data into Redshift-managed storage.

Hands-on deliverable:

- Stage a tiny S3 CSV, load it into Redshift Serverless, build a fact/dimension shape, and export an aggregate to S3.
- Optionally query the Week 2/3 Glue table from Redshift as an external table.
- Delete the workgroup, namespace, lab role, and Week 4 S3 prefixes; capture cost-control and teardown evidence.

Executable lab guide: [Week 4 Redshift Serverless Lab](aws-data-engineer-week-4-redshift-lab.md)

## Week 5 — Kinesis, Amazon Data Firehose, and streaming consumers

Learning:

- Kinesis Data Streams partition keys, shards, sequence numbers, retention, capacity modes, and consumer positions.
- Amazon Data Firehose buffering and delivery from Kinesis to S3, including newline delimiters, prefixes, and delivery IAM roles.
- Lambda event-source mappings, batches, starting positions, retries, and the boundary between Firehose delivery and application-level stream processing.

Hands-on deliverable:

- Send a small set of partitioned JSON events to Kinesis Data Streams.
- Deliver them through Amazon Data Firehose to the Week 1 S3 bucket.
- Optionally attach a small Lambda consumer and inspect its CloudWatch logs.
- Delete the stream, delivery stream, optional Lambda resources, IAM roles, and streaming prefixes; capture cost and teardown evidence.

Executable lab guide: [Week 5 Kinesis and Firehose Streaming Lab](aws-data-engineer-week-5-streaming-lab.md)

## Week 6 — Orchestration and event-driven workflows

Learning:

- Step Functions Standard state machines, Glue `.sync` integration, retry/catch behavior, and execution history.
- EventBridge event patterns and target roles for starting workflows.
- Glue Workflows/triggers and the distinction between Glue-native DAGs, cross-service orchestration, and MWAA/Airflow.

Hands-on deliverable:

- Run the Week 3 Glue job through a Step Functions Standard state machine.
- Start one execution through a custom EventBridge event, then disable the rule.
- Perform a controlled failure-injection exercise and explain retry/idempotency decisions.
- Compare Step Functions, Glue Workflows, and MWAA without creating an always-on MWAA environment.

Executable lab guide: [Week 6 Orchestration Lab](aws-data-engineer-week-6-orchestration-lab.md)

## Week 7 — Operational data stores and migration decisions

Learning:

- RDS/Aurora relational and transactional workloads, Multi-AZ versus read replicas, and Aurora readers/storage.
- DynamoDB tables, items, composite keys, query-driven design, GSIs, Streams, TTL, backups, and on-demand capacity.
- AWS DMS full load/CDC, DataSync file/object movement, and AppFlow SaaS-to-AWS flows.

Hands-on deliverable:

- Complete the no-account store-selection scenarios and migration decision matrix.
- If the account and budget gate are ready, create a tiny on-demand DynamoDB table, run a key-based query, intentionally inspect a scan, and delete the table in the same session.
- Write a short explanation of when to choose DMS, DataSync, or AppFlow and a full-load-plus-CDC migration runbook.

Do not create RDS/Aurora, DMS, DataSync, or AppFlow resources for this week without confirming current account credits and cost guardrails.

Executable lab guide: [Week 7 Operational Stores and Migration Lab](aws-data-engineer-week-7-data-stores-migration-lab.md)

## Week 8 — Security, encryption, secrets, and data governance

Learning:

- IAM policy evaluation, role trust versus role permissions, least privilege, `iam:PassRole`, permissions boundaries, and explicit denies.
- S3 SSE-S3 versus SSE-KMS, KMS key policies, envelope encryption, and service-specific key permissions.
- Secrets Manager runtime retrieval and rotation, Lake Formation permissions/hybrid access, and Macie S3 sensitive-data discovery.

Hands-on deliverable:

- Complete the pipeline identity/access matrix and the governance worksheet.
- Validate a least-privilege S3 policy with IAM Access Analyzer without attaching it to an identity.
- Explain the KMS/S3 permission path, Secrets Manager rotation path, Lake Formation/IAM boundary, and Macie cost/scope boundary.
- Complete the original 10-question security and governance quiz.

Do not create a customer-managed KMS key, Secrets Manager secret, Lake Formation grant, or Macie discovery job until the account and cost gate is confirmed.

Executable lab guide: [Week 8 Security and Governance Lab](aws-data-engineer-week-8-security-governance-lab.md)

## Week 9 — Observability, data quality, failure recovery, and cost

Learning:

- CloudWatch metrics, logs, Logs Insights, alarms, and service-specific operational signals.
- CloudTrail management events versus opt-in data events and the evidence needed for an audit investigation.
- SQL quality checks, Glue Data Quality/DQDL, freshness/volume/reconciliation gates, and quarantine policies.
- Retry/idempotency, partial-output handling, backfill/replay, budgets, Cost Explorer, and anomaly detection.

Hands-on deliverable:

- Run one narrow Logs Insights query and interpret a CloudTrail management event, or complete both conceptually if no account is ready.
- Define quality rules and pass/fail actions for the capstone.
- Write a failure/recovery runbook and identify the cost drivers and budget guardrails for each branch.
- Complete the original 12-question reliability and cost quiz.

Executable lab guide: [Week 9 Observability, Reliability, and Cost Lab](aws-data-engineer-week-9-observability-reliability-cost-lab.md)

## Week 10 — CLI, Boto3, dbt, infrastructure as code, and CI/CD

Learning:

- AWS CLI profiles, role-based credential use, Boto3 Sessions/clients/paginators, and read-only automation.
- CloudFormation templates, parameters, outputs, change review, deletion policies, and stack teardown; recognize CDK as a higher-level authoring layer that synthesizes CloudFormation.
- Recognize AWS SAM as a CloudFormation transform for serverless applications without turning this learning week into a Lambda deployment project.
- dbt as the closest Dataform analogue on Redshift: SQL models, `ref()` dependencies, sources, development schemas, and data tests.
- CodeBuild buildspecs, CodePipeline stages, least-privilege build/deploy roles, and the boundary between validation and production deployment.

Hands-on deliverable:

- Run the read-only Boto3 inventory with a named profile, or complete the no-account fallback.
- Validate and, only after the account/cost gate, deploy and delete the tiny Week 10 CloudFormation stack.
- Build the `source → stg_orders → fct_orders` dbt DAG against the existing Week 4 Redshift workgroup, or document the Dataform-to-dbt mapping without creating a second warehouse.
- Review the validation-only CodeBuild buildspec and draw the protected deployment pipeline.
- Complete the original 12-question automation/IaC/dbt quiz and add errors to the tracker.

Executable lab guide: [Week 10 Automation, IaC, dbt, and CI/CD Lab](aws-data-engineer-week-10-automation-iac-dbt-lab.md)

No-account exam diagnostic: [DEA-C01 Baseline Diagnostic](aws-dea-c01-baseline-diagnostic.md)

## Week 11 — Domain remediation and official pretest

Learning:

- Use the current exam guide, official Practice Question Set, targeted Exam Prep Standard Course content, and the error log to repair gaps rather than rereading the entire catalog.
- Audit current-guide additions: data APIs/rate limits, Iceberg/vector concepts, DataBrew/QuickSight/Athena notebooks, SageMaker Unified Studio examples, VPC/ABAC controls, SAM, IaC, and CI/CD.
- Complete one remediation artifact per domain, the troubleshooting drills, and the original 16-question remediation check.
- Take the official Pretest only after the local baseline and targeted remediation; availability depends on the current Skill Builder offering.

Hands-on deliverable:

- Produce a domain scorecard and error log with corrective rules.
- Complete the store-selection, signal-to-action, security-chain, and troubleshooting exercises.
- Decide whether the Week 12 timed phase is a go/no-go based on the stop/go gate.

Executable guide: [Week 11 Domain Remediation and Official Pretest](aws-data-engineer-week-11-remediation-pretest.md)

## Week 12 — Timed practice, official practice exam, and readiness

Learning:

- Complete three timed 65-question/130-minute practice sessions using authorized or original material.
- Review every wrong and guessed question, classify the error, and close the remediation loop.
- Take the AWS Certification Official Practice Exam when available, then make a documented schedule/delay decision.
- Recheck the official exam guide, pricing, testing option, and logistics immediately before scheduling.

Hands-on deliverable:

- Meet the evidence gates: capstone, troubleshooting, three timed sets at or above 80%, no repeated domain blind spot, and official assessment after remediation.
- Save the scorecard, error log, capstone/teardown evidence, and scheduling decision.

Executable guide: [Week 12 Timed Readiness and Exam Guide](aws-data-engineer-week-12-timed-readiness-exam.md)

## 12-week sequence

| Weeks | Focus | Deliverable |
|---|---|---|
| 1 | AWS fundamentals, IAM, S3, CLI, CloudWatch, CloudTrail | Secure S3 data lake foundation |
| 2 | Glue Catalog, Athena, Lake Formation, Parquet, partitions | Queryable raw/curated lake |
| 3 | Glue ETL, EMR concepts, schema evolution, batch processing | CSV/JSON-to-Parquet pipeline |
| 4 | Redshift Serverless, COPY, UNLOAD, external schemas, modeling | Star-schema warehouse |
| 5 | Kinesis Streams, Firehose, Lambda, MSK/Flink concepts | Streaming-to-S3 branch |
| 6 | Step Functions, EventBridge, Glue Workflows, SNS/SQS, MWAA concepts | Scheduled/event-driven workflow |
| 7 | RDS, Aurora, DynamoDB, DMS, AppFlow, DataSync | Data-store decision matrix |
| 8 | IAM, KMS, Secrets Manager, Lake Formation, Macie | Governed and encrypted access |
| 9 | CloudWatch Logs, CloudTrail, quality checks, retries, alerts, cost | Failure-injection runbook |
| 10 | CLI, boto3, dbt on Redshift, CloudFormation/CDK, SAM, CI/CD | [Repeatable deployment and SQL model DAG](aws-data-engineer-week-10-automation-iac-dbt-lab.md) |
| 11 | Official pretest, domain quizzes, current-scope audit, service comparisons | [Gap-remediation plan](aws-data-engineer-week-11-remediation-pretest.md) |
| 12 | Timed practice and official practice exam | [Readiness decision and scheduling](aws-data-engineer-week-12-timed-readiness-exam.md) |

## Capstone architecture

Build incrementally:

`S3 → Glue Catalog/ETL → Athena → Redshift Serverless`

Then add Kinesis or Firehose, Step Functions/EventBridge, Lambda quality checks, IAM/KMS/Lake Formation controls, CloudWatch/CloudTrail monitoring, and CloudFormation or CDK deployment.

Do not activate Redshift until the dataset, teardown steps, and budget monitoring are ready. Redshift Serverless trial credits are separate from AWS Free Tier credits.

## Weekly check-in

Use the [AWS Data Engineer accountability tracker](aws-data-engineer-accountability.md) to record verified status, evidence, scores, error patterns, and the next commitment.

Complete the [DEA-C01 baseline diagnostic](aws-dea-c01-baseline-diagnostic.md) before the first formal weekly check-in.

Copy this template into the next check-in:

```text
Week:
Hours studied:
Learning completed:
Labs completed:
Artifact or evidence:
Quiz/practice score by domain:
What broke:
Current confidence (1–5):
Next commitment:
```

## Readiness gates

- Complete the capstone end to end and explain every service choice.
- Reach at least 80% consistently on domain practice before scheduling.
- Demonstrate troubleshooting, security, data-quality, and cost reasoning—not just definitions.
- Take the official practice exam after the gap-remediation phase.
