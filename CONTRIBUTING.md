# Contributing to StackBridge

Thank you for helping build StackBridge. The project is designed for people who want to carry professional expertise from one cloud or data platform to another. Contributions that improve the live learning path, the path-library model, local development experience, accessibility, documentation, or platform portability are welcome.

## Before you start

Please read the [README](./README.md) for the product context and current live route. For substantial changes, open an issue first so the proposed direction can be discussed before implementation.

## Development setup

Requirements:

- Node.js 20.9 or newer (Node.js 22 or 24 LTS is recommended).
- npm.

Clone the repository and start the contributor-friendly local runtime:

```bash
git clone https://github.com/bolablg/StackBridge.git
cd StackBridge
npm ci
cp .env.example .env.local
npm run dev
```

The example configuration sets `STACKBRIDGE_MODE=local`. In local mode:

- Clerk is not loaded.
- Clerk middleware is not run.
- Neon and hosted APIs are not required.
- Progress is kept in the browser for the local user.

To work on hosted authentication, set `STACKBRIDGE_MODE=hosted` and configure every required Clerk, Neon, and admin-email variable privately. Never commit credentials or use local mode for a public deployment.

## Useful commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Run the production build and TypeScript checks
npm run start     # Serve a completed production build
```

Before opening a pull request, run at least:

```bash
npm run lint
npm run build
```

## Project structure

- `app/` — Next.js routes, UI, Clerk integration, and API handlers.
- `lib/content.ts` — role/platform path catalog and current learning content.
- `lib/server/` — runtime configuration, authentication, access control, database, and path services.
- `public/guides/` — Markdown learning guides shipped with the app.
- `.github/workflows/ci.yml` — quality checks and automatic development-to-staging PR creation.

Keep new paths data-driven. A new role or platform should normally be represented in the path catalog and its server definition rather than by duplicating dashboard components.

## Branch and pull request workflow

Use a development branch named `dev-<name>` for feature work:

```bash
git switch -c dev-your-name
git push -u origin dev-your-name
```

Every push to a `dev-*` branch runs lint and build. Once the quality job passes, GitHub Actions automatically opens or reuses a draft pull request from that branch into `staging`. The workflow does not merge it. Review the diff, mark the draft ready, and merge it when it is suitable for the staging preview.

The `staging` branch is the pre-production validation branch. A separate pull request from `staging` to `main` is required for production. Do not push directly to protected branches.

## Contribution guidelines

- Keep changes focused and explain the user or contributor problem they solve.
- Prefer accessible native HTML elements, visible focus states, keyboard-friendly interactions, and readable contrast.
- Keep hosted-only dependencies behind the runtime-mode boundary where practical.
- Do not add secrets, personal credentials, private URLs, or machine-specific paths.
- Update the README or relevant documentation when behavior, configuration, or workflow changes.
- Add or update tests/checks when introducing logic that can be verified automatically.
- Use clear commit messages, for example `feat: add Azure data engineering path` or `docs: clarify local mode`.

## Pull request checklist

- [ ] The change is scoped and documented.
- [ ] No credentials or machine-specific paths are included.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Local mode still works without Clerk or Neon credentials.
- [ ] Hosted-mode behavior remains authenticated and fail-closed.
- [ ] Screenshots or a short verification note are included for visual changes.

## Security

Do not report security vulnerabilities in a public issue. Use the repository’s private security contact or contact the maintainers before disclosing details publicly. Never include secret values, access tokens, MFA codes, or private connection strings in issues or pull requests.
