# Week 5 — Kinesis Data Streams and Amazon Data Firehose lab

This lab builds the AWS equivalent of a small Pub/Sub-to-data-lake branch:

`producer → Kinesis Data Stream → Amazon Data Firehose → S3`

The optional extension adds a Lambda consumer to the same stream. The goal is to understand partitions, ordering, retention, consumers, buffering, delivery, and IAM—not to generate meaningful data volume.

AWS now uses the name **Amazon Data Firehose** in the console and documentation. Older exam material and architecture diagrams may still call it **Kinesis Data Firehose**.

## What you will learn

- The difference between Kinesis Data Streams and Amazon Data Firehose.
- How a partition key determines a record's shard assignment.
- Ordering within a shard/partition-key path, sequence numbers, and the default 24-hour retention period.
- How Firehose consumes a Kinesis stream and buffers records before delivering them to S3.
- Why newline delimiters, buffer hints, and delivery prefixes matter for downstream lake processing.
- The separate IAM identities for the producer, Firehose, and optional Lambda consumer.
- Lambda event-source mapping concepts: batch size, starting position, retries, and batch failure handling.
- The GCP mapping from Pub/Sub/Dataflow to Kinesis, Firehose, Lambda, and Managed Service for Apache Flink.

## Important cost and account gate

Do not create the stream or delivery stream until all of these are true:

