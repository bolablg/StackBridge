# StackBridge — Carry expertise across cloud platforms

> Carry your data and AI expertise across cloud platforms.

StackBridge is a private learning and accountability workspace for people who already have real expertise in one platform and want to transfer it to another. The role is the constant; the platform is the bridge.

The path library is organized by professional profile and source platform. A learner can start with data engineering, machine learning engineering, or cloud architecture, choose the environment they already know, and see the destination bridges available for that profile.

Version one has one live route: a Google Cloud Professional Data Engineer moving into AWS and preparing for the AWS Certified Data Engineer — Associate exam. The other role and platform combinations remain visible as coming-soon routes so the product can grow without changing its core user, path, or progress model.

## Path library

- **Data engineering** — GCP → AWS is live; GCP → Azure, Snowflake, and Databricks are coming soon.
- **Machine learning engineering** — role and platform bridges are coming soon.
- **Cloud architecture** — role and platform bridges are coming soon.

## What is included

- A 13-week roadmap with milestone status and field notes.
- A 16-question baseline diagnostic with domain scoring.
- Weekly accountability check-ins and recent-history tracking.
- GCP → AWS service translation, including Dataform → dbt + Redshift.
- The existing Markdown study guides and official AWS resources, rendered as embedded guide pages inside the app.
- Browser-local persistence for immediate use, with per-user hosted sync when Clerk and Neon are configured.
- Installable PWA shell with offline app loading, network awareness, and a dim theme.
- Multi-user, multi-path storage through Clerk and Neon Postgres.
- Server-side access control with an admin approval queue for new accounts.

## Local development

The repository is a Next.js application using TypeScript, React, and an optional Clerk + Neon hosted stack. You can run the complete dashboard locally without creating a Clerk application or a database.

### Prerequisites

- Node.js 20.9 or newer (Node.js 22 or 24 LTS is recommended).
- npm (the lockfile is committed, so use `npm ci` for reproducible installs).

### Clone and run

