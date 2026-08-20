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
- Server-side access control with an admin approval queue for new accounts.

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

The production domain is [bolablg-stackbridge.vercel.app](https://bolablg-stackbridge.vercel.app). The shorter `stackbridge.vercel.app` name is already assigned to another Vercel project.

Set these environment variables in Vercel for Preview and Production:

- `DATABASE_URL` — supplied by a Neon Postgres integration.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — safe to expose to the browser.
- `CLERK_SECRET_KEY` — server-only; never commit it or expose it to client code.
- `CLERK_JWT_KEY` — optional, only when using Clerk’s JWT verification path.
- `CLERK_AUTHORIZED_PARTIES` — comma-separated deployed origins when you need an explicit allow-list.
- `CLERK_FRONTEND_API_URL` — optional; normally derived from the publishable key.
- `STACKBRIDGE_ADMIN_EMAIL` — the Clerk email that owns the access queue; defaults to `bolajibalogoun@gmail.com`.
- `RESEND_API_KEY` and `ACCESS_REQUEST_FROM_EMAIL` — optional; enable email notifications for new access requests.

The first authenticated request creates or upgrades the application tables and seeds the default `gcp-to-aws-data-engineer` path. `schema.sql` contains the same DDL if you prefer to apply it manually. Each user’s progress is isolated by `(user_id, path_key)`.

### Access control

The configured admin email is admitted automatically. Every other signed-in account is held at the access gate until approved. The gate can create one pending request per learner and stores the request in Neon. The admin reviews the queue at `/admin/access-requests`; approving a request creates a path-scoped grant. The dashboard page and all progress/path APIs enforce the same decision on the server and return `403` for unapproved accounts.

Email delivery is optional so the free deployment remains usable without another paid service. Without the two Resend variables, requests still appear in the admin queue. To send email notifications, create a free Resend account, add a verified sender address, and set `RESEND_API_KEY` plus `ACCESS_REQUEST_FROM_EMAIL` in Vercel.

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

### CI/CD promotion flow

- Every push to `dev-bola` runs the GitHub Actions `quality` check (`npm ci`, lint, and build) and creates a Vercel preview.
- A pull request from `dev-bola` into `staging` runs the same quality check and receives a Vercel pull-request preview. Merging it updates the staging branch deployment.
- A pull request from `staging` into `main` must pass both `quality` and the Vercel check. Merging it is the only production release path because `main` is protected.
- `staging` and `main` reject direct pushes, force pushes, and unresolved review conversations. They currently require a pull request and passing checks; review approval can be increased later if the project gains additional maintainers.

## Legacy local fallback

The original static dashboard files and `server.py` remain in this folder as a fallback for opening the old file-backed experience. The primary launcher and deployment path are now the Next.js app described above. The legacy fallback keeps browser `localStorage` and can still write `progress.json`; it is not the hosted database path.

Do not enter AWS access keys, MFA codes, secret values, or private tokens into the dashboard. Use a private deployment and keep `.env.local` out of version control.
