export type WeekStatus = "not-started" | "studying" | "practiced" | "verified" | "revisit";

export type Week = {
  number: number;
  title: string;
  domain: string;
  summary: string;
  tags: string[];
  deliverable: string;
  guide: string;
};

export const STATUS_OPTIONS: Array<[WeekStatus, string]> = [
  ["not-started", "Not started"],
  ["studying", "Studying"],
  ["practiced", "Practiced"],
  ["verified", "Verified"],
  ["revisit", "Revisit"],
];

export const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS) as Record<WeekStatus, string>;

export const WEEKS: Week[] = [
  {
    number: 0,
    title: "Account & safety",
    domain: "setup / guardrails",
    summary: "Secure the learning account, pick a Region, and establish cost guardrails before touching a warehouse.",
    tags: ["IAM", "Budgets", "CloudShell"],
    deliverable: "Verified Week 0 stop-point",
    guide: "/guides/aws-data-engineer-week-0-account-setup.md",
  },
  {
    number: 1,
    title: "S3 foundation",
    domain: "foundations",
    summary: "Build a private, encrypted lake landing zone and explain roles, bucket policies, lifecycle, and access denial.",
    tags: ["S3", "KMS", "IAM"],
    deliverable: "Secure bucket + teardown evidence",
    guide: "/guides/aws-data-engineer-week-1-lab.md",
  },
  {
    number: 2,
    title: "Glue + Athena",
    domain: "ingestion / stores",
    summary: "Turn S3 objects into queryable metadata, then make partition pruning and columnar storage visible in scan costs.",
    tags: ["Glue Catalog", "Athena", "Parquet"],
    deliverable: "Catalog table + query evidence",
    guide: "/guides/aws-data-engineer-week-2-glue-athena-lab.md",
  },
  {
    number: 3,
    title: "Glue ETL",
    domain: "ingestion / transformation",
    summary: "Run a small Spark transformation, inspect its script and logs, and make a deliberate schema-evolution decision.",
    tags: ["Glue ETL", "Spark", "Bookmarks"],
    deliverable: "Curated Parquet + schema note",
    guide: "/guides/aws-data-engineer-week-3-glue-etl-lab.md",
  },
  {
    number: 4,
    title: "Redshift warehouse",
    domain: "store management",
    summary: "Cross the boundary from querying S3 to modeling warehouse tables, then add the dbt layer that feels familiar from Dataform.",
    tags: ["Redshift", "COPY", "dbt"],
    deliverable: "Warehouse model + UNLOAD",
    guide: "/guides/aws-data-engineer-week-4-redshift-lab.md",
  },
  {
    number: 5,
    title: "Streaming path",
    domain: "ingestion / velocity",
    summary: "Send partitioned events through Kinesis and Firehose, then reason about retention, ordering, buffering, and replay.",
    tags: ["Kinesis", "Firehose", "Lambda"],
    deliverable: "Delivery evidence + teardown",
    guide: "/guides/aws-data-engineer-week-5-streaming-lab.md",
  },
  {
    number: 6,
    title: "Orchestration",
    domain: "operations",
    summary: "Wrap a Glue job in Step Functions, trigger it with EventBridge, and inject a failure to practice retries and catches.",
    tags: ["Step Functions", "EventBridge", "Glue"],
    deliverable: "Execution + failure-path evidence",
    guide: "/guides/aws-data-engineer-week-6-orchestration-lab.md",
  },
  {
    number: 7,
    title: "Stores + migration",
    domain: "store management",
    summary: "Choose between OLTP, key-value, warehouse, and movement services using workload shape rather than service familiarity.",
    tags: ["DynamoDB", "RDS", "DMS"],
    deliverable: "Decision matrix + runbook",
    guide: "/guides/aws-data-engineer-week-7-data-stores-migration-lab.md",
  },
  {
    number: 8,
    title: "Security + governance",
    domain: "security",
    summary: "Trace identity, encryption, secrets, and lake permissions through the pipeline; validate a policy before attaching it.",
    tags: ["IAM", "KMS", "Lake Formation"],
    deliverable: "Access matrix + policy rationale",
    guide: "/guides/aws-data-engineer-week-8-security-governance-lab.md",
  },
  {
    number: 9,
    title: "Observe + recover",
    domain: "operations / cost",
    summary: "Make logs, audit trails, data-quality checks, failure recovery, and cost controls part of the pipeline—not afterthoughts.",
    tags: ["CloudWatch", "CloudTrail", "Budgets"],
    deliverable: "Runbook + quality/cost worksheet",
    guide: "/guides/aws-data-engineer-week-9-observability-reliability-cost-lab.md",
  },
  {
    number: 10,
    title: "Automate the platform",
    domain: "automation / dbt",
    summary: "Use CLI, Boto3, IaC, dbt, and validation-first CI/CD to turn the lab into a repeatable engineering artifact.",
    tags: ["Boto3", "CloudFormation", "dbt"],
    deliverable: "Starter stack + automation evidence",
    guide: "/guides/aws-data-engineer-week-10-automation-iac-dbt-lab.md",
  },
  {
    number: 11,
    title: "Remediate + pretest",
    domain: "exam readiness",
    summary: "Audit the current blueprint, close domain gaps, and turn missed questions into specific remediation actions.",
    tags: ["Blueprint", "Error log", "Pretest"],
    deliverable: "Closed error log + pretest result",
    guide: "/guides/aws-data-engineer-week-11-remediation-pretest.md",
  },
  {
    number: 12,
    title: "Timed readiness",
    domain: "exam readiness",
    summary: "Use timed sets, capstone troubleshooting, and an official practice result to make a deliberate schedule-or-delay decision.",
    tags: ["Timed sets", "Capstone", "Schedule"],
    deliverable: "Readiness gate + exam decision",
    guide: "/guides/aws-data-engineer-week-12-timed-readiness-exam.md",
  },
];

