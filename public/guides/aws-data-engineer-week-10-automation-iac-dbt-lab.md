# Week 10 — CLI, Boto3, dbt, infrastructure as code, and CI/CD

Week 10 turns the earlier AWS labs into repeatable engineering work:

`named AWS profile → read-only Boto3 inventory → CloudFormation stack → dbt model DAG → validation build`

The practical emphasis is deliberate. A GCP Professional Data Engineer already knows how to design data systems; this week builds the AWS-specific muscle of selecting credentials, calling APIs, expressing infrastructure declaratively, modeling Redshift transformations with dbt, and putting safe checks in a build pipeline.

## What you will learn

- AWS CLI profiles, role-based credential use, and the difference between the caller identity and a service role.
- Boto3 Sessions, clients, paginators, structured error handling, and read-only automation.
- CloudFormation templates, parameters, outputs, change review, stack lifecycle, and teardown.
- The Dataform-to-dbt translation: SQL models, `ref()` dependencies, source declarations, tests, and a development schema in Redshift.
- CodeBuild buildspecs and the role of CodePipeline, while keeping deployment and `dbt build` behind an explicit approval and credential boundary.
- Which pieces belong in source control, which belong in Secrets Manager/IAM, and which should never be committed.

## GCP-to-AWS translation

| GCP habit | AWS Week 10 equivalent | Important difference |
|---|---|---|
| `gcloud` configuration and ADC | AWS CLI named profiles, IAM Identity Center, or role profiles | The active principal comes from the AWS credential chain; verify it with STS before mutating anything. |
| Python Google Cloud client libraries | Boto3 Session/client/resource APIs | A Session selects the profile/Region; clients expose service APIs; paginators handle multi-page results. |
| Terraform/Deployment Manager | CloudFormation or CDK | CloudFormation stacks own a resource group; deletion and replacement policies matter. |
| Dataform SQLX models and assertions | dbt SQL models, `ref()`, sources, and data tests on Redshift | dbt is the modeling/testing layer; Glue, Step Functions, or CodePipeline supplies surrounding AWS orchestration. |
| Cloud Build trigger | CodeBuild buildspec, optionally started by CodePipeline | A build should validate artifacts; production deployment needs a separate least-privilege role and approval boundary. |

## Account and cost gate

### No-account track — do this first if account status is unknown

Complete Parts 1, 2, 3.1, 4.1, 5.1, and the quiz using the starter files in this workspace. Do not create a Redshift workgroup, CodeBuild project, CodePipeline, VPC, NAT Gateway, or IAM role just to complete this week.

### Account track — only after the gate is true

Proceed to the optional AWS calls only when:

- Week 0 identity, MFA, Region, budget, and alert checks are complete.
- You know the exact active profile and account ID.
- Week 4 Redshift Serverless is already available if you want to run dbt against it; do not create a second warehouse for Week 10.
- You can delete the Week 10 CloudFormation stack in the same session and confirm that its S3 bucket is empty.
- You understand that CloudFormation itself is free, but the resources in a stack are billed at their own rates. CodeBuild, Redshift, Athena, Glue, and S3 can all have usage charges.

This lab does not create an always-on CI/CD system. Read the pipeline design and, if desired, run one validation build only after checking current pricing and the account budget.

## Starter files

These files are deliberately small and contain no credentials:

- [CloudFormation learning stack](aws-data-engineer-week-10-lake-foundation.yaml) — private encrypted S3 bucket plus Glue Catalog database; no compute or IAM resources.
- [Read-only Boto3 inventory](aws-data-engineer-week-10-inventory.py) — identity, S3 bucket names, and Glue database metadata, with permission errors recorded rather than hidden.
- [CodeBuild validation buildspec](aws-data-engineer-week-10-buildspec.yml) — Python compilation, CloudFormation validation, and a no-mutation smoke check.
- [Python requirements](aws-data-engineer-week-10-requirements.txt) — Boto3 and pytest for local/CI validation.

Do not add a real `profiles.yml`, Redshift password, access key, secret, or token to this folder or to Git.

## Official references

