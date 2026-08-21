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

export type Transfer = {
  source: string;
  target: string;
  focus: string;
};

export const TRANSFERS: Transfer[] = [
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

export type PathRouteStatus = "available" | "coming-soon";

export type PathRoute = {
  key: string;
  targetKey: string;
  targetLabel: string;
  targetMark: string;
  title: string;
  description: string;
  status: PathRouteStatus;
  pathKey?: string;
};

export type PathSource = {
  key: string;
  label: string;
  short: string;
  credential: string;
  routes: PathRoute[];
};

export type PathGroup = {
  key: string;
  number: string;
  title: string;
  description: string;
  status: "active" | "coming-soon";
  sources: PathSource[];
};

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
  { number: 1, domain: "ingestion", prompt: "Daily CSVs need a serverless Spark transformation that casts columns, writes partitioned Parquet, and runs after new objects arrive. Best fit?", options: { A: "An EMR Serverless Spark job with custom orchestration", B: "An AWS Glue ETL job triggered through EventBridge", C: "A Redshift COPY followed by stored procedures", D: "A Lambda function that bundles the Spark runtime" }, answer: "B" },
  { number: 2, domain: "ingestion", prompt: "Clickstream events need per-customer ordering, retained replay, and independent consumers. Best design?", options: { A: "Amazon Data Firehose with dynamic partitioning", B: "Kinesis Data Streams with customer ID as the partition key", C: "An Amazon MSK topic with one partition for all customers", D: "An SQS FIFO queue shared by all independent consumers" }, answer: "B" },
  { number: 3, domain: "ingestion", prompt: "Near-real-time JSON events need managed buffering, optional format conversion, and delivery to S3 without custom consumer code. Which service?", options: { A: "Amazon Data Firehose", B: "Kinesis Data Streams with a Lambda consumer", C: "Amazon MSK Connect with a custom sink", D: "AWS Glue streaming ETL" }, answer: "A" },
  { number: 4, domain: "ingestion", prompt: "Step Functions must start a Glue job and continue only after the job reaches a terminal state. Which integration is appropriate?", options: { A: "glue:startJobRun with a fixed Wait state", B: "glue:startJobRun.sync", C: "lambda:invoke.waitForTaskToken wrapping StartJobRun", D: "An EventBridge rule that starts the state machine again" }, answer: "B" },
  { number: 5, domain: "stores", prompt: "Athena scans 2 TB but needs one day stored under Hive-style event_date prefixes. Highest-value first optimization?", options: { A: "Filter the event_date partition and project only required columns", B: "Use a CTAS query to write an unpartitioned ORC copy before every query", C: "Enable provisioned capacity without changing the query", D: "Increase result reuse duration even though each query uses a new date" }, answer: "A" },
  { number: 6, domain: "stores", prompt: "Repeated multi-table joins and aggregations need warehouse-managed storage and predictable BI concurrency. Best design?", options: { A: "Query raw S3 data with Athena for every dashboard refresh", B: "Load curated dimensional data into modeled Redshift tables", C: "Keep the model external and query it through Redshift Spectrum only", D: "Use Aurora read replicas as the analytical serving layer" }, answer: "B" },
  { number: 7, domain: "stores", prompt: "An application needs single-digit-millisecond profile reads by known customer ID at high volume, with no joins. Best fit?", options: { A: "DynamoDB with customer ID as the partition key", B: "Aurora Serverless v2 with customer ID indexed", C: "Redshift Serverless with a distribution key", D: "Athena over partitioned profile files" }, answer: "A" },
  { number: 8, domain: "stores", prompt: "A service processes short ACID transactions while analysts run large aggregations over curated history. Which placement is most appropriate?", options: { A: "Use Aurora or RDS for transactions and Redshift for analytical history", B: "Use Redshift for both single-row transactions and warehouse queries", C: "Use Athena as the transactional database and Aurora for the warehouse", D: "Use the Glue Data Catalog as the transactional store" }, answer: "A" },
  { number: 9, domain: "operations", prompt: "A Glue job has transient service or concurrency failures. Retry with backoff, then route failure for investigation. Which mechanism?", options: { A: "A Step Functions Retry policy followed by Catch", B: "A Glue job retry count with no terminal notification path", C: "An EventBridge retry policy that restarts the entire workflow", D: "A Lambda asynchronous dead-letter queue around the Glue job" }, answer: "A" },
  { number: 10, domain: "operations", prompt: "An investigation must identify which IAM principal changed a Glue table and when. Primary audit source?", options: { A: "CloudWatch metrics for the Glue Data Catalog", B: "AWS CloudTrail management events", C: "Glue job run logs", D: "AWS Config resource snapshots only" }, answer: "B" },
  { number: 11, domain: "operations", prompt: "A sandbox account needs notifications for both actual and forecasted monthly spend at defined thresholds. Best control?", options: { A: "AWS Budgets with actual and forecasted alerts", B: "Cost Anomaly Detection with no budget thresholds", C: "A Cost and Usage Report queried at month end", D: "AWS Compute Optimizer recommendations" }, answer: "A" },
  { number: 12, domain: "operations", prompt: "A Kinesis consumer may receive a purchase event again after a checkpoint retry. Safest target-write behavior?", options: { A: "Use a stable event ID with an idempotent or conditional write", B: "Increase the shard count so duplicate delivery cannot occur", C: "Use enhanced fan-out and append every record without checking keys", D: "Shorten stream retention below the consumer checkpoint interval" }, answer: "A" },
  { number: 13, domain: "security", prompt: "Redshift must load files from one restricted S3 prefix without storing long-lived credentials. Preferred authorization approach?", options: { A: "Store an IAM user's keys in Secrets Manager and inject them into COPY", B: "Attach a least-privilege IAM role and reference it with IAM_ROLE", C: "Use a presigned URL for every object in the manifest", D: "Grant the Redshift cluster's security group access to the bucket" }, answer: "B" },
  { number: 14, domain: "security", prompt: "Redshift must COPY objects encrypted with a customer-managed KMS key from a restricted S3 prefix. Which TWO controls are required?", options: { A: "Grant the Redshift IAM role s3:GetObject and kms:Decrypt for the scoped resources", B: "Allow the Redshift IAM role in the KMS key policy", C: "Make the S3 prefix public and rely on bucket encryption", D: "Embed an IAM user's access keys in the COPY command", E: "Disable KMS key rotation for the duration of each load" }, answer: "A,B" },
  { number: 15, domain: "security", prompt: "Teams query cataloged S3 data but require table, column, and row-level authorization across Athena and Redshift Spectrum. Which governance service is most direct?", options: { A: "AWS Lake Formation", B: "S3 Access Points without catalog permissions", C: "IAM Identity Center permission sets only", D: "Glue resource policies without data filters" }, answer: "A" },
  { number: 16, domain: "security", prompt: "A Glue job needs a database password that rotates automatically and must not live in code or job arguments. Best fit?", options: { A: "AWS Secrets Manager with scoped role access", B: "SSM Parameter Store as an unencrypted String parameter", C: "An encrypted value committed to the deployment repository", D: "A Glue connection property containing the literal password" }, answer: "A" },
];

