# Development guide

## Prerequisites

- Node.js **22** (`nvm use` reads `.nvmrc`)
- MongoDB 7+ (local, Atlas, or `docker compose up -d mongo`). Optional: `DB_DRIVER=memory`
- Docker (optional, for the full stack)

## First run

```bash
npm run install:all                 # root tooling (husky, commitlint) + backend + frontend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev:api                     # terminal 1 → http://localhost:3000/api/docs
npm run dev:web                     # terminal 2 → http://localhost:5173
```

## Root scripts

| Script                                          | Does                                                       |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `npm run verify`                                | lint + typecheck + all tests + builds (run before pushing) |
| `npm run lint` / `typecheck` / `test` / `build` | the same across both packages                              |
| `npm run dev:api` / `dev:web`                   | dev servers                                                |

## Workflow

1. **Spec first** for features: `specs/NNN-name/` (`/specify` → `/plan` → `/tasks`). See [specs/README](../specs/README.md).
2. Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `chore/…`, `docs/…`.
3. Commit with [Conventional Commits](https://www.conventionalcommits.org): `feat(backend): add password reset`. The `commit-msg` hook enforces it. Allowed scopes: backend, frontend, docs, ci, deps, specs, repo.
4. The `pre-commit` hook runs ESLint/Prettier on staged files (lint-staged).
5. Open a PR using the template. `npm run verify` must pass (there is no CI, see ADR-0009). Record significant decisions as an [ADR](./adr/README.md).
6. Add a line to `CHANGELOG.md` under **Unreleased**.

## Conventions (summary)

The full rules are in [CLAUDE.md](../CLAUDE.md) and the skills in `.claude/skills/`.

- Backend: ESM, relative imports end in `.js`. Controller → service → port → adapter. Routes are protected by default.
- Frontend: every request goes through `apiFetch`. Forms use react-hook-form + zod. UI uses tokens, not raw colours.
- Strict TypeScript, no `any`. Prettier: single quotes, trailing commas, width 100.

## Debugging

- API logs are pretty-printed in development. Every line and response has a request id.
- `npm run start:debug --prefix backend`, then attach VS Code to port 9229.
- Swagger UI at `/api/docs` with **Authorize** (paste the access token).
- Frontend: React Query state is cleared on sign-out. Check Network for `/api/auth/refresh` on load.

## Project layout

See [architecture.md](./architecture.md).
