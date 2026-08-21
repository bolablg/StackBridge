-- Multi-user, multi-path storage for the hosted dashboard.
-- The Next.js API routes also create these objects on first request.

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  environment_key TEXT NOT NULL DEFAULT 'production',
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS environment_key TEXT NOT NULL DEFAULT 'production';
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS app_users_environment_email_idx
ON app_users (environment_key, LOWER(email));

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

-- Access approval is application-wide. The default path key is retained as a
-- compatibility anchor while progress and enrollments remain path-specific.
CREATE TABLE IF NOT EXISTS access_grants (
  path_key TEXT NOT NULL REFERENCES learning_paths(path_key) ON DELETE CASCADE,
  environment_key TEXT NOT NULL DEFAULT 'production',
  clerk_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  granted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (environment_key, path_key, clerk_user_id)
);

ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS environment_key TEXT NOT NULL DEFAULT 'production';
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'access_grants_pkey'
      AND pg_get_constraintdef(oid) NOT LIKE '%environment_key%'
  ) THEN
    ALTER TABLE access_grants DROP CONSTRAINT access_grants_pkey;
    ALTER TABLE access_grants ADD CONSTRAINT access_grants_pkey
      PRIMARY KEY (environment_key, path_key, clerk_user_id);
  END IF;
END
$$;
DROP INDEX IF EXISTS access_grants_email_idx;
CREATE UNIQUE INDEX IF NOT EXISTS access_grants_environment_email_idx
ON access_grants (environment_key, path_key, LOWER(email));

CREATE TABLE IF NOT EXISTS access_requests (
  id TEXT PRIMARY KEY,
  path_key TEXT NOT NULL REFERENCES learning_paths(path_key) ON DELETE CASCADE,
  environment_key TEXT NOT NULL DEFAULT 'production',
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
);

ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS environment_key TEXT NOT NULL DEFAULT 'production';
DROP INDEX IF EXISTS access_requests_pending_idx;
CREATE UNIQUE INDEX IF NOT EXISTS access_requests_environment_pending_idx
ON access_requests (environment_key, path_key, clerk_user_id)
WHERE status = 'pending';

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
