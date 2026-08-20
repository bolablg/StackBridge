# Week 9 — Observability, data quality, failure recovery, and cost

This week turns the pipeline into an operable system. A data engineer must be able to answer four questions quickly:

1. Did the pipeline run?
2. Did it produce correct and complete data?
3. If it failed, can it be safely retried or replayed?
4. What did the run cost, and how will we notice an unexpected increase?

## Outcomes

By the end of this week, you should be able to:

- distinguish CloudWatch logs/metrics/alarms from CloudTrail audit events;
- write a narrow CloudWatch Logs Insights query and explain why time range and log-group scope matter;
- define data-quality rules for completeness, uniqueness, validity, freshness, volume, and referential integrity;
- choose retry, quarantine, fail-fast, backfill, or replay behavior for common data failures;
- design idempotent outputs and a failure runbook for Glue, Step Functions, Kinesis, Athena, and Redshift branches;
- identify the main cost drivers in the capstone and use Budgets, Cost Explorer, tags, and anomaly alerts appropriately.

## Cost and safety gate

This is primarily a no-account and read-only week. Do not create new long-lived resources just to produce monitoring screenshots. Do not create a CloudTrail trail, CloudTrail Lake event data store, Macie job, or high-frequency CloudWatch dashboard without confirming the cost and retention implications.

CloudWatch Logs Insights queries can incur charges based on data scanned, so use one narrow log group and the smallest useful time range. CloudTrail Event history is a safe read-only exercise, but CloudTrail data events are not enabled by default and have additional charges. AWS Glue Data Quality tasks and ETL checks consume Glue processing resources. Budgets and Cost Explorer provide visibility, but billing data and alerts can be delayed.

If Weeks 1–8 have not been executed, complete the worksheets and local examples. If an earlier state machine, Glue job, or S3 bucket already exists and its budget gate is approved, reuse it; do not create another parallel capstone.

## Observability map

| Question | Primary AWS tool | What it tells you | What it does not prove |
|---|---|---|---|
| Did a Glue job log an exception? | CloudWatch Logs | Runtime messages, stack traces, job/application logs | That the data is correct |
| Did a job or workflow fail? | CloudWatch metrics, Step Functions history, Glue run status | State transitions, failure counts, duration, retries | That every output row is valid |
| Who changed a role, rule, bucket policy, or job? | CloudTrail management events | API caller, time, Region, request, result | Every S3 object read/write unless data events are configured |
| Who read or deleted an S3 object? | CloudTrail S3 data events, if deliberately enabled | Object-level data-plane activity | Historical data events before logging was enabled |
| Is the data complete and valid? | SQL checks, Glue Data Quality/DQDL, custom validation | Rule outcomes and bad-record signals | Business meaning beyond the rules you wrote |
| Are we spending unexpectedly? | Budgets, Cost Explorer, Cost Anomaly Detection | Actual/forecast spend, trends, anomalies | A real-time transaction-level cost kill switch |

Keep these two distinctions clear:

- **CloudWatch** helps operate workloads: logs, metrics, dashboards, alarms, and log queries.
- **CloudTrail** helps audit API activity: who called what, when, from where, and with which request context.

## Part 1 — CloudWatch metrics, logs, and alarms

### 1.1 Signals to monitor

Use this as a starting inventory. Exact metric names and dimensions vary by service and integration, so verify them in the service console or current documentation before creating an alarm.

| Pipeline component | Useful signals | Example response |
|---|---|---|
| Glue crawler | Run failure, duration, tables/partitions discovered | Inspect schema drift and crawler target; do not blindly rerun against an unexpected prefix |
| Glue ETL | Job failure, duration, worker/DPU usage, input/output records, error logs | Inspect logs, input schema, permissions, and output atomicity |
| Athena | Query failure, bytes scanned, execution time, workgroup usage | Check partition pruning, file format, query result location, and workgroup limits |
| Redshift | Query duration/queueing, connections, storage, workload errors | Check distribution/sort strategy, workload management, and query plan |
| Kinesis Data Streams | Incoming records/bytes, iterator age, read/write throttles | Check partition-key skew, consumer lag, retention, and consumer capacity |
| Firehose | Delivery success/failure, data freshness, throttling, backup objects | Check destination IAM, buffering, transformation errors, and S3 prefix |
| Lambda consumer | Errors, duration, throttles, iterator age, concurrent executions | Inspect batch size, retry behavior, poison records, and idempotency |
| Step Functions | Executions started/succeeded/failed/timed out, duration | Inspect execution history and state-level error/cause; classify retryability |
| S3 | Storage, requests, 4xx/5xx metrics where enabled, object inventory/lifecycle | Check unexpected access, prefix growth, and retention policy |

