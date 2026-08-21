import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import {
  ACTIVE_PATH_KEYS,
  DEFAULT_PATH_KEY as CONTENT_DEFAULT_PATH_KEY,
  PATH_BLUEPRINTS,
} from "../content";

export const DEFAULT_PATH_KEY = CONTENT_DEFAULT_PATH_KEY;

export type PathDefinition = {
  title: string;
  sourcePlatform: string;
  targetPlatform: string;
  focus: string;
  version: number;
};

export const PATH_DEFINITIONS: Record<string, PathDefinition> = Object.fromEntries(
  ACTIVE_PATH_KEYS.map((pathKey) => {
    const blueprint = PATH_BLUEPRINTS[pathKey];
    if (!blueprint) throw new Error(`Missing active path blueprint: ${pathKey}`);

    return [pathKey, {
      title: blueprint.title,
      sourcePlatform: blueprint.source.key,
      targetPlatform: blueprint.target.key,
      focus: blueprint.focus,
      version: 1,
    }];
  }),
);

export type Sql = NeonQueryFunction<false, false>;
let schemaReady: Promise<void> | undefined;

export function getSql(): Sql {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  return neon(process.env.DATABASE_URL);
}

export async function ensureSchema(sql: Sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      const statements = [
        () => sql`
          CREATE TABLE IF NOT EXISTS app_users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `,
        () => sql`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name = 'app_users' AND column_name = 'password_hash'
            ) THEN
              ALTER TABLE app_users ALTER COLUMN password_hash DROP NOT NULL;
            END IF;
          END
          $$
        `,
        () => sql`
          CREATE TABLE IF NOT EXISTS learning_paths (
            path_key TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            source_platform TEXT NOT NULL,
            target_platform TEXT NOT NULL,
            focus TEXT NOT NULL,
            definition JSONB NOT NULL DEFAULT '{}'::jsonb,
            active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `,
        () => sql`
          CREATE TABLE IF NOT EXISTS path_enrollments (
            user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
            path_key TEXT NOT NULL REFERENCES learning_paths(path_key) ON DELETE RESTRICT,
            status TEXT NOT NULL DEFAULT 'active',
            enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, path_key)
          )
        `,
        () => sql`
          CREATE TABLE IF NOT EXISTS path_progress (
            user_id TEXT NOT NULL,
            path_key TEXT NOT NULL,
            state JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, path_key),
            FOREIGN KEY (user_id, path_key)
              REFERENCES path_enrollments(user_id, path_key)
              ON DELETE CASCADE
          )
        `,
        () => sql`
          CREATE TABLE IF NOT EXISTS access_grants (
            path_key TEXT NOT NULL REFERENCES learning_paths(path_key) ON DELETE CASCADE,
            clerk_user_id TEXT NOT NULL,
            email TEXT NOT NULL,
            granted_by TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (path_key, clerk_user_id)
          )
        `,
        () => sql`
          CREATE UNIQUE INDEX IF NOT EXISTS access_grants_email_idx
          ON access_grants (path_key, LOWER(email))
        `,
        () => sql`
          CREATE TABLE IF NOT EXISTS access_requests (
            id TEXT PRIMARY KEY,
            path_key TEXT NOT NULL REFERENCES learning_paths(path_key) ON DELETE CASCADE,
            clerk_user_id TEXT NOT NULL,
            email TEXT NOT NULL,
            display_name TEXT NOT NULL,
            message TEXT,
            status TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'denied')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            reviewed_at TIMESTAMPTZ,
            reviewed_by TEXT
          )
        `,
        () => sql`
          CREATE UNIQUE INDEX IF NOT EXISTS access_requests_pending_idx
          ON access_requests (path_key, clerk_user_id)
          WHERE status = 'pending'
        `,
      ];

      for (const statement of statements) await statement();

      for (const [pathKey, definition] of Object.entries(PATH_DEFINITIONS)) {
        await sql`
          INSERT INTO learning_paths (
            path_key, title, source_platform, target_platform, focus, definition
          )
          VALUES (
            ${pathKey},
            ${definition.title},
            ${definition.sourcePlatform},
            ${definition.targetPlatform},
            ${definition.focus},
            ${JSON.stringify(definition)}::jsonb
          )
          ON CONFLICT (path_key) DO UPDATE SET
            title = EXCLUDED.title,
            source_platform = EXCLUDED.source_platform,
            target_platform = EXCLUDED.target_platform,
            focus = EXCLUDED.focus,
            definition = EXCLUDED.definition,
            updated_at = NOW()
        `;
      }
    })();
  }

  try {
    await schemaReady;
  } catch (error) {
    schemaReady = undefined;
    throw error;
  }
}