export const DOMAIN_META = {
  ingestion: { label: "Ingestion & Transformation", short: "D1", weight: "34%" },
  stores: { label: "Data Store Management", short: "D2", weight: "26%" },
  operations: { label: "Data Operations & Support", short: "D3", weight: "22%" },
  security: { label: "Data Security & Governance", short: "D4", weight: "18%" },
} as const;

export type DiagnosticDomainKey = keyof typeof DOMAIN_META;
export type DiagnosticDomainMeta = Record<DiagnosticDomainKey, {
  label: string;
  short: string;
  weight: string;
}>;

export type SafetyProfile = {
  locationLabel: string;
  locationPlaceholder: string;
  accountLabel: string;
  accountOptions: string[];
  expiryLabel: string;
  checks: [keyof DashboardSetupChecks, string][];
};

export type DashboardSetupChecks = {
  rootMfa: boolean;
  nonRoot: boolean;
  budget: boolean;
  noOrg: boolean;
};

export const DEFAULT_PATH_KEY = "gcp-to-aws-data-engineer";

export type PlatformKey = "gcp" | "aws" | "azure" | "databricks" | "snowflake";

export type PlatformProfile = {
  key: PlatformKey;
  label: string;
  short: string;
  credential: string;
  officialUrl: string;
  preparationUrl: string;
  exam: {
    version: string;
    duration: string;
    questionCount: string;
    responseTypes: string;
    blueprintSummary: string;
  };
  diagnosticDomains: DiagnosticDomainMeta;
  diagnosticNote: string;
  safety: SafetyProfile;
  services: {
    lake: string;
    warehouse: string;
    batch: string;
    streaming: string;
    semantic: string;
    orchestration: string;
    governance: string;
    secrets: string;
    observability: string;
  };
};

export type SimulationQuestion = Question & {
  id: string;
  rationale: string;
};

export type ExamSimulation = {
  key: string;
  number: number;
  title: string;
  focus: string;
  durationMinutes: number;
  questions: SimulationQuestion[];
};

export type PathBlueprint = {
  key: string;
  roleKey: "data-engineering";
  title: string;
  summary: string;
  focus: string;
  source: PlatformProfile;
  target: PlatformProfile;
  weeks: Week[];
  transfers: Transfer[];
  simulations: ExamSimulation[];
};

