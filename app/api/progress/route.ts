import { NextResponse } from "next/server";
import { getAppSession, hostedAuthConfigured } from "../../../lib/server/auth";
import { ensureEnrollment, publicPath, type PathRow } from "../../../lib/server/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authError() {
  return NextResponse.json(
    { error: hostedAuthConfigured() ? "Authentication required." : "Clerk and database environment variables are not configured." },
    { status: hostedAuthConfigured() ? 401 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

function requestedPath(request: Request) {
  return new URL(request.url).searchParams.get("path") || "gcp-to-aws-data-engineer";
}

export async function GET(request: Request) {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const pathKey = requestedPath(request);
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
    const pathKey = requestedPath(request);
    const enrollment = await ensureEnrollment(session, pathKey);
    if (!enrollment) return NextResponse.json({ error: "You are not enrolled in this learning path." }, { status: 403 });
    const state = await request.json() as Record<string, unknown>;
    if (!state || typeof state !== "object" || !state.weekStatus || !state.setup || !state.diagnostic || !Array.isArray(state.checkins)) {
      return NextResponse.json({ error: "Invalid dashboard state." }, { status: 400 });
    }
    await session.sql`
      INSERT INTO path_progress (user_id, path_key, state, updated_at)
      VALUES (${session.user.id}, ${pathKey}, ${JSON.stringify({ ...state, pathKey })}::jsonb, NOW())
      ON CONFLICT (user_id, path_key)
      DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true, user: session.user, path: publicPath(enrollment) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("StackBridge progress PUT failed", error);
    return NextResponse.json({ error: "Could not write progress." }, { status: 500 });
  }
}
