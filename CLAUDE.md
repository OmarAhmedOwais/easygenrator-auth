# CLAUDE.md: Easygenerator auth module

Guidance for Claude Code and other AI coding agents working in this repo (humans too; `AGENTS.md`
points here). Follow the existing patterns and don't introduce new ones. When unsure, read the
matching skill in `.claude/skills/` and the worked examples (`backend/src/modules/auth`,
`frontend/src/features/auth`).

## Layout

```
backend/    NestJS 12 (native ESM) + MongoDB (Mongoose 9) API · prefix /api · Swagger /api/docs · Vitest
frontend/   React 19 + TS + Vite SPA · calls same-origin /api (Vite proxy / nginx) · Vitest
specs/      spec-driven work: NNN-name/{spec,plan,research,data-model,tasks}.md + contracts/openapi.json
docs/       architecture, api, security, testing, development, deployment, runbook, adr/
.claude/    skills/, commands/ (/specify /plan /tasks /implement /verify /review), agents/
```

## How work is done here

1. **Features start as a spec** (`/specify` → `/plan` → `/tasks`). See the `spec-driven-development` skill and `specs/README.md`.
2. **Implement task by task** (`/implement`), tests first where practical.
3. **Verify** (`/verify`): every acceptance criterion has a passing test, `npm run verify` is green.
4. **Review** (`/review`) with the `code-reviewer` and `security-reviewer` subagents.
5. Significant decisions get an **ADR** (`docs/adr/`). User-visible changes get a **CHANGELOG** line.

## Commands

| Task                                    | Where       | Command                                                         |
| --------------------------------------- | ----------- | --------------------------------------------------------------- |
| everything (lint, types, tests, builds) | root        | `npm run verify`                                                |
| dev servers                             | root        | `npm run dev:api` · `npm run dev:web`                           |
| backend unit / e2e                      | `backend/`  | `npm test` · `npm run test:e2e` (`DB_DRIVER=mongo` for real DB) |
| OpenAPI contract                        | `backend/`  | `npm run openapi` · `npm run openapi:check` (fails on drift)    |
| frontend tests                          | `frontend/` | `npm test`                                                      |

A change is not done until `npm run verify` passes.

## Non-negotiable rules

1. **Routes are protected by default.** The global `JwtAuthGuard` applies everywhere. Add `@Public()` only on purpose.
2. **Services depend on ports, not on Mongoose.** `UsersRepository` is an abstract class (and the DI token). Adapters live in `modules/users/infrastructure/{mongoose,in-memory}`, are bound in `persistence/persistence.module.ts`, and keep identical behaviour.
3. **Controllers are thin.** Validate (DTO), call a service, shape the response.
4. **Never return or log secrets.** Map through `toPublicUser`. Hash fields are `select: false`. Logs redact auth headers and cookies.
5. **Validation rules live in one place per side:** `backend/src/common/validation/auth-rules.ts` ↔ `frontend/src/features/auth/schemas.ts`. Change both in the same commit.
6. **One error shape.** Throw Nest `HttpException`s. `AllExceptionsFilter` formats them.
7. **Access token stays in memory** on the frontend (`api/session.ts`). Never localStorage. Every request goes through `apiFetch`.
8. **Backend is ESM:** relative imports end in `.js`. Use `vi.*` in tests (ADR-0006).
9. **Config goes through `ConfigService<AppConfig, true>`.** New env vars go in `env.validation.ts`, `configuration.ts`, `.env.example` and `docs/deployment.md`.
10. **Every behaviour change ships with tests** (`auth-testing` skill) and keeps the spec, docs and OpenAPI contract in sync.
11. **Conventional Commits** (`git-workflow` skill). Hooks run lint-staged and commitlint. There is no CI pipeline: the hooks and `npm run verify` are the quality gates (ADR-0009).

## Skills

| Skill                           | Use when                                                           |
| ------------------------------- | ------------------------------------------------------------------ |
| `spec-driven-development`       | starting a feature or significant change                           |
| `nest-auth-backend`             | endpoints, modules, persistence, auth/session logic                |
| `react-auth-frontend`           | pages, forms, API calls, route guards, UI components               |
| `auth-testing`                  | writing tests at any layer, on either side                         |
| `security-review`               | anything touching auth, data, logging, headers, CORS, dependencies |
| `architecture-decision-records` | decisions with long-lived consequences                             |
| `git-workflow`                  | commits, PRs, changelog, releases                                  |

## Key decisions (see `docs/adr/`)

MongoDB + Mongoose (0002) · memory access token + rotating httpOnly refresh cookie (0003) · port/adapter
without CQRS (0004) · argon2id (0005) · NestJS 12 ESM + Vitest (0006) · same-origin deployment (0007)
· spec-driven workflow (0008) · local quality gates instead of CI (0009).