export const PLATFORM_PROFILES: Record<PlatformKey, PlatformProfile> = {
  gcp: {
    key: "gcp",
    label: "Google Cloud",
    short: "GCP",
    credential: "Professional Data Engineer",
    officialUrl: "https://cloud.google.com/learn/certification/data-engineer",
    preparationUrl: "https://cloud.google.com/learn/certification/data-engineer",
    exam: {
      version: "Professional Data Engineer · guide v4.2",
      duration: "2 hours",
      questionCount: "40–50 questions",
      responseTypes: "Multiple choice and multiple select",
      blueprintSummary: "Design 22% · ingest/process 25% · storage 20% · analysis 15% · operations 18%",
    },
    diagnosticDomains: {
      ingestion: { label: "Ingest & process data", short: "P1", weight: "practice" },
      stores: { label: "Store, prepare & use data", short: "P2", weight: "practice" },
      operations: { label: "Maintain & automate workloads", short: "P3", weight: "practice" },
      security: { label: "Secure data processing", short: "P4", weight: "practice" },
    },
    diagnosticNote: "Practice dimensions aligned to the current Professional Data Engineer abilities; they are not presented as official exam weights.",
    safety: {
      locationLabel: "Default region",
      locationPlaceholder: "us-central1",
      accountLabel: "Project boundary",
      accountOptions: ["Personal sandbox project", "Free-trial project", "Organization sandbox"],
      expiryLabel: "Credit / budget review",
      checks: [["rootMfa", "Google account MFA enabled"], ["nonRoot", "Least-privilege admin and service account tested"], ["budget", "Project budget alert exists"], ["noOrg", "Project ownership and organization are understood"]],
    },
    services: {
      lake: "Cloud Storage",
      warehouse: "BigQuery",
      batch: "Dataflow / Dataproc",
      streaming: "Pub/Sub",
      semantic: "Dataform",
      orchestration: "Composer / Workflows",
      governance: "Dataplex / BigLake",
      secrets: "Secret Manager",
      observability: "Cloud Logging / Monitoring",
    },
  },
  aws: {
    key: "aws",
    label: "AWS",
    short: "AWS",
    credential: "AWS Certified Data Engineer — Associate (DEA-C01)",
    officialUrl: "https://aws.amazon.com/certification/certified-data-engineer-associate/",
    preparationUrl: "https://aws.amazon.com/certification/certification-prep/",
    exam: {
      version: "AWS Certified Data Engineer — Associate · DEA-C01",
      duration: "130 minutes",
      questionCount: "65 questions · 50 scored",
      responseTypes: "Multiple choice and multiple response",
      blueprintSummary: "Ingestion 34% · stores 26% · operations 22% · security 18%",
    },
    diagnosticDomains: DOMAIN_META,
    diagnosticNote: "Domains and weights follow the current AWS DEA-C01 exam guide.",
    safety: {
      locationLabel: "Default Region",
      locationPlaceholder: "us-east-1",
      accountLabel: "Account plan",
      accountOptions: ["Free Tier", "Paid / budgeted", "Sandbox / organization"],
      expiryLabel: "Credit expiry",
      checks: [["rootMfa", "Root MFA enabled"], ["nonRoot", "Non-root admin works"], ["budget", "Budget alert exists"], ["noOrg", "No unexpected organization"]],
    },
    services: {
      lake: "Amazon S3",
      warehouse: "Athena / Redshift",
      batch: "Glue / EMR",
      streaming: "Kinesis",
      semantic: "dbt + Redshift",
      orchestration: "MWAA / Step Functions",
      governance: "Glue Catalog / Lake Formation",
      secrets: "Secrets Manager",
      observability: "CloudWatch / CloudTrail",
    },
  },
  azure: {
    key: "azure",
    label: "Microsoft Azure / Fabric",
    short: "AZ",
    credential: "Microsoft Certified: Fabric Data Engineer Associate (DP-700)",
    officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/",
    preparationUrl: "https://learn.microsoft.com/en-us/training/courses/dp-700t00",
    exam: {
      version: "Fabric Data Engineer Associate · DP-700 · July 2026 skills",
      duration: "100 minutes",
      questionCount: "Question count varies · typically 40–60",
      responseTypes: "Role-based question types and possible interactive components",
      blueprintSummary: "Manage 30–35% · ingest/transform 30–35% · monitor/optimize 30–35%",
    },
    diagnosticDomains: {
      ingestion: { label: "Ingest & transform data", short: "P1", weight: "30–35%" },
      stores: { label: "Implement & manage analytics", short: "P2", weight: "30–35%" },
      operations: { label: "Monitor & optimize", short: "P3", weight: "30–35%" },
      security: { label: "Security & governance decisions", short: "P4", weight: "embedded" },
    },
    diagnosticNote: "The first three dimensions follow the DP-700 study guide; security and governance are tested across those dimensions.",
    safety: {
      locationLabel: "Default region",
      locationPlaceholder: "East US",
      accountLabel: "Subscription boundary",
      accountOptions: ["Free account", "Pay-as-you-go / budgeted", "Organization sandbox"],
      expiryLabel: "Credit / budget review",
      checks: [["rootMfa", "Microsoft Entra MFA enabled"], ["nonRoot", "Least-privilege RBAC identity tested"], ["budget", "Subscription budget alert exists"], ["noOrg", "Tenant and subscription ownership are understood"]],
    },
    services: {
      lake: "ADLS Gen2 / OneLake",
      warehouse: "Fabric Lakehouse / Warehouse",
      batch: "Data Factory / Fabric Spark",
      streaming: "Event Hubs / Real-Time Intelligence",
      semantic: "Fabric Warehouse + semantic models",
      orchestration: "Data Factory / Fabric pipelines",
      governance: "Microsoft Purview / Fabric governance",
      secrets: "Azure Key Vault",
      observability: "Azure Monitor / Log Analytics",
    },
  },
  databricks: {
    key: "databricks",
    label: "Databricks",
    short: "DBX",
    credential: "Databricks Certified Data Engineer Associate",
    officialUrl: "https://www.databricks.com/learn/certification/data-engineer-associate",
    preparationUrl: "https://customer-academy.databricks.com/learn/learning-plans/10/data-engineer-learning-plan",
    exam: {
      version: "Data Engineer Associate · live guide November 2025",
      duration: "90 minutes",
      questionCount: "45 scored questions",
      responseTypes: "Multiple choice",
      blueprintSummary: "Platform · ingestion · processing · production · governance",
    },
    diagnosticDomains: {
      ingestion: { label: "Develop data processing code", short: "P1", weight: "practice" },
      stores: { label: "Model & optimize the lakehouse", short: "P2", weight: "practice" },
      operations: { label: "Operate production pipelines", short: "P3", weight: "practice" },
      security: { label: "Govern, secure & deploy", short: "P4", weight: "practice" },
    },
    diagnosticNote: "Practice dimensions derived from the current Databricks data-engineering exam objectives; consult the official guide for the exact version you plan to take.",
    safety: {
      locationLabel: "Workspace region",
      locationPlaceholder: "us-west-2",
      accountLabel: "Workspace boundary",
      accountOptions: ["Free Edition", "Personal cloud sandbox", "Organization sandbox"],
      expiryLabel: "Spend review date",
      checks: [["rootMfa", "SSO or account MFA enabled"], ["nonRoot", "Least-privilege group or service principal tested"], ["budget", "Compute policy and spend alert exist"], ["noOrg", "Cloud account and workspace ownership are understood"]],
    },
    services: {
      lake: "Delta Lake / cloud object storage",
      warehouse: "Databricks SQL Warehouse",
      batch: "Apache Spark",
      streaming: "Structured Streaming / Auto Loader",
      semantic: "Delta tables + dbt",
      orchestration: "Lakeflow Jobs / Workflows",
      governance: "Unity Catalog",
      secrets: "Databricks secrets / external locations",
      observability: "system tables / query history",
    },
  },
  snowflake: {
    key: "snowflake",
    label: "Snowflake",
    short: "SF",
    credential: "Snowflake data engineering track",
    officialUrl: "https://www.snowflake.com/en/certifications/",
    preparationUrl: "https://learn.snowflake.com/en/certifications/",
    exam: {
      version: "Credential to be selected",
      duration: "Confirm in the current exam guide",
      questionCount: "Confirm in the current exam guide",
      responseTypes: "Confirm in the current exam guide",
      blueprintSummary: "A Snowflake bridge is not live yet.",
    },
    diagnosticDomains: {
      ingestion: { label: "Load & transform data", short: "P1", weight: "practice" },
      stores: { label: "Model & serve data", short: "P2", weight: "practice" },
      operations: { label: "Operate & optimize workloads", short: "P3", weight: "practice" },
      security: { label: "Secure & govern the platform", short: "P4", weight: "practice" },
    },
    diagnosticNote: "Practice dimensions for route planning; use the official Snowflake guide for credential-specific objectives.",
    safety: {
      locationLabel: "Account region",
      locationPlaceholder: "AWS_US_WEST_2",
      accountLabel: "Account boundary",
      accountOptions: ["Trial account", "Personal account", "Organization sandbox"],
      expiryLabel: "Trial / spend review",
      checks: [["rootMfa", "Account MFA enabled"], ["nonRoot", "Least-privilege role hierarchy tested"], ["budget", "Resource monitor exists"], ["noOrg", "Account and organization ownership are understood"]],
    },
    services: {
      lake: "Stages / external storage",
      warehouse: "Virtual warehouses",
      batch: "Snowpark / tasks",
      streaming: "Snowpipe Streaming",
      semantic: "Dynamic tables / dbt",
      orchestration: "Tasks / streams",
      governance: "Horizon / tags / policies",
      secrets: "Secrets integrations",
      observability: "Account Usage / event tables",
    },
  },
};

