# Week 8 — Security, encryption, secrets, and data governance

This week targets the DEA-C01 Security and Governance domain and the security decisions that appear throughout the other domains. The aim is to understand the complete access path for a data pipeline, not to collect product names.

## Outcomes

By the end of this week, you should be able to:

- distinguish IAM identity policies, resource policies, trust policies, permissions boundaries, and service control policies;
- trace which principal calls which AWS service and which role it assumes;
- explain explicit deny, least privilege, `iam:PassRole`, and the difference between a role's trust policy and permissions policy;
- choose between SSE-S3 and SSE-KMS and identify the KMS permissions required by common S3 operations;
- use Secrets Manager for application/database credentials without hard-coding secrets or AWS credentials;
- explain how Lake Formation permissions augment IAM and how hybrid access mode avoids a risky all-at-once migration;
- explain what Macie discovers in S3 and how its cost surface differs from Lake Formation;
- review and validate a least-privilege policy without attaching it to an AWS identity.

## Cost and safety gate

Begin with the no-account exercises and local policy validation. Do not create or change any of the following unless the account, budget, and cleanup plan are confirmed:

- a customer-managed KMS key;
- a Secrets Manager secret or rotation configuration;
- a Lake Formation registered S3 location or `grant-permissions`/`revoke-permissions` change;
- a Macie account configuration or sensitive-data discovery job;
- a CloudTrail trail or organization-wide logging configuration.

These services are useful but they are not all “free practice” surfaces. KMS customer-managed keys, Secrets Manager secrets/API calls, Macie monitoring/scanning, S3 log storage, and related API or data-transfer operations can incur charges. Lake Formation changes can also alter access to existing Glue Catalog resources. Read-only inspection and `accessanalyzer validate-policy` are the preferred first exercises.

Do not attach the sample policy in this guide to your learning administrator or any existing production identity. Validate it as a document first. Do not paste real credentials, tokens, key material, or secret values into the chat, shell history, source code, or CloudWatch logs.

## GCP-to-AWS security translation

| GCP concept | AWS starting point | Important difference |
|---|---|---|
| IAM principals, roles, service accounts | IAM users/roles, STS, identity federation | AWS role trust and permissions policies are separate documents |
| Service-account impersonation | `sts:AssumeRole` | The caller needs permission to assume; the target role must trust the caller |
| IAM Conditions | IAM `Condition` blocks | Condition keys and supported actions are service-specific |
| Cloud KMS/CMEK | AWS KMS keys and key policies | KMS key policy behavior is a frequent AWS exam trap |
| Secret Manager | AWS Secrets Manager | Use IAM roles for AWS credentials; use Secrets Manager for application/database secrets |
| Dataplex/Data Catalog governance | Glue Data Catalog + Lake Formation | Lake Formation adds a separate fine-grained data-lake permission model |
| Sensitive Data Protection/DLP | Amazon Macie for S3 discovery | Macie is focused on S3 data security and sensitive-data discovery, not a general-purpose DLP replacement |
| Cloud Audit Logs | AWS CloudTrail | Management events and data events have different scope and cost considerations |

## Part 1 — The security path of a data pipeline

Use this simplified capstone path as the anchor for the week:

`human or CI identity → assumed role → Step Functions → Glue job role → S3/Glue Catalog → Athena or Redshift`

For each arrow, identify the caller, the target resource, the permissions policy, and the trust relationship. A service can call another service only when the relevant service role and permissions are correctly configured.

