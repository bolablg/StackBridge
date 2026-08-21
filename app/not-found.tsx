import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import AuthenticatedPageShell from "./authenticated-page-shell";
import { renderDashboard } from "./dashboard-entry";
import { getAccessDecision } from "../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../lib/server/auth";
import { isLocalMode } from "../lib/server/config";

export default async function NotFound() {
  let shellIdentity = { clerkEnabled: false, displayName: "Local learner", isAdmin: false };

  if (!isLocalMode()) {
    if (!hostedAuthConfigured()) return renderDashboard();
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) return renderDashboard();
    const session = await getAppSession();
    if (!session) return renderDashboard();
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (access.status !== "allowed") return renderDashboard();
    shellIdentity = { clerkEnabled: true, displayName: access.displayName, isAdmin: access.isAdmin };
  }

  return (
    <AuthenticatedPageShell
      clerkEnabled={shellIdentity.clerkEnabled}
      contextLabel="page not found"
      displayName={shellIdentity.displayName}
      isAdmin={shellIdentity.isAdmin}
    >
      <section className="not-found-page">
        <div className="eyebrow"><span className="eyebrow-line" /> StackBridge / route unavailable</div>
        <p className="not-found-code">404</p>
        <h1>This bridge ends here.</h1>
        <p>The address may be outdated, or the path has not been published yet. Return to the path library and choose an available transition.</p>
        <div className="not-found-actions">
          <Link className="button button-primary" href="/data-engineering">Browse data engineering paths</Link>
          <Link className="button button-quiet" href="/">Return to overview</Link>
        </div>
      </section>
    </AuthenticatedPageShell>
  );
}

