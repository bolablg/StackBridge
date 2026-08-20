import { auth } from "@clerk/nextjs/server";
import AccessGate from "./access-gate";
import StackBridgeDashboard from "./stackbridge-dashboard";
import { getAccessDecision } from "../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../lib/server/auth";
import { isLocalMode } from "../lib/server/config";

/**
 * Shared server entry for the home route and the path-aware route tree.
 * Keeping auth here means deep links and in-app links have the exact same
 * access behavior as the homepage.
 */
export async function renderDashboard() {
  if (isLocalMode()) return <StackBridgeDashboard clerkEnabled={false} />;
  if (!hostedAuthConfigured()) return <HostedConfigurationMessage />;

  const { isAuthenticated } = await auth();
  if (!isAuthenticated) return <StackBridgeDashboard clerkEnabled />;

  const session = await getAppSession();
  if (!session) return <StackBridgeDashboard clerkEnabled />;

  const access = await getAccessDecision(session.user, session.sql);
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

  return <StackBridgeDashboard clerkEnabled isAdmin={access.isAdmin} />;
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
