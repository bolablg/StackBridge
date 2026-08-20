-- Multi-user, multi-path storage for the hosted dashboard.
-- The Next.js API routes also create these objects on first request.

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade path from the retired password-auth prototype.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'app_users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE app_users ALTER COLUMN password_hash DROP NOT NULL;
  END IF;
END
$$;

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
);

CREATE TABLE IF NOT EXISTS path_enrollments (
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  path_key TEXT NOT NULL REFERENCES learning_paths(path_key) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, path_key)
);

CREATE TABLE IF NOT EXISTS path_progress (
  user_id TEXT NOT NULL,
  path_key TEXT NOT NULL,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, path_key),
  FOREIGN KEY (user_id, path_key)
    REFERENCES path_enrollments(user_id, path_key)
    ON DELETE CASCADE
);

INSERT INTO learning_paths (
  path_key, title, source_platform, target_platform, focus, definition
)
VALUES (
  'gcp-to-aws-data-engineer',
  'GCP → AWS Data Engineering',
  'gcp',
  'aws',
  'AWS Certified Data Engineer — Associate',
  '{"title":"GCP → AWS Data Engineering","sourcePlatform":"gcp","targetPlatform":"aws","focus":"AWS Certified Data Engineer — Associate","version":1}'::jsonb
)
ON CONFLICT (path_key) DO NOTHING;
