import { NextResponse } from "next/server";
import { getAccessDecision, listAccessRequests, reviewAccessRequest } from "../../../../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authError() {
  return NextResponse.json(
    { error: hostedAuthConfigured() ? "Authentication required." : "Clerk and database environment variables are not configured." },
    { status: hostedAuthConfigured() ? 401 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

function forbiddenError() {
  return NextResponse.json({ error: "Administrator access required." }, { status: 403, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (!access.isAdmin) return forbiddenError();
    const requests = await listAccessRequests(session.sql);
    return NextResponse.json({ requests }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("StackBridge admin access GET failed", error);
    return NextResponse.json({ error: "Could not read access requests." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (!access.isAdmin) return forbiddenError();

    const body = await request.json() as { id?: unknown; status?: unknown };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const status = body.status === "approved" || body.status === "denied" ? body.status : null;
    if (!id || !status) return NextResponse.json({ error: "id and a valid status are required." }, { status: 400 });

    const reviewed = await reviewAccessRequest(session.sql, session.user, id, status);
    if (!reviewed) return NextResponse.json({ error: "Access request not found." }, { status: 404 });
    return NextResponse.json({ request: reviewed }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("StackBridge admin access PATCH failed", error);
    return NextResponse.json({ error: "Could not review access request." }, { status: 500 });
  }
}
