# Easygenerator: Full Stack Auth Module

[![CI](https://github.com/OmarAhmedOwais/easygenerator-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/OmarAhmedOwais/easygenerator-auth/actions/workflows/ci.yml)
![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Sign-up and sign-in module built for the Easygenerator full-stack test task. It's production-minded and spec-driven, with every acceptance criterion covered by tests.

|              |                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS v4 · react-hook-form + zod · TanStack Query · React Router 7             |
| **Backend**  | NestJS 12 (native ESM) · MongoDB + Mongoose 9 · Passport-JWT · argon2id · Swagger · pino                             |
| **Quality**  | Vitest (both sides) · Supertest · Testing Library · ESLint + Prettier · husky + commitlint · GitHub Actions · Docker |

> 📄 **[AI.md](./AI.md)**: how AI was used · 📐 **[specs/](./specs/README.md)**: spec → plan → tasks · 🧭 **[docs/](./docs/README.md)**: architecture, API, security, ADRs

## Features

- **Sign up** with email, name (≥ 3 chars) and a password (≥ 8 chars, a letter, a number, a special character), with a live password checklist. Rules are enforced on the client **and** the API.
- **Sign in** with one generic error for bad credentials (no account enumeration, timing-safe).
- **Application page** with _"Welcome to the application."_ and **Log out**, reachable only when signed in.
- **Protected endpoint** `GET /api/users/me` (Bearer token).
- **Secure sessions:** a 15-minute access token kept in memory + a 7-day **httpOnly, SameSite=Strict refresh cookie** with **rotation and reuse detection**. The session survives reloads, and logout revokes it on the server.
- **Bonus:** rate limiting, Helmet + CSP, Swagger + exported OpenAPI contract, structured logs with request ids, health check, consistent error format, fail-fast env validation, Docker Compose, CI.

## Quick start

### Docker (one command)

```bash
docker compose up --build
```

App → http://localhost:8080 · API → http://localhost:3000/api · Swagger → http://localhost:3000/api/docs

### Local development

Requires **Node 22** (`nvm use`) and MongoDB (or `docker compose up -d mongo`).

```bash
npm run install:all
cp backend/.env.example backend/.env       # MONGODB_URI + two different 32+ char JWT secrets
cp frontend/.env.example frontend/.env
npm run dev:api                            # http://localhost:3000/api/docs
npm run dev:web                            # http://localhost:5173 (proxies /api)
```

No MongoDB? Set `DB_DRIVER=memory` in `backend/.env` (in-memory adapter, for demos and tests only).

## Scripts (root)

| Script                                          | What                                                           |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `npm run verify`                                | lint + typecheck + all tests + builds. Run this before pushing |
| `npm run dev:api` / `dev:web`                   | dev servers                                                    |
| `npm run lint` · `typecheck` · `test` · `build` | across both packages                                           |

Per package: `backend/` has `test`, `test:e2e`, `test:cov`, `openapi`. `frontend/` has `test`, `test:cov`. See [docs/development.md](./docs/development.md).

## API at a glance

| Method | Path                | Auth       | Result                                                  |
| ------ | ------------------- | ---------- | ------------------------------------------------------- |
| POST   | `/api/auth/signup`  | public     | `201 { accessToken, expiresIn, user }` + refresh cookie |
| POST   | `/api/auth/signin`  | public     | `200 { accessToken, expiresIn, user }` + refresh cookie |
| POST   | `/api/auth/refresh` | cookie     | new access token + rotated cookie                       |
| POST   | `/api/auth/signout` | cookie     | `204`, session revoked                                  |
| GET    | `/api/users/me`     | **Bearer** | current user (the protected endpoint)                   |
| GET    | `/api/health`       | public     | liveness + MongoDB ping                                 |

Full reference: [docs/api.md](./docs/api.md) · Swagger UI `/api/docs` · contract [openapi.json](./specs/001-auth-module/contracts/openapi.json).

## Repository map

```
backend/            NestJS 12 API (src/modules/{auth,users,health}, persistence/, common/, config/)
frontend/           React SPA (src/features/{auth,home}, api/, components/ui/)
specs/              001-auth-module, 002-nestjs-12-esm-migration (spec · plan · research · data model · tasks · contracts)
docs/               architecture · api · security · testing · development · deployment · runbook · adr/
.claude/            skills/ · commands/ (/specify /plan /tasks /implement /verify /review) · agents/
.github/            CI workflow · PR/issue templates · CODEOWNERS · Dependabot
CLAUDE.md, AGENTS.md  rules for AI coding agents
AI.md               how AI was used (required by the task)
```

## How this was built

Spec-driven ([ADR-0008](./docs/adr/0008-spec-driven-development.md)): each change has a **spec** (user stories, Given/When/Then acceptance criteria), a **plan** (architecture, contracts, risks, test strategy) and **tasks** mapped to requirements and tests. Significant decisions are recorded as [ADRs](./docs/adr/README.md):

| ADR  | Decision                                                  |
| ---- | --------------------------------------------------------- |
| 0002 | MongoDB + Mongoose                                        |
| 0003 | Access token in memory + rotating httpOnly refresh cookie |
| 0004 | Repository port + adapters (no CQRS)                      |
| 0005 | argon2id password hashing                                 |
| 0006 | NestJS 12 native ESM + Vitest                             |
| 0007 | Same-origin deployment (nginx / Vite proxy)               |

## Security highlights

argon2id · generic auth errors + dummy-hash timing equalisation · throttling on `/auth/*` · single-use refresh tokens with reuse detection · `whitelist` + `forbidNonWhitelisted` validation · `$eq` queries · Helmet + nginx CSP · secrets never serialised or logged · fail-fast env validation. Threat model: [docs/security.md](./docs/security.md). Vulnerability reports: [SECURITY.md](./SECURITY.md).

## Trade-offs and next steps

- **One active session per user.** A sessions collection would enable multi-device sessions and "log out everywhere".
- **Rules are mirrored, not shared** (`auth-rules.ts` ↔ `schemas.ts`). A shared workspace package would remove the duplication.
- Not done yet: email verification, password reset, account lockout, Redis-backed throttling for multiple instances, Playwright E2E in CI.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) · [CHANGELOG.md](./CHANGELOG.md). Licensed under [MIT](./LICENSE).
