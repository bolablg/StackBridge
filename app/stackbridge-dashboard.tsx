"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  DOMAIN_META,
  QUESTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  TRANSFERS,
  WEEKS,
  type WeekStatus,
} from "../lib/content";
import { Show, UserButton, useAuth, useUser } from "@clerk/nextjs";
import AccessGate from "./access-gate";
import ClerkAuthPanel from "./clerk-auth-panel";

const LEGACY_STORAGE_KEY = "aws-dea-dashboard-v1";
const PATH_KEY = "gcp-to-aws-data-engineer";

type View = "overview" | "roadmap" | "diagnostic" | "checkin" | "library";

type DashboardState = {
  version: 1;
  pathKey: string;
  weekStatus: Record<string, WeekStatus>;
  weekNotes: Record<string, string>;
  setup: {
    region: string;
    plan: string;
    expiry: string;
    rhythm: string;
    checks: { rootMfa: boolean; nonRoot: boolean; budget: boolean; noOrg: boolean };
  };
  diagnostic: {
    answers: string[];
    time: string;
    confidence: string;
    uncertain: string;
    result: DiagnosticResult | null;
    attempts: DiagnosticResult[];
  };
  checkins: Checkin[];
  preferences: { theme: "light" | "dark" };
};

type DiagnosticResult = {
  score: number;
  total: number;
  percentage: number;
  submittedAt: string;
  time: string;
  confidence: string;
  uncertain: string;
  byDomain: Record<string, { score: number; total: number; percentage: number }>;
};

type Checkin = {
  id: string;
  createdAt: string;
  week: number;
  weekTitle: string;
  dates: string;
  hours: string;
  account: string;
  rhythm: string;
  learning: string;
  evidence: string;
  score: string;
  confidence: string;
  unclear: string;
  next: string;
};

type AuthState = {
  clerkEnabled: boolean;
  isLoaded: boolean;
  userId: string | null;
  displayName: string;
  getToken?: () => Promise<string | null>;
};

type AccessPayload = {
  status: "allowed" | "pending" | "denied" | "not_requested";
  isAdmin: boolean;
  email: string;
  displayName: string;
  adminEmail: string;
  requestId?: string;
};