export const TRANSFERS = [
  { source: "Cloud Storage", target: "S3", focus: "object layout + lifecycle" },
  { source: "BigQuery", target: "Athena / Redshift", focus: "lake query vs warehouse" },
  { source: "Dataflow", target: "Glue / EMR", focus: "managed batch + Spark" },
  { source: "Pub/Sub", target: "Kinesis", focus: "partitions + replay" },
  { source: "Dataform", target: "dbt + Redshift", focus: "models + tests + DAG" },
  { source: "Composer", target: "MWAA / Step Functions", focus: "workflow boundary" },
  { source: "Cloud Logging", target: "CloudWatch", focus: "workload telemetry" },
  { source: "Audit Logs", target: "CloudTrail", focus: "API evidence" },
  { source: "Dataplex", target: "Glue + Lake Formation", focus: "catalog + governance" },
  { source: "Secret Manager", target: "Secrets Manager", focus: "runtime secrets" },
];

export const CORE_RESOURCES = [
  { number: "01", title: "Start Here", description: "Current status, first 30 minutes, and the GCP → AWS map.", href: "/guides/AWS-DATA-ENGINEER-START-HERE.md", type: "local" },
  { number: "02", title: "Completion audit", description: "Prepared material versus learner evidence still needed.", href: "/guides/AWS-DATA-ENGINEER-COMPLETION-AUDIT.md", type: "local" },
  { number: "03", title: "Study plan", description: "Full sequence, capstone, Dataform/dbt mapping, and gates.", href: "/guides/aws-data-engineer-study-plan.md", type: "local" },
  { number: "04", title: "DEA-C01 blueprint", description: "Domains, service priorities, and error taxonomy.", href: "/guides/aws-dea-c01-blueprint.md", type: "local" },
  { number: "05", title: "Accountability tracker", description: "Verified status, check-in template, and readiness scorecard.", href: "/guides/aws-data-engineer-accountability.md", type: "local" },
  { number: "06", title: "Week 0 setup", description: "Account safety, billing guardrails, and non-root identity steps.", href: "/guides/aws-data-engineer-week-0-account-setup.md", type: "local" },
];

export const OFFICIAL_RESOURCES = [
  { number: "A", title: "AWS exam guide", description: "Current DEA-C01 scope, domains, response types, and revisions.", href: "https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html", type: "AWS" },
  { number: "B", title: "Certification preparation", description: "AWS’s current preparation index and official options.", href: "https://aws.amazon.com/certification/certification-prep/", type: "AWS" },
  { number: "C", title: "Skill Builder", description: "Search the free DEA-C01 preparation catalog.", href: "https://skillbuilder.aws/", type: "AWS" },
  { number: "D", title: "Free Tier", description: "Current account plan, credits, and eligibility information.", href: "https://aws.amazon.com/free/", type: "AWS" },
  { number: "E", title: "AWS Educate", description: "Account-free foundational labs and resources.", href: "https://www.awseducate.com/", type: "AWS" },
];

export type Question = {
  number: number;
  domain: "ingestion" | "stores" | "operations" | "security";
  prompt: string;
  options: Record<string, string>;
  answer: string;
};

