/*
 * StackBridge — local-first cross-platform learning dashboard
 * No framework. Local-first by default, with optional Clerk + Neon hosting.
 */

const STORAGE_KEY = "aws-dea-dashboard-v1";
// Keep the legacy key so existing local progress survives the rebrand.
const ACTIVE_PATH_KEY = "gcp-to-aws-data-engineer";

const STATUS_OPTIONS = [
  ["not-started", "Not started"],
  ["studying", "Studying"],
  ["practiced", "Practiced"],
  ["verified", "Verified"],
  ["revisit", "Revisit"],
];

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS);

const WEEKS = [
  {
    number: 0,
    title: "Account & safety",
    domain: "setup / guardrails",
    summary: "Secure the learning account, pick a Region, and establish cost guardrails before touching a warehouse.",
    tags: ["IAM", "Budgets", "CloudShell"],
    deliverable: "Verified Week 0 stop-point",
    guide: "../aws-data-engineer-week-0-account-setup.md",
  },
  {
    number: 1,
    title: "S3 foundation",
    domain: "foundations",
    summary: "Build a private, encrypted lake landing zone and explain roles, bucket policies, lifecycle, and access denial.",
    tags: ["S3", "KMS", "IAM"],
    deliverable: "Secure bucket + teardown evidence",
    guide: "../aws-data-engineer-week-1-lab.md",
  },
  {
    number: 2,
    title: "Glue + Athena",
    domain: "ingestion / stores",
    summary: "Turn S3 objects into queryable metadata, then make partition pruning and columnar storage visible in scan costs.",
    tags: ["Glue Catalog", "Athena", "Parquet"],
    deliverable: "Catalog table + query evidence",
    guide: "../aws-data-engineer-week-2-glue-athena-lab.md",
  },
  {
    number: 3,
    title: "Glue ETL",
    domain: "ingestion / transformation",
    summary: "Run a small Spark transformation, inspect its script and logs, and make a deliberate schema-evolution decision.",
    tags: ["Glue ETL", "Spark", "Bookmarks"],
    deliverable: "Curated Parquet + schema note",
    guide: "../aws-data-engineer-week-3-glue-etl-lab.md",
  },
  {
    number: 4,
    title: "Redshift warehouse",
    domain: "store management",
    summary: "Cross the boundary from querying S3 to modeling warehouse tables, then add the dbt layer that feels familiar from Dataform.",
    tags: ["Redshift", "COPY", "dbt"],
    deliverable: "Warehouse model + UNLOAD",
    guide: "../aws-data-engineer-week-4-redshift-lab.md",
  },
  {
    number: 5,
    title: "Streaming path",
    domain: "ingestion / velocity",
    summary: "Send partitioned events through Kinesis and Firehose, then reason about retention, ordering, buffering, and replay.",
    tags: ["Kinesis", "Firehose", "Lambda"],
    deliverable: "Delivery evidence + teardown",
    guide: "../aws-data-engineer-week-5-streaming-lab.md",
  },
  {
    number: 6,
    title: "Orchestration",
    domain: "operations",
    summary: "Wrap a Glue job in Step Functions, trigger it with EventBridge, and inject a failure to practice retries and catches.",
    tags: ["Step Functions", "EventBridge", "Glue"],
    deliverable: "Execution + failure-path evidence",
    guide: "../aws-data-engineer-week-6-orchestration-lab.md",
  },
  {
    number: 7,
    title: "Stores + migration",
    domain: "store management",
    summary: "Choose between OLTP, key-value, warehouse, and movement services using workload shape rather than service familiarity.",
    tags: ["DynamoDB", "RDS", "DMS"],
    deliverable: "Decision matrix + runbook",
    guide: "../aws-data-engineer-week-7-data-stores-migration-lab.md",
  },
  {
    number: 8,
    title: "Security + governance",
    domain: "security",
    summary: "Trace identity, encryption, secrets, and lake permissions through the pipeline; validate a policy before attaching it.",
    tags: ["IAM", "KMS", "Lake Formation"],
    deliverable: "Access matrix + policy rationale",
    guide: "../aws-data-engineer-week-8-security-governance-lab.md",
  },
  {
    number: 9,
    title: "Observe + recover",
    domain: "operations / cost",
    summary: "Make logs, audit trails, data-quality checks, failure recovery, and cost controls part of the pipeline—not afterthoughts.",
    tags: ["CloudWatch", "CloudTrail", "Budgets"],
    deliverable: "Runbook + quality/cost worksheet",
    guide: "../aws-data-engineer-week-9-observability-reliability-cost-lab.md",
  },
  {
    number: 10,
    title: "Automate the platform",
    domain: "automation / dbt",
    summary: "Use CLI, Boto3, IaC, dbt, and validation-first CI/CD to turn the lab into a repeatable engineering artifact.",
    tags: ["Boto3", "CloudFormation", "dbt"],
    deliverable: "Starter stack + automation evidence",
    guide: "../aws-data-engineer-week-10-automation-iac-dbt-lab.md",
  },
  {
    number: 11,
    title: "Remediate + pretest",
    domain: "exam readiness",
    summary: "Audit the current blueprint, close domain gaps, and turn missed questions into specific remediation actions.",
    tags: ["Blueprint", "Error log", "Pretest"],
    deliverable: "Closed error log + pretest result",
    guide: "../aws-data-engineer-week-11-remediation-pretest.md",
  },
  {
    number: 12,
    title: "Timed readiness",
    domain: "exam readiness",
    summary: "Use timed sets, capstone troubleshooting, and an official practice result to make a deliberate schedule-or-delay decision.",
    tags: ["Timed sets", "Capstone", "Schedule"],
    deliverable: "Readiness gate + exam decision",
    guide: "../aws-data-engineer-week-12-timed-readiness-exam.md",
  },
];

const TRANSFERS = [
  { gcp: "Cloud Storage", aws: "S3", focus: "object layout + lifecycle" },
  { gcp: "BigQuery", aws: "Athena / Redshift", focus: "lake query vs warehouse" },
  { gcp: "Dataflow", aws: "Glue / EMR", focus: "managed batch + Spark" },
  { gcp: "Pub/Sub", aws: "Kinesis", focus: "partitions + replay" },
  { gcp: "Dataform", aws: "dbt + Redshift", focus: "models + tests + DAG" },
  { gcp: "Composer", aws: "MWAA / Step Functions", focus: "workflow boundary" },
  { gcp: "Cloud Logging", aws: "CloudWatch", focus: "workload telemetry" },
  { gcp: "Audit Logs", aws: "CloudTrail", focus: "API evidence" },
  { gcp: "Dataplex", aws: "Glue + Lake Formation", focus: "catalog + governance" },
  { gcp: "Secret Manager", aws: "Secrets Manager", focus: "runtime secrets" },
];

