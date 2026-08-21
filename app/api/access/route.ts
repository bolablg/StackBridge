import { NextResponse } from "next/server";
import { getAccessDecision, submitAccessRequest } from "../../../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authError() {
  return NextResponse.json(
    { error: hostedAuthConfigured() ? "Authentication required." : "Clerk and database environment variables are not configured." },
    { status: hostedAuthConfigured() ? 401 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    return NextResponse.json(access, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("StackBridge access GET failed", error);
    return NextResponse.json({ error: "Could not read access status." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAppSession();
    if (!session) return authError();

    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (access.status === "allowed") {
      return NextResponse.json({ error: "This account already has access.", status: access.status }, { status: 409 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const message = body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message.trim().slice(0, 1000)
      : "";

    const result = await submitAccessRequest(session.user, session.clerkUserId, message, session.sql);
    return NextResponse.json({
      status: result.request.status,
      requestId: result.request.id,
      notificationSent: result.notificationSent,
      alreadyPending: result.alreadyPending,
    }, {
      status: result.alreadyPending ? 200 : 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("StackBridge access POST failed", error);
    return NextResponse.json({ error: "Could not submit access request." }, { status: 500 });
  }
}
