import type { AppSession } from "./auth";
import { ACTIVE_PATH_KEYS, DEFAULT_PATH_KEY } from "../content";

const LEGACY_PATH_ALIASES: Record<string, string> = {
  "gcp-to-aws": DEFAULT_PATH_KEY,
};

export function resolvePathKey(pathKey?: string | null) {
  const requestedKey = pathKey?.trim();
  if (!requestedKey) return null;

  const canonicalKey = LEGACY_PATH_ALIASES[requestedKey] || requestedKey;
  return ACTIVE_PATH_KEYS.includes(canonicalKey) ? canonicalKey : null;
}

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
  if (existing) return existing;
  await session.sql`
    INSERT INTO path_enrollments (user_id, path_key)
    SELECT ${session.user.id}, path_key
    FROM learning_paths
    WHERE path_key = ${pathKey} AND active = TRUE
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