An alarm must have a response owner and runbook. An alarm without a decision or action is noise.

### 1.2 Logs Insights query exercise

Use the CloudWatch console first. Choose one known Glue or Lambda log group, select a narrow time range, and run:

```text
fields @timestamp, @message, @logStream
| filter @message like /(?i)(error|exception|failed|accessdenied)/
| sort @timestamp desc
| limit 20
```

Then adapt it to a request or run identifier:

```text
fields @timestamp, @message, @logStream
| filter @message like /run_id=<replace-with-a-run-id>/
| sort @timestamp asc
| limit 100
```

Record:

- the log group selected;
- the exact start/end time;
- the number of bytes scanned shown by CloudWatch;
- the first error and the likely upstream cause;
- whether the query result contains secrets or personal data that should be masked/redacted.

The query language supports `fields`, `filter`, `parse`, `stats`, `sort`, and `limit`. Keep the time range and log-group selection narrow; cancel a query before closing the console.

Optional CLI pattern, only if you already have a log group and permission to query it:

```bash
export AWS_REGION="<your-learning-region>"
export LOG_GROUP_NAME="<one-existing-log-group>"
export START_TIME="<unix-seconds-start>"
export END_TIME="<unix-seconds-end>"

QUERY_STRING='fields @timestamp, @message, @logStream
| filter @message like /(?i)(error|exception|failed)/
| sort @timestamp desc
| limit 20'

aws logs start-query \
  --log-group-names "${LOG_GROUP_NAME}" \
  --start-time "${START_TIME}" \
  --end-time "${END_TIME}" \
  --query-string "${QUERY_STRING}" \
  --region "${AWS_REGION}"
```

The command returns a query ID. Use `aws logs get-query-results` with that ID, then record the query cost/scan information visible in the console. Do not use a large time range merely to find one error.

### 1.3 Alarm design worksheet

For each proposed alarm, write the metric, dimensions, threshold, evaluation periods, missing-data treatment, notification/response, and teardown owner.

| Alarm | Metric/signal | Threshold and period | Response | Missing-data decision |
|---|---|---|---|---|
| Glue pipeline failed | Glue run failure or failed execution | Any failed production run | Stop downstream promotion; inspect logs; notify owner | Treat missing data as not automatically healthy |
| Workflow stalled | Step Functions duration/timeout | Above expected SLA | Inspect current execution and upstream service | Distinguish no execution from successful zero-volume run |
| Streaming lag | Kinesis iterator age | Above freshness SLO | Check consumer health and partition skew | Do not hide a missing consumer behind “no data” |
| Data freshness | Quality result or latest event timestamp | Older than agreed SLA | Quarantine/alert; decide backfill | A zero-row dataset is not automatically fresh |
| Cost spike | Budget/anomaly notification | Account/project threshold | Freeze optional experiments and investigate | Billing data may arrive later than usage |

## Part 2 — CloudTrail audit exercise

CloudTrail Event history is enabled by default and provides a searchable, immutable view of the past 90 days of management events for a Region. It is a safe first audit exercise and has no charge for viewing event history.

Event history does not show S3 object-level `GetObject`, `PutObject`, or `DeleteObject` activity. Those are data events and are not logged by trails or event data stores by default; enabling them adds charges. Use advanced event selectors to narrow data events to the resources and operations that matter.

### 2.1 Read-only CLI lookup

```bash
export AWS_REGION="<your-learning-region>"

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=StartJobRun \
  --max-results 10 \
  --region "${AWS_REGION}" \
  --output json
```

Repeat conceptually or in the console for `CreateRole`, `PutBucketPolicy`, `StartExecution`, `PutRule`, and `DeleteBucket`. If the account has no matching event, record “no event found”; do not manufacture a resource merely to create a log.

For one event, identify:

- `eventTime` and `awsRegion`;
- `eventName` and `eventSource`;
- `userIdentity` and whether the call came from a role or an assumed-role session;
- request parameters and resource names;
- `errorCode`/`errorMessage`, if present;
- source IP or user agent where available;
- the likely corrective action and whether the event should be preserved for incident review.

