# ADR-001: StackBridge account-based, multi-path learning progress

**Status:** Accepted
**Date:** 2026-08-19
**Deciders:** Product owner and Codex

## Context

The first hosted prototype had one shared password and one progress document. That is acceptable for a private prototype, but it cannot safely support several learners. The product also starts with a GCP → AWS Data Engineering path and may later add Microsoft, Databricks, Snowflake, or other tracks.

## Decision

Use Clerk for identity and session management, and Neon Postgres as the application source of truth with four explicit concepts:

- `app_users` — a small mirror of Clerk identity fields used by the application;
- `learning_paths` — reusable path catalog entries with source/target platform metadata;
- `path_enrollments` — which paths a user can access;
- `path_progress` — one JSON state document per `(user_id, path_key)`.

Use Clerk-managed session tokens validated by `@clerk/nextjs`. The browser sends a canonical path key to the progress API, while the API authorizes both the Clerk user and the enrollment before reading or writing state. Account identity and application-access records use `(environment_key, normalized_email)` so development and production Clerk instances cannot merge the same email. Progress writes carry a monotonic revision and use a conditional upsert to reject stale saves.

## Consequences

- Learners can create accounts and their progress is isolated.
- A user can eventually enroll in multiple certification paths without duplicating the application.
- New providers become catalog/configuration work rather than a new database shape.
- The current frontend renders twelve directed data-engineering bridges across GCP, AWS, Azure, and Databricks from one catalog and shared renderer.
- Clerk provides the account, recovery, and session surface; the application still needs rate limiting and stronger operational monitoring before a large public launch.

## Revisit when

Add path-versioning when learning content changes materially, move granular events out of the JSON state when analytics become important, and add an external identity provider when account volume or support requirements justify it.
