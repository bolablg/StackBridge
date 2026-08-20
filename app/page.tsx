import { auth } from "@clerk/nextjs/server";
import AccessGate from "./access-gate";
import StackBridgeDashboard from "./stackbridge-dashboard";
import { getAccessDecision } from "../lib/server/access";
import { getAppSession } from "../lib/server/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!clerkEnabled || !process.env.CLERK_SECRET_KEY) {
    return <StackBridgeDashboard clerkEnabled={clerkEnabled} />;
  }

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