const CORE_RESOURCES = [
  { number: "01", title: "Start Here", description: "Current status, first 30 minutes, and the GCP → AWS map.", href: "../AWS-DATA-ENGINEER-START-HERE.md", type: "local" },
  { number: "02", title: "Completion audit", description: "Prepared material versus learner evidence still needed.", href: "../AWS-DATA-ENGINEER-COMPLETION-AUDIT.md", type: "local" },
  { number: "03", title: "Study plan", description: "Full sequence, capstone, Dataform/dbt mapping, and gates.", href: "../aws-data-engineer-study-plan.md", type: "local" },
  { number: "04", title: "DEA-C01 blueprint", description: "Domains, service priorities, and error taxonomy.", href: "../aws-dea-c01-blueprint.md", type: "local" },
  { number: "05", title: "Accountability tracker", description: "Verified status, check-in template, and readiness scorecard.", href: "../aws-data-engineer-accountability.md", type: "local" },
  { number: "06", title: "Week 0 setup", description: "Account safety, billing guardrails, and non-root identity steps.", href: "../aws-data-engineer-week-0-account-setup.md", type: "local" },
];

const OFFICIAL_RESOURCES = [
  { number: "A", title: "AWS exam guide", description: "Current DEA-C01 scope, domains, response types, and revisions.", href: "https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html", type: "AWS" },
  { number: "B", title: "Certification preparation", description: "AWS’s current preparation index and official options.", href: "https://aws.amazon.com/certification/certification-prep/", type: "AWS" },
  { number: "C", title: "Skill Builder", description: "Search the free DEA-C01 preparation catalog.", href: "https://skillbuilder.aws/", type: "AWS" },
  { number: "D", title: "Free Tier", description: "Current account plan, credits, and eligibility information.", href: "https://aws.amazon.com/free/", type: "AWS" },
  { number: "E", title: "AWS Educate", description: "Account-free foundational labs and resources.", href: "https://www.awseducate.com/", type: "AWS" },
];

const DOMAIN_META = {
  ingestion: { label: "Ingestion & Transformation", short: "D1", weight: "34%" },
  stores: { label: "Data Store Management", short: "D2", weight: "26%" },
  operations: { label: "Data Operations & Support", short: "D3", weight: "22%" },
  security: { label: "Data Security & Governance", short: "D4", weight: "18%" },
};

const QUESTIONS = [
  {
    number: 1, domain: "ingestion", prompt: "Daily CSVs need a serverless Spark transformation that casts columns, writes Parquet, and can run on demand or after a trigger. Best fit?",
    options: { A: "Redshift provisioned cluster", B: "AWS Glue ETL job", C: "DynamoDB", D: "Route 53" }, answer: "B",
  },
  {
    number: 2, domain: "ingestion", prompt: "Clickstream events need per-customer ordering and independent consumers reading retained events. Best design?",
    options: { A: "S3 with random object names", B: "Kinesis Data Streams with customer ID as partition key", C: "Firehose Direct PUT only", D: "RDS as the queue" }, answer: "B",
  },
  {
    number: 3, domain: "ingestion", prompt: "Near-real-time JSON events need managed buffering and delivery to S3 without custom consumer code. Which service?",
    options: { A: "Amazon Data Firehose", B: "CloudTrail", C: "Glue Crawler", D: "EBS" }, answer: "A",
  },
  {
    number: 4, domain: "ingestion", prompt: "Step Functions must start a Glue job and continue only after it finishes. Which integration is appropriate?",
    options: { A: "glue:startJobRun", B: "glue:startJobRun.sync", C: "lambda:invoke.waitForTaskToken", D: "EventBridge schedule with no target role" }, answer: "B",
  },
  {
    number: 5, domain: "stores", prompt: "Athena scans 2 TB but needs one day stored under Hive-style event_date prefixes. Highest-value first optimization?",
    options: { A: "Filter the partition and select required columns", B: "Convert Parquet to CSV", C: "Remove the partition column", D: "Only increase result-cache duration" }, answer: "A",
  },
  {
    number: 6, domain: "stores", prompt: "Repeated joins and aggregations need warehouse-managed tables and predictable SQL performance. Best design?",
    options: { A: "Always scan external S3 data in Athena", B: "Load curated data into modeled Redshift tables", C: "Store rows in Parameter Store", D: "Use CloudTrail Lake as the warehouse" }, answer: "B",
  },
  {
    number: 7, domain: "stores", prompt: "An application needs single-digit-millisecond access to profiles by known customer ID, at high volume, with no joins. Best fit?",
    options: { A: "DynamoDB", B: "Redshift", C: "Athena", D: "S3 Select as the primary database" }, answer: "A",
  },
  {
    number: 8, domain: "stores", prompt: "Which statement best distinguishes an operational relational database from an analytical warehouse?",
    options: { A: "RDS/Aurora generally serve transactions; Redshift serves analytics", B: "RDS/Aurora cannot store relational data", C: "Redshift is always for single-row transactions", D: "RDS/Aurora replaces Glue metadata" }, answer: "A",
  },
  {
    number: 9, domain: "operations", prompt: "A Glue job has transient service or concurrency failures. Retry with backoff, then route failure for investigation. Which mechanism?",
    options: { A: "Step Functions Retry followed by Catch", B: "A larger S3 bucket", C: "A new IAM user per retry", D: "Disable all CloudWatch logs" }, answer: "A",
  },
  {
    number: 10, domain: "operations", prompt: "You need to answer which IAM principal called an AWS API operation and when. Primary audit source?",
    options: { A: "CloudWatch Logs only", B: "AWS CloudTrail", C: "Athena results only", D: "Glue Crawler history only" }, answer: "B",
  },
  {
    number: 11, domain: "operations", prompt: "You want actual-spend and forecasted-spend alerts at thresholds. Best control?",
    options: { A: "AWS Budgets", B: "S3 lifecycle rule", C: "Redshift sort key", D: "Kinesis partition key" }, answer: "A",
  },
  {
    number: 12, domain: "operations", prompt: "A Kinesis consumer may receive a record again after retry. Safest purchase-event behavior?",
    options: { A: "Idempotent processing using a stable event ID", B: "Assume exactly once and insert blindly", C: "Delete the stream after each batch", D: "Disable retries" }, answer: "A",
  },
  {
    number: 13, domain: "security", prompt: "Redshift must load files from a specific S3 prefix. Preferred authorization approach?",
    options: { A: "Access keys in COPY", B: "Least-privilege IAM role with IAM_ROLE", C: "Public S3 bucket", D: "Root access keys" }, answer: "B",
  },
  {
    number: 14, domain: "security", prompt: "S3 objects need a customer-managed KMS key with controlled role usage. Which combination matters?",
    options: { A: "KMS key policy/IAM permissions plus S3 encryption configuration", B: "CloudWatch dashboard only", C: "Partition projection only", D: "EventBridge pattern only" }, answer: "A",
  },
  {
    number: 15, domain: "security", prompt: "Teams query S3 data but need table, column, or row-level authorization. Which governance service is most direct?",
    options: { A: "Lake Formation", B: "Route 53", C: "ECR", D: "CodeDeploy" }, answer: "A",
  },
  {
    number: 16, domain: "security", prompt: "A Glue job needs a rotatable database password that must not live in source code or S3. Best fit?",
    options: { A: "Secrets Manager", B: "Public S3 metadata", C: "CloudTrail history", D: "Hard-coded Git environment variable" }, answer: "A",
  },
];

