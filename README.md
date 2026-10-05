# Easygenerator — Full Stack Auth Module

Sign up / sign in module built for the Easygenerator full-stack test task.

- **Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · react-hook-form + zod · TanStack Query · React Router
- **Backend:** NestJS 11 · MongoDB (Mongoose) · Passport-JWT · argon2id · Swagger · pino
- **Quality:** Jest + Supertest, Vitest + Testing Library, ESLint + Prettier, GitHub Actions CI, Docker Compose

> AI usage is described in **[AI.md](./AI.md)**. Requirements and design notes: [docs/FRD.md](./docs/FRD.md), [docs/TRD.md](./docs/TRD.md).

## Features

- **Sign up** with email, name (≥ 3 chars) and a password (≥ 8 chars, a letter, a number, a special character), with a live password checklist. Rules are enforced on the client **and** the server.
- **Sign in** with email + password and one generic error for bad credentials.
- **Application page** with *"Welcome to the application."* and a **Log out** button, reachable only when signed in.
- **Protected endpoint** `GET /api/users/me` (Bearer token).
- **Sessions:** a 15-minute access token kept in memory + a 7-day **httpOnly, SameSite=Strict refresh cookie** with **rotation and reuse detection**. The session survives a page reload, and logging out revokes it on the server.
- **Extras:** rate limiting, Helmet, Swagger docs, structured logs with request ids, health check, consistent error format, env validation, Docker, CI.

## Quick start

### Option A: Docker (everything in one command)

```bash
docker compose up --build
```

| | URL |
|---|---|
| App | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

### Option B: Local development

Requirements: **Node.js 22+** and a MongoDB (local install, Atlas, or `docker compose up -d mongo`).

```bash
# 1) API
cd backend
cp .env.example .env          # set MONGODB_URI and two different 32+ char JWT secrets
npm install
npm run start:dev             # http://localhost:3000/api  ·  docs at /api/docs

# 2) Web (second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173  (proxies /api to :3000)
```

No MongoDB handy? Run the API with `DB_DRIVER=memory` in `backend/.env`. It uses the in-memory adapter (data is lost on restart) and is meant for demos and tests only.

## Scripts

| | Backend (`/backend`) | Frontend (`/frontend`) |
|---|---|---|
| Dev server | `npm run start:dev` | `npm run dev` |
| Lint / typecheck | `npm run lint` · `npm run typecheck` | `npm run lint` · `npm run typecheck` |
| Unit tests | `npm test` (`npm run test:cov`) | `npm test` |
| E2E (HTTP) | `npm run test:e2e` (in-memory; `DB_DRIVER=mongo` for real DB) | — |
| Build | `npm run build` | `npm run build` |

## API

Full interactive docs: **`/api/docs`** (Swagger).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | public | Create account → `201 { accessToken, expiresIn, user }` + refresh cookie |
| POST | `/api/auth/signin` | public | Sign in → `200 { accessToken, expiresIn, user }` + refresh cookie |
| POST | `/api/auth/refresh` | cookie | Rotate refresh cookie, new access token |
| POST | `/api/auth/signout` | cookie | Revoke session, clear cookie → `204` |
| GET | `/api/users/me` | **Bearer** | Current user (the protected endpoint) |
| GET | `/api/health` | public | Liveness + MongoDB ping |

Every error has the same shape:

```json
{ "statusCode": 400, "error": "Bad Request", "message": ["Please provide a valid email address"],
  "path": "/api/auth/signup", "timestamp": "…", "requestId": "…" }
```

```bash
# try it
curl -i -c jar -H 'content-type: application/json' \
  -d '{"email":"jane@example.com","name":"Jane Doe","password":"Passw0rd!"}' \
  http://localhost:3000/api/auth/signup
```

## Project structure

```
backend/
  src/
    config/        env validation (Joi) + typed config
    common/        exception filter, shared validation rules
    persistence/   binds repository ports to adapters (mongo | memory)
    modules/
      auth/        signup/signin/refresh/signout, JWT strategy, global guard, argon2 hasher
      users/       UsersRepository port + Mongoose / in-memory adapters, GET /users/me
      health/
  test/            e2e tests (supertest)
frontend/
  src/
    api/           fetch client (Bearer, single-flight refresh), error normalisation
    features/auth/ schemas, auth context, guards, sign-in / sign-up pages
    features/home/ application (welcome) page
    components/ui/ button, input, label, form field
docs/              FRD, TRD
.claude/skills/    project conventions for AI coding agents (see CLAUDE.md)
```

## Security decisions

| Concern | Decision |
|---|---|
| Password storage | argon2id (OWASP parameters), never returned (`select: false` + explicit mapper) |
| User enumeration | Same message for wrong password / unknown email; a dummy hash is verified for unknown emails so timing matches |
| Token theft (XSS) | Access token only in memory; refresh token in an httpOnly cookie that JS can't read |
| CSRF | Refresh cookie is `SameSite=Strict` and scoped to `/api/auth`; API auth uses the `Authorization` header |
| Stolen refresh token | Single-use rotation; reusing an old token revokes the session |
| Brute force | `@nestjs/throttler`: 10 requests / minute / IP on `/auth/*` |
| Injection / mass assignment | Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`; `$eq` in queries |
| Headers | Helmet on the API; CSP and security headers in the nginx image |
| Config | Fails at boot if secrets are missing, short (< 32 chars), or identical |
| Logs | `Authorization`, `Cookie`, `Set-Cookie` redacted; 500s never leak internals to clients |

## Production notes

- Serve the SPA and the API from the **same site** (the provided nginx config proxies `/api`). A cross-site API would need `SameSite=None` cookies plus CSRF protection.
- Set `COOKIE_SECURE=true` behind HTTPS, use strong secrets from a secret manager, and set `SWAGGER_ENABLED=false` if the docs shouldn't be public.
- The throttler uses in-memory storage. With several API instances, switch to a Redis store.

## Trade-offs and next steps

- **One active session per user.** A new sign-in replaces the previous refresh token. A `sessions` collection would allow multiple devices and a "log out everywhere" option.
- **Shared validation rules are duplicated** (`backend/src/common/validation/auth-rules.ts` ↔ `frontend/src/features/auth/schemas.ts`). A shared workspace package would remove the duplication, but it felt like too much for this scope.
- Not done yet: email verification, password reset, account lockout after repeated failures, and Playwright E2E in CI.
