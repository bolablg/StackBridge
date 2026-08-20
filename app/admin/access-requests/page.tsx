import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminAccessRequests from "./admin-access-requests";
import { getAccessDecision, listAccessRequests } from "../../../lib/server/access";
import { getAppSession } from "../../../lib/server/auth";
import { isLocalMode } from "../../../lib/server/config";

export const dynamic = "force-dynamic";

export default async function AccessRequestsPage() {
  if (isLocalMode()) redirect("/");
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) redirect(`/sign-in?redirect_url=${encodeURIComponent("/admin/access-requests")}`);

  const session = await getAppSession();
  if (!session) redirect("/");
  const access = await getAccessDecision(session.user, session.sql);
  if (!access.isAdmin) redirect("/");

  const requests = await listAccessRequests(session.sql);
  return <AdminAccessRequests adminEmail={access.adminEmail} initialRequests={requests} />;
}