const BRIDGE_WEEK_TEMPLATES = [
  {
    title: "Orientation + baseline",
    domain: "transfer / guardrails",
    summary: "Name the source assumptions, target credential, account boundaries, and the first measurable gap.",
    tags: ["Blueprint", "Access", "Baseline"],
    deliverable: "Route brief + baseline result",
  },
  {
    title: "Landing zone",
    domain: "foundations",
    summary: "Create the target storage boundary, encryption posture, naming convention, and lifecycle rule.",
    tags: ["Storage", "IAM", "Encryption"],
    deliverable: "Private landing zone + teardown note",
  },
  {
    title: "Ingest + transform",
    domain: "ingestion / transformation",
    summary: "Move batch data into the target platform and explain how parsing, schema handling, and retries work.",
    tags: ["Batch", "Schemas", "Retries"],
    deliverable: "Repeatable ingestion run",
  },
  {
    title: "Analytical stores",
    domain: "store management",
    summary: "Choose the target lake, warehouse, or lakehouse boundary from workload shape—not product familiarity.",
    tags: ["Lakehouse", "SQL", "Modeling"],
    deliverable: "Store decision matrix + model",
  },
  {
    title: "Model + test",
    domain: "analytics engineering",
    summary: "Carry Dataform or dbt habits into the target: modular models, assertions, documentation, and lineage.",
    tags: ["SQL", "Tests", "Lineage"],
    deliverable: "Curated model + test evidence",
  },
  {
    title: "Streaming path",
    domain: "ingestion / velocity",
    summary: "Design partitioning, ordering, buffering, checkpointing, retention, replay, and idempotent processing.",
    tags: ["Events", "Replay", "Idempotency"],
    deliverable: "Stream design + replay proof",
  },
  {
    title: "Orchestration",
    domain: "operations",
    summary: "Turn the pipeline into a dependable workflow with dependencies, retries, alerts, backfills, and failure paths.",
    tags: ["DAGs", "Retries", "Backfills"],
    deliverable: "Workflow run + failure-path evidence",
  },
  {
    title: "Governance + identity",
    domain: "security / governance",
    summary: "Trace identities, roles, catalogs, row or column controls, secrets, and privacy through the whole route.",
    tags: ["Catalog", "Policies", "Secrets"],
    deliverable: "Access matrix + policy rationale",
  },
  {
    title: "Observe + control cost",
    domain: "operations / cost",
    summary: "Make freshness, quality, logs, audit trails, performance, and spend visible before the pipeline is trusted.",
    tags: ["Quality", "Telemetry", "Cost"],
    deliverable: "Runbook + quality/cost worksheet",
  },
  {
    title: "Automate the platform",
    domain: "automation",
    summary: "Use source control, CLI or SDKs, infrastructure as code, and validation-first delivery to remove manual drift.",
    tags: ["Git", "IaC", "CI/CD"],
    deliverable: "Repeatable deployment artifact",
  },
  {
    title: "Capstone + remediation",
    domain: "integration",
    summary: "Connect ingestion, modeling, orchestration, governance, quality, and recovery into one target-platform story.",
    tags: ["Capstone", "Recovery", "Evidence"],
    deliverable: "End-to-end architecture review",
  },
  {
    title: "Blueprint remediation",
    domain: "exam readiness",
    summary: "Turn missed questions and weak decisions into targeted practice, refreshed notes, and another evidence pass.",
    tags: ["Error log", "Review", "Practice"],
    deliverable: "Closed error log + retest",
  },
  {
    title: "Timed readiness",
    domain: "exam readiness",
    summary: "Use the four simulations, timed sets, and a final confidence review to make a schedule-or-delay decision.",
    tags: ["Timed sets", "Confidence", "Schedule"],
    deliverable: "Readiness gate + exam decision",
  },
] as const;

const BRIDGE_WEEK_SERVICE_KEYS: Array<keyof PlatformProfile["services"]> = [
  "governance",
  "lake",
  "batch",
  "warehouse",
  "semantic",
  "streaming",
  "orchestration",
  "governance",
  "observability",
  "orchestration",
  "warehouse",
  "governance",
  "observability",
];

export function getBridgeWeekServiceKey(weekNumber: number): keyof PlatformProfile["services"] {
  return BRIDGE_WEEK_SERVICE_KEYS[weekNumber] || "warehouse";
}

function buildBridgeWeeks(pathKey: string, source: PlatformProfile, target: PlatformProfile): Week[] {
  return BRIDGE_WEEK_TEMPLATES.map((week, number) => {
    const serviceKey = getBridgeWeekServiceKey(number);
    const sourceService = source.services[serviceKey];
    const targetService = target.services[serviceKey];
    return {
      number,
      title: week.title,
      domain: week.domain,
      summary: `${week.summary} Translate the ${sourceService} mental model into ${targetService}.`,
      tags: [...week.tags, targetService],
      deliverable: week.deliverable,
      guide: `/data-engineering/${pathKey}/guides/${number}`,
    };
  });
}

function buildTransfers(source: PlatformProfile, target: PlatformProfile): Transfer[] {
  return [
    { source: source.services.lake, target: target.services.lake, focus: "landing, layout + lifecycle" },
    { source: source.services.warehouse, target: target.services.warehouse, focus: "analytical store choice" },
    { source: source.services.batch, target: target.services.batch, focus: "batch compute + Spark" },
    { source: source.services.streaming, target: target.services.streaming, focus: "partitions, replay + state" },
    { source: source.services.semantic, target: target.services.semantic, focus: "models, tests + lineage" },
    { source: source.services.orchestration, target: target.services.orchestration, focus: "workflow boundary" },
    { source: source.services.governance, target: target.services.governance, focus: "catalog, policy + access" },
    { source: source.services.secrets, target: target.services.secrets, focus: "runtime secrets" },
    { source: source.services.observability, target: target.services.observability, focus: "telemetry, audit + cost" },
  ];
}

const AWS_RATIONALES = [
  "Glue ETL is the managed Spark boundary for a serverless transformation job.",
  "A Kinesis partition key keeps related records ordered while allowing independent consumers.",
  "Firehose provides managed buffering and delivery without requiring a custom consumer.",
  "The .sync integration keeps the workflow at the Glue job boundary until completion.",
  "Partition pruning and column projection reduce the data Athena must scan.",
  "Modeled Redshift tables fit repeated joins and aggregations better than an always-external scan.",
  "DynamoDB is designed for high-volume key-value access with predictable low latency.",
  "Relational services are transaction-oriented; Redshift is designed for analytical workloads.",
  "Step Functions can retry transient failures, then catch and route the failure for investigation.",
  "CloudTrail is the primary record of who called an AWS API operation and when.",
  "AWS Budgets supports actual and forecasted spend thresholds.",
  "Stable event IDs make retries safe when a stream delivers a record more than once.",
  "A least-privilege IAM role avoids embedding long-lived credentials in a COPY command.",
  "Both permission planes must agree: the Redshift role needs scoped S3/KMS permissions, and the KMS key policy must permit that role.",
  "Lake Formation is the AWS-native control plane for fine-grained lake permissions.",
  "Secrets Manager keeps a rotatable password out of source code and data storage.",
];

