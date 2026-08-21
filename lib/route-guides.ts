import { getBridgeWeekServiceKey, getPathBlueprint, type PathBlueprint, type Week } from "./content";

export type RouteGuide = {
  blueprint: PathBlueprint;
  week: Week;
  sourceService: string;
  targetService: string;
  outcome: string;
  decisions: string[];
  labSteps: string[];
  evidence: string[];
  teardown: string[];
};

const WEEK_PRACTICE: Array<Pick<RouteGuide, "outcome" | "decisions" | "labSteps" | "evidence" | "teardown">> = [
  {
    outcome: "A safe target-platform sandbox, a credential-scope brief, and an honest baseline you can use to prioritize the route.",
    decisions: ["Which target credential version and exam guide are you following?", "What is the smallest account or workspace boundary that keeps experiments isolated?", "Which source-platform habits transfer directly, and which assumptions need testing?"],
    labSteps: ["Read the target credential page and record the exam version, assessed abilities, and renewal policy.", "Create or select a sandbox boundary; enable MFA, least privilege, and a spend control before provisioning data services.", "Take the StackBridge baseline without external help and convert every uncertain answer into a named learning gap.", "Write a one-page route brief: source strengths, target gaps, weekly rhythm, evidence location, and stop conditions."],
    evidence: ["Credential/version note", "Redacted safety-control screenshots", "Baseline result and error log", "Calendar rhythm and cost ceiling"],
    teardown: ["Do not store recovery codes, access keys, tokens, or billing identifiers in evidence.", "Remove any temporary elevated role created only for setup."],
  },
  {
    outcome: "A private, encrypted landing zone whose naming, lifecycle, access, and deletion behavior you can explain.",
    decisions: ["How does the target represent buckets, containers, catalogs, or volumes?", "Where are encryption, retention, versioning, and lifecycle policies enforced?", "Which identity writes raw data and which identities may read it?"],
    labSteps: ["Create the smallest private landing area supported by your target sandbox.", "Upload a tiny public dataset using a non-human or least-privilege workload identity.", "Add a raw/curated prefix or schema convention and one lifecycle or retention rule.", "Attempt one intentionally denied read, then inspect the platform's audit evidence."],
    evidence: ["Architecture sketch", "Policy or grant excerpt with secrets removed", "Successful write and denied-read evidence", "Lifecycle and teardown note"],
    teardown: ["Delete test data and temporary identities after evidence is captured.", "Confirm no public access or anonymous sharing remains."],
  },
  {
    outcome: "A repeatable batch ingestion that validates schema, writes an analytical format, and behaves predictably on retry.",
    decisions: ["Managed pipeline, Spark, SQL, or serverless job?", "How are schema drift, malformed rows, and late files handled?", "What makes reruns idempotent?"],
    labSteps: ["Ingest a small CSV or JSON dataset from the landing zone.", "Cast types, add an ingestion timestamp, quarantine malformed input, and write a columnar target.", "Run the job twice and verify that the second run does not create unintended duplicates.", "Inspect job history, logs, and scanned or processed volume."],
    evidence: ["Job definition or notebook", "Before/after schema", "Retry or idempotency result", "Log and cost observation"],
    teardown: ["Stop ephemeral compute and delete transient outputs.", "Keep only minimal, non-sensitive artifacts needed for the next week."],
  },
  {
    outcome: "A defensible lake, lakehouse, or warehouse design based on access patterns, latency, concurrency, and governance.",
    decisions: ["External data or managed tables?", "Transactional, streaming, ad-hoc, or repeated analytical workload?", "How do partitioning, clustering, file size, and compute isolation affect cost and performance?"],
    labSteps: ["Load the curated dataset into the target analytical store.", "Create one fact-like model and one reusable dimension or reference model.", "Run the same analytical query before and after one physical-design improvement.", "Document when you would keep data in the lake instead of loading it into the warehouse."],
    evidence: ["Store decision matrix", "DDL or model definitions", "Query-plan or runtime comparison", "Cost/concurrency note"],
    teardown: ["Suspend or delete billable compute when the lab ends.", "Remove duplicate test copies that no longer support evidence."],
  },
  {
    outcome: "A modular transformation layer with tests, documentation, lineage, and a promotion boundary comparable to your source-platform workflow.",
    decisions: ["Native modeling tool or dbt?", "Where do assertions run, and what blocks publication?", "How are environments, dependencies, documentation, and lineage represented?"],
    labSteps: ["Build staging and curated models from the prior week's data.", "Add not-null, unique, accepted-value, and relationship checks where they express real contracts.", "Generate or inspect lineage and documentation.", "Introduce one failing record, confirm the gate blocks or quarantines it, then remediate."],
    evidence: ["Model DAG", "Passing and intentionally failing test output", "Generated documentation", "Source-to-target modeling comparison"],
    teardown: ["Remove the intentionally bad record.", "Drop temporary development schemas or catalogs if they incur cost or expose data."],
  },
  {
    outcome: "A streaming design that states ordering, partitioning, state, replay, duplicate handling, and failure recovery explicitly.",
    decisions: ["What is the partition or routing key?", "How long is replay possible and where is checkpoint state stored?", "What delivery guarantees exist, and what must the consumer do to be safe?"],
    labSteps: ["Publish a small sequence of keyed events into the target streaming service.", "Land or transform the events with a managed sink or streaming job.", "Replay or restart the consumer and verify idempotent behavior with a stable event ID.", "Record buffering latency, ordering behavior, and the platform metric that reveals lag."],
    evidence: ["Event contract and partition-key rationale", "Producer/consumer configuration", "Replay or checkpoint proof", "Lag and cost observation"],
    teardown: ["Stop streaming compute and remove test streams, topics, or endpoints.", "Delete checkpoints only after you have recorded why doing so changes replay semantics."],
  },
  {
    outcome: "An observable workflow that encodes dependencies, retries, alerts, backfills, and a deliberate failure path.",
    decisions: ["Native orchestrator, managed Airflow, or workload scheduler?", "Which failures are retryable and which require intervention?", "How are parameters, backfills, secrets, and service identities handled?"],
    labSteps: ["Orchestrate landing, transformation, quality checks, and publication as separate steps.", "Inject one transient failure and one non-retryable quality failure.", "Verify bounded retry, failure routing, and operator-visible context.", "Run a small backfill without overwriting unrelated partitions."],
    evidence: ["Workflow graph", "Retry and failure-path run history", "Alert payload with sensitive values removed", "Backfill runbook"],
    teardown: ["Disable schedules that should not keep running.", "Remove temporary notification targets and elevated workflow permissions."],
  },
  {
    outcome: "A reviewed identity and governance model covering workload identities, catalogs, row/column controls, secrets, and auditability.",
    decisions: ["Which control belongs to cloud IAM, workspace roles, catalog grants, or data policies?", "How are human and workload identities separated?", "Where are secrets stored and how are access changes audited?"],
    labSteps: ["Create a reader identity and a pipeline identity with different permissions.", "Apply a table, schema, row, column, tag, or masking control supported by the target.", "Retrieve a test secret at runtime without printing it.", "Review the audit trail for a permission change and a data-access event."],
    evidence: ["Identity and access matrix", "Governance policy rationale", "Redacted audit events", "Secret-rotation ownership note"],
    teardown: ["Revoke temporary grants and delete test secrets.", "Confirm no broad administrator or owner role remains attached to the lab identity."],
  },
  {
    outcome: "A runbook that makes freshness, quality, reliability, performance, and spend visible enough to operate the pipeline.",
    decisions: ["Which service-level indicators reveal useful data, not merely successful infrastructure?", "What is logged, alerted, retained, and routed?", "Which cost unit can be attributed to the workload?"],
    labSteps: ["Define freshness, volume, validity, and pipeline-latency checks.", "Create one operational view or query over logs and job history.", "Set a small budget, quota, warehouse limit, cluster policy, or equivalent guardrail.", "Simulate stale or incomplete data and follow the runbook from detection to recovery."],
    evidence: ["SLI and threshold table", "Operational view or query", "Recovery timeline", "Cost worksheet and guardrail"],
    teardown: ["Remove noisy test alerts and temporary log exports.", "Stop compute and verify no schedule can restart it unexpectedly."],
  },
  {
    outcome: "A source-controlled, validation-first deployment that can rebuild the lab without relying on console memory.",
    decisions: ["Infrastructure as code, SDK, CLI, or a layered combination?", "Which checks run before merge and before deployment?", "How are environments and secrets separated?"],
    labSteps: ["Represent one storage, identity, orchestration, or warehouse resource as code.", "Add format, validation, and plan or dry-run checks.", "Deploy to a sandbox from a clean checkout or clean environment.", "Change one property through review, then roll it back through the same delivery path."],
    evidence: ["Repository structure", "Validation output", "Plan or dry-run artifact", "Rollback record"],
    teardown: ["Destroy only the resources created by the lab's automation.", "Verify the plan is empty or explain any intentionally retained resource."],
  },
  {
    outcome: "An end-to-end target-platform data product and architecture review that demonstrates transfer, not just service recall.",
    decisions: ["Where are the system boundaries and failure domains?", "Which choices optimize for correctness, recovery, governance, and cost?", "What evidence would convince another engineer the system can be operated?"],
    labSteps: ["Connect ingestion, storage, transformation, tests, orchestration, and observability into one small capstone.", "Run a normal load, a duplicate/retry scenario, and a malformed-data scenario.", "Review permissions, audit evidence, data lineage, and teardown behavior.", "Present the architecture in source-platform terms first, then translate every boundary into target-platform terms."],
    evidence: ["Architecture diagram", "End-to-end run evidence", "Failure and recovery record", "Five-minute design review narrative"],
    teardown: ["Use the capstone inventory to remove every temporary resource.", "Keep only redacted code, diagrams, decisions, and logs needed as portfolio evidence."],
  },
  {
    outcome: "A closed error log in which every miss names the decision rule, the evidence that corrected it, and a retest result.",
    decisions: ["Is each miss a knowledge gap, translation gap, reading error, or time-pressure error?", "Which official objective owns the gap?", "What practical test would make the answer memorable?"],
    labSteps: ["Review every diagnostic and simulation miss without changing the recorded first answer.", "Tag each miss by practice dimension and error type.", "Return to the smallest relevant guide or official page, then perform one corrective field test.", "Retake a fresh set and compare both accuracy and confidence."],
    evidence: ["Categorized error log", "Official objective mapping", "Corrective field-test artifact", "Retest comparison"],
    teardown: ["Remove any temporary remediation resources.", "Do not hide unresolved gaps; move them into the final readiness decision."],
  },
  {
    outcome: "A schedule-or-delay decision grounded in timed performance, operational fluency, confidence calibration, and the official exam guide.",
    decisions: ["Can you explain why the distractors are wrong, not merely identify the answer?", "Are weak dimensions isolated or systemic?", "Is the credential version and exam language still current?"],
    labSteps: ["Complete all four StackBridge compact simulations under their suggested time boxes.", "Use an official practice assessment or current sample questions when available.", "Rehearse the capstone's failure and recovery story without notes.", "Schedule only when your score trend, error log, and confidence tell the same story; otherwise create a bounded remediation cycle."],
    evidence: ["Four simulation results", "Official practice result or sample-question review", "Final error log", "Written schedule-or-delay rationale"],
    teardown: ["Confirm every paid lab resource is stopped or deleted before exam week.", "Archive evidence without credentials, private data, or unnecessary cloud identifiers."],
  },
];

export function getRouteGuide(pathKey: string, weekNumber: number): RouteGuide | null {
  const blueprint = getPathBlueprint(pathKey);
  if (blueprint.key !== pathKey) return null;
  const week = blueprint.weeks.find((item) => item.number === weekNumber);
  const practice = WEEK_PRACTICE[weekNumber];
  if (!week || !practice) return null;

  const serviceKey = getBridgeWeekServiceKey(weekNumber);
  return {
    blueprint,
    week,
    sourceService: blueprint.source.services[serviceKey],
    targetService: blueprint.target.services[serviceKey],
    ...practice,
  };
}
