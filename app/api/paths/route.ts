import { NextResponse } from "next/server";
import { getAppSession, hostedAuthConfigured } from "../../../lib/server/auth";
import { ensureSchema } from "../../../lib/server/db";
import { publicPath, type PathRow } from "../../../lib/server/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authError() {
  return NextResponse.json(
    { error: hostedAuthConfigured() ? "Authentication required." : "Clerk and database environment variables are not configured." },
    { status: hostedAuthConfigured() ? 401 : 503 },
  );
}

export async function GET() {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    await ensureSchema(session.sql);
    const rows = await session.sql`
      SELECT p.path_key, p.title, p.source_platform, p.target_platform, p.focus, p.definition, e.status AS enrollment_status
      FROM learning_paths p
      LEFT JOIN path_enrollments e ON e.path_key = p.path_key AND e.user_id = ${session.user.id}
      WHERE p.active = TRUE
      ORDER BY p.created_at ASC, p.path_key ASC
    ` as unknown as PathRow[];
    return NextResponse.json({ paths: rows.map(publicPath), user: session.user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("StackBridge paths GET failed", error);
    return NextResponse.json({ error: "Could not read learning paths." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAppSession();
    if (!session) return authError();
    const body = await request.json() as { pathKey?: string };
    const pathKey = typeof body.pathKey === "string" ? body.pathKey.trim() : "";
    if (!pathKey) return NextResponse.json({ error: "pathKey is required." }, { status: 400 });
    const pathRows = await session.sql`
      SELECT path_key, title, source_platform, target_platform, focus, definition
      FROM learning_paths
      WHERE path_key = ${pathKey} AND active = TRUE
      LIMIT 1
    ` as unknown as PathRow[];
    if (!pathRows[0]) return NextResponse.json({ error: "Learning path not found." }, { status: 404 });
    await session.sql`
      INSERT INTO path_enrollments (user_id, path_key)
      VALUES (${session.user.id}, ${pathKey})
      ON CONFLICT (user_id, path_key) DO UPDATE SET status = 'active', updated_at = NOW()
    `;
    return NextResponse.json({ ok: true, path: publicPath({ ...pathRows[0], enrollment_status: "active" }), user: session.user });
  } catch (error) {
    console.error("StackBridge paths POST failed", error);
    return NextResponse.json({ error: "Could not enroll in learning path." }, { status: 500 });
  }
}
