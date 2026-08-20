import type { AppSession } from "./auth";

export type PathRow = {
  path_key: string;
  title: string;
  source_platform: string;
  target_platform: string;
  focus: string;
  definition: unknown;
  enrollment_status?: string | null;
};

export async function getEnrollment(session: AppSession, pathKey: string) {
  const rows = await session.sql`
    SELECT p.path_key, p.title, p.source_platform, p.target_platform, p.focus, p.definition
    FROM path_enrollments e
    JOIN learning_paths p ON p.path_key = e.path_key
    WHERE e.user_id = ${session.user.id}
      AND e.path_key = ${pathKey}
      AND e.status = 'active'
      AND p.active = TRUE
    LIMIT 1
  ` as unknown as PathRow[];
  return rows[0] || null;
}

export async function ensureEnrollment(session: AppSession, pathKey: string) {
  const existing = await getEnrollment(session, pathKey);
  if (existing || pathKey !== "gcp-to-aws-data-engineer") return existing;
  await session.sql`
    INSERT INTO path_enrollments (user_id, path_key)
    VALUES (${session.user.id}, ${pathKey})
    ON CONFLICT (user_id, path_key) DO NOTHING
  `;
  return getEnrollment(session, pathKey);
}

export function publicPath(row: PathRow) {
  return {
    key: row.path_key,
    title: row.title,
    sourcePlatform: row.source_platform,
    targetPlatform: row.target_platform,
    focus: row.focus,
    definition: row.definition,
    enrolled: row.enrollment_status === "active" || row.enrollment_status === undefined,
  };
}