- [AWS CLI configuration and credential files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [Using an IAM role in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-role.html)
- [AWS CLI authentication guidance](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)
- [Boto3 quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html)
- [Boto3 Session reference](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html)
- [Getting started with CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/GettingStarted.html)
- [CloudFormation `AWS::S3::Bucket` resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-s3-bucket.html)
- [CloudFormation `AWS::Glue::Database` resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-glue-database.html)
- [CloudFormation deploy command](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/deploy.html)
- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/v2/guide/)
- [AWS Serverless Application Model overview](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [CodeBuild buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [Create a CodeBuild project](https://docs.aws.amazon.com/codebuild/latest/userguide/create-project.html)
- [CodeBuild with CodePipeline](https://docs.aws.amazon.com/codebuild/latest/userguide/how-to-create-pipeline.html)
- [dbt Redshift connection setup](https://docs.getdbt.com/docs/local/connect-data-platform/redshift-setup)
- [dbt data tests](https://docs.getdbt.com/docs/build/data-tests)

## Part 1 — Establish the active identity safely

### 1.1 Prefer a named profile or role

Use the authentication method already established in Week 0. Prefer IAM Identity Center or short-lived role credentials where available. If you must use an existing credential source, isolate it in a named profile and do not paste its values into a command, notebook, source file, or chat.

```bash
export AWS_PROFILE=aws-de-learning
export AWS_REGION=us-east-1  # replace with the Region you actually chose

aws configure list-profiles
aws sts get-caller-identity --profile "${AWS_PROFILE}"
aws configure get region --profile "${AWS_PROFILE}"
```

If you use IAM Identity Center, authenticate with the profile's supported login flow before the STS check. If you use a role profile, understand both links: the source profile obtains credentials, and STS assumes the role whose trust policy permits it. The active identity is the ARN returned by `get-caller-identity`, not the name you intended to use.

Record:

```text
AWS_PROFILE:
AWS_REGION:
AWS account ID:
Caller ARN (redact session-specific details if sharing publicly):
Credential method: IAM Identity Center / role profile / other approved method
```

### 1.2 Explain the three identities

Write one sentence for each before moving on:

1. **Human/client identity:** the principal whose credentials the CLI or Boto3 Session selects.
2. **Service role:** a role trusted by an AWS service such as Glue, Step Functions, Redshift, or CodeBuild.
3. **Target resource policy:** a policy on a resource such as S3 that can allow or deny the calling principal/service role.

This distinction is a frequent source of “the CLI works but the Glue job fails” incidents.

## Part 2 — Run the read-only Boto3 inventory

### 2.1 Local setup

Use an isolated Python environment. Boto3's current quickstart recommends a virtual environment and Python 3.10 or later.

```bash
python3 --version
python3 -m venv .aws-de-week10-venv
source .aws-de-week10-venv/bin/activate
python -m pip install -r aws-data-engineer-week-10-requirements.txt
python -m compileall -q aws-data-engineer-week-10-inventory.py
```

The script does not create or delete anything. It uses `sts:GetCallerIdentity`, `s3:ListAllMyBuckets`, and paginated `glue:GetDatabases`. A least-privilege identity may be denied for the latter calls; that is useful evidence, not a reason to grant AdministratorAccess.

### 2.2 Run and inspect

```bash
python aws-data-engineer-week-10-inventory.py \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  > week-10-inventory.json

python -m json.tool week-10-inventory.json | sed -n '1,160p'
```

Expected output includes:

- the account, ARN, and Region actually used;
- S3 bucket names and creation timestamps, but no objects or secrets;
- Glue database names and locations;
- a structured `errors` object if a read permission is missing.

Do not paste the entire output into a public repository. Account IDs and ARNs are not passwords, but they are still useful metadata to minimize when sharing.

### 2.3 Boto3 reflection

Answer in your notes:

- Why is a Session preferable to scattering credentials through code?
- Why does the Glue call use a paginator?
- Which failures should be retried by a caller, and which should be surfaced for an IAM/schema correction?
- How would you add a `--stack-name` option that calls only `describe_stacks` and remains read-only?

## Part 3 — Express the lake foundation as CloudFormation

### 3.1 Local template review

Open [the starter template](aws-data-engineer-week-10-lake-foundation.yaml). Identify:

- the two resources and the resources intentionally absent;
- the generated bucket name and why that is safer than hard-coding a globally unique name;
- the public-access block and default SSE-S3 encryption;
- the seven-day lifecycle rule, which applies only to objects under `week10/`;
- the `DeletionPolicy: Delete` behavior and why it does not remove objects automatically;
- the outputs that allow later commands to target the exact bucket rather than a broad wildcard.

The template creates only a bucket and Glue database. It does not create a service role, Lambda, Glue job, Redshift resource, network, or KMS key.

### 3.2 Validate without creating resources

If you have AWS credentials but do not want to create a stack, validation is the first safe API call:

```bash
aws cloudformation validate-template \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --template-body file://aws-data-engineer-week-10-lake-foundation.yaml \
  --query 'Parameters[].ParameterKey' \
  --output table
```

If you have no AWS account, perform the local checks instead:

```bash
python -m compileall -q aws-data-engineer-week-10-inventory.py
sed -n '1,220p' aws-data-engineer-week-10-lake-foundation.yaml
```

Record whether the template is valid, what would be created, and what permission boundary would be needed for deployment.

### 3.3 Optional account deployment — one small, reversible stack

Only do this after the account gate. Use a unique stack name and a database name that does not collide with Week 2:

```bash
export WEEK10_STACK_NAME=aws-de-learning-week10
export WEEK10_GLUE_DATABASE=aws_de_learning_iac

aws cloudformation deploy \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --stack-name "${WEEK10_STACK_NAME}" \
  --template-file aws-data-engineer-week-10-lake-foundation.yaml \
  --parameter-overrides \
    "GlueDatabaseName=${WEEK10_GLUE_DATABASE}" \
    ProjectTag=aws-de-learning \
    OwnerTag=learner \
  --tags project=aws-de-learning owner=learner managed-by=cloudformation

aws cloudformation describe-stacks \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --stack-name "${WEEK10_STACK_NAME}" \
  --query 'Stacks[0].{Status:StackStatus,Outputs:Outputs}' \
  --output json
```

Before executing a change in a professional setting, use a change set or a reviewable CI plan. For this tiny learning stack, the important behavior is still the same: template → stack → outputs → observed resources → controlled deletion.

Capture:

- stack name, Region, creation time, and final status;
- the generated bucket name and Glue database name from stack outputs;
- the template review, validation result, and any permission error;
- evidence that the resources are tagged and owned by the stack.

### 3.4 Teardown and exact-target verification

Do not delete by a broad prefix or an unresolved variable. First resolve the exact output and inspect it:

```bash
export WEEK10_BUCKET_NAME="$(aws cloudformation describe-stacks \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --stack-name "${WEEK10_STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='DataBucketName'].OutputValue" \
  --output text)"

aws s3api list-objects-v2 \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --bucket "${WEEK10_BUCKET_NAME}" \
  --max-items 20
```

If you intentionally put only Week 10 objects there, remove those exact objects before deleting the stack. An empty bucket can be deleted with the stack; a non-empty bucket may cause stack deletion to fail.

```bash
aws s3 rm "s3://${WEEK10_BUCKET_NAME}" \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --recursive

aws cloudformation delete-stack \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --stack-name "${WEEK10_STACK_NAME}"

aws cloudformation wait stack-delete-complete \
  --profile "${AWS_PROFILE}" \
  --region "${AWS_REGION}" \
  --stack-name "${WEEK10_STACK_NAME}"
```

The `aws s3 rm` command is destructive. Run it only after verifying the exact generated bucket is the Week 10 lab bucket and contains no unrelated data. Save the successful `stack-delete-complete` result as teardown evidence.

### 3.5 CloudFormation versus CDK

CloudFormation is the deployment engine and template format. CDK is a higher-level programming model that synthesizes CloudFormation. For DEA-C01, be able to explain both, but do not spend this week building a second equivalent stack:

| Question | CloudFormation | CDK |
|---|---|---|
| Authoring style | YAML/JSON declarative template | TypeScript, Python, Java, C#, or Go constructs |
| Review artifact | Template and change set | Synthesized template plus CDK diff |
| State/ownership | CloudFormation stack | CloudFormation stack generated by CDK |
| Common risk | Replacement/deletion policy misunderstood | Abstraction hides the generated IAM/resource changes |
| Week 10 action | Validate/deploy the starter template | Read the guide and run `cdk synth` only if CDK is already installed |

### 3.6 Recognize AWS SAM

AWS SAM is an open-source framework and CloudFormation transform for defining serverless resources such as Lambda functions, APIs, and event sources with a shorter syntax. SAM templates are still deployed through CloudFormation, so the same stack ownership, change review, IAM, logging, and teardown rules apply. For DEA-C01, recognize when a serverless application template is being used and how it relates to CloudFormation; do not create a Lambda/API stack for this week.

## Part 4 — Transfer Dataform modeling to dbt on Redshift

This is the most direct answer to the Dataform question: dbt is the closest conceptual match, while Glue remains the AWS-native ETL skill required for DEA-C01.

### 4.1 Build the model graph on paper first

Create this small DAG before connecting to Redshift:

```text
source: public.orders
        |
        v
stg_orders (clean types and names)
        |
        v
fct_orders (daily/region aggregate)
```

Use these starter model contents in a new dbt project. Adjust column/table names to the actual Week 4 schema; do not guess them.

`models/staging/stg_orders.sql`

```sql
select
    cast(order_id as bigint) as order_id,
    cast(customer_id as bigint) as customer_id,
    cast(order_date as date) as order_date,
    cast(amount as decimal(18, 2)) as amount,
    cast(region as varchar(64)) as region
from {{ source('warehouse', 'orders') }}
```

`models/marts/fct_orders.sql`

```sql
select
    order_date,
    region,
    count(*) as order_count,
    sum(amount) as gross_amount
from {{ ref('stg_orders') }}
group by 1, 2
```

`models/schema.yml`

```yaml
version: 2

sources:
  - name: warehouse
    schema: public
    tables:
      - name: orders

models:
  - name: stg_orders
    description: Cleaned order rows from the Week 4 Redshift table.
    columns:
      - name: order_id
        data_tests:
          - unique
          - not_null
      - name: customer_id
        data_tests:
          - not_null
      - name: amount
        data_tests:
          - not_null
  - name: fct_orders
    description: Daily order amount by region.
    columns:
      - name: order_date
        data_tests:
          - not_null
      - name: region
        data_tests:
          - not_null
```

The current dbt syntax calls these `data_tests`; older projects may contain the backward-compatible `tests` key. Do not mix both keys for the same resource. The four built-in generic tests to recognize are `unique`, `not_null`, `accepted_values`, and `relationships`.

### 4.2 Create a safe development profile

Run dbt's current initialization flow and use its current Redshift adapter documentation for the exact Serverless connection fields. A Redshift Serverless workgroup, database, schema, user, and approved IAM-based authentication path must already exist. Use a development schema such as `dbt_de_learning`, never the shared `public`/production schema.

```bash
python -m pip install dbt-redshift
dbt init aws_de_learning
export DBT_PROFILES_DIR="${PWD}/.dbt"
dbt debug --project-dir aws_de_learning
```

Keep `profiles.yml` outside source control. Use an IAM profile or the approved short-lived credential mechanism rather than a password embedded in YAML. If the current adapter's Serverless options differ from your installed version, follow the adapter's current setup prompt and record the version in your evidence; do not silently copy a stale example.

### 4.3 Run the smallest useful dbt sequence

Only run these against the existing Week 4 Redshift workgroup after confirming the cost gate and source table:

```bash
dbt parse --project-dir aws_de_learning
dbt ls --project-dir aws_de_learning --select stg_orders+
dbt build --project-dir aws_de_learning --select stg_orders+
dbt build --project-dir aws_de_learning --select fct_orders
dbt docs generate --project-dir aws_de_learning
```

Inspect:

- the compiled SQL in `target/compiled`;
- the graph showing `source → stg_orders → fct_orders`;
- the development schema and materialization type;
- test results and the failing rows if a test intentionally fails;
- query/runtime behavior and any Redshift usage evidence.

Do not run `dbt build` from CI with a production profile or an unbounded selector. A safe deployment job passes an explicit target/schema, uses a least-privilege database role, and stores connection material in an approved secret/identity path.

### 4.4 Dataform-to-dbt reflection

Write a mapping table:

| Dataform concept | dbt concept | AWS/Redshift consideration |
|---|---|---|
| SQLX table/view | `.sql` model | dbt materialization creates the Redshift relation |
| `ref()` dependency | `ref()` dependency | The DAG controls build order |
| assertions | `data_tests` | Tests query the warehouse and can fail the build |
| declarations | `sources.yml` | Source metadata documents upstream tables |
| release configuration | target/profile + CI stage | Keep target schema and credentials outside Git |
| Dataform repository/workflow | dbt project + CodeBuild/CodePipeline/Step Functions | AWS services supply execution/orchestration around dbt |

## Part 5 — Add validation before deployment

### 5.1 Run the validation build locally

The supplied buildspec is intentionally validation-only. It does not deploy a stack or execute dbt against Redshift.

```bash
python -m pip install -r aws-data-engineer-week-10-requirements.txt
python -m compileall -q aws-data-engineer-week-10-inventory.py
python aws-data-engineer-week-10-inventory.py --help
```

If the AWS CLI and an approved profile are available, also run the CloudFormation validation command from Part 3.2. A CI build should fail on a syntax/template error before any deployment stage is eligible.

### 5.2 Understand the CodeBuild buildspec

Read [the supplied buildspec](aws-data-engineer-week-10-buildspec.yml) line by line:

- `install` prepares dependencies;
- `pre_build` compiles Python and validates the CloudFormation template;
- `build` runs a no-mutation smoke check and any local tests;
- `post_build` reports that deployment is deliberately separate.

The CodeBuild service role would need permission for the API calls the build actually makes. A buildspec is executable configuration; anyone who can replace it or override it may change what the build runs. Store it in a trusted source repository and review changes.

### 5.3 Pipeline design, without creating a pipeline

Draw this architecture and label each role/secret boundary:

```text
Git repository
    |
    v
CodePipeline source
    |
    v
CodeBuild: compile + template validation + dbt parse
    |
    v
manual approval / protected branch
    |
    +--> CloudFormation change set and deploy role
    |
    +--> dbt build role against an explicit Redshift dev schema
```

Explain why a production deployment should not be hidden inside the validation build, why a CodeBuild role should not be an account administrator, and why a Redshift password should not be a repository variable. For this week, a diagram and a policy sketch are enough; a real pipeline is a later controlled exercise.

## Part 6 — Original practice questions

Answer without notes. These questions are original study prompts, not official exam items.

1. Which command proves which AWS principal is currently active: `aws configure list`, `aws sts get-caller-identity`, or `aws iam list-roles`? Why?
2. What is the benefit of `boto3.Session(profile_name=...)` compared with embedding an access key in Python?
3. Why should a Boto3 inventory use a paginator for `glue.get_databases`?
4. Which CloudFormation resource in the starter stack incurs the main ongoing data/storage risk: the template, the Glue database, or the S3 objects placed in the bucket?
5. What does `DeletionPolicy: Delete` on an S3 bucket fail to guarantee?
6. In the dbt graph, what does `ref('stg_orders')` provide beyond string substitution?
7. Which two dbt tests are appropriate for a primary key column?
8. Why should dbt target a development schema rather than the shared production schema during learning?
9. Should the validation CodeBuild phase run `cloudformation deploy` automatically on every commit? Give one security/operational reason.
10. Where should a CI job obtain a Redshift password or other secret if password authentication is unavoidable?
11. When is CDK different from CloudFormation, and what artifact should you review before deployment?
12. A build fails with `AccessDenied` during CloudFormation validation. Should you make the build role administrator, retry forever, or inspect the exact API action and role policy?

### Answer key

1. `aws sts get-caller-identity`; it returns the account and ARN of the principal making the request. The other commands show local configuration or IAM objects, not the caller for the current request.
2. A Session selects an approved credential chain/profile and Region without putting secret material in source code; the same pattern is reusable across clients.
3. The API can return multiple pages; a paginator prevents silently processing only the first page.
4. S3 objects/storage and requests; the template/CloudFormation service itself is not the data charge. The Glue database is metadata, but inspect current pricing for any service operation you add.
5. It does not empty an S3 bucket or guarantee that deletion succeeds if objects remain; verify and remove only exact lab objects first.
6. It creates a dependency edge and lets dbt build/select the upstream model in the correct order while compiling the relation reference.
7. `unique` and `not_null`.
8. It prevents the exercise from overwriting shared/production relations and makes teardown and review safer.
9. No. Validation and deployment have different permissions and risk; use a reviewed change set/protected approval and a separate least-privilege deployment role.
10. An approved secret/identity mechanism such as Secrets Manager or short-lived IAM authentication, injected at runtime; never commit it to Git or a buildspec.
11. CDK is a programming-language abstraction that synthesizes CloudFormation. Review the synthesized template/diff and resulting stack changes, not only the source code.
12. Inspect the exact API action, Region, account, and role policy/trust path; fix the minimum permission or configuration issue instead of broadening privileges blindly.

## Week 10 evidence and check-in

Save the evidence appropriate to your track:

- active profile/Region/account check, with secrets omitted;
- successful local compile and Boto3 inventory, or a documented no-account fallback;
- CloudFormation template review/validation and, if deployed, stack outputs plus successful deletion;
- dbt DAG/model/test notes, or a no-account Dataform-to-dbt mapping;
- buildspec review and pipeline diagram;
- practice score out of 12 and error-log entries.

Use this check-in:

```text
Week: 10 — Automation, IaC, dbt, and CI/CD
Dates covered:
Account/Region/profile:
Account status and cost guardrails:
Read-only Boto3 inventory completed (yes/no/conceptual):
CloudFormation validation/deployment completed (yes/no/conceptual):
Stack teardown completed (yes/no/not applicable):
dbt model DAG/tests completed (yes/no/conceptual):
Buildspec and pipeline design completed (yes/no):
Practice score (out of 12):
Evidence location:
What broke or felt unclear:
Current confidence (1–5):
Next commitment:
```

If you complete only the no-account track, mark Week 10 **conceptual/practiced**, not verified. Verified status requires the evidence and teardown appropriate to the actions you actually took.
