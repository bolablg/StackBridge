# Week 1 Lab: Secure S3 Data-Lake Foundation

Goal: learn the AWS control plane while creating a small, private S3 landing zone. This lab is intentionally small and should use only a few text/CSV objects.

Related plan: [AWS Data Engineer Study Plan](aws-data-engineer-study-plan.md)

## Safety rules

- Use a non-root identity. Do not create or paste root access keys.
- Prefer AWS CloudShell for the CLI. It is browser-based, pre-authenticated with the current console identity, and AWS documents it as having no additional charge.
- Use one Region and a bucket name derived from your account ID so it is globally unique.
- Do not enable public access, website hosting, NAT Gateway, VPC endpoints, KMS customer-managed keys, or any compute service for this lab.
- Save the evidence before cleanup. Delete the bucket and objects at the end.

Official references:

- AWS S3 CLI getting started: https://docs.aws.amazon.com/AmazonS3/latest/userguide/GettingStartedS3CLI.html
- AWS CloudShell: https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html
- AWS CLI console sign-in: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html
- IAM least privilege: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
- S3 Object Ownership: https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html
- IAM Access Analyzer policy validation: https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html

## Preconditions

- [ ] Week 0 account safety is complete.
- [ ] A single learning Region has been chosen. Use `us-east-1` for the examples below, or replace it consistently with your chosen Region.
- [ ] Free Tier alerts and a cost budget are enabled.
- [ ] You know whether this is a new AWS account or an existing one.

If you do not yet have an AWS account, stop after the preconditions and use AWS Educate or an AWS Skill Builder sandbox. Do not create an account solely to run this lab until Free Tier eligibility has been checked.

## Part A — Identify the active identity

Open AWS CloudShell from the AWS console and run:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_CALLER_ARN=$(aws sts get-caller-identity --query Arn --output text)
printf 'Account: %s\nCaller: %s\nRegion: %s\n' "$AWS_ACCOUNT_ID" "$AWS_CALLER_ARN" "$AWS_REGION"
```

Evidence: save the account number only if you are comfortable doing so; never save credentials, tokens, or secret values. The important evidence is the identity type and Region.

## Part B — Create a private bucket

The bucket name is globally unique within the AWS partition. The `s3api create-bucket` command needs a location constraint outside `us-east-1`.

```bash
export BUCKET="aws-de-learning-${AWS_ACCOUNT_ID}-${AWS_REGION}"
if [ "$AWS_REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION" --create-bucket-configuration LocationConstraint="$AWS_REGION"
fi
```

If the bucket name already exists, append a short lowercase suffix such as `-lab1` and export the new value before continuing.

Apply explicit safety settings:

```bash
aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws s3api put-bucket-ownership-controls --bucket "$BUCKET" --ownership-controls="Rules=[{ObjectOwnership=BucketOwnerEnforced}]"
aws s3api put-bucket-encryption --bucket "$BUCKET" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-tagging --bucket "$BUCKET" --tagging 'TagSet=[{Key=Project,Value=aws-de-learning},{Key=Environment,Value=week1}]'
```

S3 now enables default encryption and Block Public Access for new buckets, but setting and verifying them explicitly is useful exam and operational practice.

## Part C — Create lake prefixes and upload a tiny object

S3 does not create real directories; prefixes are part of object keys. This command creates `raw/`, `curated/`, and `analytics/` by writing small objects under those prefixes.

```bash
printf 'event_id,event_date,amount\n1,2026-01-01,10.50\n2,2026-01-02,7.25\n' > /tmp/week1-events.csv
aws s3 cp /tmp/week1-events.csv "s3://$BUCKET/raw/week1-events.csv"
printf 'reserved for curated output\n' | aws s3 cp - "s3://$BUCKET/curated/README.txt"
printf 'reserved for analytics output\n' | aws s3 cp - "s3://$BUCKET/analytics/README.txt"
aws s3 ls "s3://$BUCKET/" --recursive
```

## Part D — Add a short-lived lifecycle rule

Create a temporary prefix and configure it to expire after seven days. Do not apply this rule to `raw/` or the capstone data.

```bash
printf 'temporary lab object\n' | aws s3 cp - "s3://$BUCKET/tmp/cleanup-me.txt"
aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" --lifecycle-configuration '{"Rules":[{"ID":"ExpireTemporaryLabObjects","Status":"Enabled","Filter":{"Prefix":"tmp/"},"Expiration":{"Days":7}}]}'
```

## Part E — Verify the security and storage state

Run each command and save the relevant output in your notes:

```bash
aws s3api head-bucket --bucket "$BUCKET"
aws s3api get-public-access-block --bucket "$BUCKET"
aws s3api get-bucket-encryption --bucket "$BUCKET"
aws s3api get-bucket-lifecycle-configuration --bucket "$BUCKET"
aws s3api get-bucket-ownership-controls --bucket "$BUCKET"
aws s3 ls "s3://$BUCKET/" --recursive --summarize
```

Expected observations:

- Public access is blocked in all four settings.
- Default encryption uses `AES256`/SSE-S3.
- The lifecycle rule applies only to `tmp/`.
- The bucket owner controls object ownership and ACLs are not needed for this lab.
- The data is organized by prefixes, not folders.

## Part F — Least-privilege policy exercise

Do this as a policy-design exercise before attaching it to any workload. Draft a policy document—do not create a persistent customer-managed policy yet—with the following intent:

- Allow `s3:ListBucket` only for the lab bucket and only when the requested prefix is `raw/`.
- Allow `s3:GetObject` only for `arn:aws:s3:::<BUCKET_NAME>/raw/*`.
- Do not allow `s3:PutObject`, `s3:DeleteObject`, `s3:PutBucketPolicy`, or public access.

Replace `<BUCKET_NAME>` with the exact bucket name. Use IAM Access Analyzer to validate the draft policy if it is available in the account; validation does not require attaching the policy to a principal. Create or attach a persistent policy only when there is a real workload principal, an explicit cleanup step, and a trust policy to review; do not invent an EC2 instance just to test the policy.

## Evidence checklist

- [ ] Account/identity type and Region recorded.
- [ ] Bucket name recorded.
- [ ] Architecture sketch: client/CLI → S3 raw/curated/analytics prefixes.
- [ ] Public access block, encryption, lifecycle, ownership, and object listing verified.
- [ ] One-paragraph comparison: GCS bucket/IAM versus S3 bucket/IAM/role.
- [ ] Least-privilege policy design saved without credentials.
- [ ] Cleanup completed and verified.

## Cleanup

Run only after saving evidence and confirming that `BUCKET` is the lab bucket:

```bash
printf 'About to delete: %s\n' "$BUCKET"
aws s3 rm "s3://$BUCKET" --recursive
aws s3api delete-bucket --bucket "$BUCKET" --region "$AWS_REGION"
```

Verify that the bucket no longer appears in the S3 console. If a command fails, save the exact error message and stop; do not work around a permission error by using the root user.

## Week 1 check-in

```text
Week: 1
Hours studied:
AWS account status (new/existing/unknown):
Region:
Bucket created: yes/no
Security settings verified:
CLI commands that worked:
What broke:
GCP comparison learned:
Evidence saved:
Confidence (1–5):
Next commitment:
```
