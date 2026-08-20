# Week 11 — Domain remediation and official pretest

Week 11 converts practice results into targeted repairs. Do not reread every AWS service from the beginning. Use your baseline, lab evidence, original quizzes, and official practice results to identify the few concepts that are costing you points.

The official AWS preparation flow is: understand the exam and exam-style questions, refresh knowledge and skills, review and practice, then assess readiness. This guide mirrors that sequence while keeping your GCP Professional Data Engineer background in mind.

## Outcomes

- Produce a domain-level score and an error taxonomy rather than one undifferentiated percentage.
- Repair AWS-specific vocabulary, permissions, service-selection, operational, and cost misconceptions.
- Audit the current exam guide for newer scope examples such as SAM/IaC/CI/CD, data APIs and rate limits, Apache Iceberg and vector concepts, DataBrew/QuickSight/Athena notebooks, and VPC/ABAC controls.
- Complete a targeted remediation loop and an official pretest if it is available through your current AWS Skill Builder plan.
- Decide whether you are ready for Week 12 timed practice; do not schedule the certification exam yet.

## Official preparation sequence

| Official phase | Your Week 11 action | Evidence |
|---|---|---|
| Get to know the exam | Read the current guide, take the official 20-question Practice Question Set, and complete the local baseline diagnostic | Guide revision checked, score, and error log |
| Refresh knowledge and skills | Use the free Exam Prep Standard Course and targeted AWS documentation/labs for weak domains | Notes tied to missed concepts |
| Review and practice | Repeat service comparisons, troubleshooting drills, and domain quizzes; use the official Pretest only after remediation | Domain scores and corrected explanations |
| Assess readiness | Review the pretest report and unresolved errors | Go/no-go decision for Week 12 |

