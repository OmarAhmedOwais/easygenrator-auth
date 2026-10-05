# Tasks 001: Authentication module

|            |                      |
| ---------- | -------------------- |
| **Spec**   | [spec.md](./spec.md) |
| **Plan**   | [plan.md](./plan.md) |
| **Status** | All tasks done ✅    |

Legend: `[P]` = parallelisable with the previous task. Each task lists the requirements it
satisfies and how it was verified.

## Phase 1: Foundation

- [x] **T001** Monorepo layout `backend/` + `frontend/`, editorconfig, gitattributes (LF) · _NFR-10_ · verify: tree review
- [x] **T002** NestJS app shell, strict TS, ESLint (type-checked) + Prettier · _NFR-10_ · verify: `npm run lint && npm run typecheck`
- [x] **T003** Env validation (Joi, fail fast) + typed `AppConfig` · _NFR-6_ · verify: boot with a short secret fails with a readable list
- [x] **T004** [P] pino logging with request id + redaction · _NFR-7_ · verify: e2e "request id" test, manual log check
- [x] **T005** [P] `AllExceptionsFilter`, one error shape · _NFR-1_ · verify: `all-exceptions.filter.spec.ts`

## Phase 2: Persistence

- [x] **T010** Domain `User` / `PublicUser` + `toPublicUser` · _NFR-1_
- [x] **T011** `UsersRepository` port (abstract class = DI token) · _plan §3_
- [x] **T012** Mongoose schema (unique email, `select: false` secrets) + adapter (dup key → domain error, CAS rotation) · _FR-6_ · verify: e2e with `DB_DRIVER=mongo` (CI)
- [x] **T013** [P] In-memory adapter with identical semantics · verify: e2e default run
- [x] **T014** `PersistenceModule.forRoot(driver)` binding · verify: both e2e runs

## Phase 3: Auth API

- [x] **T020** Shared rules `auth-rules.ts` + `@IsStrongPassword` · _FR-2–FR-5_ · verify: `auth-rules.spec.ts`
- [x] **T021** DTOs (`SignUpDto`, `SignInDto`) with normalisation · _FR-1, FR-7, AC-6, AC-9_
- [x] **T022** `PasswordHasher` (argon2id, dummy hash) · _NFR-1, NFR-2_ · verify: `password-hasher.service.spec.ts`
- [x] **T023** `TokensService` (separate secrets, HS256 pinned, sha256) · _NFR-4_
- [x] **T024** `AuthService`: signUp / signIn / refresh (rotation + reuse detection) / signOut · _AC-4, AC-8, AC-14, AC-15_ · verify: `auth.service.spec.ts`
- [x] **T025** `AuthController` + cookie handling + throttler · _NFR-3, NFR-4_
- [x] **T026** Global `JwtAuthGuard` + `@Public()` + `@CurrentUser()` · _FR-11_
- [x] **T027** `GET /users/me` (protected) · _AC-12_
- [x] **T028** [P] Health check (terminus, per-driver indicators) · _NFR-6_
- [x] **T029** [P] Swagger + OpenAPI export script + CI drift check · _NFR-11_ · verify: `npm run openapi` + `git diff --exit-code`

## Phase 4: API tests

- [x] **T030** E2E suite covering AC-1…AC-4, AC-6, AC-8, AC-9, AC-12, AC-14, AC-15, headers · verify: `npm run test:e2e` (20 tests)
- [x] **T031** CI job running e2e against in-memory **and** a MongoDB service · verify: GitHub Actions

## Phase 5: Frontend

- [x] **T040** Vite + React 19 + TS + Tailwind v4, design tokens, UI primitives (Button, Input, Label, FormField) · _NFR-8, NFR-9_
- [x] **T041** `apiFetch` (Bearer, credentials, single-flight refresh, Web Lock, `ApiError`) · _AC-13_ · verify: `client.test.ts`
- [x] **T042** zod schemas mirroring the API rules · _FR-2–FR-4_ · verify: `schemas.test.ts`
- [x] **T043** `AuthProvider` (restore on load, adopt session, sign out clears cache) · _AC-13, AC-14_
- [x] **T044** Route guards `RequireAuth` / `RedirectIfAuthenticated` · _AC-11, AC-7_
- [x] **T045** Sign-up page + live password checklist + 409 → email field · _AC-1–AC-5, FR-13_
- [x] **T046** Sign-in page (return to the original page) · _AC-7, AC-8_
- [x] **T047** Application page ("Welcome to the application.", `/users/me`, logout) · _AC-10, AC-14_

## Phase 6: Frontend tests

- [x] **T050** Flow tests: guard redirect, session restore, sign-up validation + success + 409, sign-in error, sign-in → logout · verify: `auth-flow.test.tsx`
- [x] **T051** Headless-browser smoke of the full journey (desktop + 390 px mobile), screenshots reviewed · _NFR-9_

## Phase 7: Delivery

- [x] **T060** Dockerfiles (multi-stage, non-root, healthcheck), nginx (SPA + `/api` proxy + CSP), compose
- [x] **T061** GitHub Actions: lint, typecheck, audit, unit + coverage, e2e ×2, build, docker build, commitlint
- [x] **T062** README, AI.md, CLAUDE.md, skills, specs, ADRs, guides

## Acceptance criteria → tests

| AC       | Backend test                                                                    | Frontend test                                                            |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AC-1/2/3 | e2e `400 on …` table                                                            | `schemas.test.ts`, `validates fields and shows live password rules`      |
| AC-4     | e2e `409 on duplicate email (case-insensitive)`                                 | `maps a 409 to the email field`                                          |
| AC-5     | e2e `201 creates the user…`                                                     | `creates the account and lands on the application page`                  |
| AC-6     | e2e `400 on unknown properties`                                                 | —                                                                        |
| AC-7/8   | e2e `200 with valid credentials`, `401 with the same message…`                  | `shows the server error for bad credentials`                             |
| AC-9     | e2e `400 rejects NoSQL operator injection`                                      | —                                                                        |
| AC-10/11 | —                                                                               | `restores the session…`, `sends signed-out users from /app…`             |
| AC-12    | e2e `protected GET /api/users/me` block                                         | —                                                                        |
| AC-13    | —                                                                               | `restores the session from the refresh cookie on load`, `client.test.ts` |
| AC-14/15 | e2e `rotates the cookie, rejects replay, and signs out`; `auth.service.spec.ts` | `signs in, then logs out back to the sign-in page`                       |

## Definition of done

- [x] All acceptance criteria covered by automated tests
- [x] `npm run verify` green
- [x] Docs, CHANGELOG and ADRs updated