```bash
git clone https://github.com/bolablg/StackBridge.git
cd StackBridge
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The example environment uses `STACKBRIDGE_MODE=local`. Local mode deliberately does not initialize Clerk, run Clerk middleware, or connect to Neon. Progress is saved in the browser for the local user, with the dashboard’s backup/export controls available for portability.

The optional [`local/run-dashboard.command`](./local/run-dashboard.command) launcher resolves the repository root and opens the same development server on macOS. Set `STACKBRIDGE_PORT` if you want a different local port; the regular npm commands work on every supported development platform.

Useful checks:

```bash
npm run lint
npm run build
npm run start
```

Clerk is only needed for hosted mode. If you are working on the hosted integration, keep its local keys in `.env.local` (which is ignored by Git) and use the Clerk CLI to check the setup:

```bash
clerk doctor
```

## Repository layout

- `app/` and `lib/` — the current Next.js application and its server services.
- `guides/` — open-source Markdown source for the embedded field guides; the app renders these through `/guides/<slug>` rather than exposing raw `.md` files.
- `styles/` — the shared dashboard stylesheet used by the current and legacy interfaces.
- `public/` — assets served by the PWA; image assets live under `public/images/`, while `manifest.json` and `sw.js` stay at the public root for stable web-app URLs.
- `local/` — optional local-development launchers.
- `legacy/` — the older static/Python fallback, kept for local use and excluded from Vercel deployments.
- `db/` — manually applicable database schema reference.
- `docs/adr/` — architecture decision records.

## Hosted deployment: Vercel + Clerk + Neon

Set the repository root as the Vercel project root. Vercel will detect the Next.js build and use the scripts in `package.json`.

The production website is [stackbridge.bolablg.com](https://stackbridge.bolablg.com). The Vercel fallback domain is [bolablg-stackbridge.vercel.app](https://bolablg-stackbridge.vercel.app); the shorter `stackbridge.vercel.app` name is already assigned to another Vercel project.

Set these environment variables in Vercel for Preview and Production:

- `STACKBRIDGE_MODE=hosted` — enables the authenticated hosted runtime; do not use `local` for a public deployment.
- `DATABASE_URL` — supplied by a Neon Postgres integration.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — safe to expose to the browser.
- `CLERK_SECRET_KEY` — server-only; never commit it or expose it to client code.
- `CLERK_JWT_KEY` — optional, only when using Clerk’s JWT verification path.
- `CLERK_AUTHORIZED_PARTIES` — comma-separated deployed origins when you need an explicit allow-list.
- `CLERK_FRONTEND_API_URL` — optional; normally derived from the publishable key.
- `STACKBRIDGE_ADMIN_EMAIL` — required; the Clerk email that owns the access queue.
- `RESEND_API_KEY` and `ACCESS_REQUEST_FROM_EMAIL` — optional; enable email notifications for new access requests.

The first authenticated request creates or upgrades the application tables and seeds the default `gcp-to-aws-data-engineer` path. [`db/schema.sql`](./db/schema.sql) contains the same DDL if you prefer to apply it manually. Each user’s progress is isolated by `(user_id, path_key)`.

### Access control

The configured admin email is admitted automatically. Every other signed-in account is held at the access gate until approved. The gate can create one pending request per learner and stores the request in Neon. The admin reviews the queue at `/admin/access-requests`; approving a request creates a path-scoped grant. The dashboard page and all progress/path APIs enforce the same decision on the server and return `403` for unapproved accounts.

Email delivery is optional so the free deployment remains usable without another paid service. Without the two Resend variables, requests still appear in the admin queue. To send email notifications, create a free Resend account, add a verified sender address, and set `RESEND_API_KEY` plus `ACCESS_REQUEST_FROM_EMAIL` in Vercel.

After deploying:

1. Configure Clerk’s allowed origins and redirect URLs for the Vercel preview and production domains.
2. Create a learner account and verify that a roadmap change survives a full reload.
3. Create a second account and verify that its path is independent.
4. Use the browser’s **Install app** / **Add to Home Screen** action to install the PWA.

The PWA shell can reopen without a network. Database synchronization requires connectivity and a signed-in Clerk session.

## Open source and contributing

StackBridge is public under the [MIT License](./LICENSE). Start with the [contribution guide](./CONTRIBUTING.md) for the local setup, runtime modes, branch workflow, coding conventions, and pull request checklist.

## Branch workflow

- `dev-*` — active development and feature work. The current branch is `dev-bola`.
- `staging` — pre-production validation and deployment previews.
- `main` — production deployment branch.

### CI/CD promotion flow

- Every push to a `dev-*` branch runs the GitHub Actions `quality` check (`npm ci`, lint, and build) and creates a Vercel preview.
- After that quality check passes, GitHub Actions automatically opens or reuses a draft pull request from the development branch into `staging`. The automation never merges the pull request; a maintainer reviews it, marks it ready, and merges it when appropriate.
- A pull request from a `dev-*` branch into `staging` runs the same quality check and receives a Vercel pull-request preview. Merging it updates the staging branch deployment.
- A pull request from `staging` into `main` must pass both `quality` and the Vercel check. Merging it is the only production release path because `main` is protected.
- `staging` and `main` reject direct pushes, force pushes, and unresolved review conversations. They currently require a pull request and passing checks; review approval can be increased later if the project gains additional maintainers.

## Legacy local fallback

The original static dashboard files and Python file-backed server live under [`legacy/`](./legacy/) as a fallback. The primary launcher and deployment path are now the Next.js app described above. To run the fallback from the repository root:

```bash
python3 legacy/server.py --port 8765
```

Then open [http://127.0.0.1:8765/legacy/](http://127.0.0.1:8765/legacy/). It keeps browser `localStorage` and can write `legacy/progress.json`; it is not the hosted database path.

Do not enter AWS access keys, MFA codes, secret values, or private tokens into the dashboard. Use a private deployment and keep `.env.local` out of version control.
