import { NextResponse } from "next/server";
import { getAccessDecision } from "../../../lib/server/access";
import { getAppSession, hostedAuthConfigured } from "../../../lib/server/auth";
import { ensureEnrollment, publicPath, resolvePathKey } from "../../../lib/server/paths";
import { isDashboardStatePayload, progressRevision } from "../../../lib/progress-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authError() {
  return NextResponse.json(
    { error: hostedAuthConfigured() ? "Authentication required." : "Clerk and database environment variables are not configured." },
    { status: hostedAuthConfigured() ? 401 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

function requestedPath(request: Request) {
  return resolvePathKey(new URL(request.url).searchParams.get("path") || "gcp-to-aws-data-engineer");
}

export async function GET(request: Request) {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (access.status !== "allowed") return NextResponse.json({ error: "Access approval required." }, { status: 403 });
    const pathKey = requestedPath(request);
    if (!pathKey) return NextResponse.json({ error: "Unknown learning path." }, { status: 400 });
    const enrollment = await ensureEnrollment(session, pathKey);
    if (!enrollment) return NextResponse.json({ error: "You are not enrolled in this learning path." }, { status: 403 });
    const rows = await session.sql`
      SELECT state
      FROM path_progress
      WHERE user_id = ${session.user.id} AND path_key = ${pathKey}
      LIMIT 1
    ` as unknown as Array<{ state: unknown }>;
    return NextResponse.json({ state: rows[0]?.state || null, user: session.user, path: publicPath(enrollment) }, {
      headers: { "Cache-Control": "no-store", "X-Progress-Storage": "database", "X-Progress-Path": pathKey },
    });
  } catch (error) {
    console.error("StackBridge progress GET failed", error);
    return NextResponse.json({ error: "Could not read progress." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const access = await getAccessDecision(session.user, session.clerkUserId, session.sql);
    if (access.status !== "allowed") return NextResponse.json({ error: "Access approval required." }, { status: 403 });
    const pathKey = requestedPath(request);
    if (!pathKey) return NextResponse.json({ error: "Unknown learning path." }, { status: 400 });
    const enrollment = await ensureEnrollment(session, pathKey);
    if (!enrollment) return NextResponse.json({ error: "You are not enrolled in this learning path." }, { status: 403 });
    let state: unknown;
    try {
      state = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    if (!isDashboardStatePayload(state)) {
      return NextResponse.json({ error: "Invalid dashboard state." }, { status: 400 });
    }
    const revision = progressRevision(state);
    const rows = await session.sql`
      INSERT INTO path_progress (user_id, path_key, state, updated_at)
      VALUES (${session.user.id}, ${pathKey}, ${JSON.stringify({ ...state, pathKey })}::jsonb, NOW())
      ON CONFLICT (user_id, path_key)
      DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
      WHERE CASE
        WHEN path_progress.state->>'revision' ~ '^[0-9]{1,18}$' THEN (path_progress.state->>'revision')::bigint
        ELSE 0
      END <= ${revision}
      RETURNING updated_at
    ` as unknown as Array<{ updated_at: string }>;
    if (!rows[0]) {
      return NextResponse.json({ error: "A newer progress revision already exists. Reload before saving again." }, { status: 409, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ ok: true, revision, user: session.user, path: publicPath(enrollment) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("StackBridge progress PUT failed", error);
    return NextResponse.json({ error: "Could not write progress." }, { status: 500 });
  }
}
