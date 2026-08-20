## Promotion checklist

- [ ] The target branch is intentional (`staging` for validation or `main` for production).
- [ ] The Vercel preview has been reviewed when one is available.
- [ ] The change does not expose credentials, tokens, or private user data.
- [ ] Database or environment-variable changes are documented in the PR.

## Validation

- [ ] `npm run lint`
- [ ] `npm run build`