const TARGET_QUESTION_BANKS: Record<PlatformKey, SimulationQuestion[]> = {
  aws: QUESTIONS.map((question, index) => ({
    ...question,
    id: `aws-target-${question.number}`,
    rationale: AWS_RATIONALES[index],
  })),
  gcp: [
    { id: "gcp-target-1", number: 1, domain: "ingestion", prompt: "A daily export needs a serverless Apache Beam transformation with a repeatable template and autoscaling. Best fit?", options: { A: "A BigQuery scheduled query", B: "A Dataflow Flex Template", C: "A Dataproc Serverless Spark batch", D: "A Cloud Run job" }, answer: "B", rationale: "Dataflow is the managed Apache Beam execution service; a Flex Template packages the repeatable pipeline for controlled launches." },
    { id: "gcp-target-2", number: 2, domain: "ingestion", prompt: "Events need independent subscribers and replay from a retained stream. Which design is most appropriate?", options: { A: "Pub/Sub topic with subscriptions and retention", B: "Cloud Storage with one object", C: "BigQuery temporary table", D: "Secret Manager" }, answer: "A", rationale: "Pub/Sub separates publishers from subscribers and can retain messages for replay." },
    { id: "gcp-target-3", number: 3, domain: "ingestion", prompt: "A pipeline must preserve ordering for each customer while scaling across customers. What should the publisher use?", options: { A: "A customer ordering key", B: "A random topic per record", C: "A single Cloud SQL row", D: "A BigQuery view" }, answer: "A", rationale: "Ordering keys scope ordering to related messages without serializing unrelated customers." },
    { id: "gcp-target-4", number: 4, domain: "ingestion", prompt: "A team wants a durable raw landing zone that can later be queried without loading every file into native BigQuery storage. Which design is the best starting point?", options: { A: "Cloud Storage with a documented prefix, lifecycle policy, and a governed external-table path", B: "Load every arrival directly into a single unpartitioned BigQuery table", C: "Use BigQuery Data Transfer Service to rewrite the source system", D: "Use Storage Transfer Service as the query engine" }, answer: "A", rationale: "A governed Cloud Storage landing zone preserves replayable raw evidence and can support external access through BigLake or BigQuery external tables." },
    { id: "gcp-target-5", number: 5, domain: "stores", prompt: "A BigQuery table is queried mostly by event_date and customer_id. Which physical design is the best starting point?", options: { A: "Partition by event_date and cluster by customer_id", B: "Cluster by event_date and shard one table per customer", C: "Partition by ingestion time and ignore the business event date", D: "Create one authorized view per event_date" }, answer: "A", rationale: "Partitioning narrows scanned data by date; clustering improves locality for common customer filters." },
    { id: "gcp-target-6", number: 6, domain: "stores", prompt: "A data product spans Cloud Storage and BigQuery and needs discovery, policy enforcement, and governed cross-engine access. Which platform boundary should be evaluated first?", options: { A: "Dataplex with BigLake-governed tables", B: "Dataset-level IAM roles without a catalog or lake boundary", C: "Policy tags applied only after every dataset is copied", D: "Separate BigQuery reservations for each consumer" }, answer: "A", rationale: "Dataplex and BigLake address discovery and governed access across lake and warehouse assets; the other controls solve narrower concerns." },
    { id: "gcp-target-7", number: 7, domain: "stores", prompt: "An application needs transactional updates by account_id, not analytical scans. Which store is the better fit?", options: { A: "Cloud SQL", B: "BigQuery", C: "Cloud Storage", D: "Data Catalog" }, answer: "A", rationale: "Cloud SQL is the transactional relational boundary; BigQuery is optimized for analytics." },
    { id: "gcp-target-8", number: 8, domain: "stores", prompt: "A producer adds a nullable field to an event schema. What should a robust pipeline do before promoting the change?", options: { A: "Version the schema and validate backward compatibility against downstream contracts", B: "Enable BigQuery schema autodetection in production and skip contract tests", C: "Create a new dataset for every schema revision", D: "Convert the complete payload to an opaque JSON string" }, answer: "A", rationale: "Schema compatibility checks make evolution deliberate and protect downstream consumers without discarding type information." },
    { id: "gcp-target-9", number: 9, domain: "operations", prompt: "A Composer task fails intermittently because a dependency returns temporary 429 responses. What is the most defensible first control?", options: { A: "Configure bounded task retries with exponential backoff and a terminal alert", B: "Increase the DAG schedule interval without retrying the failed task", C: "Move the task to a separate Composer environment for every attempt", D: "Mark the task successful when the dependency returns 429" }, answer: "A", rationale: "Bounded retries handle transient throttling while terminal alerting preserves operational visibility." },
    { id: "gcp-target-10", number: 10, domain: "operations", prompt: "You need to investigate who changed a BigQuery dataset IAM policy. Where should you start?", options: { A: "Cloud Audit Logs", B: "BigQuery result cache", C: "Cloud Storage lifecycle", D: "Dataform compile output" }, answer: "A", rationale: "Cloud Audit Logs provide the actor, operation, resource, and timestamp for control-plane activity." },
    { id: "gcp-target-11", number: 11, domain: "operations", prompt: "A batch pipeline reports success while delivering yesterday's partition again. Which control best detects the failure?", options: { A: "Freshness and expected-volume assertions on the published partition", B: "A Cloud Monitoring uptime check against the orchestration endpoint", C: "A BigQuery reservation with more slots", D: "A longer Cloud Storage retention policy" }, answer: "A", rationale: "Freshness and volume checks detect silent data-product failure that infrastructure success does not reveal." },
    { id: "gcp-target-12", number: 12, domain: "operations", prompt: "A Dataform model must fail the workflow when a business key is null or duplicated. Which feature should the engineer implement?", options: { A: "Dataform assertions", B: "An incremental table with uniqueKey only", C: "A declaration for the upstream source", D: "A post-operation that writes the violation count to another table" }, answer: "A", rationale: "Assertions make data-quality expectations executable and fail the workflow when the condition is violated." },
    { id: "gcp-target-13", number: 13, domain: "security", prompt: "A Dataflow job needs access to exactly one bucket and one topic. Preferred identity?", options: { A: "A dedicated service account with least-privilege roles", B: "A user Owner role", C: "An embedded API key", D: "Public access" }, answer: "A", rationale: "Dedicated service accounts make workload identity explicit and permissions reviewable." },
    { id: "gcp-target-14", number: 14, domain: "security", prompt: "Sensitive BigQuery data requires a customer-managed encryption key. Which concern must be resolved before attaching the key?", options: { A: "Grant the BigQuery service agent access and assign ownership for key rotation and recovery", B: "Grant dataset viewers Cloud KMS Admin so queries can decrypt data", C: "Place the key in a different location from the BigQuery dataset", D: "Use a BigQuery reservation as the key-access boundary" }, answer: "A", rationale: "CMEK is an operational control: service-agent permissions, compatible location, lifecycle, and recovery ownership must be deliberate." },
    { id: "gcp-target-15", number: 15, domain: "security", prompt: "A pipeline needs a rotatable database credential at runtime. Which service should hold it?", options: { A: "Secret Manager", B: "A Git repository", C: "A BigQuery comment", D: "Cloud Logging text" }, answer: "A", rationale: "Secret Manager provides controlled access and rotation without putting credentials in code." },
    { id: "gcp-target-16", number: 16, domain: "security", prompt: "A regulated BigQuery platform needs durable evidence of administrative changes and sensitive-data reads. Which TWO controls should the engineer implement?", options: { A: "Enable and retain the relevant Admin Activity and Data Access audit logs", B: "Route matching audit logs to a protected central sink with an explicit retention policy", C: "Rely on BigQuery query-result cache entries as the audit record", D: "Use Cloud DNS query logs as the primary data-access record", E: "Add descriptive labels to datasets without retaining logs" }, answer: "A,B", rationale: "Audit Logs record the activity; a protected centralized sink and retention policy preserve evidence for investigation and compliance." },
  ],
  azure: [
    { id: "azure-target-1", number: 1, domain: "ingestion", prompt: "A recurring batch copy from a REST API to OneLake needs scheduling, retries, and reusable parameters. Best fit?", options: { A: "A Fabric Data Factory pipeline with a Copy activity", B: "A Dataflow Gen2 refreshed manually by an analyst", C: "A Spark notebook invoked separately for every source page", D: "An Eventstream with no batch connector" }, answer: "A", rationale: "Fabric pipelines provide scheduled orchestration, parameters, retry behavior, and Copy activities for recurring batch movement." },
    { id: "azure-target-2", number: 2, domain: "ingestion", prompt: "Events need scalable partitions and independent consumers before landing in an analytics solution. Which service?", options: { A: "Event Hubs", B: "Azure Files", C: "Purview glossary only", D: "Azure SQL trigger only" }, answer: "A", rationale: "Event Hubs is the event-ingestion boundary for partitioned, high-throughput streams." },
    { id: "azure-target-3", number: 3, domain: "ingestion", prompt: "A team wants incremental file ingestion into a lakehouse without repeatedly processing historical files. Best pattern?", options: { A: "Checkpointed incremental ingestion using file metadata or a watermark", B: "A full overwrite of every source partition on each run", C: "A OneLake shortcut with no transformation state", D: "Mirroring the entire source database for a file-only source" }, answer: "A", rationale: "Durable incremental state avoids repeated work and makes late-arriving files explicit." },
    { id: "azure-target-4", number: 4, domain: "ingestion", prompt: "A solution needs to ingest events, apply near-real-time transformations, and serve operational KQL dashboards in Fabric. Which workload is the best fit?", options: { A: "Real-Time Intelligence with Eventstreams and an Eventhouse", B: "A batch-only Warehouse pipeline", C: "A Dataflow Gen2 scheduled once per day", D: "A semantic model using Import mode as the ingestion layer" }, answer: "A", rationale: "Real-Time Intelligence combines event ingestion, KQL processing, Eventhouse storage, and near-real-time analysis." },
    { id: "azure-target-5", number: 5, domain: "stores", prompt: "A workload needs open Delta storage for Spark engineering and a governed relational serving layer with T-SQL semantics. Which Fabric design fits?", options: { A: "A Lakehouse for engineering plus a Warehouse serving boundary", B: "A Warehouse for both raw file ingestion and Spark notebooks", C: "An Eventhouse for dimensional T-SQL serving", D: "A semantic model as the system of record" }, answer: "A", rationale: "The Lakehouse supports open Delta and Spark workflows, while the Warehouse provides a relational SQL serving boundary over OneLake." },
    { id: "azure-target-6", number: 6, domain: "stores", prompt: "A team must query an existing ADLS dataset from several Fabric workspaces without copying the files into each workspace. What should it evaluate?", options: { A: "OneLake shortcuts with governed workspace and data permissions", B: "Mirroring the ADLS account into every workspace", C: "A pipeline Copy activity scheduled before every query", D: "Direct Lake semantic models without a OneLake-access path" }, answer: "A", rationale: "Shortcuts expose existing storage through OneLake without duplicating the underlying data; permissions still need deliberate governance." },
    { id: "azure-target-7", number: 7, domain: "stores", prompt: "A serving workload needs transactional relational behavior rather than large analytical scans. Better fit?", options: { A: "Azure SQL Database", B: "OneLake files only", C: "Event Hubs", D: "Purview collections" }, answer: "A", rationale: "Azure SQL Database is the transactional relational boundary; lakehouse and warehouse patterns serve analytics." },
    { id: "azure-target-8", number: 8, domain: "stores", prompt: "An upstream producer adds a nullable field used by downstream Fabric models. What should happen before promotion?", options: { A: "Validate schema compatibility, update the contract, and test downstream models", B: "Enable automatic schema merge in every workload without impact analysis", C: "Create a new workspace and duplicate all historical data", D: "Convert the complete record to a string in the bronze layer" }, answer: "A", rationale: "Contract and compatibility checks protect downstream lakehouse, warehouse, and semantic consumers while preserving useful types." },
    { id: "azure-target-9", number: 9, domain: "operations", prompt: "A Fabric pipeline activity intermittently fails because an API throttles requests. Which control is most appropriate?", options: { A: "A bounded retry policy with backoff, alerting, and a terminal failure path", B: "A ForEach activity with unlimited parallelism", C: "A schedule that reruns the complete pipeline every minute", D: "A dependency condition that treats Failed as success" }, answer: "A", rationale: "Retries should be bounded and observable, with a deliberate route for non-transient failure." },
    { id: "azure-target-10", number: 10, domain: "operations", prompt: "A Fabric item refresh failed and the engineer needs duration, activity state, and error details. Where should the investigation start?", options: { A: "The Fabric monitoring hub and the item's run history", B: "The workspace's sensitivity-label settings", C: "The OneLake shortcut cache configuration", D: "The semantic model's report theme" }, answer: "A", rationale: "The monitoring hub and run history connect the failed operation to timing, activity-level state, and diagnostics." },
    { id: "azure-target-11", number: 11, domain: "operations", prompt: "A pipeline run succeeds but publishes an incomplete daily partition. Which quality gate best detects the issue?", options: { A: "Freshness, expected-volume, and business-key checks before publication", B: "A capacity autoscale rule based only on CPU", C: "A longer pipeline activity timeout", D: "A deployment rule that changes connection strings" }, answer: "A", rationale: "Data-quality gates catch silent partial loads that infrastructure success and capacity signals cannot detect." },
    { id: "azure-target-12", number: 12, domain: "operations", prompt: "A Warehouse model must not publish duplicate business keys. What belongs in the delivery process?", options: { A: "Automated uniqueness tests that block promotion", B: "A clustered columnstore index without a quality assertion", C: "A semantic-model refresh after every failed load", D: "An Eventstream partition-count increase" }, answer: "A", rationale: "Automated tests keep correctness checks close to the model and make the deployment decision enforceable." },
    { id: "azure-target-13", number: 13, domain: "security", prompt: "A production pipeline must read one storage account and write one Warehouse without using a person's credentials. Preferred identity?", options: { A: "A managed identity with scoped workspace, item, and storage permissions", B: "A service principal assigned Fabric Administrator", C: "A shared service account stored in pipeline parameters", D: "The pipeline author's delegated user token" }, answer: "A", rationale: "Managed identities reduce secret handling and make the workload permission boundary explicit; permissions should remain scoped." },
    { id: "azure-target-14", number: 14, domain: "security", prompt: "A pipeline's source credential must rotate without changing notebook or pipeline code. Which service should own the secret lifecycle?", options: { A: "Azure Key Vault referenced by the connection", B: "A Fabric environment variable containing the secret value", C: "A parameter stored in the deployment pipeline", D: "A credential embedded in a OneLake shortcut URL" }, answer: "A", rationale: "Key Vault is designed for controlled secret storage and rotation while clients reference the secret rather than embed it." },
    { id: "azure-target-15", number: 15, domain: "security", prompt: "A Fabric program must expose searchable ownership and lineage while visibly classifying sensitive items for consumers. Which TWO capabilities should be configured?", options: { A: "Microsoft Purview catalog and lineage", B: "Sensitivity labels on Fabric items", C: "Event Hubs capture without catalog registration", D: "Workspace Admin for every consumer", E: "OneLake public access" }, answer: "A,B", rationale: "Purview supplies inventory and lineage, while sensitivity labels communicate and govern the classification of Fabric items." },
    { id: "azure-target-16", number: 16, domain: "security", prompt: "A user can administer a Fabric workspace but should read only one curated table. Which access model best applies?", options: { A: "Review workspace roles and item/data permissions separately under least privilege", B: "Use the workspace role as the only data-authorization boundary", C: "Grant Contributor and rely on report-level filters", D: "Grant access through a shared service principal used by the team" }, answer: "A", rationale: "Workspace administration and data authorization are separate permission planes; reviewing both limits blast radius and improves auditability." },
  ],
  databricks: [
    { id: "databricks-target-1", number: 1, domain: "ingestion", prompt: "Cloud object storage receives a high volume of new files and a pipeline must discover them incrementally with durable progress. Best fit?", options: { A: "Auto Loader with a schema and checkpoint location", B: "COPY INTO scheduled without tracking previously loaded files", C: "A batch DataFrame that lists and rereads the complete prefix", D: "Lakehouse Federation over the object-storage path" }, answer: "A", rationale: "Auto Loader incrementally discovers files at scale and uses durable state for progress and schema handling." },
    { id: "databricks-target-2", number: 2, domain: "ingestion", prompt: "A stream must resume after a cluster restart without losing its progress. What is essential?", options: { A: "A durable checkpoint location", B: "A random temporary directory", C: "Disabling retries", D: "A new workspace per batch" }, answer: "A", rationale: "Structured Streaming checkpoints persist progress and state across restarts." },
    { id: "databricks-target-3", number: 3, domain: "ingestion", prompt: "A bronze pipeline must preserve raw records while allowing downstream cleansing. Best design?", options: { A: "Append raw data to a bronze Delta table", B: "Overwrite the source after parsing", C: "Store secrets in the table", D: "Skip the raw layer" }, answer: "A", rationale: "A raw bronze layer preserves replayable evidence and separates ingestion from refinement." },
    { id: "databricks-target-4", number: 4, domain: "ingestion", prompt: "A stream may redeliver an event after recovery. What should the curated target pipeline implement?", options: { A: "A stable event key with deduplication or an idempotent MERGE", B: "A longer trigger interval with append-only writes", C: "A new checkpoint directory for every restart", D: "A complete overwrite of the target after each micro-batch" }, answer: "A", rationale: "Stable keys and idempotent merge semantics make retry and replay safe for event data." },
    { id: "databricks-target-5", number: 5, domain: "stores", prompt: "A Delta table has many small files after frequent micro-batches and scan performance has degraded. Which action should be evaluated first?", options: { A: "OPTIMIZE or predictive optimization appropriate to the table", B: "VACUUM with zero-hour retention", C: "ZORDER every column regardless of access patterns", D: "Convert the table to an external Parquet table" }, answer: "A", rationale: "Compaction reduces small-file overhead; the table's management model determines whether OPTIMIZE or predictive optimization is appropriate." },
    { id: "databricks-target-6", number: 6, domain: "stores", prompt: "A SQL workload needs governed, isolated compute with predictable concurrency. Best fit?", options: { A: "A Databricks SQL Warehouse", B: "A developer laptop", C: "A secrets scope", D: "A raw object prefix" }, answer: "A", rationale: "SQL Warehouses provide a purpose-built serving boundary for Databricks SQL workloads." },
    { id: "databricks-target-7", number: 7, domain: "stores", prompt: "A data product needs centralized ownership, external locations, lineage, and fine-grained grants across workspaces. Which control plane?", options: { A: "Unity Catalog", B: "Workspace-local table ACLs and mounts", C: "A cluster policy with unrestricted data access", D: "Delta transaction-log history alone" }, answer: "A", rationale: "Unity Catalog centralizes metadata, access policies, lineage, and ownership across workspaces." },
    { id: "databricks-target-8", number: 8, domain: "stores", prompt: "A source adds a nullable column to a Delta feed. What should the engineer decide explicitly before enabling schema evolution?", options: { A: "The compatibility policy and impact on downstream readers", B: "Whether to disable Delta table history", C: "Whether to grant every consumer MODIFY", D: "Whether to rewrite all previous versions of the table" }, answer: "A", rationale: "Schema evolution is useful only when compatibility, ownership, and downstream behavior are deliberate." },
    { id: "databricks-target-9", number: 9, domain: "operations", prompt: "A task in a multi-task Lakeflow Job fails because an upstream service is temporarily unavailable. What is the strongest workflow behavior?", options: { A: "Bounded task retries, explicit dependencies, and a terminal notification", B: "Repair-run every successful upstream task along with the failed task", C: "Continue all dependent tasks regardless of the failure", D: "Create a new job definition for each retry" }, answer: "A", rationale: "Jobs should encode dependencies and bounded recovery; repair runs can then target failed and dependent work without rerunning everything." },
    { id: "databricks-target-10", number: 10, domain: "operations", prompt: "An engineer must compare query duration, compute use, and failure patterns across SQL users. Where should the investigation start?", options: { A: "Query history and the relevant system tables", B: "Only the SQL Warehouse event log", C: "Unity Catalog grants without workload telemetry", D: "Notebook command history from one user" }, answer: "A", rationale: "Query history and system tables provide query-level and account-level evidence for workload, reliability, and cost analysis." },
    { id: "databricks-target-11", number: 11, domain: "operations", prompt: "A Lakeflow Spark Declarative Pipeline must fail an update when a critical field is null. Which pattern is appropriate?", options: { A: "An expectation with an explicit fail-update policy", B: "A warning-only expectation and silent row deletion", C: "A table constraint added after the pipeline publishes", D: "A cluster policy that restarts the compute" }, answer: "A", rationale: "Expectations make quality behavior explicit; fail-update is appropriate when the contract requires the update to stop." },
    { id: "databricks-target-12", number: 12, domain: "operations", prompt: "A corrected source record must update a curated Delta table without duplicating history. Which operation?", options: { A: "MERGE using a stable business key", B: "Blind append", C: "Drop the table", D: "Overwrite all partitions every time" }, answer: "A", rationale: "MERGE applies inserts and updates against a stable key while preserving unrelated records." },
    { id: "databricks-target-13", number: 13, domain: "security", prompt: "A production job needs access to one governed schema and must not run as a human user. Preferred identity?", options: { A: "A service principal with USE and object privileges scoped to the required schema", B: "A shared personal access token owned by the platform lead", C: "A service principal with account-admin rights", D: "A workspace group used as the job's run-as identity" }, answer: "A", rationale: "A service principal creates an auditable non-human identity; Unity Catalog grants should remain limited to the required objects." },
    { id: "databricks-target-14", number: 14, domain: "security", prompt: "A storage credential already exists for a non-human cloud identity. Which Unity Catalog object should bind that credential to the restricted object-storage prefix used by external tables?", options: { A: "A catalog", B: "An external location", C: "A DBFS mount created with a developer key", D: "A cluster policy" }, answer: "B", rationale: "An external location combines an approved cloud path with a storage credential so Unity Catalog can govern access to that boundary." },
    { id: "databricks-target-15", number: 15, domain: "security", prompt: "A notebook needs a third-party API secret at runtime. Which approach keeps the value out of source and table data?", options: { A: "Read it from a managed secret scope with scoped ACLs", B: "Pass it as a plain-text notebook widget", C: "Store it in a restricted Delta table", D: "Put it in the cluster Spark configuration as literal text" }, answer: "A", rationale: "Secret scopes keep credentials outside notebooks and data tables and make access reviewable." },
    { id: "databricks-target-16", number: 16, domain: "security", prompt: "A governance review needs evidence of grants, object access, and administrative changes across workspaces. Which source is most relevant?", options: { A: "Audit logs delivered to system tables or the configured cloud destination", B: "Delta table history for business tables only", C: "SQL query history without control-plane events", D: "Cluster event logs from production compute only" }, answer: "A", rationale: "Audit logs provide the control-plane and access evidence required for review; workload histories cover only part of the activity." },
  ],
  snowflake: [],
};

