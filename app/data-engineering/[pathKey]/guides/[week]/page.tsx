import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { renderDashboard } from "../../../../dashboard-entry";
import { getRouteGuide } from "../../../../../lib/route-guides";
import { getAccessDecision } from "../../../../../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../../../../../lib/server/auth";
import { isLocalMode } from "../../../../../lib/server/config";

type RouteGuideParams = Promise<{ pathKey: string; week: string }>;

function parseWeek(value: string) {
  if (!/^\d{1,2}$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 12 ? parsed : null;
}

export async function generateMetadata({ params }: { params: RouteGuideParams }): Promise<Metadata> {
  const { pathKey, week: weekParam } = await params;
  const weekNumber = parseWeek(weekParam);
  const guide = weekNumber === null ? null : getRouteGuide(pathKey, weekNumber);
  if (!guide) return { title: "Guide not found — StackBridge" };
  return {
    title: `Week ${guide.week.number} · ${guide.week.title} — StackBridge`,
    description: guide.week.summary,
  };
}

export default async function RouteGuidePage({ params }: { params: RouteGuideParams }) {
  const { pathKey, week: weekParam } = await params;
  const weekNumber = parseWeek(weekParam);
  const guide = weekNumber === null ? null : getRouteGuide(pathKey, weekNumber);
  if (!guide) notFound();

  if (!isLocalMode()) {
    if (!hostedAuthConfigured()) return renderDashboard(pathKey);
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) return renderDashboard(pathKey);
    const session = await getAppSession();
    if (!session) return renderDashboard(pathKey);
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (access.status !== "allowed") return renderDashboard(pathKey);
  }

  const { blueprint, week, sourceService, targetService } = guide;
  const previous = week.number > 0 ? blueprint.weeks[week.number - 1] : null;
  const next = week.number < blueprint.weeks.length - 1 ? blueprint.weeks[week.number + 1] : null;
  const pathHref = `/data-engineering/${blueprint.key}`;

  return (
    <main className="guide-page">
      <a className="skip-link" href="#guide-content">Skip to guide</a>
      <div className="guide-page-shell">
        <nav className="guide-toolbar" aria-label="Guide navigation">
          <Link className="guide-toolbar-link" href={`${pathHref}/library`}>← Field library</Link>
          <span className="guide-toolbar-brand">StackBridge <span>/</span> field notes</span>
          <a className="guide-toolbar-link" href={blueprint.target.officialUrl} target="_blank" rel="noreferrer">Official credential ↗</a>
        </nav>

        <div className="guide-layout">
          <aside className="guide-rail">
            <div className="guide-rail-mark" aria-hidden="true">SB</div>
            <div className="guide-rail-kicker">route guide</div>
            <div className="guide-rail-number">W{String(week.number).padStart(2, "0")}</div>
            <p>Read for the decision. Practice for the evidence. Record what became clear.</p>
            <Link className="guide-rail-link" href={pathHref}>← {blueprint.source.short} → {blueprint.target.short} path</Link>
          </aside>

          <article className="guide-article" id="guide-content">
            <header className="guide-header">
              <div className="eyebrow"><span className="eyebrow-line" /> {blueprint.source.short} → {blueprint.target.short} / week {String(week.number).padStart(2, "0")}</div>
              <h1>{week.title}</h1>
              <p className="guide-dek">{week.summary}</p>
              <div className="route-guide-translation" aria-label="Service translation">
                <span><small>familiar anchor</small><strong>{sourceService}</strong></span>
                <b aria-hidden="true">→</b>
                <span><small>target field</small><strong>{targetService}</strong></span>
              </div>
            </header>

            <div className="guide-markdown route-guide-body">
              <section>
                <h2>Outcome</h2>
                <p>{guide.outcome}</p>
              </section>
              <section>
                <h2>Decisions to make</h2>
                <ul>{guide.decisions.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
              <section>
                <h2>Field lab</h2>
                <ol>{guide.labSteps.map((item) => <li key={item}>{item}</li>)}</ol>
                <blockquote><p>Use the target platform&apos;s current official documentation for console labels, APIs, quotas, and pricing. The durable skill is the decision boundary, not a screenshot sequence.</p></blockquote>
              </section>
              <section>
                <h2>Evidence gate</h2>
                <ul>{guide.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
                <p><strong>Milestone deliverable:</strong> {week.deliverable}.</p>
              </section>
              <section>
                <h2>Cost and security stop-point</h2>
                <ul>{guide.teardown.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
              <section>
                <h2>Official doors</h2>
                <ul>
                  <li><a href={blueprint.target.officialUrl} target="_blank" rel="noreferrer">{blueprint.target.credential}</a></li>
                  <li><a href={blueprint.target.preparationUrl} target="_blank" rel="noreferrer">{blueprint.target.label} preparation resources</a></li>
                </ul>
              </section>
            </div>

            <footer className="guide-footer">
              <div className="guide-footer-note"><span className="guide-footer-mark" aria-hidden="true">↳</span><span>This route-aware guide is rendered inside StackBridge. Reading it does not mark the milestone complete.</span></div>
              <div className="guide-neighbors" aria-label="Adjacent guides">
                {previous ? <Link className="guide-neighbor guide-neighbor-previous" href={previous.guide}><span>← previous</span><strong>W{String(previous.number).padStart(2, "0")} · {previous.title}</strong></Link> : <span />}
                {next ? <Link className="guide-neighbor guide-neighbor-next" href={next.guide}><span>next →</span><strong>W{String(next.number).padStart(2, "0")} · {next.title}</strong></Link> : <span />}
              </div>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