let state = loadState();
let checkinSelectedWeek = 0;
let toastTimer;
let fileSyncMode = "checking";
let storageBackend = "file";
let fileSyncTimer;
let fileSyncInFlight = false;
let fileSyncQueued = false;
let deferredInstallPrompt = null;
let currentUser = null;
let authMode = "login";
let clerk = null;
let clerkReady = false;
let clerkAuthMounted = null;
let clerkHydrationInFlight = null;

function createDefaultState() {
  return {
    version: 1,
    pathKey: ACTIVE_PATH_KEY,
    weekStatus: Object.fromEntries(WEEKS.map((week) => [String(week.number), "not-started"])),
    weekNotes: {},
    setup: {
      region: "",
      plan: "",
      expiry: "",
      rhythm: "",
      checks: { rootMfa: false, nonRoot: false, budget: false, noOrg: true },
    },
    diagnostic: {
      answers: Array(QUESTIONS.length).fill(""),
      time: "",
      confidence: "",
      uncertain: "",
      result: null,
      attempts: [],
    },
    checkins: [],
    preferences: { theme: "light" },
  };
}

function normalizeState(parsed) {
  const defaults = createDefaultState();
  return {
    ...defaults,
    ...(parsed || {}),
    pathKey: typeof parsed?.pathKey === "string" ? parsed.pathKey : ACTIVE_PATH_KEY,
    weekStatus: { ...defaults.weekStatus, ...((parsed && parsed.weekStatus) || {}) },
    weekNotes: { ...defaults.weekNotes, ...((parsed && parsed.weekNotes) || {}) },
    setup: {
      ...defaults.setup,
      ...((parsed && parsed.setup) || {}),
      checks: { ...defaults.setup.checks, ...((parsed && parsed.setup && parsed.setup.checks) || {}) },
    },
    diagnostic: { ...defaults.diagnostic, ...((parsed && parsed.diagnostic) || {}) },
    checkins: Array.isArray(parsed && parsed.checkins) ? parsed.checkins : [],
    preferences: {
      ...defaults.preferences,
      ...((parsed && parsed.preferences) || {}),
      theme: parsed?.preferences?.theme === "dark" ? "dark" : "light",
    },
  };
}

function userStorageKey(userId) {
  return `${STORAGE_KEY}:${userId}:${ACTIVE_PATH_KEY}`;
}

function loadStateFromStorage(storageKey = STORAGE_KEY) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return createDefaultState();
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn("Could not read saved dashboard state", error);
    return createDefaultState();
  }
}

function loadState() {
  return loadStateFromStorage(STORAGE_KEY);
}

function activeStorageKey() {
  return currentUser ? userStorageKey(currentUser.id) : STORAGE_KEY;
}

function saveState(message = "saved locally", announce = true) {
  try {
    window.localStorage.setItem(activeStorageKey(), JSON.stringify(state));
    const saveStateElement = document.querySelector("#save-state");
    if (saveStateElement) saveStateElement.textContent = message;
    scheduleFileSync();
    if (announce) showToast(message);
  } catch (error) {
    console.warn("Could not save dashboard state", error);
    const saveStateElement = document.querySelector("#save-state");
    if (saveStateElement) saveStateElement.textContent = "storage unavailable";
  }
}

function showAuthGate(message = "Sign in with Clerk to load your private progress.") {
  const gate = document.querySelector("#auth-gate");
  const authMessage = document.querySelector("#auth-message");
  if (authMessage) authMessage.textContent = message;
  if (!gate) return;
  gate.hidden = false;
  if (clerkReady) mountClerkAuth();
}

function hideAuthGate() {
  const gate = document.querySelector("#auth-gate");
  if (gate) gate.hidden = true;
}

function setCurrentUser(user) {
  currentUser = user || null;
  const identity = document.querySelector("#user-identity");
  const label = document.querySelector("#user-label");
  if (identity) identity.hidden = !currentUser;
  if (label) label.textContent = currentUser ? (currentUser.displayName || currentUser.email) : "";
}

function setAuthMode(mode = "login") {
  authMode = mode === "register" ? "register" : "login";
  const register = authMode === "register";
  const title = document.querySelector("#auth-title");
  const copy = document.querySelector("#auth-copy");
  const loginTab = document.querySelector("#auth-login-tab");
  const registerTab = document.querySelector("#auth-register-tab");
  if (title) title.textContent = register ? "Start your dossier." : "Welcome back.";
  if (copy) copy.textContent = register
    ? "Create an account to keep your own learning path and progress separate from every other learner."
    : "Sign in to load your private path and continue where you left off.";
  if (loginTab) {
    loginTab.classList.toggle("is-active", !register);
    loginTab.setAttribute("aria-selected", String(!register));
  }
  if (registerTab) {
    registerTab.classList.toggle("is-active", register);
    registerTab.setAttribute("aria-selected", String(register));
  }
  if (clerkReady) mountClerkAuth();
}

function applyTheme() {
  const theme = state.preferences?.theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = theme;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const themeToggle = document.querySelector("#theme-toggle");
  if (metaTheme) metaTheme.content = theme === "dark" ? "#202b2c" : "#2d3b3c";
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "☼" : "◐";
    themeToggle.title = theme === "dark" ? "Switch to light theme" : "Switch to dim theme";
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dim theme");
  }
}

function toggleTheme() {
  state.preferences.theme = state.preferences.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveState("theme preference saved", false);
}

function updateNetworkStatus() {
  const status = document.querySelector("#network-status");
  if (!status) return;
  const online = navigator.onLine !== false;
  status.classList.toggle("is-offline", !online);
  status.innerHTML = `<span class="network-dot"></span> ${online ? "online" : "offline · local save"}`;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.info("Offline shell is unavailable", error.message);
  });
}