### 2.2 Audit versus observability scenarios

Choose the primary tool:

1. A Glue job threw a Python exception. → CloudWatch Logs and Glue run details.
2. Someone changed an S3 bucket policy. → CloudTrail management event.
3. A particular object was deleted and object-level attribution is required. → CloudTrail S3 data event, if it was enabled for that bucket/prefix.
4. A Step Functions state took longer than its SLO. → CloudWatch metric/execution history.
5. A role has permissions that no longer appear necessary. → CloudTrail access activity plus IAM Access Analyzer/last-accessed analysis.

## Part 3 — Data-quality rules and quality gates

### 3.1 Quality dimensions

| Dimension | Example rule | Typical response when it fails |
|---|---|---|
| Completeness | `order_id` is not null | Quarantine or fail the batch |
| Uniqueness | One row per `order_id` | Deduplicate or fail; never silently pick a row without a rule |
| Validity | `status` is in an approved set | Quarantine invalid records and alert |
| Range | `amount >= 0` or within business bounds | Reject or route to review |
| Freshness | Latest event is within the SLA | Alert and investigate upstream delay |
| Volume | Row count is above a minimum or within an expected range | Check upstream availability and partition selection |
| Referential integrity | Every fact key has a dimension row | Delay promotion or quarantine unmatched facts |
| Schema | Required columns/types exist | Fail fast on breaking changes; handle additive changes deliberately |
| Reconciliation | Source totals match target totals within tolerance | Stop publication and investigate |

Separate **hard gates** from **warnings**. A missing primary key, unsafe schema change, or mismatched financial total may block publication. A small volume deviation may warn, page, or trigger a backfill depending on the business SLO.

### 3.2 SQL quality worksheet

Use the Week 2/3 Athena table or Week 4 Redshift table if it exists. Adapt column names; do not run against a large dataset without a scan/cost check.

```sql
-- Completeness and volume
SELECT
  COUNT(*) AS row_count,
  SUM(CASE WHEN order_id IS NULL THEN 1 ELSE 0 END) AS null_order_ids,
  SUM(CASE WHEN event_ts IS NULL THEN 1 ELSE 0 END) AS null_event_timestamps
FROM <curated_orders>;
```

```sql
-- Duplicate business keys
SELECT order_id, COUNT(*) AS duplicate_count
FROM <curated_orders>
GROUP BY order_id
HAVING COUNT(*) > 1;
```

```sql
-- Validity and range checks
SELECT
  SUM(CASE WHEN status NOT IN ('paid', 'refunded', 'cancelled') THEN 1 ELSE 0 END) AS invalid_statuses,
  SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) AS negative_amounts
FROM <curated_orders>;
```

```sql
-- Referential integrity: facts without a matching customer
SELECT COUNT(*) AS unmatched_customers
FROM <curated_orders> o
LEFT JOIN <dim_customer> c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;
```

For each query, write the pass/fail threshold and the action. A query that returns zero bad rows is not useful unless the pipeline actually stops or alerts when the result is nonzero.

### 3.3 Glue Data Quality and DQDL

AWS Glue Data Quality provides a managed, serverless way to define and evaluate rules using Data Quality Definition Language (DQDL). A minimal DQDL ruleset is case-sensitive and uses a capitalized `Rules` list:

```text
Rules = [
  RowCount > 0,
  IsComplete "order_id",
  IsUnique "order_id",
  ColumnValues "status" in ["paid", "refunded", "cancelled"]
]
```

Glue Data Quality can work with cataloged data and with Glue ETL jobs. It can publish results to S3 and integrate with CloudWatch and EventBridge. Treat DQDL as a rule engine, not as a replacement for choosing thresholds, ownership, remediation, and business definitions.

Do not create a Data Quality task for this week unless the Glue cost gate is approved. The no-account deliverable is the ruleset plus the SQL equivalents and response policy.

## Part 4 — Failure classification and recovery

### 4.1 Failure policy matrix

