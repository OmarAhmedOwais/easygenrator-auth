# Testing

## Strategy

```
        ▲  few   Browser smoke (manual / Playwright): full journey, desktop + mobile
        │        Frontend integration: real router + providers, fetch fake      (Vitest + Testing Library)
        │        Backend e2e: real HTTP stack, in-memory AND real MongoDB       (Vitest + Supertest)
        │  many  Unit: rules, hasher, auth service, filter, schemas, API client (Vitest)
```

- Tests assert **behaviour** (status codes, payloads, cookies, what the user sees), not mock call counts.
- Every acceptance criterion in a spec maps to at least one test. See the mapping table in [specs/001 tasks](../specs/001-auth-module/tasks.md#acceptance-criteria--tests).
- Security properties are tested explicitly: enumeration, injection, mass assignment, replay, secrets never in responses.

## Backend (`backend/`)

| Command                                                                      | What                                               |
| ---------------------------------------------------------------------------- | -------------------------------------------------- |
| `npm test`                                                                   | Unit tests (`src/**/*.spec.ts`)                    |
| `npm run test:watch`                                                         | Watch mode                                         |
| `npm run test:cov`                                                           | Unit tests + v8 coverage → `coverage/`             |
| `npm run test:e2e`                                                           | HTTP e2e (`test/*.e2e-spec.ts`), in-memory adapter |
| `DB_DRIVER=mongo MONGODB_URI=mongodb://localhost:27017/e2e npm run test:e2e` | Same suite against real MongoDB                    |

E2E boots `AppModule.forRoot()` and applies the **same** `configureApp()` as `main.ts`. Env
defaults live in `vitest.config.e2e.ts`. Variables already set in the shell win, which is how CI
switches to MongoDB.

## Frontend (`frontend/`)

| Command                           | What                      |
| --------------------------------- | ------------------------- |
| `npm test`                        | All Vitest suites (jsdom) |
| `npm run test:watch` / `test:cov` | Watch / coverage          |

Helpers live in `src/test/utils.tsx`:

- `mockApi({ 'POST /api/auth/signin': () => ({ status: 200, body }) })` is a strict fetch fake. Unhandled requests throw.
- `renderApp('/signup')` renders the real route table with all providers.

## CI

`.github/workflows/ci.yml` runs on every push and PR: audit → lint → typecheck → unit (+coverage
artifact) → e2e (memory) → e2e (MongoDB service) → build → OpenAPI drift check. The frontend
job runs lint, typecheck, tests and build, then the Docker images are built.

## Writing a new test

1. Find the acceptance criterion (or add one to the spec).
2. Write the failing test at the lowest layer that can prove it.
3. Add an e2e/integration test if it crosses HTTP or the router.
4. Name it after the behaviour: `'401 with the same message on unknown email'`.
