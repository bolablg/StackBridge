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

export const DEFAULT_PATH_KEY = "gcp-to-aws-data-engineer";

export type PlatformKey = "gcp" | "aws" | "azure" | "databricks" | "snowflake";

export type PlatformProfile = {
  key: PlatformKey;
  label: string;
  short: string;
  credential: string;
  officialUrl: string;
  preparationUrl: string;
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

function buildBridgeWeeks(pathKey: string, source: PlatformProfile, target: PlatformProfile): Week[] {
  return BRIDGE_WEEK_TEMPLATES.map((week, number) => ({
    number,
    title: week.title,
    domain: week.domain,
    summary: `${week.summary} ${source.short} → ${target.short} focus: ${target.services[number === 1 ? "lake" : number === 2 ? "batch" : number === 3 ? "warehouse" : number === 4 ? "semantic" : number === 5 ? "streaming" : number === 6 ? "orchestration" : number === 7 ? "governance" : number === 8 ? "observability" : number === 9 ? "orchestration" : "warehouse" ]}.`,
    tags: [...week.tags, target.short],
    deliverable: week.deliverable,
    guide: `/data-engineering/${pathKey}/library`,
  }));
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
  "S3 encryption and KMS authorization must agree: key policy, IAM permissions, and bucket settings.",
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
    { id: "gcp-target-1", number: 1, domain: "ingestion", prompt: "A daily export needs a serverless Apache Beam transformation with a repeatable template and autoscaling. Best fit?", options: { A: "BigQuery BI Engine", B: "Dataflow", C: "Cloud SQL", D: "Cloud DNS" }, answer: "B", rationale: "Dataflow is the managed Apache Beam execution service for batch and streaming pipelines." },
    { id: "gcp-target-2", number: 2, domain: "ingestion", prompt: "Events need independent subscribers and replay from a retained stream. Which design is most appropriate?", options: { A: "Pub/Sub topic with subscriptions and retention", B: "Cloud Storage with one object", C: "BigQuery temporary table", D: "Secret Manager" }, answer: "A", rationale: "Pub/Sub separates publishers from subscribers and can retain messages for replay." },
    { id: "gcp-target-3", number: 3, domain: "ingestion", prompt: "A pipeline must preserve ordering for each customer while scaling across customers. What should the publisher use?", options: { A: "A customer ordering key", B: "A random topic per record", C: "A single Cloud SQL row", D: "A BigQuery view" }, answer: "A", rationale: "Ordering keys scope ordering to related messages without serializing unrelated customers." },
    { id: "gcp-target-4", number: 4, domain: "ingestion", prompt: "A team wants object landing to be queryable later without copying every file immediately. Which first step?", options: { A: "Cloud Storage with a documented prefix and lifecycle", B: "Delete the raw objects", C: "Store CSV rows in Secret Manager", D: "Use Cloud DNS" }, answer: "A", rationale: "A governed Cloud Storage landing zone preserves raw evidence and makes lifecycle explicit." },
    { id: "gcp-target-5", number: 5, domain: "stores", prompt: "A BigQuery table is queried mostly by event_date and customer_id. Which physical design is the best starting point?", options: { A: "Partition by event_date and cluster by customer_id", B: "Convert every column to STRING", C: "Use a Cloud SQL trigger", D: "Disable table metadata" }, answer: "A", rationale: "Partitioning narrows scanned data by date; clustering improves locality for common filters." },
    { id: "gcp-target-6", number: 6, domain: "stores", prompt: "A data product needs governed access across Cloud Storage and BigQuery assets. Which boundary should be evaluated first?", options: { A: "Dataplex / BigLake governance", B: "Cloud DNS", C: "Cloud Functions only", D: "A public bucket" }, answer: "A", rationale: "Dataplex and BigLake address governed discovery and access across data domains." },
    { id: "gcp-target-7", number: 7, domain: "stores", prompt: "An application needs transactional updates by account_id, not analytical scans. Which store is the better fit?", options: { A: "Cloud SQL", B: "BigQuery", C: "Cloud Storage", D: "Data Catalog" }, answer: "A", rationale: "Cloud SQL is the transactional relational boundary; BigQuery is optimized for analytics." },
    { id: "gcp-target-8", number: 8, domain: "stores", prompt: "A producer adds a nullable field to an event schema. What should a robust pipeline do?", options: { A: "Version and validate compatibility before promotion", B: "Drop the entire dataset", C: "Hide the field in IAM", D: "Disable monitoring" }, answer: "A", rationale: "Schema compatibility checks make evolution deliberate and protect downstream consumers." },
    { id: "gcp-target-9", number: 9, domain: "operations", prompt: "A Composer task fails transiently. What is the most defensible first control?", options: { A: "Task retries with backoff and an alert", B: "Grant Owner to the task", C: "Delete the DAG", D: "Ignore the failure" }, answer: "A", rationale: "Retries handle transient faults while alerting preserves operational visibility." },
    { id: "gcp-target-10", number: 10, domain: "operations", prompt: "You need to investigate who changed a BigQuery dataset IAM policy. Where should you start?", options: { A: "Cloud Audit Logs", B: "BigQuery result cache", C: "Cloud Storage lifecycle", D: "Dataform compile output" }, answer: "A", rationale: "Cloud Audit Logs provide the actor, operation, resource, and timestamp for control-plane activity." },
    { id: "gcp-target-11", number: 11, domain: "operations", prompt: "A batch pipeline can finish successfully while delivering stale data. Which check addresses that risk?", options: { A: "Freshness and row-count assertions", B: "A larger VM only", C: "A new DNS zone", D: "Removing the partition column" }, answer: "A", rationale: "Freshness and volume checks detect silent success that does not meet data-product expectations." },
    { id: "gcp-target-12", number: 12, domain: "operations", prompt: "A Dataform model should stop publication when a key is null or duplicated. Which feature fits?", options: { A: "Assertions", B: "Cloud NAT", C: "Pub/Sub ordering only", D: "Cloud DNS" }, answer: "A", rationale: "Dataform assertions turn data-quality expectations into a promotion gate." },
    { id: "gcp-target-13", number: 13, domain: "security", prompt: "A Dataflow job needs access to exactly one bucket and one topic. Preferred identity?", options: { A: "A dedicated service account with least-privilege roles", B: "A user Owner role", C: "An embedded API key", D: "Public access" }, answer: "A", rationale: "Dedicated service accounts make workload identity explicit and permissions reviewable." },
    { id: "gcp-target-14", number: 14, domain: "security", prompt: "Sensitive BigQuery data requires customer-managed encryption keys. What must be planned with the key?", options: { A: "KMS IAM and key rotation ownership", B: "A public bucket ACL", C: "A DNS record", D: "A larger query result cache" }, answer: "A", rationale: "CMEK is an operational control: permissions, lifecycle, and rotation ownership matter." },
    { id: "gcp-target-15", number: 15, domain: "security", prompt: "A pipeline needs a rotatable database credential at runtime. Which service should hold it?", options: { A: "Secret Manager", B: "A Git repository", C: "A BigQuery comment", D: "Cloud Logging text" }, answer: "A", rationale: "Secret Manager provides controlled access and rotation without putting credentials in code." },
    { id: "gcp-target-16", number: 16, domain: "security", prompt: "A security review needs evidence of data access and administrative changes. Which combination is strongest?", options: { A: "Audit Logs plus targeted log sinks and retention", B: "Only application print statements", C: "Only table descriptions", D: "A disabled monitoring workspace" }, answer: "A", rationale: "Audit evidence needs the control-plane record plus deliberate routing and retention." },
  ],
  azure: [
    { id: "azure-target-1", number: 1, domain: "ingestion", prompt: "A recurring batch copy from an API to OneLake needs scheduling, retries, and parameterized datasets. Best fit?", options: { A: "Fabric / Data Factory pipeline", B: "Azure DNS", C: "Power BI visual only", D: "Key Vault secret" }, answer: "A", rationale: "Fabric and Data Factory pipelines provide scheduled orchestration around copy and transformation activities." },
    { id: "azure-target-2", number: 2, domain: "ingestion", prompt: "Events need scalable partitions and independent consumers before landing in an analytics solution. Which service?", options: { A: "Event Hubs", B: "Azure Files", C: "Purview glossary only", D: "Azure SQL trigger only" }, answer: "A", rationale: "Event Hubs is the event-ingestion boundary for partitioned, high-throughput streams." },
    { id: "azure-target-3", number: 3, domain: "ingestion", prompt: "A team wants incremental file ingestion into a lakehouse without repeatedly listing every historical file. Best pattern?", options: { A: "Checkpointed incremental ingestion", B: "Full reload on every run", C: "A public container", D: "Disable file metadata" }, answer: "A", rationale: "Incremental state reduces repeated scans and makes late-arriving files explicit." },
    { id: "azure-target-4", number: 4, domain: "ingestion", prompt: "A streaming route needs near-real-time transformations and operational dashboards. Which Fabric capability is relevant?", options: { A: "Real-Time Intelligence", B: "Azure DNS", C: "Key Vault certificates only", D: "A static Word document" }, answer: "A", rationale: "Fabric Real-Time Intelligence brings streaming ingestion, transformation, and analysis together." },
    { id: "azure-target-5", number: 5, domain: "stores", prompt: "A workload needs open lake storage for Spark and a SQL warehouse for governed serving. Which Fabric design fits?", options: { A: "Lakehouse plus Warehouse boundaries", B: "One giant CSV", C: "Only Azure DNS", D: "Key Vault as a database" }, answer: "A", rationale: "Fabric separates open lakehouse processing from warehouse-style SQL serving while sharing OneLake." },
    { id: "azure-target-6", number: 6, domain: "stores", prompt: "A team wants query acceleration without duplicating a source dataset into every workspace. What should it evaluate?", options: { A: "OneLake shortcuts and governed access", B: "Public blob access", C: "A new DNS zone", D: "Manual screenshots" }, answer: "A", rationale: "Shortcuts can reduce duplication while governance determines whether the access boundary is acceptable." },
    { id: "azure-target-7", number: 7, domain: "stores", prompt: "A serving workload needs transactional relational behavior rather than large analytical scans. Better fit?", options: { A: "Azure SQL Database", B: "OneLake files only", C: "Event Hubs", D: "Purview collections" }, answer: "A", rationale: "Azure SQL Database is the transactional relational boundary; lakehouse and warehouse patterns serve analytics." },
    { id: "azure-target-8", number: 8, domain: "stores", prompt: "An upstream producer adds a nullable field. What should happen before a Fabric model is promoted?", options: { A: "Validate schema compatibility and update the contract", B: "Delete all history", C: "Grant workspace Admin", D: "Disable refresh" }, answer: "A", rationale: "Contract and compatibility checks protect downstream lakehouse, warehouse, and semantic consumers." },
    { id: "azure-target-9", number: 9, domain: "operations", prompt: "A pipeline activity fails due to a transient dependency. Which control is most appropriate?", options: { A: "Retry policy with alerting and a failure path", B: "Permanent Admin permissions", C: "Silently skip the activity", D: "Delete the pipeline" }, answer: "A", rationale: "Retries should be bounded and observable, with a deliberate route for non-transient failure." },
    { id: "azure-target-10", number: 10, domain: "operations", prompt: "You need to investigate a failed Fabric refresh and its duration. Where should you start?", options: { A: "Workspace monitoring and activity logs", B: "DNS records", C: "A static report export", D: "Key Vault secret names" }, answer: "A", rationale: "Workspace monitoring and activity history connect the failed operation to timing and diagnostics." },
    { id: "azure-target-11", number: 11, domain: "operations", prompt: "A pipeline succeeds but the daily dataset is incomplete. Which quality gate helps detect it?", options: { A: "Freshness, volume, and business-key checks", B: "A larger dashboard font", C: "A new DNS record", D: "Disabling lineage" }, answer: "A", rationale: "Quality gates catch silent partial loads that infrastructure success alone cannot detect." },
    { id: "azure-target-12", number: 12, domain: "operations", prompt: "A warehouse model should not publish duplicate business keys. What belongs in the delivery process?", options: { A: "Automated data-quality tests before promotion", B: "Manual browser refresh only", C: "Public storage", D: "A larger Event Hubs partition" }, answer: "A", rationale: "Automated tests keep correctness checks close to the model and deployment decision." },
    { id: "azure-target-13", number: 13, domain: "security", prompt: "A pipeline must read one storage account and write one warehouse. Preferred identity?", options: { A: "Managed identity with scoped RBAC", B: "A shared personal password", C: "Workspace Admin everywhere", D: "Anonymous access" }, answer: "A", rationale: "Managed identities reduce credential handling and make the workload permission boundary explicit." },
    { id: "azure-target-14", number: 14, domain: "security", prompt: "A source credential must be rotated without changing pipeline code. Which service?", options: { A: "Azure Key Vault", B: "Power BI report text", C: "Event Hubs message body", D: "A public blob" }, answer: "A", rationale: "Key Vault is designed for controlled secret storage and rotation." },
    { id: "azure-target-15", number: 15, domain: "security", prompt: "A governance team needs a searchable inventory, ownership, and lineage across data assets. Which service?", options: { A: "Microsoft Purview", B: "Azure DNS", C: "Event Hubs", D: "Azure Files" }, answer: "A", rationale: "Purview provides the catalog and governance plane across data estates." },
    { id: "azure-target-16", number: 16, domain: "security", prompt: "Workspace and data access should be reviewed separately. Which principle applies?", options: { A: "Least privilege with separate role and data permissions", B: "Everyone receives Admin", C: "Use a shared root account", D: "Disable audit logs" }, answer: "A", rationale: "Separating workspace administration from data access limits blast radius and improves reviewability." },
  ],
  databricks: [
    { id: "databricks-target-1", number: 1, domain: "ingestion", prompt: "A cloud object store receives many new files and the pipeline should process each file once as it arrives. Best fit?", options: { A: "Auto Loader", B: "A full table scan every minute", C: "A DNS record", D: "A manual notebook export" }, answer: "A", rationale: "Auto Loader incrementally discovers and processes new files with durable state." },
    { id: "databricks-target-2", number: 2, domain: "ingestion", prompt: "A stream must resume after a cluster restart without losing its progress. What is essential?", options: { A: "A durable checkpoint location", B: "A random temporary directory", C: "Disabling retries", D: "A new workspace per batch" }, answer: "A", rationale: "Structured Streaming checkpoints persist progress and state across restarts." },
    { id: "databricks-target-3", number: 3, domain: "ingestion", prompt: "A bronze pipeline must preserve raw records while allowing downstream cleansing. Best design?", options: { A: "Append raw data to a bronze Delta table", B: "Overwrite the source after parsing", C: "Store secrets in the table", D: "Skip the raw layer" }, answer: "A", rationale: "A raw bronze layer preserves replayable evidence and separates ingestion from refinement." },
    { id: "databricks-target-4", number: 4, domain: "ingestion", prompt: "A stream may deliver the same event more than once. What should the target pipeline implement?", options: { A: "A stable event key and idempotent merge", B: "Blind append only", C: "Delete checkpoints", D: "Disable the stream" }, answer: "A", rationale: "Idempotent keys and merge semantics make retries safe for event data." },
    { id: "databricks-target-5", number: 5, domain: "stores", prompt: "A Delta table has many small files after frequent micro-batches. Which action should be evaluated?", options: { A: "Compaction or OPTIMIZE", B: "Convert it to JSON forever", C: "Disable statistics", D: "Use a DNS alias" }, answer: "A", rationale: "Compaction reduces small-file overhead and improves read efficiency." },
    { id: "databricks-target-6", number: 6, domain: "stores", prompt: "A SQL workload needs governed, isolated compute with predictable concurrency. Best fit?", options: { A: "A Databricks SQL Warehouse", B: "A developer laptop", C: "A secrets scope", D: "A raw object prefix" }, answer: "A", rationale: "SQL Warehouses provide a purpose-built serving boundary for Databricks SQL workloads." },
    { id: "databricks-target-7", number: 7, domain: "stores", prompt: "A data product needs centralized ownership, external locations, and fine-grained grants. Which control plane?", options: { A: "Unity Catalog", B: "A notebook cell comment", C: "A public bucket", D: "Cluster logs only" }, answer: "A", rationale: "Unity Catalog centralizes metadata, access policies, and data ownership across workspaces." },
    { id: "databricks-target-8", number: 8, domain: "stores", prompt: "A source adds a nullable column to a Delta feed. What should the engineer decide explicitly?", options: { A: "Schema evolution policy and downstream compatibility", B: "Delete the table", C: "Grant all users MANAGE", D: "Disable table history" }, answer: "A", rationale: "Delta schema evolution is useful only when its compatibility and ownership rules are deliberate." },
    { id: "databricks-target-9", number: 9, domain: "operations", prompt: "A multi-task job has a transient upstream failure. What is the strongest workflow behavior?", options: { A: "Bounded retries, dependencies, and an alert", B: "Ignore task state", C: "Grant workspace Admin", D: "Rerun everything manually" }, answer: "A", rationale: "Jobs should encode dependencies and bounded recovery rather than rely on manual intervention." },
    { id: "databricks-target-10", number: 10, domain: "operations", prompt: "You need to understand query duration, compute, and failure patterns across users. Where should you start?", options: { A: "Query history and system tables", B: "A README only", C: "A storage ACL", D: "A DNS record" }, answer: "A", rationale: "Query history and system tables provide operational evidence for workload and cost analysis." },
    { id: "databricks-target-11", number: 11, domain: "operations", prompt: "A pipeline should fail a batch when a critical field is null. Which pattern is appropriate?", options: { A: "Data-quality expectations with an explicit failure policy", B: "Delete bad rows silently", C: "Disable monitoring", D: "Move the data to DNS" }, answer: "A", rationale: "Expectations make quality behavior explicit: warn, quarantine, or fail according to the contract." },
    { id: "databricks-target-12", number: 12, domain: "operations", prompt: "A corrected source record must update a curated Delta table without duplicating history. Which operation?", options: { A: "MERGE using a stable business key", B: "Blind append", C: "Drop the table", D: "Overwrite all partitions every time" }, answer: "A", rationale: "MERGE applies inserts and updates against a stable key while preserving unrelated records." },
    { id: "databricks-target-13", number: 13, domain: "security", prompt: "A production job needs access to a governed table but should not use a human account. Preferred identity?", options: { A: "A service principal with scoped grants", B: "A shared personal token", C: "Workspace Admin for every job", D: "Anonymous access" }, answer: "A", rationale: "Service principals create an auditable, non-human identity with limited permissions." },
    { id: "databricks-target-14", number: 14, domain: "security", prompt: "A table is stored in cloud object storage outside the workspace. Which Unity Catalog boundary should be planned?", options: { A: "Storage credential and external location", B: "A public URL", C: "A notebook screenshot", D: "A SQL comment only" }, answer: "A", rationale: "External locations bind governed Unity Catalog access to cloud storage credentials and paths." },
    { id: "databricks-target-15", number: 15, domain: "security", prompt: "A notebook needs a third-party API secret at runtime. Where should it come from?", options: { A: "A managed secret scope", B: "A hard-coded cell", C: "A Delta table row", D: "A public widget" }, answer: "A", rationale: "Secret scopes keep credentials outside notebooks and make access reviewable." },
    { id: "databricks-target-16", number: 16, domain: "security", prompt: "A governance review needs evidence of grants, access, and administrative changes. Which source is most relevant?", options: { A: "Audit logs and system tables", B: "Only notebook output", C: "Only table row counts", D: "A disabled cluster" }, answer: "A", rationale: "Audit logs and system tables provide the control-plane and workload evidence needed for review." },
  ],
  snowflake: [],
};