| Failure | Retry automatically? | Safe response |
|---|---|---|
| Temporary throttling or service-unavailable error | Usually, with bounded exponential backoff | Retry with jitter and a maximum attempt count; alert after exhaustion |
| Expired/invalid credentials | No blind retry | Fix IAM/secret/role trust; then rerun from a known checkpoint |
| Missing input partition | Usually no immediate retry | Check upstream contract and freshness; fail or wait according to SLA |
| Breaking schema change | No automatic promotion | Quarantine, compare schema version, update contract/code deliberately |
| Duplicate event after consumer retry | Retry may be needed | Use an idempotency key, conditional write, or deterministic merge |
| Partial output objects | Do not publish partial data | Write to a temporary run prefix, validate, then promote or commit a manifest |
| Bad individual records | Do not fail the entire stream forever | Send poison records to a quarantine/dead-letter path with reason and replay procedure |
| Late-arriving but valid data | Not a transient failure | Define watermark/backfill policy and recompute affected partitions or facts |
| Data-quality hard-gate failure | No blind retry | Preserve input, emit result, stop downstream publication, investigate |

### 4.2 Idempotency design

For every retryable step, answer:

- What uniquely identifies this logical run or event?
- If the step executes twice, will it overwrite the same deterministic output or append a duplicate?
- Can the output be written to a temporary location and atomically promoted?
- Is the input checkpoint/bookmark advanced only after the output is valid?
- What evidence proves a replay did not double-count data?

Examples:

- Batch: `run_id + input_partition` controls a deterministic output prefix.
- Event: `event_id` is recorded before applying a non-idempotent side effect.
- Warehouse load: stage into a run-specific table, validate, then `MERGE` or swap according to the model’s key.
- Stream-to-lake: partition by event date plus a stable event identifier, then deduplicate downstream.

### 4.3 Failure drill without creating resources

Write the first five actions for each incident:

1. Glue job failed after writing part of a curated partition.
2. Step Functions retried a Glue task and the target contains duplicate rows.
3. Kinesis consumer iterator age is increasing.
4. Athena bytes scanned increased by 100× after a schema/layout change.
5. A CloudTrail event shows an unexpected `PutBucketPolicy` call.

Strong answers contain detection source, containment, evidence preservation, root-cause check, safe recovery, and post-incident prevention. “Rerun the job” is incomplete until idempotency and partial output behavior are explained.

## Part 5 — Cost controls and cost-aware operations

### 5.1 Cost drivers in this path

| Service/path | Cost driver to watch | Cost-control habit |
|---|---|---|
| S3 | Storage, requests, retrieval, data transfer | Lifecycle raw/temporary data; clean result prefixes; use tags |
| Athena | Bytes scanned and query frequency | Partition, Parquet, column projection, workgroup limits, query review |
| Glue | Crawler/ETL/DQ DPU time and Catalog usage | Small workers, short timeouts, bounded inputs, no idle sessions |
| Redshift Serverless | RPU usage, storage, data transfer | Usage limits, pause/teardown, model repeated queries appropriately |
| Kinesis | Stream capacity/retention and consumers | Use only for exercises, cap retention, delete after the lab |
| Firehose | Data volume, transformations, destination requests | Narrow prefixes and delivery paths; inspect buffering/failed records |
| CloudWatch | Log ingestion/storage, query scans, custom metrics/alarms | Narrow queries, retention policy, avoid high-frequency dashboards |
| CloudTrail | Trail/event data store, data events, storage | Log only the resources/events required and retain deliberately |
| Macie | Bucket/object monitoring and bytes inspected | Scope discovery and review pricing before enabling |

### 5.2 Budget and billing worksheet

Use the AWS console or existing Week 0 guardrails to record:

- monthly budget amount and actual/forecast alert thresholds;
- recipients and whether the alert is actually confirmed;
- account plan/credit expiration date;
- current Region and project tag;
- expected cost surface before a lab run;
- resources that must be deleted after the run;
- the date on which Cost Explorer data should be reviewed.

Budgets can alert on actual and forecasted cost or usage, but billing updates and notifications are delayed. Cost Explorer’s console is useful for analysis; the API has its own per-request pricing. Cost Anomaly Detection uses processed cost data and can take time to detect a new anomaly. These are layered controls, not substitutes for teardown and least-cost design.

## Part 6 — Reliability design for the capstone

Complete this table for `S3 → Glue → Athena → Redshift`, then add the streaming and orchestration branches.