const SIMULATION_META = [
  { title: "Translate the primitives", focus: "Map familiar patterns to target services and storage boundaries." },
  { title: "Build + operate", focus: "Choose ingestion, modeling, orchestration, and recovery controls." },
  { title: "Secure + govern", focus: "Test identity, encryption, catalog, quality, and audit decisions." },
  { title: "Timed readiness", focus: "Mix the target blueprint into a short, time-boxed readiness set." },
] as const;

function buildSimulations(target: PlatformProfile): ExamSimulation[] {
  const bank = TARGET_QUESTION_BANKS[target.key].length ? TARGET_QUESTION_BANKS[target.key] : TARGET_QUESTION_BANKS.aws;
  return SIMULATION_META.map((simulation, simulationIndex) => ({
    // Simulations belong to the destination credential. A learner coming from
    // GCP, Azure, or Databricks therefore sees the exact same AWS exam set.
    key: `data-engineer-${target.key}-simulation-${simulationIndex + 1}`,
    number: simulationIndex + 1,
    title: simulation.title,
    focus: `${simulation.focus} Aligned to ${target.credential}.`,
    durationMinutes: 12,
    questions: bank.slice(simulationIndex * 4, simulationIndex * 4 + 4).map((question, questionIndex) => ({
      ...question,
      id: `${target.key}-simulation-${simulationIndex + 1}-q${questionIndex + 1}`,
      number: questionIndex + 1,
    })),
  }));
}

