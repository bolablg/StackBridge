# StackBridge — Data Engineering: GCP → AWS

StackBridge helps certified practitioners carry their data and AI expertise across platforms. Version one is the GCP → AWS Data Engineering path: a Google Cloud Professional Data Engineer translating existing skills into AWS and preparing for the AWS Certified Data Engineer — Associate exam.

The product is built to grow into paths such as AWS → Azure, Snowflake → Databricks, cloud architecture, and ML engineering without changing the core user, path, or progress model.

## What is included

- A 13-week roadmap with milestone status and field notes.
- A 16-question baseline diagnostic with domain scoring.
- Weekly accountability check-ins and recent-history tracking.
- GCP → AWS service translation, including Dataform → dbt + Redshift.
- The existing Markdown study guides and official AWS resources.
- Browser-local persistence for immediate use, with per-user hosted sync when Clerk and Neon are configured.
- Installable PWA shell with offline app loading, network awareness, and a dim theme.
- Multi-user, multi-path storage through Clerk and Neon Postgres.

## Local development

This folder is now a Next.js application using TypeScript, React, Clerk, and Neon’s serverless Postgres driver.

```bash
cd "/Volumes/Bolaji_SSD/LLM - Learning/aws-data-engineer-dashboard"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The macOS launcher `run-dashboard.command` starts the same Next.js app and opens it automatically. Set `STACKBRIDGE_PORT` if you want a different local port.

Useful checks:

```bash
npm run lint
npm run build
npm run start
```

The Clerk CLI is already linked to the StackBridge development application in this project. Clerk’s local keys are stored in `.env.local`, which is ignored by Git. To recheck the CLI setup:

```bash
clerk doctor
```

## Hosted deployment: Vercel + Clerk + Neon

Use this folder as the Vercel project root. Vercel will detect the Next.js build and use the scripts in `package.json`.

Set these environment variables in Vercel for Preview and Production:

- `DATABASE_URL` — supplied by a Neon Postgres integration.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — safe to expose to the browser.
- `CLERK_SECRET_KEY` — server-only; never commit it or expose it to client code.
- `CLERK_JWT_KEY` — optional, only when using Clerk’s JWT verification path.
- `CLERK_AUTHORIZED_PARTIES` — comma-separated deployed origins when you need an explicit allow-list.
- `CLERK_FRONTEND_API_URL` — optional; normally derived from the publishable key.

The first authenticated request creates or upgrades the application tables and seeds the default `gcp-to-aws-data-engineer` path. `schema.sql` contains the same DDL if you prefer to apply it manually. Each user’s progress is isolated by `(user_id, path_key)`.

After deploying:

1. Configure Clerk’s allowed origins and redirect URLs for the Vercel preview and production domains.
2. Create a learner account and verify that a roadmap change survives a full reload.
3. Create a second account and verify that its path is independent.
4. Use the browser’s **Install app** / **Add to Home Screen** action to install the PWA.

The PWA shell can reopen without a network. Database synchronization requires connectivity and a signed-in Clerk session.

## Branch workflow

- `dev-bola` — active development and feature work.
- `staging` — pre-production validation and deployment previews.
- `main` — production deployment branch.

## Legacy local fallback

The original static dashboard files and `server.py` remain in this folder as a fallback for opening the old file-backed experience. The primary launcher and deployment path are now the Next.js app described above. The legacy fallback keeps browser `localStorage` and can still write `progress.json`; it is not the hosted database path.

Do not enter AWS access keys, MFA codes, secret values, or private tokens into the dashboard. Use a private deployment and keep `.env.local` out of version control.