AWS changes the availability and pricing of Skill Builder offerings. Check the current [AWS certification preparation page](https://aws.amazon.com/certification/certification-prep/) and [DEA-C01 certification page](https://aws.amazon.com/certification/certified-data-engineer-associate/) before paying for a subscription. Never use exam dumps or copied proprietary questions.

## Account and cost gate

### No-account track

Complete the guide, official free content, service matrices, troubleshooting drills, and original quiz without creating resources. This is a valid Week 11 outcome and is preferable to creating expensive services solely to obtain a score.

### Account track

Use the existing capstone resources only if they are already running under the Week 0 budget controls. Do not create a second Redshift workgroup, MWAA environment, EMR cluster, NAT Gateway, or production-like CI/CD pipeline for remediation. A conceptual answer backed by an accurate tradeoff is better evidence than an uncontrolled bill.

## Step 1 — Establish the score baseline

Before opening the answer key, record:

```text
Date:
Current exam-guide revision checked:
Official Practice Question Set score:
Local diagnostic score:
Week 1–10 quiz scores:
Domain 1 score / questions:
Domain 2 score / questions:
Domain 3 score / questions:
Domain 4 score / questions:
Questions guessed but correct:
Questions answered with low confidence:
```

For every wrong or guessed question, add one row to the tracker error log. Use one of these categories:

- **Vocabulary** — the AWS service or feature was unfamiliar.
- **Mapping** — a known GCP concept was mapped to the wrong AWS service.
- **Tradeoff** — the services were known, but cost, performance, latency, durability, or operational constraints were missed.
- **Operation** — IAM, partition, retry, API, schema, or lifecycle behavior was missed.
- **Reading** — a qualifier such as “least operational overhead,” “near real time,” “replay,” or “lowest cost” was overlooked.

Do not record only “I got it wrong.” Write the rule that would let you choose correctly under a changed scenario.

## Step 2 — Audit the current guide for scope

The [current DEA-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html) remains authoritative. The domain pages are the source of truth for task statements and examples:

- [Domain 1 — Data Ingestion and Transformation](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain1.html)
- [Domain 2 — Data Store Management](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain2.html)
- [Domain 3 — Data Operations and Support](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain3.html)
- [Domain 4 — Data Security and Governance](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain4.html)

Add a check mark only when you can explain the requirement, AWS candidate service, tradeoff, and operational/security consequence:

| Current-guide area | Recognition target | Hands-on requirement for this path |
|---|---|---|
| Data APIs, throttling, rate limits, fan-in/fan-out, replayability | Explain how limits, buffering, consumer positions, and replay affect Kinesis, DynamoDB, RDS, DMS, and APIs | Use the Week 5 streaming worksheet or write a no-account replay design |
| SAM, CloudFormation/CDK, IaC, CI/CD | Distinguish authoring abstraction, synthesized/deployed stack, build validation, and deployment approval | Week 10 template/buildspec review; no serverless stack required |
| LLM integration for data processing | Recognize an architecture decision, data/privacy boundary, latency/cost concern, and human validation need | Conceptual architecture only; no model deployment required |
| Store selection and migration | Choose among S3/Athena, Redshift, RDS/Aurora, DynamoDB, Kinesis/MSK, EMR, Transfer Family, DMS, and federated/Spectrum paths | Week 7 decision matrix and Week 4 load/unload explanation |
| Iceberg, partitions, compression, schema evolution | Explain when an open table format and catalog-managed table are useful | Design exercise; do not create an Iceberg production table just for the exam |
| Vector concepts, HNSW, and IVF | Explain index/search tradeoffs at a conceptual level | One comparison card; no vector workload required |
| DataBrew, QuickSight, Athena Spark notebooks, Data Wrangler, SageMaker Unified Studio | Identify the preparation, visualization, exploration, or catalog role; distinguish from Glue/Redshift/Athena SQL | Service-purpose matrix; no paid visualization workspace required |
| VPC security groups, endpoints, IP allowlists, ABAC/tag-based authorization | Explain network reachability versus IAM/Lake Formation authorization and how tags/attributes can drive access | Security diagram and policy review from Week 8 |

## Step 3 — Repair by domain

### Domain 1 — Data Ingestion and Transformation (34%)

Prioritize this domain first because it carries the highest weighting.

| Repair question | Correct reasoning to practice |
|---|---|
| Is the source batch, streaming, or an API? | Choose the ingestion family first; then discuss buffering, replay, ordering, rate limits, and failure handling. |
| Is transformation serverless Spark, warehouse SQL, short code, or distributed compute? | Compare Glue, Redshift, Lambda, EMR, and managed streaming rather than choosing the most familiar tool. |
| Does the pipeline need a replayable event history? | Distinguish Kinesis Data Streams retention/replay from Firehose delivery and from a one-shot batch object. |
| Does the job need orchestration or processing? | Glue/EMR/Lambda/Redshift process; Step Functions, Glue Workflows, MWAA, and EventBridge coordinate. Some services can do both, but name the boundary. |
| Can the run be retried safely? | Define idempotency keys, deterministic output paths, checkpoints/bookmarks, and partial-output cleanup before adding retries. |
| How does code reach AWS? | Use an SDK/CLI session and role; never put credentials in code. Include logging, tests, IaC, and CI/CD in the design. |

Remediation evidence: one diagram or written scenario that names the source type, AWS service, partition/replay choice, retry/idempotency behavior, and cost control.

### Domain 2 — Data Store Management (26%)

Use this decision order:

1. Access pattern and latency: scan/query, key lookup, transaction, stream, or analytical aggregation.
2. Data shape and lifecycle: structured/semi-structured, retention, versioning, TTL, schema evolution, and legal deletion.
3. Scale and performance: volume, concurrency, partitioning, compression, indexing, and availability.
4. Operating model and cost: serverless/provisioned, data scanned, compute time, storage, and migration overhead.
5. Security and catalog: identity, resource, database, Glue Catalog, Lake Formation, network, and encryption layers.

Complete six one-paragraph scenarios:

```text
1. Large append-only files, occasional SQL, lowest operational overhead:
2. High-volume key lookups with a known partition key:
3. Transactions and relational constraints with a small operational workload:
4. Continuous events that must be replayed by multiple consumers:
5. Existing database migration with full load followed by ongoing changes:
6. Analysts query S3 while a warehouse serves repeated high-performance aggregates:
```

For each, name the first choice, one rejected alternative, the cost driver, and the security/catalog consideration.

### Domain 3 — Data Operations and Support (22%)

Practice a signal-to-action loop:

```text
symptom → observable signal → likely hypotheses → narrow evidence query → safe fix → verification → prevention
```

Cover:

- CloudWatch metrics/logs/alarms versus CloudTrail API history/data events;
- Athena and Redshift SQL, aggregation, rolling averages, grouping, and pivoting;
- Glue/EMR/Step Functions failures, retries, backlog, skew, and partial output;
- completeness, uniqueness, accepted values, referential integrity, freshness, volume, sampling, and quarantine;
- DataBrew/QuickSight/Athena Spark notebooks/Data Wrangler as recognition-level tools;
- provisioned versus serverless cost/performance tradeoffs.

Remediation evidence: one root-cause analysis from a real or hypothetical broken pipeline that includes a log/metric/API signal and a cost-aware recovery action.

### Domain 4 — Data Security and Governance (18%)

Use this authorization chain:

```text
credential source → identity/trust policy → identity policy → resource policy → network reachability → catalog/database permissions → KMS/key policy → audit evidence
```

Practice separating:

- authentication from authorization;
- IAM role trust from role permissions;
- S3/IAM access from Lake Formation data permissions;
- security groups/endpoints/allowlists from IAM policy decisions;
- Secrets Manager/Parameter Store from KMS encryption keys;
- CloudTrail management events from object-level data events;
- encryption from masking/anonymization and privacy governance;
- role-based, tag-based, and attribute-based access.

Remediation evidence: one access diagram and one least-privilege policy review with the exact principal, action, resource, condition, and expected denial.

## Step 4 — Troubleshooting drills

For each scenario, write the first three checks before proposing a change.

| Scenario | Do not jump straight to | First evidence to gather |
|---|---|---|
| Glue job suddenly fails after an upstream column change | Increasing workers | Job run error, schema/catalog version, input sample, and output location |
| Kinesis consumer lag increases for one partition | Adding random shards | Partition-key distribution, iterator age, throttles, batch/processing latency |
| Athena query cost jumps | Deleting data | Format, partition predicate, columns selected, workgroup limit, bytes scanned |
| Step Functions retry creates duplicate output | Removing all retries | Execution history, run ID, output path, idempotency key, and promotion/commit step |
| Redshift query is slow and blocked | Increasing compute immediately | Query plan, locks, queue/concurrency, table statistics, distribution/sort behavior |
| Glue/Redshift task returns `AccessDenied` | Attaching AdministratorAccess | Caller/service role ARN, trust policy, action/resource, bucket/key/Lake Formation policy |
| Audit cannot show an S3 object read | Assuming CloudTrail is broken | Whether data events were configured for the bucket/prefix and which trail/event store was queried |
| A secret rotation breaks a pipeline | Hard-coding the new password | Secret version/staging label, consumer retrieval path, KMS permission, and connection retry behavior |

## Step 5 — Original remediation check

Answer without notes. These are original study prompts, not official exam questions.

1. A Kinesis producer sends most records with the same partition key. What failure/performance risk should you investigate?
2. Which design element makes a batch pipeline safe to retry: a random output path, an idempotency key and deterministic promotion step, or removing all retries?
3. Why is Firehose not a substitute for a replayable Kinesis Data Streams retention design?
4. What does AWS SAM add relative to raw CloudFormation, and what service still owns the deployed stack?
5. Which store best fits frequent key-based reads at high scale when the access pattern is known: DynamoDB, Athena over S3, or an RDS snapshot?
6. What two observations tell you an Athena query is scanning too much data?
7. Why might Apache Iceberg be chosen over a collection of unmanaged Parquet files?
8. At recognition level, what is the tradeoff represented by HNSW versus IVF vector indexes?
9. Which service is the first place to investigate an API call that changed an IAM policy: CloudTrail management-event history, S3 data events, or Glue job bookmarks?
10. Name two actions for diagnosing data skew in a distributed transformation.
11. What is the difference between an IAM role trust policy and its permissions policy?
12. Why can a security group fix fail even when the IAM policy is correct?
13. Which service is designed to store and retrieve application secrets with rotation support: Secrets Manager, CloudTrail, or Glue Data Catalog?
14. Why does cross-account SSE-KMS access require reviewing both the caller permissions and the KMS key policy?
15. What is the difference between encryption and masking/anonymization?
16. How do tag-based or attribute-based policies differ from granting the same broad role to every user?

### Answer key

1. A hot partition/key can concentrate traffic, causing throttling and lag; inspect key distribution and capacity/consumer behavior.
2. An idempotency key plus deterministic output and a safe promotion/commit step.
3. Firehose is a managed delivery/buffering path; it does not provide the same application-controlled retention, consumer positions, and replay semantics as a retained data stream.
4. SAM provides a shorter serverless authoring/packaging model; CloudFormation still creates and owns the stack.
5. DynamoDB, assuming the key design and consistency/throughput requirements fit.
6. Bytes scanned/query statistics and the absence of effective partition/column pruning; also inspect format and selected columns.
7. Iceberg supplies table metadata and transactions/schema/partition evolution patterns that are difficult to manage safely with loose files alone.
8. They represent different approximate nearest-neighbor index structures with different build/search speed, memory, recall, and update tradeoffs; know the use-case reasoning, not implementation syntax.
9. CloudTrail management-event history, assuming the API call is recorded there.
10. Inspect partition-key/distribution balance and task-level metrics; then adjust partitioning, salting, or data layout after confirming the cause.
11. Trust says who/what may assume the role; permissions say what the assumed role may do.
12. Network reachability and IAM authorization are separate; the route, endpoint, NACL, DNS, or security group may block the connection before IAM is evaluated.
13. Secrets Manager.
14. The caller must be allowed to use the key and the key policy must allow the relevant principal/account; S3/service permissions may also be involved.
15. Encryption protects data through reversible cryptographic access; masking/anonymization changes or hides values for privacy/use-case reasons and may be irreversible.
16. Access is evaluated from attributes/tags and conditions, allowing a narrower, scalable policy model than a broad identical role assignment.

## Week 11 stop/go gate

Proceed to Week 12 timed practice only when:

- every wrong/guessed baseline question has an error-log row and corrective rule;
- each domain has at least one completed remediation artifact;
- the original remediation check is at least 80%, or every miss has been corrected and retaken;
- you can explain the capstone architecture and its IAM, quality, monitoring, and cost boundaries without notes;
- the current official guide and in-scope service list have been rechecked.

If any condition is false, spend the next session on the specific domain rather than taking another broad practice test.

## Week 11 check-in

```text
Week: 11 — Domain remediation and official pretest
Dates covered:
Account/Region:
Hours studied:
Current exam-guide revision checked:
Official Practice Question Set score:
Official Pretest taken (yes/no/not available):
Domain 1 score and main gap:
Domain 2 score and main gap:
Domain 3 score and main gap:
Domain 4 score and main gap:
Remediation artifacts completed:
Original remediation check score (out of 16):
Error-log entries added/closed:
What remains unclear:
Current confidence (1–5):
Week 12 go/no-go decision:
Next commitment:
```

## Official references

- [Current DEA-C01 exam guide](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html)
- [Domain 1 task statements](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain1.html)
- [Domain 2 task statements](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain2.html)
- [Domain 3 task statements](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain3.html)
- [Domain 4 task statements](https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01-domain4.html)
- [AWS Certified Data Engineer — Associate certification page](https://aws.amazon.com/certification/certified-data-engineer-associate/)
- [AWS certification preparation](https://aws.amazon.com/certification/certification-prep/)
- [AWS Skill Builder](https://skillbuilder.aws/)