export const QUESTIONS: Question[] = [
  { number: 1, domain: "ingestion", prompt: "Daily CSVs need a serverless Spark transformation that casts columns, writes Parquet, and can run on demand or after a trigger. Best fit?", options: { A: "Redshift provisioned cluster", B: "AWS Glue ETL job", C: "DynamoDB", D: "Route 53" }, answer: "B" },
  { number: 2, domain: "ingestion", prompt: "Clickstream events need per-customer ordering and independent consumers reading retained events. Best design?", options: { A: "S3 with random object names", B: "Kinesis Data Streams with customer ID as partition key", C: "Firehose Direct PUT only", D: "RDS as the queue" }, answer: "B" },
  { number: 3, domain: "ingestion", prompt: "Near-real-time JSON events need managed buffering and delivery to S3 without custom consumer code. Which service?", options: { A: "Amazon Data Firehose", B: "CloudTrail", C: "Glue Crawler", D: "EBS" }, answer: "A" },
  { number: 4, domain: "ingestion", prompt: "Step Functions must start a Glue job and continue only after it finishes. Which integration is appropriate?", options: { A: "glue:startJobRun", B: "glue:startJobRun.sync", C: "lambda:invoke.waitForTaskToken", D: "EventBridge schedule with no target role" }, answer: "B" },
  { number: 5, domain: "stores", prompt: "Athena scans 2 TB but needs one day stored under Hive-style event_date prefixes. Highest-value first optimization?", options: { A: "Filter the partition and select required columns", B: "Convert Parquet to CSV", C: "Remove the partition column", D: "Only increase result-cache duration" }, answer: "A" },
  { number: 6, domain: "stores", prompt: "Repeated joins and aggregations need warehouse-managed tables and predictable SQL performance. Best design?", options: { A: "Always scan external S3 data in Athena", B: "Load curated data into modeled Redshift tables", C: "Store rows in Parameter Store", D: "Use CloudTrail Lake as the warehouse" }, answer: "B" },
  { number: 7, domain: "stores", prompt: "An application needs single-digit-millisecond access to profiles by known customer ID, at high volume, with no joins. Best fit?", options: { A: "DynamoDB", B: "Redshift", C: "Athena", D: "S3 Select as the primary database" }, answer: "A" },
  { number: 8, domain: "stores", prompt: "Which statement best distinguishes an operational relational database from an analytical warehouse?", options: { A: "RDS/Aurora generally serve transactions; Redshift serves analytics", B: "RDS/Aurora cannot store relational data", C: "Redshift is always for single-row transactions", D: "RDS/Aurora replaces Glue metadata" }, answer: "A" },
  { number: 9, domain: "operations", prompt: "A Glue job has transient service or concurrency failures. Retry with backoff, then route failure for investigation. Which mechanism?", options: { A: "Step Functions Retry followed by Catch", B: "A larger S3 bucket", C: "A new IAM user per retry", D: "Disable all CloudWatch logs" }, answer: "A" },
  { number: 10, domain: "operations", prompt: "You need to answer which IAM principal called an AWS API operation and when. Primary audit source?", options: { A: "CloudWatch Logs only", B: "AWS CloudTrail", C: "Athena results only", D: "Glue Crawler history only" }, answer: "B" },
  { number: 11, domain: "operations", prompt: "You want actual-spend and forecasted-spend alerts at thresholds. Best control?", options: { A: "AWS Budgets", B: "S3 lifecycle rule", C: "Redshift sort key", D: "Kinesis partition key" }, answer: "A" },
  { number: 12, domain: "operations", prompt: "A Kinesis consumer may receive a record again after retry. Safest purchase-event behavior?", options: { A: "Idempotent processing using a stable event ID", B: "Assume exactly once and insert blindly", C: "Delete the stream after each batch", D: "Disable retries" }, answer: "A" },
  { number: 13, domain: "security", prompt: "Redshift must load files from a specific S3 prefix. Preferred authorization approach?", options: { A: "Access keys in COPY", B: "Least-privilege IAM role with IAM_ROLE", C: "Public S3 bucket", D: "Root access keys" }, answer: "B" },
  { number: 14, domain: "security", prompt: "S3 objects need a customer-managed KMS key with controlled role usage. Which combination matters?", options: { A: "KMS key policy/IAM permissions plus S3 encryption configuration", B: "CloudWatch dashboard only", C: "Partition projection only", D: "EventBridge pattern only" }, answer: "A" },
  { number: 15, domain: "security", prompt: "Teams query S3 data but need table, column, or row-level authorization. Which governance service is most direct?", options: { A: "Lake Formation", B: "Route 53", C: "ECR", D: "CodeDeploy" }, answer: "A" },
  { number: 16, domain: "security", prompt: "A Glue job needs a rotatable database password that must not live in source code or S3. Best fit?", options: { A: "Secrets Manager", B: "Public S3 metadata", C: "CloudTrail history", D: "Hard-coded Git environment variable" }, answer: "A" },
];

export const DOMAIN_META = {
  ingestion: { label: "Ingestion & Transformation", short: "D1", weight: "34%" },
  stores: { label: "Data Store Management", short: "D2", weight: "26%" },
  operations: { label: "Data Operations & Support", short: "D3", weight: "22%" },
  security: { label: "Data Security & Governance", short: "D4", weight: "18%" },
} as const;