const SIMULATION_META = [
  { title: "Translate the primitives", focus: "Map familiar patterns to target services and storage boundaries." },
  { title: "Build + operate", focus: "Choose ingestion, modeling, orchestration, and recovery controls." },
  { title: "Secure + govern", focus: "Test identity, encryption, catalog, quality, and audit decisions." },
  { title: "Timed readiness", focus: "Mix the target blueprint into a short, time-boxed readiness set." },
] as const;

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function rebalanceQuestionOptions(question: SimulationQuestion, questionIndex: number): SimulationQuestion {
  const currentAnswerIndex = OPTION_KEYS.indexOf(question.answer as (typeof OPTION_KEYS)[number]);
  const desiredAnswerIndex = questionIndex % OPTION_KEYS.length;
  const rotation = (desiredAnswerIndex - currentAnswerIndex + OPTION_KEYS.length) % OPTION_KEYS.length;
  const options = Object.fromEntries(OPTION_KEYS.map((key, optionIndex) => [
    OPTION_KEYS[(optionIndex + rotation) % OPTION_KEYS.length],
    question.options[key],
  ]));

  return { ...question, options, answer: OPTION_KEYS[desiredAnswerIndex] };
}

function buildSimulations(pathKey: string, source: PlatformProfile, target: PlatformProfile): ExamSimulation[] {
  const bank = TARGET_QUESTION_BANKS[target.key].length ? TARGET_QUESTION_BANKS[target.key] : TARGET_QUESTION_BANKS.aws;
  // Keep the original GCP → AWS bank stable so existing baseline answers remain
  // valid; new routes get balanced option positions for a fairer simulation.
  const preparedBank = pathKey === DEFAULT_PATH_KEY ? bank : bank.map(rebalanceQuestionOptions);
  return SIMULATION_META.map((simulation, simulationIndex) => ({
    key: `${pathKey}-simulation-${simulationIndex + 1}`,
    number: simulationIndex + 1,
    title: simulation.title,
    focus: `${simulation.focus} ${source.short} → ${target.short}.`,
    durationMinutes: 12,
    questions: preparedBank.slice(simulationIndex * 4, simulationIndex * 4 + 4).map((question, questionIndex) => ({
      ...question,
      id: `${pathKey}-simulation-${simulationIndex + 1}-q${questionIndex + 1}`,
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
    simulations: buildSimulations(key, source, target),
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