| Component | Calling principal | Trust relationship to understand | Typical permission scope |
|---|---|---|---|
| Human or CI starts a workflow | IAM Identity Center/federated identity or assumed role | The caller must be allowed to assume the target role | `states:StartExecution` on one state machine |
| Step Functions starts Glue | Step Functions execution role | Role trust includes `states.amazonaws.com` | `glue:StartJobRun` on the intended job; any `iam:PassRole` requirement belongs to the caller that passes a role |
| Glue reads and writes data | Glue job role | Role trust includes `glue.amazonaws.com` | Scoped S3 prefixes, Glue Catalog actions, CloudWatch Logs, and KMS use only when configured |
| Athena queries S3 data | Human, federated identity, or application role | The caller needs Athena and S3/query-result access | Workgroup/query permissions plus `s3:GetObject` on data and `s3:PutObject` on results |
| Redshift loads from S3 | Redshift service role | Redshift service assumes the role | `s3:ListBucket`, `s3:GetObject`, and any required KMS decrypt permission on the specific source |
| Application retrieves a database password | Application role | Application runtime obtains temporary role credentials | `secretsmanager:GetSecretValue` on one secret, plus KMS decrypt if a customer-managed key is used |

### The two-policy role test

For every IAM role, answer two different questions:

1. **Who may assume this role?** Read the role's trust policy. This is a resource-based policy attached to the role.
2. **What may the role do after it is assumed?** Read the role's identity-based permissions policies.

Confusing those questions causes many “AccessDenied” failures. A role can have perfectly good S3 permissions and still be unusable if its trust policy does not trust the service or principal that needs to assume it.

Also distinguish `iam:PassRole` from `sts:AssumeRole`:

- `sts:AssumeRole` lets a principal obtain a session for a role that trusts it;
- `iam:PassRole` lets a principal pass a role to an AWS service as part of creating or starting a resource;
- neither action automatically grants the role's eventual data permissions to the original caller.

## Part 2 — IAM policy evaluation and least privilege

AWS IAM evaluates multiple policy types together. The useful exam mental model is:

- identity-based and same-account resource-based allows can combine;
- a permissions boundary limits what an identity-based policy can grant;
- an SCP/RCP can limit permissions in an organization;
- an explicit deny overrides an allow;
- a policy that grants `s3:ListBucket` on an object ARN is not the same as a policy that grants `s3:GetObject` on an object ARN;
- actions that do not support resource-level permissions may require `Resource: "*"`, even in a least-privilege policy.

### Policy review exercise

Review this deliberately unsafe policy and list at least five problems before reading the improved version:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "kms:Decrypt",
      "Resource": "*"
    }
  ]
}
```

Likely problems include unrestricted S3 access, unrestricted role passing, access to every secret, access to every KMS key, no resource scoping, and no conditions such as a controlled role path or encryption context where the workload needs one.

Now save this improved identity-policy example as `week8-s3-read-policy.json`, replacing the example bucket name only if you are validating against a known learning bucket. Do not attach it to an identity in this exercise.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListCuratedPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::example-de-learning-bucket",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "curated",
            "curated/*"
          ]
        }
      }
    },
    {
      "Sid": "ReadCuratedObjects",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-de-learning-bucket/curated/*"
    },
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::example-de-learning-bucket",
        "arn:aws:s3:::example-de-learning-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

Validate the document without attaching it:

```bash
export AWS_REGION="<your-learning-region>"

aws accessanalyzer validate-policy \
  --policy-type IDENTITY_POLICY \
  --policy-document file://week8-s3-read-policy.json \
  --region "${AWS_REGION}" \
  --output json
