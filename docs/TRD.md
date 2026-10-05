# Technical Requirements Document (TRD)

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Required (React/Vue + TS); Vite for fast dev/build |
| UI | Tailwind CSS v4 + shadcn-style primitives (Radix) + lucide | Small, accessible, no heavy design framework |
| Forms | react-hook-form + zod | Typed schemas, per-field errors, minimal re-renders |
| Server state | TanStack Query | Caching + retries; cleared on sign-out |
| Routing | React Router v7 | Route guards via layout routes |
| Backend | NestJS 11 | Required. v11 (CommonJS) chosen over v12 (ESM-only) so Jest/ts-jest work unchanged |
| Database | MongoDB + Mongoose | Required (MongoDB); Mongoose for schemas + indexes |
| Auth | Passport-JWT, `@nestjs/jwt`, argon2id | Industry standard; argon2id is the OWASP first choice |
| Docs | Swagger (`@nestjs/swagger`) at `/api/docs` | Bonus: API documentation |
| Logging | nestjs-pino | Structured JSON logs, request ids, redaction |
| Tests | Jest + Supertest (API), Vitest + Testing Library (web) | |
| CI | GitHub Actions | lint → typecheck → unit → e2e (in-memory + real MongoDB) → build → docker build |

## 2. API

Base path: `/api`. Errors always use one shape:
`{ statusCode, error, message: string | string[], path, timestamp, requestId }`.

| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| POST | `/auth/signup` | public, rate-limited | `{ email, name, password }` | `201 AuthResponse` + refresh cookie |
| POST | `/auth/signin` | public, rate-limited | `{ email, password }` | `200 AuthResponse` + refresh cookie |
| POST | `/auth/refresh` | refresh cookie | – | `200 AuthResponse` + rotated cookie |
| POST | `/auth/signout` | refresh cookie | – | `204`, cookie cleared, session revoked |
| GET | `/users/me` | **Bearer access token** (protected) | – | `200 User` |
| GET | `/health` | public | – | `200` (includes MongoDB ping) |

`AuthResponse = { accessToken, tokenType: "Bearer", expiresIn, user: { id, email, name, createdAt } }`

Failure codes: `400` validation (incl. unknown properties), `401` bad credentials / invalid session, `409` email taken, `429` rate limit.

## 3. Session model

```
sign in ──► access JWT (15 min, response body → kept in memory by the SPA)
        └─► refresh JWT (7 days, httpOnly + SameSite=Strict cookie, Path=/api/auth, Secure when COOKIE_SECURE=true)
             sha256(refresh) stored on the user document

401 on an API call ──► POST /auth/refresh (single-flight, cross-tab Web Lock)
                       ├─ hash matches  → atomically swap to the new hash, return new pair
                       └─ hash mismatch → token was already used ⇒ theft/replay ⇒ revoke session
```

- Different secrets for access and refresh tokens; `HS256` pinned on verify.
- Rotation uses a compare-and-swap (`updateOne({ _id, refreshTokenHash: old })`), so two concurrent refreshes can't both win.
- Trade-off: one active session per user (a new sign-in replaces the previous refresh token). A `sessions` collection would allow multi-device; noted as a next step.

## 4. Data model (`users` collection)

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `email` | string | unique index, stored lower-cased + trimmed |
| `name` | string | trimmed, 3–50 chars |
| `passwordHash` | string | argon2id, `select: false` |
| `refreshTokenHash` | string \| null | sha256, `select: false` |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

## 5. Backend architecture

```
src/
  main.ts / app.setup.ts       bootstrap; HTTP config shared with e2e tests
  config/                      Joi env validation (fail fast) + typed config
  common/                      exception filter, validation rules shared by DTOs
  persistence/                 binds repository ports to adapters (DB_DRIVER=mongo|memory)
  modules/
    auth/                      controller, service, tokens, password hasher, JWT strategy, global guard
    users/                     domain types, UsersRepository (port), mongoose + in-memory adapters, /users/me
    health/                    terminus health check
```

Rules: controllers are thin; business logic lives in services; services depend on the **repository port**, never on Mongoose; routes are protected by default (`@Public()` opts out).

## 6. Security checklist

- argon2id (19 MiB, t=2) password hashing; dummy verify on unknown email (timing-safe).
- Generic sign-in error; rate limiting (10 req/min/IP) on `/auth/*`.
- `ValidationPipe({ whitelist, forbidNonWhitelisted })` blocks mass-assignment and NoSQL operator injection (`{ "$gt": "" }` fails `@IsEmail`, plus `$eq` in the query).
- Helmet headers; CORS allow-list with credentials; nginx CSP in the frontend image.
- Secrets never serialised (`select: false` + explicit `PublicUser` mapper); `Authorization`/`Cookie`/`Set-Cookie` redacted in logs; 500s never leak internals.
- Env validated at boot (secrets ≥ 32 chars, access ≠ refresh secret).