function setupInstallPrompt() {
  const installButton = document.querySelector("#install-button");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    if (installButton) installButton.hidden = true;
    showToast("Field guide installed.");
  });
  installButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#a76351",
    colorText: "#25312f",
    colorTextSecondary: "#66706a",
    colorBackground: "#f5f1e7",
    borderRadius: "2px",
    fontFamily: "Avenir Next, Avenir, sans-serif",
  },
  elements: {
    card: "clerk-card",
    headerTitle: "clerk-title",
    headerSubtitle: "clerk-subtitle",
    formButtonPrimary: "clerk-primary",
    footerActionLink: "clerk-link",
    formFieldInput: "clerk-input",
  },
};

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((script) => script.src === src);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function decodeClerkFrontendApi(publishableKey) {
  const encoded = String(publishableKey || "").split("_")[2];
  if (!encoded) return "";
  const padded = encoded.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  try {
    return atob(padded).replace(/\$$/, "");
  } catch {
    return "";
  }
}

function clerkDomain(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`).host;
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function mapClerkUser(user) {
  if (!user) return null;
  const email = user.primaryEmailAddress?.emailAddress || "";
  return {
    id: user.id,
    email,
    displayName: user.fullName || user.firstName || email.split("@")[0] || "Learner",
  };
}

function mountClerkAuth() {
  const container = document.querySelector("#clerk-auth");
  if (!clerkReady || !clerk || !container) return;

  try {
    if (clerkAuthMounted === "login") clerk.unmountSignIn?.(container);
    if (clerkAuthMounted === "register") clerk.unmountSignUp?.(container);
  } catch (error) {
    console.info("Could not unmount the previous Clerk form", error.message);
  }
  container.replaceChildren();

  const options = {
    appearance: clerkAppearance,
    routing: "hash",
    signInFallbackRedirectUrl: window.location.href,
    signUpFallbackRedirectUrl: window.location.href,
  };
  if (authMode === "register") {
    clerk.mountSignUp(container, options);
    clerkAuthMounted = "register";
  } else {
    clerk.mountSignIn(container, options);
    clerkAuthMounted = "login";
  }
}

async function getClerkHeaders(json = false) {
  const headers = { Accept: "application/json" };
  if (json) headers["Content-Type"] = "application/json";
  if (clerk?.session) {
    try {
      const token = await clerk.session.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.info("Could not get a Clerk session token", error.message);
    }
  }
  return headers;
}

async function handleClerkUser(user) {
  if (!user) {
    setCurrentUser(null);
    state = createDefaultState();
    storageBackend = "database";
    setFileSyncStatus("auth");
    showAuthGate();
    return;
  }

  if (clerkHydrationInFlight === user.id) return;
  clerkHydrationInFlight = user.id;
  try {
    setCurrentUser(mapClerkUser(user));
    hideAuthGate();
    const remoteState = await loadProgressFromFile();
    if (remoteState) {
      state = remoteState;
      window.localStorage.setItem(activeStorageKey(), JSON.stringify(state));
    } else if (fileSyncMode === "active") {
      state = loadStateFromStorage(activeStorageKey());
      await syncProgressFile();
    }
    applyTheme();
    renderAll();
    showToast("Signed in. Your private path is loaded.");
  } finally {
    clerkHydrationInFlight = null;
  }
}

async function initClerk() {
  try {
    const response = await fetch("./api/config", { cache: "no-store" });
    if (!response.ok) return false;
    const config = await response.json();
    const publishableKey = config.clerkPublishableKey;
    if (!publishableKey) return false;

    const domain = clerkDomain(config.clerkFrontendApiUrl || decodeClerkFrontendApi(publishableKey));
    if (!domain) throw new Error("Could not determine the Clerk frontend API domain.");

    await loadExternalScript(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadExternalScript(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`);
    if (typeof window.Clerk !== "function") throw new Error("Clerk browser SDK did not load.");

    clerk = new window.Clerk(publishableKey);
    const loadOptions = { appearance: clerkAppearance };
    if (window.__internal_ClerkUICtor) loadOptions.ui = { ClerkUI: window.__internal_ClerkUICtor };
    await clerk.load(loadOptions);
    clerkReady = true;
    clerk.addListener(({ user }) => { void handleClerkUser(user); });
    await handleClerkUser(clerk.user);
    return true;
  } catch (error) {
    clerk = null;
    clerkReady = false;
    console.info("Clerk is not available; using local mode", error.message);
    return false;
  }
}

function setFileSyncStatus(mode) {
  fileSyncMode = mode;
  const label = document.querySelector("#file-sync-status");
  const dot = document.querySelector("#file-sync-dot");
  const activeCopy = storageBackend === "database" ? "auto-save → Postgres" : "auto-save → progress.json";
  const savingCopy = storageBackend === "database" ? "writing to Postgres" : "writing progress.json";
  const copy = {
    checking: "sync checking",
    active: activeCopy,
    saving: savingCopy,
    browser: "browser storage only",
    error: "file sync needs attention",
    auth: "sign-in required",
    setup: "hosted setup needed",
  }[mode] || "local progress";
  if (label) label.textContent = copy;
  if (dot) {
    dot.className = `status-dot status-dot-${mode}`;
  }
}

function scheduleFileSync() {
  if (fileSyncMode !== "active") return;
  window.clearTimeout(fileSyncTimer);
  fileSyncTimer = window.setTimeout(() => syncProgressFile(), 220);
}

async function syncProgressFile() {
  if (fileSyncMode !== "active") return;
  if (fileSyncInFlight) {
    fileSyncQueued = true;
    return;
  }
  fileSyncInFlight = true;
  setFileSyncStatus("saving");
  try {
    const response = await fetch(`./api/progress?path=${encodeURIComponent(ACTIVE_PATH_KEY)}`, {
      method: "PUT",
      headers: await getClerkHeaders(true),
      credentials: "same-origin",
      body: JSON.stringify(state),
    });
    if (response.status === 401) {
      storageBackend = "database";
      setFileSyncStatus("auth");
      showAuthGate("Your Clerk session has expired. Sign in again to sync progress.");
      return;
    }
    if (response.status === 503) {
      storageBackend = "database";
      setFileSyncStatus("setup");
      showAuthGate("Hosted setup is incomplete. Add the database and app environment variables, then reload.");
      return;
    }
    if (!response.ok) throw new Error(`Progress file request failed: ${response.status}`);
    storageBackend = response.headers.get("X-Progress-Storage") || storageBackend;
    setFileSyncStatus("active");
  } catch (error) {
    console.warn("Could not sync progress", error);
    setFileSyncStatus("error");
  } finally {
    fileSyncInFlight = false;
    if (fileSyncQueued) {
      fileSyncQueued = false;
      scheduleFileSync();
    }
  }
}