```

Record the findings, then explain the expected result for each request:

| Request | Expected result |
|---|---|
| List `curated/` in the example bucket over TLS | Allowed by the list statement |
| Read `curated/sample.parquet` over TLS | Allowed by the object statement |
| Delete an object | Implicitly denied because no delete allow exists |
| Read `raw/sample.json` | Implicitly denied because the object is outside the curated prefix |
| Any S3 request over insecure transport | Explicitly denied by the deny statement |

IAM Access Analyzer validates grammar and security best practices; it does not prove that the policy matches your entire application design. Review the resource ARNs, conditions, trust policy, and actual access path separately.

## Part 3 — KMS and S3 encryption

### Core model

AWS KMS protects and controls encryption keys. For S3 SSE-KMS, S3 uses envelope encryption: a data key encrypts the object, and KMS protects the data key with the configured KMS key.

Use the following distinction:

| Option | Starting decision |
|---|---|
| SSE-S3 | Default S3 server-side encryption with no separate customer-managed key lifecycle; often sufficient for ordinary learning data |
| SSE-KMS with an AWS managed key | KMS-integrated encryption with less customer key administration; cross-account and key-policy flexibility are limited compared with a customer-managed key |
| SSE-KMS with a customer-managed key | Choose when you need explicit key policy control, cross-account sharing, independent key administration, or detailed key lifecycle/audit requirements |

For S3 SSE-KMS, the common permission pattern is:

- uploading/encrypting an object: `s3:PutObject` plus `kms:GenerateDataKey` on the key;
- downloading/decrypting an object: `s3:GetObject` plus `kms:Decrypt` on the key;
- multipart operations may require both `kms:GenerateDataKey` and `kms:Decrypt`.

The exact permission path depends on the service integration. Always read both the S3 policy and the KMS key policy. A KMS key policy that does not enable the account to delegate through IAM can make an otherwise plausible IAM allow ineffective.

### KMS scenario exercise

Choose SSE-S3, AWS-managed SSE-KMS, or customer-managed SSE-KMS and justify the choice:

1. A small personal learning bucket contains synthetic CSV files and no cross-account sharing.
2. A regulated data lake requires separate key administration, key-use audit, and cross-account analytics access.
3. A team wants to store a database password and rotate it without putting it in a Glue script.
4. An S3 bucket is in Region A, but the requested KMS key is in Region B.

Answer key:

1. SSE-S3 is a reasonable default for synthetic learning data; do not create a customer-managed key merely to demonstrate a checkbox.
2. Customer-managed SSE-KMS is the likely choice, with a carefully scoped key policy and cross-account design.
3. Use Secrets Manager; KMS is the encryption-control service, not the secret lifecycle or rotation service.
4. S3 SSE-KMS requires a KMS key in the same Region as the bucket.

Do not create a customer-managed KMS key for this week. A key is a durable security boundary with its own policy, administrators, users, audit, rotation, and deletion lifecycle.

## Part 4 — Secrets Manager and runtime credentials

Secrets Manager is for database credentials, application credentials, OAuth tokens, API keys, and similar secrets that need lifecycle management. It supports runtime retrieval and automatic rotation patterns.

Use this decision table:

| Need | Use |
|---|---|
| AWS API credentials for a workload | IAM role and temporary credentials, not a stored access key in Secrets Manager |
| Database password or third-party API token | Secrets Manager |
| Encryption key material and key-use policy | AWS KMS |
| Nonsecret application configuration | Parameter Store or another configuration service |
| Private certificate/key lifecycle | ACM or the appropriate certificate/key service |

### Secret access design exercise

Design the access path for a Glue job that reads a PostgreSQL password:

1. The Glue job assumes its job role.
2. The job role can call `secretsmanager:GetSecretValue` on one secret ARN, not every secret.
3. The secret is encrypted with the default Secrets Manager managed key unless a documented customer-managed-key requirement exists.
4. The job retrieves the value at runtime and never logs the secret.
5. Rotation updates both the secret and the database/service credential; it is not merely a new text value in the secret store.
6. CloudWatch log filters, application error handling, and debugging procedures must prevent the value from appearing in logs.

Do not create a real secret for this exercise. Write the role-to-secret permission and the rotation sequence on paper, then identify the missing network, database, and monitoring assumptions.

## Part 5 — Lake Formation governance

Lake Formation centrally governs data-lake data in S3 and its metadata in the Glue Data Catalog. Its permission model augments IAM and can apply fine-grained controls at the database, table, column, row, or cell level for supported analytics services.

The important access path is:

`principal → IAM permissions → Lake Formation permissions → Glue Catalog/S3 data access`

A principal may need both the IAM permissions required to call the service and the Lake Formation permissions required to access the governed Data Catalog resource. Examples of Lake Formation permissions include `DESCRIBE`, `SELECT`, `INSERT`, `ALTER`, and `DATA_LOCATION_ACCESS`; they apply to different resource types and use cases.

### Hybrid access and `IAMAllowedPrincipals`

Lake Formation can coexist with existing IAM-based access through hybrid access mode. This supports incremental onboarding of databases or tables instead of changing the whole account at once.

Be especially careful with `IAMAllowedPrincipals`. It may be present for backward compatibility and can grant broad access through IAM policies. Do not revoke it from an existing shared Data Catalog resource during a learning exercise. First map current readers, writers, crawlers, Glue jobs, Athena workgroups, Redshift external schemas, and automation roles; then design a controlled migration or use hybrid access mode.

### No-mutation Lake Formation exercise

If your identity has read-only permissions, inspect the current account state. If the commands are denied or Lake Formation is not configured, record that as an expected result and do not request broad permissions just to make the lab run.

```bash
export AWS_REGION="<your-learning-region>"
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"

