# Week 6 — Step Functions, EventBridge, Glue Workflows, and MWAA concepts

This lab adds an orchestration layer around the Week 3 Glue job:

`EventBridge custom event → Step Functions Standard → Glue job → success/failure path`

You will also compare that design with an AWS Glue Workflow and with Amazon Managed Workflows for Apache Airflow (MWAA). The real hands-on path uses Step Functions and one manually sent EventBridge event. It does **not** create a recurring schedule, a NAT Gateway, or an MWAA environment.

## What you will learn

- The difference between data processing and orchestration.
- Step Functions Standard state machines, Task states, `.sync` service integration, retries, catchers, and execution history.
- EventBridge event patterns, targets, and IAM roles.
- AWS Glue Workflows, triggers, and event-based starts.
- When MWAA is appropriate and why its DAGs/networking/environment lifecycle require a separate milestone.
- How to prevent an orchestration lab from becoming an unattended cost source.

## Important account and cost gate

Do not create the state machine or EventBridge rule until:

- Week 0 billing alerts/budgets are active.
- You know the exact Region and the exact Week 3 Glue job name.
- The Week 3 Glue job has already been run successfully, or you have chosen the no-account fallback.
- You have time to delete the state machine, rule, targets, and lab-only IAM roles in the same session.

Use a **Standard** Step Functions workflow. AWS documents Standard workflows as durable and auditable, and the optimized Glue `startJobRun.sync` integration is designed for a job that Step Functions waits for. Standard workflows have a 4,000-state-transition monthly Free Tier, but the Glue job itself can still incur Glue charges. Check the current [Step Functions pricing](https://aws.amazon.com/step-functions/pricing/) and [AWS Glue pricing](https://aws.amazon.com/glue/pricing/) before running.

Do not create an MWAA environment for this lab. MWAA environments include managed Airflow infrastructure, networking, S3 DAG storage, and CloudWatch integration; they are a later, deliberate resource. Use the conceptual section instead.

## Official references

- [Start an AWS Glue job with Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/connect-glue.html)
- [Handling errors in Step Functions workflows](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)
- [Step Functions workflow types](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html)
- [Step Functions pricing](https://aws.amazon.com/step-functions/pricing/)
- [EventBridge IAM roles for targets](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events-iam-roles.html)
- [EventBridge `put-events` CLI command](https://docs.aws.amazon.com/cli/latest/reference/events/put-events.html)
- [AWS Glue Workflows overview](https://docs.aws.amazon.com/glue/latest/dg/workflows_overview.html)
- [Starting a Glue Workflow with an EventBridge event](https://docs.aws.amazon.com/glue/latest/dg/starting-workflow-eventbridge.html)
- [Amazon MWAA documentation](https://docs.aws.amazon.com/mwaa/)

## Prerequisites and variables

Use CloudShell or the AWS CLI in the same Region as the earlier labs:

```bash
export AWS_REGION=us-east-1  # replace with your exact Region
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
export GLUE_JOB_NAME="<exact-week-3-glue-job-name>"
export STATE_MACHINE_NAME="aws-de-learning-orchestrator"
export EVENT_RULE_NAME="aws-de-learning-start-rule"

aws sts get-caller-identity
aws glue get-jobs \
  --region "${AWS_REGION}" \
  --query 'Jobs[].Name' \
  --output table
```

Replace `GLUE_JOB_NAME` with the actual job. Do not use a guessed name. If the job list is empty, stop and use the no-account fallback or complete Week 3 first.

## Part 1 — Build a Step Functions Standard state machine

Open the [Step Functions console](https://console.aws.amazon.com/states/) in the same Region.

1. Choose **State machines** → **Create state machine**.
2. Choose **Write workflow code** or **Create from blank**.
3. Select **Standard** as the workflow type.
4. Name it `aws-de-learning-orchestrator`.
5. Use the following Amazon States Language definition in the code editor.

This definition expects an EventBridge-shaped input with `detail.job_name` and `detail.run_id`. It uses `detail.job_name` to select the Glue job; `detail.run_id` remains available in the execution input for traceability. It starts the Glue job, waits for completion, retries selected transient failures, and routes exhausted failures to a failure state.

```json
{
  "Comment": "Orchestrate one AWS Glue learning job",
  "StartAt": "RunGlueJob",
  "States": {
    "RunGlueJob": {
      "Type": "Task",
      "Resource": "arn:aws:states:::glue:startJobRun.sync",
      "Parameters": {
        "JobName.$": "$.detail.job_name"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "Glue.ConcurrentRunsExceededException",
            "States.TaskFailed"
          ],
          "IntervalSeconds": 30,
          "MaxAttempts": 2,
          "BackoffRate": 2
        }
      ],
      "Catch": [
        {
          "ErrorEquals": [
            "States.ALL"
          ],
          "ResultPath": "$.error",
          "Next": "PipelineFailed"
        }
      ],
      "ResultPath": "$.glue_run",
      "Next": "PipelineSucceeded"
    },
    "PipelineSucceeded": {
      "Type": "Succeed"
    },
    "PipelineFailed": {
      "Type": "Fail",
      "Error": "GlueJobFailed",
      "Cause": "The orchestrated Glue job failed after its retry policy was exhausted."
    }
  }
}
```

The optimized Glue integration uses `arn:aws:states:::glue:startJobRun.sync`; the `.sync` pattern makes the Task state wait for the Glue job. AWS documents the required Glue actions as `glue:StartJobRun`, `glue:GetJobRun`, `glue:GetJobRuns`, and `glue:BatchStopJobRun`. The Step Functions console can generate the execution role; inspect it and remove unrelated permissions.

### State machine role review

The Step Functions execution role should trust `states.amazonaws.com` and have, at minimum, the following Glue actions in this learning account:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "glue:StartJobRun",
        "glue:GetJobRun",
        "glue:GetJobRuns",
        "glue:BatchStopJobRun"
      ],
      "Resource": "*"
    }
  ]
}
```

AWS Glue does not provide resource-based control for this integration, so the documented policy example uses `Resource: "*"`; keep the actions limited and use a dedicated lab role. If you enable Step Functions CloudWatch Logs, add only the required log-delivery permissions and capture that choice.

## Part 2 — Run the state machine manually once

Before adding EventBridge, prove the state machine works directly.

Start an execution from the Step Functions console with this input:

```json
{
  "detail": {
    "job_name": "<exact-week-3-glue-job-name>",
    "run_id": "manual-001"
  }
}
```

Replace the job name. Observe the visual execution graph:

1. `RunGlueJob` enters **Running**.
2. The Glue job run ID appears in the Task result.
3. The state reaches `PipelineSucceeded`, or the retry/catch path is visible.

Capture the state machine ARN, execution ARN, execution status, Glue job run ID, duration, and any error cause.

If you do not want to incur a Glue run yet, validate only the state-machine definition in the console and stop here. Do not claim an execution succeeded without a real execution result.

## Part 3 — Trigger the state machine with one EventBridge event

Use a custom event on the default EventBridge bus. This avoids creating a schedule that could continue starting jobs after the lab.

### 3.1 Create the rule

Open the [EventBridge console](https://console.aws.amazon.com/events/) and create a rule named `aws-de-learning-start-rule` on the default event bus.

Use this event pattern:

```json
{
  "source": [
    "aws.de.learning"
  ],
  "detail-type": [
    "Start Glue Learning Pipeline"
  ],
  "detail": {
    "job_name": [
      "<exact-week-3-glue-job-name>"
    ]
  }
}
```

Add the Step Functions state machine as the target. Let the console create a new target invocation role if possible, then inspect it. Its essential permission is:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "states:StartExecution",
      "Resource": "<STATE_MACHINE_ARN>"
    }
  ]
}
```

The role trust should allow `events.amazonaws.com`. Do not configure a schedule for this exercise. Leave the rule disabled until the target and pattern are saved.

### 3.2 Send one event

Enable the rule, then send exactly one custom event from CloudShell. Replace the job name and use the actual EventBridge rule Region:

```bash
aws events put-events \
  --region "${AWS_REGION}" \
  --entries '[
    {
      "Source": "aws.de.learning",
      "DetailType": "Start Glue Learning Pipeline",
      "Detail": "{\"job_name\":\"<exact-week-3-glue-job-name>\",\"run_id\":\"eventbridge-001\"}",
      "EventBusName": "default"
    }
  ]'
```

Check the rule's matched-event and invocation metrics, then open Step Functions and find the new execution. Compare the manual execution with the EventBridge execution.

Disable the rule immediately after the single test:

```bash
aws events disable-rule \
  --name "${EVENT_RULE_NAME}" \
  --event-bus-name default \
  --region "${AWS_REGION}"
```

## Part 4 — Failure injection and retry reasoning

Only perform this if the account budget and Week 3 job are already under control.

Start one execution with a deliberately nonexistent job name, for example `aws-de-learning-job-does-not-exist`. Observe whether the error is retried or caught. Do not leave the EventBridge rule enabled for this test.

Record:

```text
Error name:
Retry attempts observed:
Final state:
Error details preserved in:
What would be safe to retry:
What would need idempotency before retrying:
```

Step Functions applies matching `Retry` policies before `Catch` transitions. A broad `States.ALL` catcher is useful as a last-resort route, but it does not make every error safe to retry. See the [Step Functions error-handling guide](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html).

## Part 5 — Compare Glue Workflows and MWAA

Do not create MWAA in this lab. Complete the design comparison instead.

| Need | Step Functions | Glue Workflows | MWAA |
|---|---|---|---|
| Primary abstraction | State machine with service integrations | Glue jobs, crawlers, and triggers in a workflow graph | Apache Airflow DAGs and operators |
| Best fit | Cross-service orchestration and explicit error paths | Glue-centric ETL chains and crawler/job dependencies | Existing Airflow operating model, Python DAGs, and broad provider ecosystem |
| Event start | EventBridge target can start execution | EventBridge event trigger can start a Glue workflow | EventBridge/API/UI can invoke or coordinate Airflow workflows |
| Cost/control concern | State transitions plus underlying services | Glue job/crawler execution plus underlying services | Long-lived managed Airflow environment and networking |
| GCP mapping | Workflows/Eventarc-like orchestration | Dataform/Composer-adjacent Glue ETL graph | Cloud Composer/Airflow |

AWS Glue Workflows can contain crawlers, jobs, and triggers and can start from an EventBridge event. MWAA stores DAG files in S3 and synchronizes them into the Airflow environment. These are different layers from the transformation code itself.

Write a one-paragraph design decision:

```text
For a pipeline that only runs Glue crawlers/jobs, I would choose:
For a pipeline that coordinates Glue, Lambda, SQS, and Redshift with explicit retries, I would choose:
For a company already standardized on Airflow DAGs, I would choose:
The operational cost/risk I would verify before creating MWAA:
```

## Evidence checklist

Save a short note or screenshot set containing:

- State machine type, ARN, execution role, and definition version.
- Manual execution result and Glue job run ID.
- EventBridge rule pattern, target, invocation role, and one matched event.
- EventBridge-triggered execution result.
- Retry/catch failure-injection result, if performed.
- Glue Workflow versus Step Functions versus MWAA design decision.
- Teardown verification showing no enabled rule or lab state machine remains.

## Troubleshooting map

| Symptom | Check first |
|---|---|
| State machine definition is rejected | `Resource` is the Glue optimized integration, fields use PascalCase, JSONPath paths match the input, and the definition is valid ASL |
| Step Functions cannot start Glue | Execution role has `glue:StartJobRun` and the Glue job name/Region is correct |
| State machine starts but does not wait | The Task uses `arn:aws:states:::glue:startJobRun.sync`; an asynchronous integration will return before the job finishes |
| Glue job fails immediately | Run the Week 3 job directly, inspect Glue/CloudWatch logs, and verify the Step Functions input did not change the expected job arguments |
| EventBridge rule never starts an execution | Rule is enabled, event pattern matches `source`/`detail-type`/`detail.job_name`, target role trusts EventBridge, and `states:StartExecution` targets the exact ARN |
| EventBridge starts the wrong pipeline | Narrow the event pattern and disable the rule while editing it |
| Rule continues to incur activity | Disable/delete the rule; this lab intentionally uses one custom event rather than a schedule |
| MWAA creation asks for VPC/networking | Stop; MWAA is outside this lab and should be planned as a separate resource decision |

## Teardown — do this in the same session

1. Disable the EventBridge rule.
2. Remove the rule target and delete the rule:

   ```bash
   aws events remove-targets \
     --rule "${EVENT_RULE_NAME}" \
     --ids "<target-id>" \
     --event-bus-name default \
     --region "${AWS_REGION}"

   aws events delete-rule \
     --name "${EVENT_RULE_NAME}" \
     --event-bus-name default \
     --region "${AWS_REGION}"
   ```

3. Delete the Step Functions state machine only after saving the definition and execution evidence:

   ```bash
   aws stepfunctions delete-state-machine \
     --state-machine-arn "<STATE_MACHINE_ARN>" \
     --region "${AWS_REGION}"
   ```

4. Delete the EventBridge invocation role and Step Functions execution role only after the associated resources are deleted.
5. Do not delete the Week 3 Glue job; it belongs to the learning path and may be reused in the capstone.
6. Verify that no EventBridge rule is enabled and no lab state machine remains.

## No-account fallback

If your account is not ready, do not create Step Functions, EventBridge, or MWAA resources. Complete the following on paper or in an AWS Skill Builder sandbox:

- Annotate the ASL definition: Task, `.sync`, `Retry`, `Catch`, `ResultPath`, `Succeed`, and `Fail`.
- Draw the identity path: your IAM identity → Step Functions; Step Functions → Glue; EventBridge → `states:StartExecution`.
- Compare Step Functions, Glue Workflows, and MWAA using the table above.
- Design a failure policy for a Glue job that is safe to retry and a job that is not safe to retry.
- Mark the week “conceptual only” until an execution and teardown artifact exists.

## Week 6 check-in

```text
Week: 6 — Orchestration
Account/Region:
Account status and cost guardrails:
Hours studied:
Step Functions state machine created/deleted:
Manual Glue execution result:
EventBridge event-triggered execution result:
Retry/catch test result:
Glue Workflows vs Step Functions vs MWAA decision:
What broke:
Most important orchestration distinction learned:
Current confidence (1–5):
Next commitment:
```