const ACTIVE_BRIDGES: Array<[PlatformKey, PlatformKey]> = [
  ["gcp", "aws"],
  ["gcp", "azure"],
  ["gcp", "databricks"],
  ["azure", "aws"],
  ["azure", "gcp"],
  ["azure", "databricks"],
  ["databricks", "aws"],
  ["databricks", "gcp"],
  ["databricks", "azure"],
  ["aws", "gcp"],
  ["aws", "azure"],
  ["aws", "databricks"],
];

function bridgePathKey(source: PlatformKey, target: PlatformKey) {
  return `${source}-to-${target}-data-engineer`;
}

const PATH_BLUEPRINT_ENTRIES = ACTIVE_BRIDGES.map(([sourceKey, targetKey]) => {
  const source = PLATFORM_PROFILES[sourceKey];
  const target = PLATFORM_PROFILES[targetKey];
  const key = bridgePathKey(sourceKey, targetKey);
  return [key, {
    key,
    roleKey: "data-engineering",
    title: `${source.short} → ${target.short} Data Engineering`,
    summary: `Translate ${source.label} data engineering judgment into ${target.label}, including its service boundaries, operating model, and certification language.`,
    focus: target.credential,
    source,
    target,
    weeks: key === DEFAULT_PATH_KEY ? WEEKS : buildBridgeWeeks(key, source, target),
    transfers: buildTransfers(source, target),
    simulations: buildSimulations(target),
  } satisfies PathBlueprint] as const;
});

