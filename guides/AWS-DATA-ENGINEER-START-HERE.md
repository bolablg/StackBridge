# AWS Data Engineer — Start Here

Objective: prepare for and pass AWS Certified Data Engineer – Associate (DEA-C01) through practical AWS work mapped from your Google Cloud Professional Data Engineer experience.

## Current verified status

- GCP Professional Data Engineer: reported certified.
- AWS account: new account reported; Region, MFA, billing guardrails, and plan/credit details are not yet verified.
- AWS resources: no account resources have been accessed or created by this learning plan.
- Curriculum: Weeks 0–12 guides are prepared; learner execution, scores, and lab evidence remain unverified.

The [accountability tracker](aws-data-engineer-accountability.md) is the source of truth for progress. Reading a guide does not mark a lab complete.

The [completion audit](AWS-DATA-ENGINEER-COMPLETION-AUDIT.md) shows which parts of the objective are prepared and which still require learner evidence.

## Your next 30 minutes

### 1. Complete the Week 0 safety gate

Open the [Week 0 account setup guide](aws-data-engineer-week-0-account-setup.md) and verify:

- root MFA is enabled and no root access keys exist;
- a learning Region is chosen;
- the Free Tier/credit balance and expiration dates are recorded;
- a non-root identity or approved federated session is ready;
- Free Tier alerts and a small budget are active;
- AWS Organizations and Control Tower have not been created for this sandbox.

Do not create Redshift, RDS, EMR, MWAA, NAT Gateway, or VPC endpoints during Week 0.

### 2. Send the first check-in

Send status only—never credentials, access keys, MFA codes, or secret values:

```text
AWS Region:
Credit balance/expiration:
Free Plan expiration:
Root MFA:
Non-root identity:
Budget/alerts:
Preferred weekly check-in day/time:
```

### 3. Establish your knowledge baseline

Complete the [DEA-C01 baseline diagnostic](aws-dea-c01-baseline-diagnostic.md) without notes and send only the answer string first, for example:

```text
1:B, 2:D, 3:A, ... 16:C
```

I will score it by domain, identify the highest-value gap, and assign the first time-bounded commitment.

### If the AWS account gate is not ready

Use this 60-minute no-account sprint instead of creating a duplicate account or launching resources:

1. Complete the 16-question diagnostic and record time, confidence, and uncertain questions.
2. Write one sentence for each transfer: Cloud Storage → S3, BigQuery → Athena/Redshift, Dataflow → Glue, Pub/Sub → Kinesis, Composer → Step Functions/MWAA, and Dataform → dbt on Redshift.
3. Sketch the capstone flow `S3 raw → Glue Catalog/ETL → Athena → Redshift` and label partitioning, IAM role, encryption, retry, and data-quality checkpoints.
4. Note one reason EC2 is not the default replacement for each managed service above, considering operations and cost.

Send the answer string plus the six transfer decisions and the sketch as text if the account is still unresolved. This counts as baseline preparation—not as a verified AWS lab.

When reporting setup status, share only the Region, plan/credit dates, identity type, and yes/no guardrails. Do not send credentials, MFA codes, access keys, secret values, full account IDs, or full ARNs.

## The first hands-on path

After Week 0 is verified:

1. Run the [Week 1 Secure S3 Lab](aws-data-engineer-week-1-lab.md).
2. Save the command output and teardown evidence.
3. Send the [Week 1 check-in](aws-data-engineer-week-1-lab.md) details in chat.
4. I will update the tracker conservatively and assign Week 2.

If the account gate is not ready, complete the no-account portions of Week 1 and the diagnostic instead. Do not create resources to manufacture progress.

## GCP-to-AWS focus

| Your GCP experience | AWS capability to learn |
|---|---|
| Cloud Storage | S3, lifecycle, encryption, policies, prefixes, and event integration |
| BigQuery | Athena over S3 versus Redshift-managed warehouse tables |
| Dataflow/Dataproc | Glue, EMR, Lambda, and managed streaming tradeoffs |
| Pub/Sub | Kinesis Data Streams, Firehose, MSK, SNS/SQS |
| Dataplex/Data Catalog | Glue Data Catalog and Lake Formation |
| Composer | Step Functions, Glue Workflows, EventBridge, and MWAA |
| Cloud Logging/Audit Logs | CloudWatch and CloudTrail |
| Dataform | dbt models/tests on Redshift, with Glue and AWS orchestration around them |

For the Dataform question specifically, learn dbt as the closest SQL-model/DAG/testing analogue, but still learn Glue because DEA-C01 tests AWS-native ingestion, transformation, catalog, security, and operations.

## Document map

| Need | File |
|---|---|
| Overall sequence and capstone | [Study plan](aws-data-engineer-study-plan.md) |
| Verified progress and check-ins | [Accountability tracker](aws-data-engineer-accountability.md) |
| Exam domains, service priorities, and error taxonomy | [DEA-C01 blueprint](aws-dea-c01-blueprint.md) |
| Account and billing safety | [Week 0](aws-data-engineer-week-0-account-setup.md) |
| S3 foundation | [Week 1](aws-data-engineer-week-1-lab.md) |
| Glue and Athena | [Week 2](aws-data-engineer-week-2-glue-athena-lab.md) |
| Glue ETL and schema evolution | [Week 3](aws-data-engineer-week-3-glue-etl-lab.md) |
| Redshift Serverless | [Week 4](aws-data-engineer-week-4-redshift-lab.md) |
| Streaming | [Week 5](aws-data-engineer-week-5-streaming-lab.md) |
| Orchestration | [Week 6](aws-data-engineer-week-6-orchestration-lab.md) |
| Stores and migration | [Week 7](aws-data-engineer-week-7-data-stores-migration-lab.md) |
| Security and governance | [Week 8](aws-data-engineer-week-8-security-governance-lab.md) |
| Observability and reliability | [Week 9](aws-data-engineer-week-9-observability-reliability-cost-lab.md) |
| CLI, Boto3, IaC, dbt, and CI/CD | [Week 10](aws-data-engineer-week-10-automation-iac-dbt-lab.md) |
| Remediation and official pretest | [Week 11](aws-data-engineer-week-11-remediation-pretest.md) |
| Timed practice and scheduling decision | [Week 12](aws-data-engineer-week-12-timed-readiness-exam.md) |

## Weekly accountability contract

At every check-in, report:

```text
Week:
Dates covered:
Account/Region:
Hours studied:
Learning/lab completed:
Evidence location:
Quiz/practice score by domain:
What broke or felt unclear:
Confidence (1–5):
Next commitment:
```

I will return the evidence-based status, the highest-value gap, a short targeted quiz or troubleshooting prompt, and the next commitment. A week becomes **verified** only after the appropriate artifact, result, reflection, and cleanup evidence are reported.