function createDefaultState(): DashboardState {
  return {
    version: 1,
    pathKey: PATH_KEY,
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

function normalizeState(value: unknown): DashboardState {
  const defaults = createDefaultState();
  const parsed = value && typeof value === "object" ? value as Partial<DashboardState> : {};
  return {
    ...defaults,
    ...parsed,
    pathKey: typeof parsed.pathKey === "string" ? parsed.pathKey : PATH_KEY,
    weekStatus: { ...defaults.weekStatus, ...(parsed.weekStatus || {}) },
    weekNotes: { ...defaults.weekNotes, ...(parsed.weekNotes || {}) },
    setup: {
      ...defaults.setup,
      ...(parsed.setup || {}),
      checks: { ...defaults.setup.checks, ...(parsed.setup?.checks || {}) },
    },
    diagnostic: { ...defaults.diagnostic, ...(parsed.diagnostic || {}) },
    checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
    preferences: {
      ...defaults.preferences,
      ...(parsed.preferences || {}),
      theme: parsed.preferences?.theme === "dark" ? "dark" : "light",
    },
  };
}

function storageKey(userId: string | null) {
  return userId ? `${LEGACY_STORAGE_KEY}:${userId}:${PATH_KEY}` : LEGACY_STORAGE_KEY;
}

function readStoredState(userId: string | null) {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? normalizeState(JSON.parse(raw)) : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function TextButton({ children, onClick, danger = false }: { children: ReactNode; onClick?: () => void; danger?: boolean }) {
  return <button className={`text-button${danger ? " text-button-danger" : ""}`} type="button" onClick={onClick}>{children}</button>;
}

function ClerkHeaderActions({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="clerk-header-actions">
      {isAdmin && <a className="text-button text-button-main" href="/admin/access-requests">Access requests</a>}
      <Show when="signed-out">
        <Link className="text-button text-button-main" href="/sign-in">Sign in</Link>
        <Link className="button button-small button-dark" href="/sign-up">Create account</Link>
      </Show>
      <Show when="signed-in">
        <UserButton appearance={{ elements: { avatarBox: "clerk-avatar" } }} />
      </Show>
    </div>
  );
}

function ClerkAuthGate() {
  return <ClerkAuthPanel mode="sign-in" routing="hash" />;
}

function ClerkDashboard({ isAdmin }: { isAdmin: boolean }) {
  const { isLoaded, userId, getToken } = useAuth();
  const { user } = useUser();
  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Learner";
  const [accessCheck, setAccessCheck] = useState<{ userId: string; decision?: AccessPayload; error?: string } | null>(null);

  useEffect(() => {
    const activeUserId = typeof userId === "string" ? userId : "";
    if (!isLoaded || !activeUserId) return;
    let cancelled = false;

    async function checkAccess() {
      try {
        const response = await fetch("/api/access", { cache: "no-store" });
        const payload = await response.json() as AccessPayload & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not verify access.");
        if (!cancelled) setAccessCheck({ userId: activeUserId, decision: payload });
      } catch (error) {
        if (!cancelled) setAccessCheck({ userId: activeUserId, error: error instanceof Error ? error.message : "Could not verify access." });
      }
    }

    void checkAccess();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  const currentAccess = userId && accessCheck?.userId === userId ? accessCheck : null;
  if (userId && !currentAccess) return <div className="app-loading">Checking your StackBridge access…</div>;
  if (userId && currentAccess?.error) {
    return <div className="app-loading"><span>{currentAccess.error} Please reload and try again.</span></div>;
  }
  if (userId && currentAccess?.decision && currentAccess.decision.status !== "allowed") {
    return <AccessGate {...currentAccess.decision} status={currentAccess.decision.status} />;
  }

  const auth: AuthState = { clerkEnabled: true, isLoaded, userId: userId || null, displayName, getToken };
  return <DashboardCore auth={auth} isAdmin={currentAccess?.decision?.isAdmin || isAdmin} />;
}

export default function StackBridgeDashboard({ clerkEnabled, isAdmin = false }: { clerkEnabled: boolean; isAdmin?: boolean }) {
  return clerkEnabled ? <ClerkDashboard isAdmin={isAdmin} /> : <DashboardCore auth={{ clerkEnabled: false, isLoaded: true, userId: null, displayName: "" }} isAdmin={false} />;
}

function DashboardCore({ auth, isAdmin }: { auth: AuthState; isAdmin: boolean }) {
  const [state, setState] = useState<DashboardState>(() => createDefaultState());
  const [view, setView] = useState<View>("overview");
  const [filter, setFilter] = useState<"all" | WeekStatus>("all");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [toast, setToast] = useState("");
  const [syncStatus, setSyncStatus] = useState(auth.clerkEnabled ? "auth" : "browser");
  const [hydrated, setHydrated] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [diagnosticDomain, setDiagnosticDomain] = useState("all");
  const [importInputKey, setImportInputKey] = useState(0);
  const [online, setOnline] = useState(true);
  const syncTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const tokenGetter = auth.getToken;

  const announce = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const changeView = useCallback((nextView: View) => {
    setView(nextView);
    window.history.replaceState(null, "", `#${nextView}`);
  }, []);

  const getHeaders = useCallback(async (json = false) => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (json) headers["Content-Type"] = "application/json";
    const token = tokenGetter ? await tokenGetter() : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [tokenGetter]);

  useEffect(() => {
    const updateOnlineState = () => setOnline(navigator.onLine !== false);
    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useEffect(() => {
    if (auth.clerkEnabled && !auth.isLoaded) return;
    const localState = readStoredState(auth.userId);
    // This effect intentionally hydrates state from the browser/database when the signed-in identity changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(localState);
    setHydrated(true);
    setRemoteReady(!auth.clerkEnabled || !auth.userId);
    const hash = window.location.hash.slice(1) as View;
    if (["overview", "roadmap", "diagnostic", "checkin", "library"].includes(hash)) setView(hash);

    if (!auth.userId || !auth.getToken) {
      setSyncStatus(auth.clerkEnabled ? "auth" : "browser");
      return;
    }

    let cancelled = false;
    setSyncStatus("checking");
    void (async () => {
      try {
        const response = await fetch(`/api/progress?path=${encodeURIComponent(PATH_KEY)}`, {
          cache: "no-store",
          credentials: "same-origin",
          headers: await getHeaders(),
        });
        if (response.status === 401) {
          setSyncStatus("auth");
          return;
        }
        if (response.status === 503) {
          setSyncStatus("setup");
          return;
        }
        if (!response.ok) throw new Error(`Progress request failed: ${response.status}`);
        const payload = await response.json() as { state?: unknown };
        if (!cancelled && payload.state) {
          const remoteState = normalizeState(payload.state);
          setState(remoteState);
          window.localStorage.setItem(storageKey(auth.userId), JSON.stringify(remoteState));
        }
        if (!cancelled) {
          setRemoteReady(true);
          setSyncStatus("active");
        }
      } catch (error) {
        if (!cancelled) setSyncStatus("error");
        console.info("StackBridge hosted progress unavailable", error);
      }
    })();
    return () => { cancelled = true; };
  }, [auth.clerkEnabled, auth.getToken, auth.isLoaded, auth.userId, getHeaders]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(auth.userId), JSON.stringify(state));
    if (!auth.userId || !auth.getToken || !remoteReady) return;
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      void (async () => {
        setSyncStatus("saving");
        try {
          const response = await fetch(`/api/progress?path=${encodeURIComponent(PATH_KEY)}`, {
            method: "PUT",
            credentials: "same-origin",
            headers: await getHeaders(true),
            body: JSON.stringify(state),
          });
          if (response.status === 401) setSyncStatus("auth");
          else if (response.status === 503) setSyncStatus("setup");
          else if (!response.ok) throw new Error(`Progress save failed: ${response.status}`);
          else setSyncStatus("active");
        } catch (error) {
          setSyncStatus("error");
          console.info("StackBridge progress save unavailable", error);
        }
      })();
    }, 350);
    return () => { if (syncTimer.current) window.clearTimeout(syncTimer.current); };
  }, [auth.getToken, auth.userId, getHeaders, hydrated, remoteReady, state]);

  useEffect(() => {
    document.body.dataset.theme = state.preferences.theme;
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, [state.preferences.theme]);

  const verifiedCount = WEEKS.filter((week) => state.weekStatus[String(week.number)] === "verified").length;
  const completion = percent(verifiedCount, WEEKS.length);
  const nextWeek = WEEKS.find((week) => state.weekStatus[String(week.number)] !== "verified") || WEEKS[WEEKS.length - 1];
  const filteredWeeks = filter === "all" ? WEEKS : WEEKS.filter((week) => state.weekStatus[String(week.number)] === filter);
  const setupCount = Object.values(state.setup.checks).filter(Boolean).length;
  const setupReady = Boolean(state.setup.region && state.setup.plan && setupCount === 4);
  const authLoading = auth.clerkEnabled && !auth.isLoaded;
  const authRequired = auth.clerkEnabled && auth.isLoaded && !auth.userId;

  function updateState(updater: (previous: DashboardState) => DashboardState, message?: string) {
    setState(updater);
    if (message) announce(message);
  }

  function setWeekStatus(week: number, status: WeekStatus) {
    updateState((previous) => ({ ...previous, weekStatus: { ...previous.weekStatus, [String(week)]: status } }), `Week ${week} marked ${STATUS_LABELS[status].toLowerCase()}`);
  }

  function setWeekNote(week: number, note: string) {
    updateState((previous) => ({ ...previous, weekNotes: { ...previous.weekNotes, [String(week)]: note } }));
  }

  function toggleTheme() {
    updateState((previous) => ({ ...previous, preferences: { theme: previous.preferences.theme === "dark" ? "light" : "dark" } }), "Theme preference saved");
  }

  function handleDiagnosticSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answers = state.diagnostic.answers;
    if (answers.some((answer) => !answer)) {
      announce("Answer all 16 questions before scoring the baseline.");
      return;
    }
    const domains = Object.keys(DOMAIN_META);
    const byDomain = Object.fromEntries(domains.map((domain) => [domain, { score: 0, total: 0, percentage: 0 }])) as DiagnosticResult["byDomain"];
    let score = 0;
    QUESTIONS.forEach((question, index) => {
      const bucket = byDomain[question.domain];
      bucket.total += 1;
      if (answers[index] === question.answer) {
        bucket.score += 1;
        score += 1;
      }
    });
    Object.values(byDomain).forEach((bucket) => { bucket.percentage = percent(bucket.score, bucket.total); });
    const result: DiagnosticResult = {
      score,
      total: QUESTIONS.length,
      percentage: percent(score, QUESTIONS.length),
      submittedAt: new Date().toISOString(),
      time: state.diagnostic.time,
      confidence: state.diagnostic.confidence,
      uncertain: state.diagnostic.uncertain,
      byDomain,
    };
    updateState((previous) => ({
      ...previous,
      diagnostic: { ...previous.diagnostic, result, attempts: [...previous.diagnostic.attempts, result] },
    }), `Baseline saved: ${score}/${QUESTIONS.length}`);
  }

  function handleCheckinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const week = Number(form.get("week"));
    const learning = String(form.get("learning") || "").trim();
    const next = String(form.get("next") || "").trim();
    if (!learning || !next) {
      announce("Add what you completed and a specific next commitment.");
      return;
    }
    const weekMeta = WEEKS.find((item) => item.number === week) || WEEKS[0];
    const checkin: Checkin = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      week,
      weekTitle: weekMeta.title,
      dates: String(form.get("dates") || "").trim(),
      hours: String(form.get("hours") || "").trim(),
      account: String(form.get("account") || "").trim(),
      rhythm: String(form.get("rhythm") || "").trim(),
      learning,
      evidence: String(form.get("evidence") || "").trim(),
      score: String(form.get("score") || "").trim(),
      confidence: String(form.get("confidence") || "").trim(),
      unclear: String(form.get("unclear") || "").trim(),
      next,
    };
    updateState((previous) => ({
      ...previous,
      checkins: [checkin, ...previous.checkins],
      setup: { ...previous.setup, rhythm: checkin.rhythm || previous.setup.rhythm },
      weekStatus: { ...previous.weekStatus, [String(week)]: previous.weekStatus[String(week)] === "not-started" ? "studying" : previous.weekStatus[String(week)] },
    }), "Check-in saved");
    event.currentTarget.reset();
    setSelectedWeek(week);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString(), app: "stackbridge" }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stackbridge-gcp-to-aws-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    announce("Backup downloaded.");
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object" || !parsed.weekStatus) throw new Error("Invalid backup");
        setState(normalizeState(parsed));
        announce("Backup imported.");
      } catch {
        announce("That file is not a valid StackBridge backup.");
      }
      setImportInputKey((key) => key + 1);
    });
    reader.readAsText(file);
  }

  function resetApp() {
    if (!window.confirm("Reset all locally saved progress, notes, diagnostic results, and check-ins?")) return;
    setState(createDefaultState());
    announce("Dashboard reset.");
  }

  if (authLoading) return <div className="app-loading">Loading your StackBridge path…</div>;

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar" aria-label="StackBridge navigation">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">SB</div>
            <div>
              <div className="brand-title">STACKBRIDGE</div>
              <div className="brand-subtitle">cross-platform / 01</div>
            </div>
          </div>
          <div className="sidebar-stamp" aria-label="Current learning path"><span>GCP</span><span className="stamp-arrow">→</span><span>AWS</span></div>
          <nav className="primary-nav" aria-label="Primary">
            {([
              ["overview", "⌂", "Overview", "your runway"],
              ["roadmap", "↗", "Roadmap", "weeks 00—12"],
              ["diagnostic", "?", "Diagnostic", "baseline signal"],
              ["checkin", "＋", "Check-in", "capture the work"],
              ["library", "▤", "Library", "guides & links"],
            ] as Array<[View, string, string, string]>).map(([target, icon, title, subtitle]) => (
              <button key={target} className={`nav-item${view === target ? " is-active" : ""}`} type="button" onClick={() => changeView(target)} aria-current={view === target ? "page" : undefined}>
                <span className="nav-icon" aria-hidden="true">{icon}</span><span><strong>{title}</strong><small>{subtitle}</small></span>
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-status"><span className={`status-dot status-dot-${syncStatus}`} /> <span>{syncStatus === "active" ? "auto-save → database" : syncStatus === "saving" ? "writing to database" : syncStatus === "browser" ? "browser storage only" : syncStatus === "auth" ? "sign-in required" : syncStatus === "setup" ? "hosted setup needed" : syncStatus === "error" ? "sync needs attention" : "sync checking"}</span></div>
            <p>Your progress stays private. StackBridge keeps a browser copy and syncs your enrolled path when hosted auth is available.</p>
            <div className="sidebar-tools">
              <TextButton onClick={exportBackup}>Save backup</TextButton>
              <label className="text-button" htmlFor={`import-file-${importInputKey}`}>Import<input key={importInputKey} id={`import-file-${importInputKey}`} type="file" accept="application/json" hidden onChange={importBackup} /></label>
              <TextButton danger onClick={resetApp}>Reset</TextButton>
            </div>
          </div>
        </aside>

        <main id="main-content" className="main-content">
          <header className="topbar">
            <div className="topbar-context"><span className="live-dot" aria-hidden="true" /><span>{view === "overview" ? "StackBridge / GCP → AWS" : view === "roadmap" ? "data engineering / study sequence" : view === "diagnostic" ? "baseline / 16 questions" : view === "checkin" ? "evidence log / weekly" : "reference desk / field notes"}</span></div>
            <div className="topbar-actions">
              <span className="network-status"><span className="network-dot" /> {online ? "online" : "offline · local save"}</span>
              <span className="save-state">{auth.userId ? auth.displayName : "saved locally"}</span>
              {auth.clerkEnabled ? <ClerkHeaderActions isAdmin={isAdmin} /> : <span className="local-mode-label">local mode</span>}
              <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Switch theme">{state.preferences.theme === "dark" ? "☼" : "◐"}</button>
              <button className="button button-small button-dark" type="button" onClick={() => changeView("checkin")}><span aria-hidden="true">＋</span> Log check-in</button>
            </div>
          </header>

          {view === "overview" && <OverviewView state={state} completion={completion} verifiedCount={verifiedCount} nextWeek={nextWeek} setupCount={setupCount} setupReady={setupReady} onView={changeView} onUpdate={updateState} />}
          {view === "roadmap" && <RoadmapView state={state} filter={filter} filteredWeeks={filteredWeeks} onFilter={setFilter} onStatus={setWeekStatus} onNote={setWeekNote} onView={changeView} />}
          {view === "diagnostic" && <DiagnosticView state={state} domain={diagnosticDomain} onDomain={setDiagnosticDomain} onUpdate={updateState} onSubmit={handleDiagnosticSubmit} />}
          {view === "checkin" && <CheckinView state={state} selectedWeek={selectedWeek} onWeek={setSelectedWeek} onDelete={(id) => updateState((previous) => ({ ...previous, checkins: previous.checkins.filter((item) => item.id !== id) }), "Check-in removed")} onSubmit={handleCheckinSubmit} />}
          {view === "library" && <LibraryView />}
        </main>
      </div>
      {authRequired && <ClerkAuthGate />}
      {toast && <div className="toast is-visible" role="status">{toast}</div>}
    </>
  );
}

function OverviewView({ state, completion, verifiedCount, nextWeek, setupCount, setupReady, onView, onUpdate }: { state: DashboardState; completion: number; verifiedCount: number; nextWeek: typeof WEEKS[number]; setupCount: number; setupReady: boolean; onView: (view: View) => void; onUpdate: (updater: (previous: DashboardState) => DashboardState, message?: string) => void }) {
  const orbitStyle = { "--progress": `${completion * 3.6}deg`, "--progress-pct": `${completion}%` } as CSSProperties;
  return (
    <section className="view is-visible">
      <div className="hero-grid">
        <div className="hero-copy reveal reveal-one">
          <div className="eyebrow"><span className="eyebrow-line" /> StackBridge / DEA-C01</div>
          <h1>Carry your data-engineering judgment <em>across clouds.</em></h1>
          <p className="hero-lede">A working path for a Google Cloud Professional Data Engineer moving into AWS. Keep the engineering judgment; translate the platform boundaries, operating model, and exam language.</p>
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={() => onView("roadmap")}>View study sequence <span aria-hidden="true">↗</span></button><button className="button button-quiet" type="button" onClick={() => onView("diagnostic")}>Take baseline</button></div>
        </div>
        <div className="progress-card reveal reveal-two">
          <div className="progress-orbit" id="progress-orbit" style={orbitStyle} aria-label={`${completion}% of weeks verified`}><div className="progress-orbit-inner"><span>completion</span><strong>{completion}%</strong><small>{verifiedCount} / {WEEKS.length} verified</small></div></div>
          <p className="progress-note">{verifiedCount === WEEKS.length ? "Readiness gates are now in view." : `Next: Week ${String(nextWeek.number).padStart(2, "0")} — ${nextWeek.title}.`}</p>
        </div>
      </div>
      <div className="proof-strip"><div><strong>13</strong><span>milestones</span></div><div><strong>4</strong><span>exam domains</span></div><div><strong>1</strong><span>working path</span></div><div><strong>0</strong><span>credential shortcuts</span></div></div>
      <div className="metric-row"><Metric label="Current week" value={`W${String(nextWeek.number).padStart(2, "0")}`} note={nextWeek.title} /><Metric label="Verified" value={String(verifiedCount)} note={`of ${WEEKS.length} milestones`} /><Metric label="Baseline" value={state.diagnostic.result ? `${state.diagnostic.result.score}/16` : "—"} note={state.diagnostic.result ? `${state.diagnostic.result.percentage}% signal` : "not taken yet"} /><Metric label="Rhythm" value={state.setup.rhythm || "—"} note="weekly commitment" /></div>
      <div className="dashboard-grid">
        <section className="panel next-panel"><div className="panel-kicker"><span className="kicker-number">NEXT</span> the immediate move</div><div className="next-index">W{String(nextWeek.number).padStart(2, "0")}</div><h2>{nextWeek.title}</h2><p>{nextWeek.summary}</p><div className="next-deliverable"><span>field test</span><strong>{nextWeek.deliverable}</strong></div><button className="button button-dark" type="button" onClick={() => onView("roadmap")}>Open roadmap <span aria-hidden="true">→</span></button></section>
        <section className="panel setup-panel"><div className="panel-kicker"><span className="kicker-number">W00</span> account &amp; safety</div><div className="section-heading"><div><h2>Earn the right to experiment.</h2><p>Write down the guardrails before the first bucket or warehouse.</p></div><span className={`status-pill ${setupReady ? "status-verified" : "status-not-started"}`}>{setupReady ? "ready" : "not ready"}</span></div><div className="gate-fields"><label className="field-label">Region<input value={state.setup.region} onChange={(event) => onUpdate((previous) => ({ ...previous, setup: { ...previous.setup, region: event.target.value } }))} placeholder="us-east-1" /></label><label className="field-label">Account plan<select value={state.setup.plan} onChange={(event) => onUpdate((previous) => ({ ...previous, setup: { ...previous.setup, plan: event.target.value } }))}><option value="">Select one</option><option>Free Tier</option><option>Paid / budgeted</option><option>Sandbox / organization</option></select></label><label className="field-label">Credit expiry<input type="date" value={state.setup.expiry} onChange={(event) => onUpdate((previous) => ({ ...previous, setup: { ...previous.setup, expiry: event.target.value } }))} /></label></div><div className="gate-checklist">{[["rootMfa", "Root MFA enabled"], ["nonRoot", "Non-root admin works"], ["budget", "Budget alert exists"], ["noOrg", "No unexpected organization"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={state.setup.checks[key as keyof DashboardState["setup"]["checks"]]} onChange={(event) => onUpdate((previous) => ({ ...previous, setup: { ...previous.setup, checks: { ...previous.setup.checks, [key]: event.target.checked } } }))} /><span>{label}</span></label>)}</div><div className="setup-progress-note">{setupReady ? "Safety gate complete — proceed deliberately." : `${setupCount} / 4 guardrails checked`}</div></section>
      </div>
      <section className="panel translation-panel"><div className="section-heading"><div><div className="panel-kicker"><span className="kicker-number">MAP</span> translate the boundaries</div><h2>Your GCP → AWS translation desk.</h2></div><p>Learn the service boundary and the decision behind it—not a list of product names.</p></div><div className="translation-grid">{TRANSFERS.map((item) => <div className="translation-card" key={item.source}><span className="translation-gcp">{item.source}</span><span className="translation-arrow" aria-hidden="true">↘</span><strong className="translation-aws">{item.target}</strong><span className="translation-focus">{item.focus}</span></div>)}</div></section>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function RoadmapView({ state, filter, filteredWeeks, onFilter, onStatus, onNote, onView }: { state: DashboardState; filter: "all" | WeekStatus; filteredWeeks: typeof WEEKS; onFilter: (value: "all" | WeekStatus) => void; onStatus: (week: number, value: WeekStatus) => void; onNote: (week: number, value: string) => void; onView: (view: View) => void }) {
  return <section className="view is-visible"><div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> sequence / 13 milestones</div><h1>The runway</h1><p>Each week has one practical center of gravity. Reading is preparation; evidence is progress.</p></div><div className="page-intro-aside"><span className="big-annotation">01 → 12</span><span>from account<br />safety<br />to readiness<br />decision</span></div></div><div className="roadmap-toolbar"><div className="status-legend">{STATUS_OPTIONS.map(([value, label]) => <span key={value}><i className={`legend-dot legend-${value}`} /> {label}</span>)}</div><label className="filter-label">show<select value={filter} onChange={(event) => onFilter(event.target.value as "all" | WeekStatus)}><option value="all">all weeks</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div className="week-grid">{filteredWeeks.map((week) => { const status = state.weekStatus[String(week.number)] || "not-started"; return <article className="week-card" key={week.number}><div className="week-card-top"><span className="week-number">W{String(week.number).padStart(2, "0")}</span><select className="week-status-select" value={status} onChange={(event) => onStatus(week.number, event.target.value as WeekStatus)} aria-label={`Week ${week.number} status`}>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="week-card-heading"><h2>{week.title}</h2><span>{week.domain}</span></div><p>{week.summary}</p><div className="tag-row">{week.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="week-deliverable"><span>field test</span><strong>{week.deliverable}</strong></div><details className="week-note"><summary>＋ add field note</summary><textarea value={state.weekNotes[String(week.number)] || ""} onChange={(event) => onNote(week.number, event.target.value)} placeholder="What did you observe, build, or decide?" /></details><div className="week-card-actions"><a href={week.guide} target="_blank" rel="noreferrer">open guide ↗</a><button className="button button-outline" type="button" onClick={() => onView("checkin")}>Log evidence</button></div></article>; })}</div></section>;
}

function DiagnosticView({ state, domain, onDomain, onUpdate, onSubmit }: { state: DashboardState; domain: string; onDomain: (value: string) => void; onUpdate: (updater: (previous: DashboardState) => DashboardState, message?: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const questions = domain === "all" ? QUESTIONS : QUESTIONS.filter((question) => question.domain === domain);
  const result = state.diagnostic.result;
  return <section className="view is-visible"><div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> baseline / 16 questions</div><h1>Find the gap.</h1><p>This is a signal, not a readiness claim. Use wrong answers to choose the next field test.</p></div><div className="page-intro-aside"><span className="big-annotation">D1 → D4</span><span>ingestion<br />stores<br />operations<br />security</span></div></div><div className="diagnostic-layout"><aside className="panel diagnostic-side"><div className="panel-kicker"><span className="kicker-number">NOTE</span> baseline posture</div><h2>{result ? `${result.score} / 16` : "Not taken"}</h2><p>{result ? `${result.percentage}% correct. Read the domain breakdown before choosing a week.` : "Complete all 16 questions, then use the score as a starting point—not a verdict."}</p>{result && <div className="diagnostic-history">{Object.entries(result.byDomain).map(([key, value]) => <div className="domain-score" key={key}><div><span>{DOMAIN_META[key as keyof typeof DOMAIN_META].short}</span><strong>{DOMAIN_META[key as keyof typeof DOMAIN_META].label}</strong></div><b>{value.percentage}%</b></div>)}</div>}</aside><form className="panel diagnostic-form" onSubmit={onSubmit}><div className="diagnostic-toolbar"><label className="filter-label">show<select value={domain} onChange={(event) => onDomain(event.target.value)}><option value="all">all domains</option>{Object.entries(DOMAIN_META).map(([key, value]) => <option key={key} value={key}>{value.short} · {value.label}</option>)}</select></label><button className="text-button" type="button" onClick={() => onUpdate((previous) => ({ ...previous, diagnostic: { ...previous.diagnostic, answers: Array(QUESTIONS.length).fill(""), result: null } }), "Diagnostic cleared")}>clear baseline</button></div>{questions.map((question) => <div className="question-item" key={question.number}><div className="question-number">Q{String(question.number).padStart(2, "0")} <span>{DOMAIN_META[question.domain].short}</span></div><p>{question.prompt}</p><select value={state.diagnostic.answers[question.number - 1]} onChange={(event) => onUpdate((previous) => { const answers = [...previous.diagnostic.answers]; answers[question.number - 1] = event.target.value; return { ...previous, diagnostic: { ...previous.diagnostic, answers } }; })}><option value="">Choose one</option>{Object.entries(question.options).map(([key, option]) => <option key={key} value={key}>{key} — {option}</option>)}</select></div>)}<div className="diagnostic-bottom"><label className="field-label">Time taken<input value={state.diagnostic.time} onChange={(event) => onUpdate((previous) => ({ ...previous, diagnostic: { ...previous.diagnostic, time: event.target.value } }))} placeholder="e.g. 24 minutes" /></label><label className="field-label">Confidence<select value={state.diagnostic.confidence} onChange={(event) => onUpdate((previous) => ({ ...previous, diagnostic: { ...previous.diagnostic, confidence: event.target.value } }))}><option value="">Select one</option><option>low</option><option>medium</option><option>high</option></select></label><label className="field-label diagnostic-wide">Uncertain questions<textarea value={state.diagnostic.uncertain} onChange={(event) => onUpdate((previous) => ({ ...previous, diagnostic: { ...previous.diagnostic, uncertain: event.target.value } }))} placeholder="Question numbers and why they felt uncertain" /></label></div><button className="button button-primary" type="submit">Score baseline <span aria-hidden="true">→</span></button></form></div></section>;
}

function CheckinView({ state, selectedWeek, onWeek, onDelete, onSubmit }: { state: DashboardState; selectedWeek: number; onWeek: (week: number) => void; onDelete: (id: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className="view is-visible"><div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> evidence log / weekly</div><h1>Make the work visible.</h1><p>A short record of what moved, what proves it, and what you will do next.</p></div></div><div className="checkin-layout"><form className="panel checkin-form" onSubmit={onSubmit}><div className="panel-kicker"><span className="kicker-number">LOG</span> next field note</div><div className="form-grid-three"><label className="field-label">Week<select name="week" value={selectedWeek} onChange={(event) => onWeek(Number(event.target.value))}>{WEEKS.map((week) => <option value={week.number} key={week.number}>Week {String(week.number).padStart(2, "0")} — {week.title}</option>)}</select></label><label className="field-label">Dates covered<input name="dates" placeholder="Mon–Sun" /></label><label className="field-label">Hours invested<input name="hours" placeholder="e.g. 4.5" /></label></div><div className="form-grid-two"><label className="field-label">What did you learn? <textarea name="learning" required placeholder="Name the decision or service boundary that became clearer." /></label><label className="field-label">Evidence link or artifact <textarea name="evidence" placeholder="Repo, screenshot, query result, notes" /></label></div><div className="form-grid-two"><label className="field-label">What is next? <textarea name="next" required placeholder="Make the next commitment concrete and small." /></label><label className="field-label">Still unclear <textarea name="unclear" placeholder="Question, service, or tradeoff to revisit" /></label></div><div className="form-grid-three"><label className="field-label">Account used<input name="account" placeholder="sandbox / project" /></label><label className="field-label">Study rhythm<input name="rhythm" placeholder="e.g. Tue + Sat" /></label><label className="field-label">Practice score<input name="score" placeholder="optional" /></label></div><div className="form-actions"><button className="button button-primary" type="submit">Save check-in <span aria-hidden="true">→</span></button></div></form><aside className="panel checkin-history-panel"><div className="panel-kicker"><span className="kicker-number">RECENT</span> accountability trail</div><h2>{state.checkins.length ? `${state.checkins.length} check-in${state.checkins.length === 1 ? "" : "s"}` : "No entries yet"}</h2>{state.checkins.length ? <div className="checkin-history">{state.checkins.slice(0, 5).map((entry) => <article className="checkin-entry" key={entry.id}><div className="checkin-entry-top"><span>W{String(entry.week).padStart(2, "0")} · {entry.weekTitle}</span><button className="checkin-entry-delete" type="button" onClick={() => onDelete(entry.id)}>remove</button></div><time>{formatDate(entry.createdAt)}</time><p>{entry.learning}</p><strong>Next: {entry.next}</strong></article>)}</div> : <p>Save one after your first study session. Accountability starts when the next action is written down.</p>}</aside></div></section>;
}

function LibraryView() {
  return <section className="view is-visible"><div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> reference desk / field notes</div><h1>The desk.</h1><p>Use the prepared material as a starting point. The evidence you create is the actual curriculum.</p></div><div className="page-intro-aside"><span className="big-annotation">FIELD KIT</span><span>offline shell<br />optional cloud sync</span></div></div><div className="library-grid"><section className="panel library-primary"><div className="panel-kicker"><span className="kicker-number">CORE</span> start with these</div><ResourceList resources={[{ number: "01", title: "Start Here", description: "Current status, first 30 minutes, and the GCP → AWS map.", href: "/guides/AWS-DATA-ENGINEER-START-HERE.md", type: "local" }, { number: "02", title: "Completion audit", description: "Prepared material versus learner evidence still needed.", href: "/guides/AWS-DATA-ENGINEER-COMPLETION-AUDIT.md", type: "local" }, { number: "03", title: "Study plan", description: "Full sequence, capstone, Dataform/dbt mapping, and gates.", href: "/guides/aws-data-engineer-study-plan.md", type: "local" }, { number: "04", title: "DEA-C01 blueprint", description: "Domains, service priorities, and error taxonomy.", href: "/guides/aws-dea-c01-blueprint.md", type: "local" }]} /></section><section className="panel library-secondary"><div className="panel-kicker"><span className="kicker-number">AWS</span> official doors</div><ResourceList resources={[{ number: "A", title: "AWS exam guide", description: "Current DEA-C01 scope, domains, response types, and revisions.", href: "https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html", type: "AWS" }, { number: "B", title: "Certification preparation", description: "AWS’s current preparation index and official options.", href: "https://aws.amazon.com/certification/certification-prep/", type: "AWS" }, { number: "C", title: "Skill Builder", description: "Search the free DEA-C01 preparation catalog.", href: "https://skillbuilder.aws/", type: "AWS" }, { number: "D", title: "Free Tier", description: "Current account plan, credits, and eligibility information.", href: "https://aws.amazon.com/free/", type: "AWS" }]} /></section><section className="panel dataform-panel"><div className="panel-kicker"><span className="kicker-number">NOTE</span> Dataform → AWS</div><h2>Keep the modeling muscle.</h2><p>There is no exact one-service AWS Dataform clone. Use dbt with Redshift for SQL models, tests, docs, and DAG thinking; learn Glue for the AWS-native ingestion, catalog, ETL, and operations layer.</p><div className="dataform-pair"><span>Dataform</span><span className="pair-arrow">→</span><strong>dbt + Redshift</strong></div><div className="dataform-pair"><span>Composer</span><span className="pair-arrow">→</span><strong>MWAA / Step Functions</strong></div></section><section className="panel rules-panel"><div className="panel-kicker"><span className="kicker-number">RULES</span> keep the sandbox healthy</div><ul className="rules-list"><li><span>01</span><p>Never put credentials, MFA codes, or secret values into StackBridge.</p></li><li><span>02</span><p>Do not mark a week verified until the artifact, evidence, reflection, and teardown exist.</p></li><li><span>03</span><p>Delete temporary AWS resources deliberately; budgets notify, but they do not block spend.</p></li></ul></section></div></section>;
}

function ResourceList({ resources }: { resources: Array<{ number: string; title: string; description: string; href: string; type: string }> }) {
  return <div className="resource-list">{resources.map((resource) => <a className="resource-item" href={resource.href} target="_blank" rel="noreferrer" key={resource.number}><span className="resource-number">{resource.number}</span><span><strong>{resource.title}</strong><small>{resource.description}</small></span><em>{resource.type}</em></a>)}</div>;
}