| Area | Decision |
|---|---|
| Freshness SLO | e.g. curated daily data available by 07:00 UTC |
| Completeness gate | minimum row count, partitions, or source-to-target reconciliation |
| Schema policy | additive changes allowed; breaking changes fail and quarantine |
| Retry policy | retryable error classes, max attempts, backoff, timeout |
| Idempotency key | run/partition or event identifier |
| Partial-output policy | temporary prefix/table plus validation before promotion |
| Quarantine path | S3 prefix/table/queue, retention, replay owner |
| Alert target | owner/team and escalation path |
| Audit evidence | CloudTrail/CloudWatch/Glue/Step Functions records to retain |
| Cost guardrail | budget, workgroup, usage limit, or teardown checklist |
| Recovery point | bookmark/checkpoint/partition/run ID |
| Recovery objective | maximum acceptable data loss and time to restore |

## Part 7 — Original practice questions

These are original study questions, not reproduced exam items. Answer before reading the key.

1. Which tool should you use first to find a Python exception emitted by a Glue job?
2. Which tool should you use to find who called `PutBucketPolicy`?
3. Does CloudTrail Event history automatically show every S3 `GetObject` call?
4. A CloudWatch Logs Insights query scans a month of logs to find one error. What is the first improvement?
5. A data-quality rule finds duplicate business keys after a retry. What design property should the pipeline have had?
6. An input schema changes by removing a required column. Should the pipeline blindly retry?
7. A Kinesis consumer’s iterator age keeps increasing. What class of signal is this, and what should you inspect?
8. What is the difference between an alarm and a runbook?
9. Which service can define `IsComplete` and `IsUnique` rules using DQDL?
10. Can an AWS Budget guarantee that no additional charges will occur after the threshold is crossed?
11. Which cost optimization reduces Athena bytes scanned without changing the business result: querying all columns in JSON or partitioned Parquet with column projection?
12. A retry writes the same daily partition twice. What are two safe recovery/design techniques?

### Answer key

1. CloudWatch Logs and the Glue job run details.
2. CloudTrail management events/Event history, assuming the API call is recorded there.
3. No. S3 object-level operations are data events and are not shown in Event history unless deliberately logged through a trail/event data store.
4. Narrow the log group and time range, then cancel the query after it completes.
5. Idempotency/deduplication based on a stable run or event key.
6. No. Treat it as a schema-contract failure; quarantine/fail fast and investigate compatibility.
7. A streaming lag/freshness signal. Inspect consumer health, partition-key skew, throttling, batch size, retries, and downstream processing speed.
8. An alarm detects a threshold/state change; a runbook tells a person or automation what to do, verify, and record next.
9. AWS Glue Data Quality.
10. No. Budgets and billing data can be delayed; use teardown, usage limits, permissions, and alerts together.
11. Partitioned Parquet with column projection.
12. Write deterministic run-specific temporary output and promote after validation; or use an idempotent `MERGE`/deduplication key and delete/replace the affected partition safely.

## Week 9 evidence and check-in

Save one or more of the following:

- a narrow Logs Insights query and its scanned-byte result;
- a CloudTrail event-history lookup and interpretation;
- the SQL quality checks and pass/fail policy;
- the DQDL ruleset and a decision about whether to run it in Glue;
- the failure classification/runbook worksheet;
- the cost-driver and budget worksheet;
- the 12-question score and error log.

Use this check-in:

```text
Week: 9 — Observability, reliability, and cost
Account/Region:
Account status and cost guardrails:
CloudWatch Logs exercise completed (yes/no/conceptual):
CloudTrail management-event exercise completed (yes/no/conceptual):
Data-quality rules completed (yes/no):
DQDL/SQL decision:
Failure/recovery runbook completed (yes/no):
Cost-driver and budget worksheet completed (yes/no):
Practice score (out of 12):
Evidence location:
What broke or felt unclear:
Current confidence (1–5):
Next commitment:
```

If no AWS account is ready, mark Week 9 **conceptual only** and submit the query, rules, runbook, and cost worksheets. It becomes **verified** only after evidence, any resource cleanup, and the reflection are reported.

## Official references

- [CloudWatch metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html)
- [CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html)
- [CloudWatch Logs Insights query syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [CloudTrail Event history](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html)
- [CloudTrail data events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html)
- [CloudTrail pricing](https://aws.amazon.com/cloudtrail/pricing/)
- [AWS Glue Data Quality](https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html)
- [Glue DQDL reference](https://docs.aws.amazon.com/glue/latest/dg/dqdl.html)
- [AWS Glue pricing](https://aws.amazon.com/glue/pricing/)
- [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html)
- [Cost Anomaly Detection](https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html)