export const PATH_BLUEPRINTS = Object.fromEntries(PATH_BLUEPRINT_ENTRIES) as Record<string, PathBlueprint>;
export const ACTIVE_PATH_KEYS = ACTIVE_BRIDGES.map(([source, target]) => bridgePathKey(source, target));
export const ACTIVE_PATH_COUNT = ACTIVE_PATH_KEYS.length;

export function getPathBlueprint(pathKey: string = DEFAULT_PATH_KEY) {
  const canonicalKey = pathKey === "gcp-to-aws" ? DEFAULT_PATH_KEY : pathKey;
  return PATH_BLUEPRINTS[canonicalKey] || PATH_BLUEPRINTS[DEFAULT_PATH_KEY];
}

const PATH_PLATFORMS = Object.values(PLATFORM_PROFILES);

const ROLE_TRACKS = [
  {
    key: "data-engineering",
    number: "01",
    title: "Data engineering",
    description: "Move pipeline, warehouse, governance, and reliability judgment between platforms.",
  },
  {
    key: "machine-learning",
    number: "02",
    title: "Machine learning engineering",
    description: "Translate model delivery, feature systems, training, and serving patterns.",
  },
  {
    key: "cloud-architecture",
    number: "03",
    title: "Cloud architecture",
    description: "Carry systems thinking across networking, security, reliability, and cost boundaries.",
  },
] as const;

/**
 * The path library is intentionally data-driven. New role tracks and platform
 * bridges can be added here without changing the homepage layout.
 */
export const PATH_CATALOG: PathGroup[] = ROLE_TRACKS.map((track) => ({
  key: track.key,
  number: track.number,
  title: track.title,
  description: track.description,
  status: track.key === "data-engineering" ? "active" : "coming-soon",
  sources: PATH_PLATFORMS.map((source) => ({
    key: source.key,
    label: source.label,
    short: source.short,
    credential: track.key === "data-engineering" ? source.credential : "Source profile / coming soon",
    routes: PATH_PLATFORMS
      .filter((target) => target.key !== source.key)
      .map((target) => {
        const pathKey = bridgePathKey(source.key, target.key);
        const blueprint = track.key === "data-engineering" ? PATH_BLUEPRINTS[pathKey] : undefined;
        return {
          key: `${source.key}-to-${target.key}-${track.key}`,
          targetKey: target.key,
          targetLabel: target.label,
          targetMark: target.short,
          title: blueprint?.focus || `${target.label} transition blueprint`,
          description: blueprint?.summary || "The role, service map, and certification bridge are being prepared.",
          status: blueprint ? "available" : "coming-soon",
          ...(blueprint ? { pathKey } : {}),
        };
      }),
  })),
}));
