# Week 12 — Timed practice, official practice exam, and readiness decision

Week 12 is the decision phase. It is not a reason to schedule the exam merely because the calendar says twelve weeks have passed. Schedule only when the evidence shows that your AWS-specific gaps are closed.

## Current exam facts

Recheck the [current official DEA-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html) and [AWS certification page](https://aws.amazon.com/certification/certified-data-engineer-associate/) immediately before scheduling. The current published format is:

- 65 questions in 130 minutes;
- multiple-choice and multiple-response questions;
- 50 scored questions and 15 unscored questions, which are not identified;
- scaled score from 100 to 1,000, with 720 as the minimum passing score;
- unanswered questions are scored incorrect and there is no penalty for guessing.

These facts and the exam guide revision are external state. Record the date you checked them; do not rely on an old screenshot or study guide.

## Account and cost gate

The timed-readiness work can be completed with no AWS account. Do not create new services in Week 12. Use the existing capstone only for a final end-to-end verification if it is already budgeted and can be torn down.

The exam fee, practice-exam availability, and Skill Builder subscription options can change. Review current official pricing and access before purchasing or scheduling. Training is recommended but not mandatory; the evidence gates below are the learning requirement for this plan.

## Part 1 — Prepare the scorecard

Create one row per timed set. Use the same time limit and an uninterrupted environment for each set.

| Set | Date | Source | Questions | Time limit | Overall % | D1 % | D2 % | D3 % | D4 % | Guessed | Main error type | Action |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| A |  | Authorized/original set | 65 | 130 min |  |  |  |  |  |  |  |  |
| B |  | Different authorized/original set | 65 | 130 min |  |  |  |  |  |  |  |  |
| C |  | AWS Official Practice Exam, if available | Full-length; record actual | Current official limit |  |  |  |  |  |  |  |  |

Do not treat a score from the official 20-question Practice Question Set as equivalent to a full readiness result. It is useful for format and gap discovery; the full practice exam is the stronger readiness signal.

## Part 2 — Three timed sessions

### Set A — First full simulation

Before starting:

- close notes and service tabs;
- set a 130-minute timer;
- use the current domain weights as a pacing guide, not as a prediction of exact question counts;
- mark every guessed answer even if it turns out to be correct.

After finishing, review every wrong and guessed question. For each one, record the requirement, selected service, rejected distractor, and the AWS-specific rule that decides the question.

Do not spend the entire review reading explanations passively. Re-answer the question from the requirement and write a one-sentence rule.

### Set B — Remediation simulation

Take Set B only after completing the remediation actions from Set A. Use a different question set. If the same error category appears twice, stop adding new services and repair that category with a targeted lab, comparison card, or troubleshooting exercise.

Examples:

- repeated `Mapping` errors → rewrite the GCP-to-AWS service matrix;
- repeated `Tradeoff` errors → add cost/latency/operations columns and explain the rejected choice;
- repeated `Operation` errors → reproduce the IAM, partition, retry, or lifecycle behavior in a small lab or no-account worksheet;
- repeated `Reading` errors → underline the requirement and the “best,” “least,” “most,” or “near real time” qualifier before evaluating services.

### Set C — Official readiness assessment

Use the AWS Certification Official Practice Exam if it is available through your current Skill Builder plan. Follow the current AWS instructions, record the question count/time limit shown by the offering, and save the scaled result and domain feedback. Do not share or reproduce its questions.

If the official exam is not available, use a different authorized practice form and label it clearly as a substitute. It can inform the decision, but it is not equivalent evidence to the official practice exam.

## Part 3 — Readiness gates

Schedule only when every required gate is true:

| Gate | Required evidence |
|---|---|
| Blueprint coverage | Current guide checked; all four domains and in-scope service families mapped to a study artifact |
| Practical foundation | S3 → Glue → Athena → Redshift capstone completed or convincingly demonstrated; teardown evidence saved |
| Troubleshooting | Access, schema, partition/scan, retry/idempotency, data-quality, monitoring, and cost failures can be diagnosed aloud |
| Timed performance | At least three timed sets at or above 80%; no domain repeatedly below 70%; guessed answers and error categories are logged |
| Official assessment | Official Practice Exam indicates readiness after remediation, or a documented reason explains why it is unavailable |
| Confidence | You can explain why each distractor is wrong, not just why the selected answer looks familiar |
| Logistics | Exam guide revision, price, testing option, identification requirements, date, and time zone have been checked on official AWS/Pearson VUE pages |

The 80% thresholds are this learning plan’s conservative readiness rules, not a conversion of percentage to AWS’s scaled score. A practice score is evidence, not a guarantee.

## Part 4 — Final review map

Use the last review session to explain these without notes:

### Ingestion and transformation

S3 versus Kinesis Data Streams versus Firehose; Glue versus EMR versus Lambda versus Redshift; partition keys, shards, retention, replay, buffering, throttling, API rate limits, schema evolution, bookmarks/checkpoints, retries, idempotency, Step Functions/Glue Workflows/MWAA/EventBridge, SAM/IaC/CI/CD.

### Store management

S3/Athena versus Redshift; RDS/Aurora versus DynamoDB; Kinesis/MSK versus a database; Glue Catalog/Lake Formation; `COPY`/`UNLOAD`/Spectrum/federated access; partitioning/compression; lifecycle/versioning/TTL; migration/full load/CDC; Iceberg; HNSW/IVF recognition.

### Operations and support

CloudWatch metrics/logs/alarms/Logs Insights versus CloudTrail management/data events; Athena/Redshift SQL; aggregation/rolling average/grouping/pivoting; quality checks and sampling; skew/backlog/locks; provisioned/serverless cost; DataBrew/QuickSight/Athena Spark notebooks/Data Wrangler recognition.

### Security and governance

IAM credential chain, role trust, permissions/resource policies, conditions, `iam:PassRole`; VPC security groups/endpoints/allowlists; S3/Lake Formation/database permissions; KMS/key policies/envelope encryption; Secrets Manager/Parameter Store; masking/anonymization; audit logs; role/tag/attribute-based authorization; privacy and deletion.

## Part 5 — Exam-session strategy

- Read the entire scenario and identify the primary constraint before looking for a service name.
- For multiple response, select all responses required by the question; do not stop after finding one plausible answer.
- Prefer the option that satisfies the stated requirement with the least unnecessary operational cost and complexity.
- When two options work, use the qualifier: latency, replay, durability, cost, security, managed effort, or scalability.
- Mark uncertain questions and continue. Return with the requirement and eliminate distractors systematically.
- Do not leave questions unanswered; AWS states unanswered questions are incorrect and there is no guessing penalty.
- Use the time budget intentionally: average time is about two minutes per question, but reserve a final review period.

## Part 6 — Scheduling decision

Complete this only after the gates:

```text
Current date:
Current official guide revision/date checked:
Set A score and domain profile:
Set B score and domain profile:
Set C / official practice result:
Repeated domain below target:
Repeated error category:
Capstone evidence location:
Troubleshooting evidence location:
Official practice exam access/result:
Exam fee/testing option/date checked:
Decision: schedule / delay and remediate
Reason:
Next commitment:
```

If the decision is **delay**, choose a specific two-week remediation block and repeat only the weak domain and one mixed timed set. If the decision is **schedule**, choose a date that leaves a short buffer for review, but stop expanding the service list.

## Part 7 — Final 72 hours

- Recheck the official guide and exam logistics.
- Review the service comparison matrix, error log, and personal one-page rules sheet.
- Rehearse the capstone and failure runbook aloud once.
- Do not start a large new AWS service or consume a new paid lab.
- Keep credentials, IDs, and appointment details private.
- Sleep and arrive with enough time for the selected testing option’s current check-in process.

## Week 12 check-in

```text
Week: 12 — Timed practice and readiness decision
Dates covered:
Current official guide revision checked:
Set A score / domain scores:
Set B score / domain scores:
Set C or official practice result:
Timed-set average:
Lowest repeated domain:
Lowest repeated error category:
Capstone evidence location:
Troubleshooting evidence location:
All readiness gates met (yes/no):
Decision: schedule / delay:
Exam date if scheduled:
Current confidence (1–5):
Next commitment:
```

## Official references

- [Current DEA-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html)
- [AWS Certified Data Engineer — Associate certification page](https://aws.amazon.com/certification/certified-data-engineer-associate/)
- [AWS certification preparation](https://aws.amazon.com/certification/certification-prep/)
- [AWS Skill Builder](https://skillbuilder.aws/)
- [AWS Certification FAQs](https://aws.amazon.com/certification/faqs/)