async function loadProgressFromFile() {
  setFileSyncStatus("checking");
  try {
    const response = await fetch(`./api/progress?path=${encodeURIComponent(ACTIVE_PATH_KEY)}`, {
      cache: "no-store",
      credentials: "same-origin",
      headers: await getClerkHeaders(),
    });
    if (response.status === 401) {
      storageBackend = "database";
      setFileSyncStatus("auth");
      showAuthGate("Sign in with Clerk to load your private progress.");
      return null;
    }
    if (response.status === 503) {
      storageBackend = "database";
      setFileSyncStatus("setup");
      showAuthGate("Hosted setup is incomplete. Add the database and app environment variables, then reload.");
      return null;
    }
    if (!response.ok) throw new Error(`Progress endpoint unavailable: ${response.status}`);
    const payload = await response.json();
    const parsed = payload?.state || payload;
    if (payload?.user) setCurrentUser(payload.user);
    storageBackend = response.headers.get("X-Progress-Storage") || "file";
    setFileSyncStatus("active");
    if (parsed && parsed.weekStatus) return normalizeState(parsed);
    return null;
  } catch (error) {
    console.info("Remote persistence is unavailable; using browser storage", error.message);
    setFileSyncStatus("browser");
    return null;
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function switchView(view, updateHash = true) {
  const validViews = ["overview", "roadmap", "diagnostic", "checkin", "library"];
  const nextView = validViews.includes(view) ? view : "overview";
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    const active = panel.dataset.viewPanel === nextView;
    panel.hidden = !active;
    panel.classList.toggle("is-visible", active);
  });
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    if (!button.classList.contains("nav-item")) return;
    const active = button.dataset.viewTarget === nextView;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  const labels = {
    overview: "StackBridge / GCP → AWS",
    roadmap: "data engineering / study sequence",
    diagnostic: "baseline / 16 questions",
    checkin: "evidence log / weekly",
    library: "reference desk / field notes",
  };
  const label = document.querySelector("#topbar-label");
  if (label) label.textContent = labels[nextView];
  if (updateHash) window.history.replaceState(null, "", `#${nextView}`);
  if (nextView === "checkin") renderCheckins();
}

function renderAll() {
  renderOverview();
  renderRoadmap();
  renderDiagnostic();
  renderCheckins();
  renderLibrary();
}

function setupGuardrailCount() {
  return Object.values(state.setup.checks).filter(Boolean).length;
}

function setupReady() {
  return Boolean(state.setup.region && state.setup.plan && setupGuardrailCount() === 4);
}

function renderOverview() {
  const verifiedCount = WEEKS.filter((week) => state.weekStatus[String(week.number)] === "verified").length;
  const percentage = Math.round((verifiedCount / WEEKS.length) * 100);
  const currentWeek = WEEKS.find((week) => state.weekStatus[String(week.number)] !== "verified") || WEEKS[WEEKS.length - 1];
  const nextWeek = currentWeek;
  const diagnosticResult = state.diagnostic.result;

  const orbit = document.querySelector("#progress-orbit");
  if (orbit) {
    orbit.style.setProperty("--progress", `${percentage * 3.6}deg`);
    orbit.style.setProperty("--progress-pct", `${percentage}%`);
    orbit.setAttribute("aria-label", `${percentage} percent of weeks verified`);
  }
  const progressPercent = document.querySelector("#progress-percent");
  const progressLabel = document.querySelector("#progress-label");
  const progressNote = document.querySelector("#progress-note");
  if (progressPercent) progressPercent.textContent = `${percentage}%`;
  if (progressLabel) progressLabel.textContent = `${verifiedCount} / ${WEEKS.length} verified`;
  if (progressNote) progressNote.textContent = verifiedCount === WEEKS.length ? "Readiness gates are now in view." : `Next: Week ${String(nextWeek.number).padStart(2, "0")} — ${nextWeek.title}.`;

  const metricCurrentWeek = document.querySelector("#metric-current-week");
  const metricCurrentTitle = document.querySelector("#metric-current-title");
  const metricVerified = document.querySelector("#metric-verified");
  const metricDiagnostic = document.querySelector("#metric-diagnostic");
  const metricDiagnosticNote = document.querySelector("#metric-diagnostic-note");
  const metricCheckinDay = document.querySelector("#metric-checkin-day");
  if (metricCurrentWeek) metricCurrentWeek.textContent = `W${String(currentWeek.number).padStart(2, "0")}`;
  if (metricCurrentTitle) metricCurrentTitle.textContent = currentWeek.title;
  if (metricVerified) metricVerified.textContent = verifiedCount;
  if (metricDiagnostic) metricDiagnostic.textContent = diagnosticResult ? `${diagnosticResult.score}/16` : "—";
  if (metricDiagnosticNote) metricDiagnosticNote.textContent = diagnosticResult ? `${diagnosticResult.percentage}% baseline` : "baseline not taken";
  if (metricCheckinDay) metricCheckinDay.textContent = state.setup.rhythm || "not set";

  const nextWeekNumber = document.querySelector("#next-week-number");
  const nextTitle = document.querySelector("#next-title");
  const nextSummary = document.querySelector("#next-week-summary");
  const nextDeliverable = document.querySelector("#next-week-deliverable");
  const nextAction = document.querySelector("#next-action");
  if (nextWeekNumber) nextWeekNumber.textContent = `W${String(nextWeek.number).padStart(2, "0")}`;
  if (nextTitle) nextTitle.textContent = nextWeek.title;
  if (nextSummary) nextSummary.textContent = nextWeek.summary;
  if (nextDeliverable) nextDeliverable.textContent = nextWeek.deliverable;
  if (nextAction) {
    nextAction.dataset.prefillWeek = String(nextWeek.number);
    nextAction.innerHTML = `Open this week <span aria-hidden="true">→</span>`;
  }

  const setupRegion = document.querySelector("#setup-region");
  const setupPlan = document.querySelector("#setup-plan");
  const setupExpiry = document.querySelector("#setup-expiry");
  if (setupRegion && document.activeElement !== setupRegion) setupRegion.value = state.setup.region;
  if (setupPlan) setupPlan.value = state.setup.plan;
  if (setupExpiry && document.activeElement !== setupExpiry) setupExpiry.value = state.setup.expiry;
  document.querySelectorAll("[data-setup-check]").forEach((checkbox) => {
    checkbox.checked = Boolean(state.setup.checks[checkbox.dataset.setupCheck]);
  });
  const guardrails = setupGuardrailCount();
  const setupBadge = document.querySelector("#setup-badge");
  const setupProgressNote = document.querySelector("#setup-progress-note");
  if (setupBadge) {
    setupBadge.className = `status-pill ${setupReady() ? "status-verified" : "status-not-started"}`;
    setupBadge.textContent = setupReady() ? "ready" : "not ready";
  }
  if (setupProgressNote) setupProgressNote.textContent = setupReady() ? "Safety gate complete — proceed deliberately." : `${guardrails} / 4 guardrails checked`;

  const stackMap = document.querySelector("#stack-map");
  if (stackMap) {
    stackMap.innerHTML = TRANSFERS.map((item) => `
      <article class="translation-card">
        <span class="translation-gcp">${escapeHTML(item.gcp)}</span>
        <span class="translation-arrow" aria-hidden="true">↘</span>
        <strong class="translation-aws">${escapeHTML(item.aws)}</strong>
        <span class="translation-focus">${escapeHTML(item.focus)}</span>
      </article>
    `).join("");
  }
}