aws lakeformation get-data-lake-settings \
  --catalog-id "${AWS_ACCOUNT_ID}" \
  --region "${AWS_REGION}" \
  --output json

aws lakeformation list-resources \
  --region "${AWS_REGION}" \
  --output json
```

Then complete this design without running `grant-permissions` or `revoke-permissions`:

| Principal | Dataset | Intended access | IAM permission needed | Lake Formation permission |
|---|---|---|---|---|
| Data analyst role | `curated_orders` | Query non-sensitive columns | Athena/workgroup and S3 result access | `DESCRIBE` + `SELECT` on approved table/columns |
| Finance analyst role | `curated_orders` | Query finance columns only | Athena/workgroup and S3 result access | Column-filtered `SELECT` |
| Glue ETL role | `raw_orders` → `curated_orders` | Read raw, write curated | Glue, S3, and possibly KMS | Appropriate table/data-location permissions |
| Data steward role | Catalog metadata | Manage schema and tags | Glue/Lake Formation administration | `ALTER`, tag, and grant permissions as governed |

## Part 6 — Macie and sensitive-data discovery

Amazon Macie is an S3-focused data security service. It inventories and monitors S3 buckets, detects security/access-control risks, and uses machine learning, managed identifiers, custom identifiers, and allow lists to discover sensitive data in S3 objects.

Use Macie when the question is “where might PII, credentials, or financial data be in S3, and what findings should we investigate?” Use Lake Formation when the question is “which principal may query which cataloged data?” Use Secrets Manager when the question is “where do application credentials live and how do they rotate?”

Macie has a 30-day trial for some monitoring/discovery usage, but targeted sensitive-data discovery jobs are not included in that trial. Do not enable Macie or create a discovery job for this week without checking the current [Macie pricing](https://aws.amazon.com/macie/pricing/) and selecting a narrowly scoped, synthetic-data bucket.

No-account exercise:

1. Label the following objects as `public`, `internal`, `confidential`, or `restricted`: synthetic sales CSV, customer email export, database password file, public product catalog, and raw application logs.
2. For each object, choose: Lake Formation control, Macie discovery, Secrets Manager, KMS, lifecycle/retention, or an application-level control.
3. State which control detects a problem and which control prevents or limits access. Discovery is not the same as authorization.

## Part 7 — Governance worksheet for the capstone

Complete this table for the capstone dataset before changing any AWS resource:

| Governance question | Decision to record |
|---|---|
| What data classes exist? | e.g. synthetic, internal, PII, credentials |
| Who owns each dataset? | named role/team, not an individual credential |
| Where is raw data stored? | S3 bucket and prefix |
| Who may read raw data? | exact role and purpose |
| Who may read curated data? | exact role, table, column, or row scope |
| How is data encrypted at rest? | SSE-S3, AWS-managed SSE-KMS, or customer-managed SSE-KMS |
| How are credentials retrieved? | IAM role and Secrets Manager path, if needed |
| What is logged? | CloudTrail management/data events, service logs, access findings |
| How long is it retained? | S3 lifecycle, backup, and log-retention decision |
| What happens on a suspected exposure? | disable access, rotate secret, investigate findings, preserve evidence |
| How is access reviewed? | policy validation, CloudTrail, last-accessed data, periodic review |

## Part 8 — Original practice questions

These are original study questions, not reproduced exam items. Answer before reading the key.

1. A Glue job role has `s3:GetObject` on the correct prefix but Glue cannot assume the role. Which document should you inspect first?
2. A role has an identity-based `Allow` for `s3:GetObject`, but an applicable bucket policy has an explicit `Deny`. What is the result?
3. A role's identity policy allows `kms:Decrypt`, but the customer-managed KMS key policy does not allow the account to delegate through IAM. What should you expect?
4. An S3 SSE-KMS upload succeeds in `PutObject` authorization but fails at KMS. Which permission is commonly missing?
5. A service needs a database password at runtime and the password must rotate. Which service is the best fit?
6. A data analyst may query `orders` but must not see `customer_email`. Which Lake Formation capability is relevant?
7. An existing Glue Catalog has broad IAM-based access. You want to onboard one table to Lake Formation without interrupting existing workloads. Which approach is safer?
8. You need to find PII in S3 objects and produce findings, not just grant permissions. Which service is the best fit?
9. A developer can create a Step Functions execution but cannot pass the Glue job role to a service. Which IAM action should you investigate?
10. A policy says `Resource: "*"` for an action that supports resource-level ARNs. What is the first least-privilege improvement?

### Answer key

1. Inspect the role trust policy and confirm it trusts `glue.amazonaws.com`.
2. Denied. An explicit deny overrides an allow.
3. The IAM allow may be ineffective for using that key; inspect the KMS key policy and account-delegation statement.
4. `kms:GenerateDataKey` on the KMS key, in addition to the required S3 permission.
5. AWS Secrets Manager, with runtime retrieval and a rotation design.
6. A Lake Formation column filter/column-level `SELECT` permission.
7. Use Lake Formation hybrid access mode or another controlled incremental migration; do not revoke broad permissions blindly.
8. Amazon Macie.
9. `iam:PassRole` on the specific role ARN, plus the relevant trust policy and service configuration.
10. Replace the wildcard with the narrowest supported resource ARN and add conditions where they materially constrain use.

## Week 8 evidence and check-in

Save one or more of the following:

- the completed pipeline identity/access matrix;
- the unsafe-policy review and validated `week8-s3-read-policy.json` output;
- the KMS/S3 encryption scenario answers;
- the Secrets Manager runtime/rotation design;
- the Lake Formation read-only output or a documented “not configured/AccessDenied” result;
- the governance worksheet and practice-question score.

Use this check-in:

```text
Week: 8 — Security and governance
Account/Region:
Account status and cost guardrails:
Policy review completed (yes/no):
Access Analyzer validation result:
Pipeline identity/access matrix completed (yes/no):
KMS/SSE-S3/SSE-KMS explanation:
Secrets Manager design completed (yes/no):
Lake Formation state (not configured/read-only inspected/conceptual):
Macie decision and cost note:
Practice score (out of 10):
Evidence location:
What broke or felt unclear:
Current confidence (1–5):
Next commitment:
```

If no AWS account is ready, mark Week 8 **conceptual only** and submit the local policy-validation output plus the access/governance worksheets. It becomes **verified** only after evidence, any resource cleanup, and the reflection are reported.

## Official references

- [IAM policies and permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [IAM policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [IAM policy validation with Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html)
- [IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS KMS overview](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [KMS default key policy](https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-default.html)
- [S3 SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)
- [AWS Secrets Manager overview](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [Secrets Manager rotation](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)
- [Lake Formation overview](https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html)
- [Lake Formation permissions reference](https://docs.aws.amazon.com/lake-formation/latest/dg/lf-permissions-reference.html)
- [Amazon Macie overview](https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html)
- [Amazon Macie pricing](https://aws.amazon.com/macie/pricing/)