- Your AWS account, Region, and Week 1 S3 bucket are confirmed.
- Week 0 billing alerts/budgets are active.
- You have a 30–45 minute block to create, test, and delete the resources.
- You understand that Kinesis Data Streams is not currently included in the AWS Free Tier. Standard on-demand Kinesis streams have usage charges and a per-stream hourly charge; Firehose charges for the volume ingested. Check the current [Kinesis Data Streams pricing](https://aws.amazon.com/kinesis/data-streams/pricing/) and [Amazon Data Firehose pricing](https://aws.amazon.com/firehose/pricing/) immediately before starting.

For this lab:

- Use **On-demand Standard** if the Kinesis console presents multiple on-demand modes. Do not choose On-demand Advantage for a tiny learning stream; AWS documents account-level minimum-usage behavior for that mode.
- Keep the default 24-hour retention period.
- Do not enable extended retention, enhanced fan-out, custom KMS encryption, VPC delivery, dynamic partitioning, format conversion, Lambda transformation, or backup streams.
- Use the same Region as the S3 bucket.
- Use only the `streaming/` prefixes in the Week 1 bucket.

The lab guide is prepared for execution, but no resource is considered complete until you have evidence of creation, data delivery, and teardown in the weekly check-in.

## Official references

- [Kinesis Data Streams concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html)
- [Kinesis Data Streams pricing](https://aws.amazon.com/kinesis/data-streams/pricing/)
- [Kinesis Data Streams `put-record` CLI command](https://docs.aws.amazon.com/cli/latest/reference/kinesis/put-record.html)
- [Configure Kinesis Data Streams as a Firehose source](https://docs.aws.amazon.com/firehose/latest/dev/writing-with-kinesis-streams.html)
- [Firehose S3 destination settings](https://docs.aws.amazon.com/firehose/latest/dev/create-destination.html)
- [Firehose IAM access](https://docs.aws.amazon.com/firehose/latest/dev/controlling-access.html)
- [Firehose buffering and delivery](https://docs.aws.amazon.com/firehose/latest/dev/basic-deliver.html)
- [Lambda parameters for Kinesis event-source mappings](https://docs.aws.amazon.com/lambda/latest/dg/services-kinesis-parameters.html)
- [Process Kinesis records with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/services-kinesis-create.html)

## Prerequisites and variables

You need the Week 1 S3 bucket and CloudShell or the AWS CLI. Use the exact Region from the earlier labs:

```bash
export AWS_REGION=us-east-1  # replace with your exact Region
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
export BUCKET_NAME="aws-de-learning-${AWS_ACCOUNT_ID}-${AWS_REGION}"
export STREAM_NAME="aws-de-learning-stream"
export FIREHOSE_NAME="aws-de-learning-firehose"

aws sts get-caller-identity
aws s3 ls "s3://${BUCKET_NAME}/"
```

If the identity or bucket check fails, stop. Do not create Kinesis resources to troubleshoot a Region or account problem.

## Part 1 — Create the Kinesis Data Stream

Use the Kinesis console in the same Region as S3:

1. Open the [Kinesis console](https://console.aws.amazon.com/kinesis/).
2. Choose **Data streams** and create a stream named `aws-de-learning-stream`.
3. Select **On-demand Standard** if the console distinguishes Standard from Advantage.
4. Keep retention at 24 hours.
5. Do not enable enhanced fan-out, extended retention, or a customer-managed KMS key.
6. Tag it with `project=aws-de-learning` and `lab=week-5`.
7. Wait for the stream to become **Active**.

Record the stream ARN, capacity mode, retention period, Region, and creation time.

You can verify the summary from CloudShell:

```bash
aws kinesis describe-stream-summary \
  --stream-name "${STREAM_NAME}" \
  --region "${AWS_REGION}"
```

Kinesis Data Streams stores records temporarily for consumers. A record contains an immutable data blob, partition key, and sequence number; the partition key determines the shard assignment. The [Kinesis concepts guide](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html) documents this model and the default 24-hour retention.

## Part 2 — Create a Firehose delivery stream to S3

Create an Amazon Data Firehose delivery stream with these settings:

1. In the Kinesis console, choose **Data Firehose** and create a delivery stream.
2. For the source, choose **Amazon Kinesis Data Streams**.
3. Select `aws-de-learning-stream` as the source.
4. For the destination, choose **Amazon S3**.
5. Use the Week 1 bucket.
6. Set the S3 prefix to `streaming/events/`.
7. Set the S3 error prefix to `streaming/errors/`.
8. Enable the **new line delimiter** option.
9. Set the S3 buffer size to the smallest available value, 1 MiB, and the buffer interval to 60 seconds. A delivery can happen when either threshold is reached.
10. Leave compression disabled for this first run so the output is easy to inspect.
11. Keep data transformation, format conversion, dynamic partitioning, VPC delivery, and backup disabled.
12. Use the bucket's default SSE-S3 encryption; do not create a KMS key.
13. Ask the console to create a new Firehose IAM role, naming it something like `aws-de-learning-firehose-role`.
14. Tag the delivery stream with `project=aws-de-learning` and `lab=week-5`.
15. Wait for the delivery stream status to become **ACTIVE**.

The important behavior is that Firehose starts reading a Kinesis source from the **LATEST** position. Create the Firehose stream before sending test records so the test records are visible to this consumer. When Kinesis Data Streams is the source, Firehose's `PutRecord` and `PutRecordBatch` APIs are not used; producers write to Kinesis instead. See the [Firehose Kinesis-source documentation](https://docs.aws.amazon.com/firehose/latest/dev/writing-with-kinesis-streams.html).

### IAM role review

The Firehose delivery role needs:

- Trust for `firehose.amazonaws.com`.
- S3 access for the Week 1 bucket and `streaming/` prefix.
- Kinesis read access to this exact stream.

The relevant permission shape is:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3StreamingDelivery",
      "Effect": "Allow",
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::<BUCKET_NAME>",
        "arn:aws:s3:::<BUCKET_NAME>/streaming/*"
      ]
    },
    {
      "Sid": "ReadLearningStream",
      "Effect": "Allow",
      "Action": [
        "kinesis:DescribeStream",
        "kinesis:GetShardIterator",
        "kinesis:GetRecords",
        "kinesis:ListShards"
      ],
      "Resource": "arn:aws:kinesis:<AWS_REGION>:<AWS_ACCOUNT_ID>:stream/<STREAM_NAME>"
    }
  ]
}
```

The console-created policy may be broader than this. Inspect it and narrow it after the lab when practical. Do not add KMS, Lambda, Glue, CloudWatch Logs, or VPC permissions unless you enable the corresponding optional feature. AWS's [Firehose access guide](https://docs.aws.amazon.com/firehose/latest/dev/controlling-access.html) lists the S3 and Kinesis permissions for this source/destination combination.

## Part 3 — Produce a small, ordered test set

Send records to Kinesis with the CLI. Use the same partition key for events that should stay ordered together, and a different key for another customer. The JSON is only a data blob; Kinesis does not inspect its schema.

```bash
aws kinesis put-record \
  --stream-name "${STREAM_NAME}" \
  --partition-key "customer-101" \
  --data '{"event_id":"evt-001","customer_id":101,"event_type":"view","event_ts":"2026-08-19T14:00:00Z","amount":0}' \
  --region "${AWS_REGION}"

aws kinesis put-record \
  --stream-name "${STREAM_NAME}" \
  --partition-key "customer-101" \
  --data '{"event_id":"evt-002","customer_id":101,"event_type":"add_to_cart","event_ts":"2026-08-19T14:00:05Z","amount":39.95}' \
  --region "${AWS_REGION}"

aws kinesis put-record \
  --stream-name "${STREAM_NAME}" \
  --partition-key "customer-102" \
  --data '{"event_id":"evt-003","customer_id":102,"event_type":"purchase","event_ts":"2026-08-19T14:00:08Z","amount":120.00}' \
  --region "${AWS_REGION}"

aws kinesis put-record \
  --stream-name "${STREAM_NAME}" \
  --partition-key "customer-101" \
  --data '{"event_id":"evt-004","customer_id":101,"event_type":"purchase","event_ts":"2026-08-19T14:00:15Z","amount":39.95}' \
  --region "${AWS_REGION}"

aws kinesis put-record \
  --stream-name "${STREAM_NAME}" \
  --partition-key "customer-103" \
  --data '{"event_id":"evt-005","customer_id":103,"event_type":"view","event_ts":"2026-08-19T14:00:20Z","amount":0}' \
  --region "${AWS_REGION}"
```

Save the returned sequence numbers. The expected learning observation is not global ordering across the stream: records with the same partition key are routed together, while records with different keys can be assigned to different shards.

## Part 4 — Verify Firehose delivery to S3

Firehose buffers records. Wait at least one buffer interval, then inspect the destination:

```bash
aws firehose describe-delivery-stream \
  --delivery-stream-name "${FIREHOSE_NAME}" \
  --region "${AWS_REGION}"

aws s3api list-objects-v2 \
  --bucket "${BUCKET_NAME}" \
  --prefix "streaming/events/" \
  --region "${AWS_REGION}"
```

Once an object appears, copy it to standard output using its exact key:

```bash
export EVENT_OBJECT_KEY="<copy-the-key-from-list-objects-output>"
aws s3 cp "s3://${BUCKET_NAME}/${EVENT_OBJECT_KEY}" - \
  --region "${AWS_REGION}"
```

Because newline delimiters were enabled, the S3 object should contain separate JSON records. Firehose concatenates incoming records according to its buffering configuration; for S3, enabling a newline delimiter makes the result easier for Athena and downstream parsers to consume. See [Firehose delivery behavior](https://docs.aws.amazon.com/firehose/latest/dev/basic-deliver.html) and [S3 destination settings](https://docs.aws.amazon.com/firehose/latest/dev/create-destination.html).

Capture:

- Firehose status.
- Kinesis source ARN.
- S3 object key and size.
- Delivery latency from the last `put-record` to the S3 object.
- Whether all five event IDs were present.
- Any delivery error prefix objects.

## Part 5 — Optional Lambda consumer

This extension demonstrates the other common Kinesis pattern: a Lambda event-source mapping reads batches directly from the stream. It is optional because it adds another resource and another IAM role.

### 5.1 Create a small Lambda function

Create a Python Lambda function named `aws-de-learning-kinesis-consumer` in the same Region. Use the console's basic Lambda execution role, then add only the Kinesis read permissions needed for this stream. The function can use:

```python
import base64
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    event_ids = []

    for record in event.get("Records", []):
        payload = base64.b64decode(record["kinesis"]["data"]).decode("utf-8")
        parsed = json.loads(payload)
        event_ids.append(parsed.get("event_id"))

    logger.info({"event_ids": event_ids, "record_count": len(event_ids)})
    return {"record_count": len(event_ids)}
```

### 5.2 Add the Kinesis trigger

Add the Kinesis stream as a trigger with:

- Batch size: 5 or 10.
- Starting position: `TRIM_HORIZON` for this lab, so retained test records can be processed.
- Batch window: leave the default.
- Parallelization factor: leave the default.
- Report batch item failures: disabled for the first successful run.

Send two more records and inspect the Lambda CloudWatch log stream. AWS documents `BatchSize`, `StartingPosition`, `BisectBatchOnFunctionError`, and partial batch responses in the [Kinesis event-source parameters](https://docs.aws.amazon.com/lambda/latest/dg/services-kinesis-parameters.html).

Write down the distinction:

```text
Firehose consumer:
Lambda consumer:
Where each output goes:
What happens if the Lambda batch fails:
What state/replay window is provided by Kinesis:
```

Delete the Lambda event-source mapping and function during teardown. Do not place the Lambda in a VPC for this exercise.

## Part 6 — Streaming decision table

| GCP concept | AWS concept | What to remember |
|---|---|---|
| Pub/Sub topic | Kinesis Data Stream | Temporary retained stream with partition/shard capacity and consumer positions |
| Pub/Sub ordering key | Kinesis partition key | Records with the same key are routed together; ordering is not global across the stream |
| Pub/Sub subscription | Lambda/Firehose/KCL consumer | Each consumer reads independently, subject to stream read limits and retention |
| Dataflow streaming pipeline | Glue streaming ETL, Lambda, or Managed Service for Apache Flink | Choose based on transformation complexity, state, latency, and operational model |
| Pub/Sub to Cloud Storage sink | Kinesis Data Streams to Firehose to S3 | Firehose handles buffering and delivery; it is not a general-purpose replay/query engine |
| Pub/Sub retention | Kinesis retention period | Default Kinesis retention is 24 hours; longer retention is an explicit cost/architecture decision |

Answer these in your own words:

1. Why is a partition key part of a Kinesis record write?
2. What ordering guarantee does a single partition-key path provide, and what does it not provide?
3. When is Firehose a better fit than writing a custom consumer on EC2 or Lambda?
4. Why is Firehose's S3 buffer interval relevant to downstream Athena/Glue file sizes and latency?
5. How would you handle a malformed event in a Lambda consumer without blocking an entire shard indefinitely?
6. When would Managed Service for Apache Flink be more appropriate than Lambda?

## Evidence checklist

Save a short note or screenshot set containing:

- Stream name, ARN, Region, capacity mode, retention, and creation time.
- Firehose name, source stream, S3 destination prefix, buffer settings, and status.
- Firehose role trust and scoped S3/Kinesis permissions.
- At least five `put-record` results with partition keys and sequence numbers.
- S3 object key, size, delivery latency, and visible event IDs.
- Optional Lambda trigger configuration and CloudWatch log evidence.
- Answers to the streaming decision questions.
- Teardown verification showing no lab stream, delivery stream, Lambda function, or `streaming/` objects remain.

## Troubleshooting map

| Symptom | Check first |
|---|---|
| Stream creation shows an unexpected pricing mode | Stop and verify it is On-demand Standard; do not continue with On-demand Advantage for this lab |
| Firehose remains active but no S3 object appears | Firehose source is the correct stream, source role has Kinesis read permissions, S3 prefix is correct, and at least one buffer interval has elapsed |
| Firehose reports delivery errors | Inspect the error prefix, S3 bucket Region, role trust, and S3 `PutObject`/multipart permissions |
| Records sent before Firehose creation are missing | Firehose starts at `LATEST`; resend records after the delivery stream is active |
| Lambda trigger cannot be created | Lambda execution role and the console caller need Kinesis list/read permissions; check the exact stream ARN and Region |
| Lambda sees malformed JSON | The Kinesis data blob is arbitrary bytes; validate and quarantine bad payloads instead of assuming every record is valid JSON |
| Data appears concatenated in S3 | Enable Firehose newline delimiters or include delimiters in producer payloads; do not assume one Kinesis record equals one S3 object |

## Teardown — do this in the same session

Wait until the Firehose output or error evidence is captured before deleting the delivery stream; deletion can discard buffered records.

1. If you used Lambda, disable and delete its Kinesis event-source mapping, then delete the lab Lambda function.
2. Delete the Firehose delivery stream:

   ```bash
   aws firehose delete-delivery-stream \
     --delivery-stream-name "${FIREHOSE_NAME}" \
     --region "${AWS_REGION}"
   ```

   Wait until the delivery stream no longer appears in the console.

3. Delete the Kinesis Data Stream from the console, or use the CLI only after verifying the exact lab name:

   ```bash
   aws kinesis delete-stream \
     --stream-name "${STREAM_NAME}" \
     --region "${AWS_REGION}"
   ```

4. Remove only the Week 5 S3 prefixes:

   ```bash
   aws s3 rm "s3://${BUCKET_NAME}/streaming/" --recursive
   aws s3 ls "s3://${BUCKET_NAME}/streaming/"
   ```

5. Delete the lab-only Firehose IAM role after the delivery stream is gone. If you created a separate Lambda execution role, delete it after the function is gone.
6. Recheck the Kinesis, Firehose, Lambda, S3, Billing/Budgets, and Cost Explorer views in the same Region.

Final evidence should show no `aws-de-learning-stream`, no `aws-de-learning-firehose`, no optional Lambda function, and no `streaming/` objects.

## No-account fallback

If your account is not ready, do not activate a paid Kinesis stream. Use an AWS Skill Builder sandbox or an official guided lab if available, and complete this conceptual exercise:

- Draw `producer → stream → Firehose → S3` and `stream → Lambda` as two independent consumer paths.
- Label the partition key, shard, sequence number, retention window, and Firehose buffer.
- Write sample `put-record` commands but do not execute them against a paid account.
- Explain why a Firehose consumer starts at `LATEST` and why a Lambda mapping may use `TRIM_HORIZON` in a test.
- Mark the week as “conceptual only” until you have real or sandbox evidence plus teardown evidence.

## Week 5 check-in

```text
Week: 5 — Kinesis/Data Firehose
Account/Region:
Account status confirmed:
Cost gate reviewed:
Hours studied:
Kinesis stream created and deleted:
Firehose delivery stream created and deleted:
Records sent and partition keys used:
S3 delivery evidence:
Lambda extension attempted (yes/no):
What broke:
Most important Pub/Sub-to-Kinesis distinction:
Current confidence (1–5):
Next commitment:
```
