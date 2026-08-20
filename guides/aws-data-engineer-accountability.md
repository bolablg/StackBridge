# AWS Data Engineer accountability tracker

Objective: prepare for and pass AWS Certified Data Engineer – Associate (DEA-C01) by building practical AWS data-engineering skills through a tailored GCP-to-AWS path.

This tracker records verified progress. A prepared guide is not the same as a completed lab. A week becomes **verified** only when the check-in includes an artifact, command output, screenshot, quiz score, or other evidence appropriate to that week's deliverable.

## How we will use it

At each weekly check-in, send the template at the bottom of this file in the chat. I will return:

- the current status and evidence quality;
- the one or two highest-value gaps to close;
- a realistic next commitment for the coming week;
- a short quiz or troubleshooting prompt tied to your weak domain;
- an updated readiness signal for DEA-C01.

Suggested cadence: one check-in every Wednesday or after each completed lab. No automated reminder has been created; the check-in remains under your control.

## Current baseline

| Area | Current evidence status | Next proof needed |
|---|---|---|
| GCP foundation | Certified Google Cloud Professional Data Engineer, reported by learner | Use the transfer map rather than repeat basic data-engineering theory |
| AWS account | New account reported by learner; setup evidence pending | Identity type/status (not credentials), Region, MFA, billing guardrails, and S3 bucket status |
| Week 0 account setup | Guide prepared; execution not verified | Account/budget/MFA evidence |
| Week 1 S3 | Guide prepared; execution not verified | Bucket policy, encryption, lifecycle, object, and cleanup evidence |
| Week 2 Glue/Athena | Guide prepared; execution not verified | Catalog table, partitions, query scan, CTAS, and cleanup evidence |
| Week 3 Glue ETL | Guide prepared; execution not verified | Job run, logs, curated table, schema-evolution decision, and cleanup evidence |
| Week 4 Redshift | Guide prepared; execution not verified | `COPY`/`NOLOAD`, model query, `UNLOAD`, optional external schema, and teardown evidence |
| Week 5 streaming | Guide prepared; execution not verified | Kinesis/Firehose delivery evidence and teardown evidence |
| Week 6 orchestration | Guide prepared; execution not verified | Step Functions execution, EventBridge trigger, failure-path evidence, and teardown evidence |
| Week 7 data stores and migration | Guide prepared; execution not verified | Decision matrix, DynamoDB query/scan evidence if attempted, migration runbook, and teardown evidence |
| Week 8 security and governance | Guide prepared; execution not verified | Policy validation, access matrix, encryption/secrets/governance decisions, quiz score, and cleanup evidence if applicable |
| Week 9 observability and reliability | Guide prepared; execution not verified | Logs/CloudTrail evidence, quality rules, failure/recovery runbook, cost worksheet, quiz score, and cleanup evidence |
| Week 10 automation, IaC, and dbt | Guide and starter kit prepared; execution not verified | Active identity, read-only Boto3 inventory, CloudFormation validation/teardown, dbt DAG/tests or no-account mapping, CI/CD design, and quiz score |
| Week 11 remediation and pretest | [Guide prepared](aws-data-engineer-week-11-remediation-pretest.md); learner scores and remediation evidence pending | Current-guide audit, domain scores, error-log closure, remediation artifacts, official pretest result if available, and 16-question score |
| Week 12 timed readiness | [Guide prepared](aws-data-engineer-week-12-timed-readiness-exam.md); learner timed-set and scheduling evidence pending | Three timed-set results, official practice result if available, capstone/troubleshooting evidence, readiness gates, and schedule/delay decision |
| DEA-C01 practice | No score reported yet | Domain-level quiz baseline |

## Weekly status scale

- **Not started** — no study or execution evidence.
- **Studying** — learning completed, lab or quiz still open.
- **Practiced** — lab or quiz attempted, but evidence or troubleshooting is incomplete.
- **Verified** — deliverable, evidence, teardown, and reflection are complete.
- **Revisit** — completed once, but quiz/troubleshooting results show a material gap.

