# Week 0: AWS Learning Account Setup

Use this guide before running the Week 1 S3 lab. The first decision is whether you already have an AWS account from the EC2 work.

## Step 0 — Preserve the Free Tier window

Create free accounts on AWS Skill Builder and AWS Educate first. Do not create a new AWS account until you know whether you are eligible for the new-customer Free plan.

AWS Free Tier references:

- Free Tier: https://aws.amazon.com/free/
- Free Tier FAQ: https://aws.amazon.com/free/free-tier-faqs/
- Free Tier terms: https://aws.amazon.com/free/terms/

Training setup:

1. Create a free profile at https://skillbuilder.aws/.
2. Search for `AWS Certified Data Engineer - Associate` or `DEA-C01`.
3. Filter the catalog to **Certification Exam Preparation** and English.
4. Start with the free Official Practice Question Set and Exam Prep Standard Course when they are available in the catalog.
5. Treat the Official Pretest, Official Practice Exam, Builder Labs, Cloud Quest, and enhanced courses as optional later resources; check the current access level and price before subscribing.
6. Create a free AWS Educate profile at https://www.awseducate.com/ for account-free foundational labs and learning resources.

Use the [AWS certification preparation page](https://aws.amazon.com/certification/certification-prep/) as the current index when Skill Builder search results change.

AWS currently describes two separate limits: new customers receive $100 in credits at signup and may earn up to $100 more through qualifying console activities; those credits expire 12 months after account creation. A Free plan account itself ends after six months or when its credits are exhausted, whichever comes first. A valid payment method is required for identity verification. Existing or previous AWS accounts may not qualify. Do not create a duplicate account to chase credits.

## Step 1 — Choose the correct branch

### Branch A: No personal AWS account has ever been created

1. Open https://aws.amazon.com/free/.
2. Choose **Create a free account**.
3. Use an email address that has never been used for an AWS account.
4. Complete email, password, contact, phone, and payment-method verification.
5. When offered a choice of account plans, choose **Free account plan**.
6. Do not upgrade to the Paid plan during signup.
7. Record the account creation date, Free plan end date, credit balance, and chosen Region.

Stop here if AWS says the account already exists or the signup is not eligible. Do not open another account; report the exact message in the check-in.

### Branch B: The EC2 work used a personal AWS account

1. Sign in at https://console.aws.amazon.com/ as the root user only to perform account-security and billing setup.
2. Open Billing and Cost Management and inspect the Free Tier/credits status.
3. Record whether the account is on the legacy or current Free Tier, whether credits remain, the credit expiration date, and the Free Plan expiration date if applicable.
4. Continue with Step 2 below.

Do not assume that an old account is eligible for the new $200 credit program. Redshift Serverless eligibility is separate and depends on whether Redshift Serverless has previously been used.

### Branch C: Account status is unknown

1. Search your password manager and email for `amazonaws.com`, `AWS account`, or `AWS billing`.
2. Try the AWS root-user sign-in flow with likely email addresses.
3. If you find an account, use Branch B.
4. If you cannot determine the status, use AWS Educate and Skill Builder while we resolve it. Do not create a second account yet.

## Step 2 — Secure the root user

After account activation or when entering an existing account:

1. Sign in as the root user.
2. Enable MFA using a passkey/security key or an authenticator app.
3. Do not create root access keys.
4. Confirm the root email address and phone number can receive AWS security and billing notices.
5. Sign out of root.

AWS root credentials have unrestricted access. Use them only for tasks that require root, not for labs or daily CLI work.

Reference: https://docs.aws.amazon.com/signin/latest/userguide/best-practices-admin.html

## Step 3 — Protect Free Tier eligibility

Do not create AWS Organizations, join another organization, or set up Control Tower in this learning account. AWS documents that joining or creating an organization can immediately expire Free Tier credits and move the account to a paid plan.

For a single-account learning sandbox, we will use a dedicated non-root administrative identity for daily console work and CloudShell. AWS's preferred federated setup can be introduced later when you have a multi-account environment; do not trade away the new-account credits merely to create an organization instance for this one-account lab.

## Step 4 — Create a non-root learning identity

From the IAM console, for this isolated one-account sandbox:

1. Choose **Users → Create user** and name the user something like `aws-de-learning-admin`.
2. Enable AWS Management Console access and attach the AWS-managed `AdministratorAccess` policy.
3. Enable MFA for the user.
4. Use the user for the console and CloudShell.
5. Do not create long-lived access keys unless a later lab explicitly requires them; prefer CloudShell or temporary credentials.
6. Keep root credentials separate and protected.

This IAM user is a temporary learning-account bootstrap compromise, not a production identity pattern. In a production or multi-account environment, use federation/IAM Identity Center and temporary role credentials instead. If an existing account is already managed by an organization, use its approved federation rather than creating another user.

When you later build workload components, use IAM roles with narrowly scoped policies rather than this administrative identity. Week 1 includes a least-privilege S3 policy design exercise; it does not require launching EC2 to test a role.

## Step 5 — Configure billing and usage alerts

Open https://console.aws.amazon.com/costmanagement/ and complete these checks:

- [ ] Free Tier usage alerts are enabled.
- [ ] Credit balance and expiration date are visible.
- [ ] A monthly cost budget exists, for example `$5`.
- [ ] An actual-spend alert is configured at a low threshold, such as `$1`.
- [ ] A forecasted-spend alert is configured at the budget threshold.
- [ ] Billing notifications go to an email you check.

Budgets notify you; they are not a hard resource-creation lock. Also inspect the Free Tier dashboard after each lab and delete resources deliberately.

## Step 6 — Verify the non-root console session

Open CloudShell from the AWS console and run:

```bash
aws sts get-caller-identity
aws configure list
aws --version
```

Confirm that:

- The account ID is the intended learning account.
- The caller is not the root user.
- The Region is the Region you selected.
- No long-lived secret key was pasted into CloudShell.

If `get-caller-identity` fails, stop and save the exact error. Do not work around it by signing in as root for normal work.

## Step 7 — Stop point before Week 1

Before creating the S3 bucket, record:

```text
AWS account status: new / existing / unknown
Account creation date:
Free plan or legacy/paid plan:
Credit balance and expiration:
Learning Region:
Non-root identity ready: yes/no
MFA enabled for root: yes/no
MFA enabled for learning identity: yes/no
Free Tier alerts: yes/no
Budget and thresholds:
Organizations/Control Tower created: no
```

When sending this stop-point to the chat, send status values only. Do not include the full account ID, ARN, credentials, access keys, MFA codes, or secret values; identity type and a redacted error are sufficient.

Once this is complete, continue with [Week 1 Secure S3 Lab](aws-data-engineer-week-1-lab.md).

## Do not create yet

Do not activate Redshift Serverless, provisioned Redshift, RDS, EMR, MSK, MWAA, OpenSearch, NAT Gateway, or VPC endpoints during Week 0. We will introduce each service only when its lab, cost boundary, and cleanup path are ready.
