import { auth } from "@clerk/nextjs/server";
import type { ComponentType } from "react";
import AccessGate from "./access-gate";
import StackBridgeDashboard from "./stackbridge-dashboard";
import { getAccessDecision } from "../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../lib/server/auth";
import { isLocalMode } from "../lib/server/config";

type DashboardProps = {
  clerkEnabled: boolean;
  isAdmin?: boolean;
  pathKey?: string;
};

// The client dashboard is shared by the route tree; keep the path context on
// the renderer boundary so path-aware clients can consume the canonical key.
const PathAwareDashboard = StackBridgeDashboard as ComponentType<DashboardProps>;

/**
 * Shared server entry for the home route and the path-aware route tree.
 * Keeping auth here means deep links and in-app links have the exact same
 * access behavior as the homepage.
 */
export async function renderDashboard(pathKey?: string) {
  if (isLocalMode()) return <PathAwareDashboard clerkEnabled={false} pathKey={pathKey} />;
  if (!hostedAuthConfigured()) return <HostedConfigurationMessage />;

  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return <PathAwareDashboard clerkEnabled pathKey={pathKey} />;

  const session = await getAppSession();
  if (!session) return <PathAwareDashboard clerkEnabled pathKey={pathKey} />;

  const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
  if (access.status !== "allowed") {
    return (
      <AccessGate
        status={access.status}
        email={access.email}
        displayName={access.displayName}
        adminEmail={access.adminEmail}
        requestId={access.requestId}
      />
    );
  }

  return <PathAwareDashboard clerkEnabled isAdmin={access.isAdmin} pathKey={pathKey} />;
}

function HostedConfigurationMessage() {
  return (
    <main className="runtime-message">
      <section>
        <div className="eyebrow"><span className="eyebrow-line" /> StackBridge / hosted configuration</div>
        <h1>Hosted mode needs its connections.</h1>
        <p>Set <code>STACKBRIDGE_MODE=local</code> for a browser-only contributor setup, or configure Clerk and Neon before running this deployment.</p>
      </section>
    </main>
  );
}