## Milestone tracker

| Week | Milestone | Status | Evidence link or note | Confidence |
|---|---|---|---|---|
| 0 | Account, identity, budget, Region | Not started |  |  |
| 1 | Secure S3 foundation | Not started |  |  |
| 2 | Glue Catalog and Athena lake | Not started |  |  |
| 3 | Glue ETL and schema evolution | Not started |  |  |
| 4 | Redshift Serverless warehouse | Not started |  |  |
| 5 | Kinesis and Firehose streaming | Not started |  |  |
| 6 | Orchestration and event-driven workflows | Not started |  |  |
| 7 | Operational data stores and migration | Not started |  |  |
| 8 | Security and governance | Not started |  |  |
| 9 | Monitoring, quality, failure recovery, cost | Not started |  |  |
| 10 | CLI, boto3, dbt, IaC, CI/CD | Not started | Guide and starter kit prepared; learner evidence pending |  |
| 11 | Domain remediation and official pretest | Not started | [Guide prepared](aws-data-engineer-week-11-remediation-pretest.md); learner scores and remediation evidence pending |  |
| 12 | Timed practice and readiness decision | Not started | [Guide prepared](aws-data-engineer-week-12-timed-readiness-exam.md); learner timed-set and scheduling evidence pending |  |

Statuses remain conservative until you report evidence. This prevents the plan from confusing reading a lab guide with acquiring operational skill.

## DEA-C01 scorecard

Record the percentage and the error pattern, not only the total score.

| Domain | Weight | Baseline | Latest | Target before scheduling | Main gap |
|---|---:|---:|---:|---:|---|
| Ingestion and Transformation | 34% |  |  | ≥80% consistently |  |
| Store Management | 26% |  |  | ≥80% consistently |  |
| Operations and Support | 22% |  |  | ≥80% consistently |  |
| Security and Governance | 18% |  |  | ≥80% consistently |  |

Readiness requires more than quiz scores:

- an end-to-end S3 → Glue → Athena → Redshift capstone;
- at least three timed practice sets at or above 80% with an error log;
- the ability to troubleshoot access, schema, retry, partition, and cost failures;
- an official practice exam after remediation;
- a deliberate scheduling decision based on evidence.

## Error log

Use one row per missed question or broken lab behavior.

| Date | Source | Domain | Error type | What I thought | Correct rule | Follow-up |
|---|---|---|---|---|---|---|
|  |  |  | Vocabulary / mapping / tradeoff / operation / reading |  |  |  |

Useful error categories:

- **Vocabulary** — confused an AWS service or term.
- **Mapping** — chose the wrong GCP-to-AWS analogue.
- **Tradeoff** — knew the services but missed cost, latency, durability, or operational implications.
- **Operation** — missed the concrete IAM, partition, retry, or configuration behavior.
- **Reading** — misread the question constraint or priority.

## Weekly check-in template

Copy, complete, and send this block:

```text
Week:
Dates covered:
Account/Region:
Account status and billing guardrails:
Hours studied:
Learning completed:
Lab or artifact completed:
Evidence location:
Quiz/practice score by domain:
Error-log entries added:
What broke or felt unclear:
Current confidence (1–5):
Next commitment (specific and time-bounded):
```

## First check-in

Because account status and actual lab execution have not yet been reported, the first useful check-in is a baseline rather than a pass/fail judgment. Send:

```text
Week: baseline
AWS account status:
AWS Region:
Week 1 S3 bucket exists (yes/no/unknown):
Billing budget/alerts active (yes/no/unknown):
Hours available per week:
Preferred check-in day:
Current DEA-C01 confidence (1–5):
```

Before or alongside the first check-in, complete the [DEA-C01 baseline diagnostic](aws-dea-c01-baseline-diagnostic.md) without notes and send the answer string. The baseline is a measurement, not a pass/fail decision.