function renderRoadmap() {
  const grid = document.querySelector("#week-grid");
  if (!grid) return;
  const filter = document.querySelector("#week-filter")?.value || "all";
  const weeks = WEEKS.filter((week) => filter === "all" || state.weekStatus[String(week.number)] === filter);
  if (!weeks.length) {
    grid.innerHTML = `<div class="empty-roadmap">No weeks match this filter. Change the view or log your next check-in.</div>`;
    return;
  }
  grid.innerHTML = weeks.map((week) => {
    const status = state.weekStatus[String(week.number)] || "not-started";
    const note = state.weekNotes[String(week.number)] || "";
    const statusOptions = STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${value === status ? "selected" : ""}>${label}</option>`).join("");
    return `
      <article class="week-card status-${status}">
        <div class="week-card-top">
          <span class="week-number">W${String(week.number).padStart(2, "0")}</span>
          <select class="week-status-select" data-week-status="${week.number}" aria-label="Status for Week ${week.number}">${statusOptions}</select>
        </div>
        <div class="week-title-row">
          <h3>${escapeHTML(week.title)}</h3>
          <span class="week-domain">${escapeHTML(week.domain)}</span>
        </div>
        <p class="week-summary">${escapeHTML(week.summary)}</p>
        <div class="week-card-tags">${week.tags.map((tag) => `<span class="service-tag">${escapeHTML(tag)}</span>`).join("")}</div>
        <div class="week-deliverable"><span>field test</span><strong>${escapeHTML(week.deliverable)}</strong></div>
        <details class="week-card-notes">
          <summary>＋ add field note</summary>
          <textarea class="week-note" data-week-note="${week.number}" placeholder="What will you remember from this week?">${escapeHTML(note)}</textarea>
        </details>
        <div class="week-card-footer">
          <a class="guide-link" href="${week.guide}">Open guide ↗</a>
          <button class="button button-quiet button-small" type="button" data-view-target="checkin" data-prefill-week="${week.number}">Log evidence</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderDiagnostic() {
  const form = document.querySelector("#diagnostic-form");
  if (!form) return;
  const grouped = Object.keys(DOMAIN_META).map((domain) => ({
    domain,
    questions: QUESTIONS.filter((question) => question.domain === domain),
  }));
  const answers = state.diagnostic.answers || [];
  const groupsMarkup = grouped.map(({ domain, questions }) => `
    <fieldset class="question-group">
      <div class="question-group-heading"><h2>${DOMAIN_META[domain].label}</h2><span>${DOMAIN_META[domain].short} / ${DOMAIN_META[domain].weight}</span></div>
      <div class="question-list">
        ${questions.map((question) => `
          <div class="question-item">
            <span class="question-number">${String(question.number).padStart(2, "0")}</span>
            <div>
              <p class="question-prompt">${escapeHTML(question.prompt)}</p>
              <select data-diagnostic-answer="${question.number}" aria-label="Answer for question ${question.number}">
                <option value="">Choose an answer</option>
                ${Object.entries(question.options).map(([letter, text]) => `<option value="${letter}" ${answers[question.number - 1] === letter ? "selected" : ""}>${letter}. ${escapeHTML(text)}</option>`).join("")}
              </select>
            </div>
          </div>
        `).join("")}
      </div>
    </fieldset>
  `).join("");

  form.innerHTML = `
    ${groupsMarkup}
    <div class="diagnostic-bottom">
      <label class="field-label">Time taken
        <input id="diagnostic-time" type="text" placeholder="e.g. 18 min" value="${escapeHTML(state.diagnostic.time)}" />
      </label>
      <label class="field-label">Confidence (1–5)
        <select id="diagnostic-confidence">
          <option value="">Choose one</option>
          ${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${String(state.diagnostic.confidence) === String(value) ? "selected" : ""}>${value} — ${["foggy", "emerging", "workable", "solid", "teach it"][value - 1]}</option>`).join("")}
        </select>
      </label>
      <label class="field-label">Most uncertain question numbers
        <input id="diagnostic-uncertain" type="text" placeholder="e.g. 4, 12, 15" value="${escapeHTML(state.diagnostic.uncertain)}" />
      </label>
    </div>
    <div class="diagnostic-submit-row">
      <span id="diagnostic-form-message" class="diagnostic-form-message" aria-live="polite"></span>
      <div class="form-actions">
        <button class="button button-quiet button-small" type="button" data-action="clear-diagnostic">Clear answers</button>
        <button class="button button-primary" type="submit">Score baseline <span aria-hidden="true">↗</span></button>
      </div>
    </div>
  `;

  renderDiagnosticHistory();
}

function scoreDiagnostic(answers) {
  const domainResults = Object.keys(DOMAIN_META).map((domain) => {
    const questions = QUESTIONS.filter((question) => question.domain === domain);
    const score = questions.filter((question) => answers[question.number - 1] === question.answer).length;
    return { domain, score, total: questions.length };
  });
  const score = domainResults.reduce((sum, result) => sum + result.score, 0);
  return {
    score,
    total: QUESTIONS.length,
    percentage: Math.round((score / QUESTIONS.length) * 100),
    domains: domainResults,
    weakest: [...domainResults].sort((a, b) => (a.score / a.total) - (b.score / b.total))[0]?.domain || "ingestion",
  };
}

function renderDiagnosticHistory() {
  const history = document.querySelector("#diagnostic-history");
  if (!history) return;
  const result = state.diagnostic.result;
  const attempts = state.diagnostic.attempts || [];
  if (!result) {
    history.innerHTML = `<div class="diagnostic-history-title">baseline history</div><p class="diagnostic-result-note">No attempt recorded yet. Your first score becomes the starting line, not a verdict.</p>`;
    return;
  }
  const weakest = DOMAIN_META[result.weakest];
  history.innerHTML = `
    <div class="diagnostic-history-title">last baseline · ${escapeHTML(formatDate(result.submittedAt))} · ${attempts.length} attempt${attempts.length === 1 ? "" : "s"}</div>
    <div class="diagnostic-result">
      <div class="diagnostic-result-score">${result.score}<small> / ${result.total}</small></div>
      <div class="domain-score-list">
        ${result.domains.map((domainResult) => `<div class="domain-score-row"><span>${DOMAIN_META[domainResult.domain].short} · ${DOMAIN_META[domainResult.domain].label}</span><strong>${domainResult.score}/${domainResult.total}</strong></div>`).join("")}
      </div>
      <p class="diagnostic-result-note">First emphasis: <strong>${escapeHTML(weakest.label)}</strong>. Use the error log to distinguish vocabulary, mapping, tradeoff, operation, and reading errors.</p>
    </div>
  `;
}

function renderCheckins() {
  const select = document.querySelector("#checkin-week");
  if (select) {
    select.innerHTML = WEEKS.map((week) => `<option value="${week.number}">W${String(week.number).padStart(2, "0")} — ${escapeHTML(week.title)}</option>`).join("");
    select.value = String(checkinSelectedWeek);
  }
  const history = document.querySelector("#checkin-history");
  const count = document.querySelector("#checkin-count");
  if (count) count.textContent = `${state.checkins.length} check-in${state.checkins.length === 1 ? "" : "s"}`;
  if (!history) return;
  if (!state.checkins.length) {
    history.innerHTML = `<div class="empty-history">Your trail is empty. After your first study block, record the artifact, the friction, and the next commitment here.</div>`;
    return;
  }
  history.innerHTML = state.checkins.slice(0, 8).map((entry) => `
    <article class="checkin-entry">
      <div class="checkin-entry-head"><strong>W${String(entry.week).padStart(2, "0")} · ${escapeHTML(entry.weekTitle || "field session")}</strong><button class="checkin-entry-delete" type="button" data-delete-checkin="${escapeHTML(entry.id)}">remove</button></div>
      <div class="checkin-entry-meta"><span>${escapeHTML(entry.dates || formatDate(entry.createdAt))}</span><span>${escapeHTML(entry.hours || "—")} hrs · confidence ${escapeHTML(entry.confidence || "—")}/5</span></div>
      <p>${escapeHTML(entry.learning || entry.next || "Evidence recorded.")}</p>
    </article>
  `).join("");
}

function renderLibrary() {
  const core = document.querySelector("#core-links");
  const official = document.querySelector("#official-links");
  const renderResources = (resources) => resources.map((resource) => {
    const external = resource.href.startsWith("http");
    return `
      <a class="resource-item" href="${resource.href}" ${external ? 'target="_blank" rel="noreferrer"' : ""}>
        <span class="resource-number">${escapeHTML(resource.number)}</span>
        <span><strong>${escapeHTML(resource.title)}</strong><small>${escapeHTML(resource.description)}</small></span>
        <span class="resource-type">${escapeHTML(resource.type)} ↗</span>
      </a>
    `;
  }).join("");
  if (core) core.innerHTML = renderResources(CORE_RESOURCES);
  if (official) official.innerHTML = renderResources(OFFICIAL_RESOURCES);
}

function collectDiagnosticAnswers() {
  return QUESTIONS.map((question) => document.querySelector(`[data-diagnostic-answer="${question.number}"]`)?.value || "");
}

function handleDiagnosticSubmit(event) {
  event.preventDefault();
  const answers = collectDiagnosticAnswers();
  const message = document.querySelector("#diagnostic-form-message");
  if (answers.some((answer) => !answer)) {
    if (message) message.textContent = "Answer all 16 questions before scoring the baseline.";
    return;
  }
  const result = scoreDiagnostic(answers);
  const attempt = {
    ...result,
    submittedAt: new Date().toISOString(),
    time: document.querySelector("#diagnostic-time")?.value.trim() || "",
    confidence: document.querySelector("#diagnostic-confidence")?.value || "",
    uncertain: document.querySelector("#diagnostic-uncertain")?.value.trim() || "",
  };
  state.diagnostic = {
    ...state.diagnostic,
    answers,
    time: attempt.time,
    confidence: attempt.confidence,
    uncertain: attempt.uncertain,
    result: attempt,
    attempts: [...(state.diagnostic.attempts || []), attempt],
  };
  saveState("baseline saved");
  renderDiagnostic();
  renderOverview();
  showToast(`Baseline saved: ${result.score}/${result.total}.`);
}

function handleCheckinSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const week = Number(formData.get("week"));
  const learning = String(formData.get("learning") || "").trim();
  const next = String(formData.get("next") || "").trim();
  if (!learning || !next) {
    showToast("Add what you completed and a specific next commitment.");
    return;
  }
  const weekMeta = WEEKS.find((item) => item.number === week) || WEEKS[0];
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    week,
    weekTitle: weekMeta.title,
    dates: String(formData.get("dates") || "").trim(),
    hours: String(formData.get("hours") || "").trim(),
    account: String(formData.get("account") || "").trim(),
    rhythm: String(formData.get("rhythm") || "").trim(),
    learning,
    evidence: String(formData.get("evidence") || "").trim(),
    score: String(formData.get("score") || "").trim(),
    confidence: String(formData.get("confidence") || "").trim(),
    unclear: String(formData.get("unclear") || "").trim(),
    next,
  };
  state.checkins.unshift(entry);
  if (entry.rhythm) state.setup.rhythm = entry.rhythm;
  if (state.weekStatus[String(week)] === "not-started") state.weekStatus[String(week)] = "studying";
  checkinSelectedWeek = week;
  saveState("check-in saved");
  form.reset();
  renderAll();
  switchView("checkin");
  showToast("Check-in saved. The next commitment is now visible.");
}

function exportBackup() {
  const payload = { ...state, exportedAt: new Date().toISOString(), app: "stackbridge" };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stackbridge-gcp-to-aws-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup downloaded.");
}

function importBackup(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || typeof parsed !== "object" || !parsed.weekStatus) throw new Error("Not a dashboard backup");
      state = normalizeState(parsed);
      saveState("backup imported");
      renderAll();
      showToast("Backup imported.");
    } catch (error) {
      showToast("That file is not a valid dashboard backup.");
    }
  });
  reader.readAsText(file);
}

async function logoutHosted() {
  const previousStorageKey = activeStorageKey();
  try {
    if (clerk?.signOut) await clerk.signOut();
  } catch (error) {
    console.info("Could not sign out of Clerk", error.message);
  }
  setCurrentUser(null);
  window.localStorage.removeItem(previousStorageKey);
  state = createDefaultState();
  storageBackend = clerkReady ? "database" : "browser";
  setFileSyncStatus(clerkReady ? "auth" : "browser");
  setAuthMode("login");
  renderAll();
  if (clerkReady) showAuthGate("Sign in with Clerk to load your private path.");
}

function resetApp() {
  if (!window.confirm("Reset all locally saved dashboard progress, notes, diagnostic results, and check-ins?")) return;
  state = createDefaultState();
  checkinSelectedWeek = 0;
  saveState("dashboard reset", false);
  renderAll();
  switchView("overview");
  showToast("Dashboard reset.");
}

function handleClick(event) {
  if (event.target.closest("#theme-toggle")) {
    toggleTheme();
    return;
  }

  const authModeButton = event.target.closest("[data-auth-mode]");
  if (authModeButton) {
    setAuthMode(authModeButton.dataset.authMode);
    return;
  }

  const viewButton = event.target.closest("[data-view-target]");
  if (viewButton) {
    if (viewButton.dataset.prefillWeek) checkinSelectedWeek = Number(viewButton.dataset.prefillWeek);
    switchView(viewButton.dataset.viewTarget);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === "save-file") {
      if (fileSyncMode === "active") {
        syncProgressFile().then(() => {
          if (fileSyncMode === "active") {
            showToast(storageBackend === "database" ? "Progress synced to Postgres." : "Progress written to progress.json.");
          }
        });
      } else {
        exportBackup();
      }
    }
    if (action === "use-local") {
      setCurrentUser(null);
      storageBackend = "browser";
      hideAuthGate();
      setFileSyncStatus("browser");
      renderAll();
      showToast("Using local browser storage.");
    }
    if (action === "logout") {
      logoutHosted();
    }
    if (action === "import") document.querySelector("#import-file")?.click();
    if (action === "reset") resetApp();
    if (action === "clear-diagnostic") {
      state.diagnostic.answers = Array(QUESTIONS.length).fill("");
      state.diagnostic.time = "";
      state.diagnostic.confidence = "";
      state.diagnostic.uncertain = "";
      saveState("diagnostic cleared");
      renderDiagnostic();
    }
    return;
  }

  const deleteButton = event.target.closest("[data-delete-checkin]");
  if (deleteButton) {
    const id = deleteButton.dataset.deleteCheckin;
    state.checkins = state.checkins.filter((entry) => entry.id !== id);
    saveState("check-in removed");
    renderCheckins();
  }
}

function handleChange(event) {
  const target = event.target;
  if (target.matches("[data-week-status]")) {
    state.weekStatus[target.dataset.weekStatus] = target.value;
    saveState(`Week ${target.dataset.weekStatus} marked ${STATUS_LABELS[target.value].toLowerCase()}`);
    renderOverview();
    renderRoadmap();
    return;
  }
  if (target.matches("[data-setup-check]")) {
    state.setup.checks[target.dataset.setupCheck] = target.checked;
    saveState("safety gate updated");
    renderOverview();
    return;
  }
  if (target.id === "setup-plan") {
    state.setup.plan = target.value;
    saveState("account plan saved");
    renderOverview();
    return;
  }
  if (target.id === "setup-expiry") {
    state.setup.expiry = target.value;
    saveState("expiry date saved");
    renderOverview();
    return;
  }
  if (target.id === "week-filter") {
    renderRoadmap();
    return;
  }
  if (target.matches("[data-diagnostic-answer]")) {
    state.diagnostic.answers[Number(target.dataset.diagnosticAnswer) - 1] = target.value;
    saveState("diagnostic answer saved", false);
    return;
  }
  if (target.id === "diagnostic-confidence") {
    state.diagnostic.confidence = target.value;
    saveState("confidence saved", false);
    return;
  }
  if (target.id === "checkin-week") {
    checkinSelectedWeek = Number(target.value);
  }
}

function handleInput(event) {
  const target = event.target;
  if (target.id === "setup-region") {
    state.setup.region = target.value;
    saveState("Region saved", false);
    updateSetupStatusOnly();
  }
  if (target.matches("[data-week-note]")) {
    state.weekNotes[target.dataset.weekNote] = target.value;
    saveState("field note saved", false);
  }
  if (target.id === "diagnostic-time") {
    state.diagnostic.time = target.value;
    saveState("time saved", false);
  }
  if (target.id === "diagnostic-uncertain") {
    state.diagnostic.uncertain = target.value;
    saveState("uncertain questions saved", false);
  }
}

function updateSetupStatusOnly() {
  const setupBadge = document.querySelector("#setup-badge");
  const setupProgressNote = document.querySelector("#setup-progress-note");
  if (setupBadge) {
    setupBadge.className = `status-pill ${setupReady() ? "status-verified" : "status-not-started"}`;
    setupBadge.textContent = setupReady() ? "ready" : "not ready";
  }
  if (setupProgressNote) setupProgressNote.textContent = setupReady() ? "Safety gate complete — proceed deliberately." : `${setupGuardrailCount()} / 4 guardrails checked`;
}

async function init() {
  setCurrentUser(null);
  setAuthMode("login");
  applyTheme();
  updateNetworkStatus();
  registerServiceWorker();
  setupInstallPrompt();
  window.addEventListener("online", () => {
    updateNetworkStatus();
    if (fileSyncMode === "active") scheduleFileSync();
  });
  window.addEventListener("offline", updateNetworkStatus);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  document.querySelector("#diagnostic-form")?.addEventListener("submit", handleDiagnosticSubmit);
  document.querySelector("#checkin-form")?.addEventListener("submit", handleCheckinSubmit);
  document.querySelector("#import-file")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) importBackup(file);
    event.target.value = "";
  });
  document.querySelectorAll("[data-action=export]").forEach((button) => button.addEventListener("click", exportBackup));
  const hostedAuth = await initClerk();
  if (!hostedAuth) {
    const fileState = await loadProgressFromFile();
    if (fileState) {
      state = fileState;
      window.localStorage.setItem(activeStorageKey(), JSON.stringify(state));
    } else if (fileSyncMode === "active") {
      await syncProgressFile();
    }
  }
  applyTheme();
  const initialView = window.location.hash.slice(1);
  renderAll();
  switchView(initialView || "overview", false);
}

document.addEventListener("DOMContentLoaded", init);
