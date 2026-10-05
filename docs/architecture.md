# Architecture

## System context

```mermaid
flowchart LR
  U((User)) -->|HTTPS| N[nginx<br/>SPA + /api proxy]
  N -->|/api| A[NestJS API]
  A --> M[(MongoDB)]
```

One origin for the browser ([ADR-0007](./adr/0007-same-origin-deployment.md)). nginx serves the
built SPA and proxies `/api/*` to the API. The API is stateless apart from MongoDB.

## Backend components

```
backend/src
├── main.ts                 bootstrap (top-level await), pino logger
├── app.module.ts           composition root: Config, Logger, Throttler, Persistence, Health, Users, Auth
├── app.setup.ts            HTTP config shared with e2e: prefix, helmet, cookies, CORS, ValidationPipe, filter, Swagger
├── config/                 Joi env schema + typed AppConfig
├── common/                 AllExceptionsFilter, ErrorResponseDto, auth rules, transforms, @IsStrongPassword
├── persistence/            PersistenceModule.forRoot(driver) → binds ports to adapters
├── modules/
│   ├── auth/               AuthController, AuthService, TokensService, PasswordHasher, JwtStrategy, JwtAuthGuard (global)
│   ├── users/              domain/, UsersRepository (port), infrastructure/{mongoose,in-memory}, UsersController
│   └── health/             terminus, per-driver indicators
└── scripts/export-openapi  writes specs/001-auth-module/contracts/openapi.json
```

Dependency rule: `controller → service → port ← adapter`. Nothing outside
`infrastructure/mongoose` imports Mongoose ([ADR-0004](./adr/0004-repository-port-and-adapters.md)).

## Frontend components

```
frontend/src
├── main.tsx, app/          providers (QueryClient, AuthProvider, Toaster) + route table
├── api/                    client.ts (apiFetch, refreshSession), session.ts (in-memory token), errors.ts, types.ts
├── features/auth/          schemas (zod), auth-context, routes/guards, components/, pages/
├── features/home/          application (welcome) page
└── components/ui/          button, input, label, form-field (shadcn-style, Radix)
```

## Flows

### Sign up / sign in

```mermaid
sequenceDiagram
  participant B as Browser (SPA)
  participant A as API
  participant D as MongoDB
  B->>A: POST /api/auth/signup {email,name,password}
  A->>A: validate DTO (whitelist) · argon2id hash
  A->>D: insert user (unique email)
  A->>A: sign access (15m) + refresh (7d, jti)
  A->>D: set refreshTokenHash = sha256(refresh)
  A-->>B: 201 {accessToken, user} + Set-Cookie refresh_token (httpOnly, Strict, /api/auth)
  B->>B: keep accessToken in memory → /app
```

### Authenticated request with transparent refresh

```mermaid
sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: GET /api/users/me (Bearer expired)
  A-->>B: 401
  Note over B: single-flight + Web Lock (one refresh across tabs)
  B->>A: POST /api/auth/refresh (cookie R1)
  A->>A: verify R1 · CAS hash(R1) → hash(R2)
  A-->>B: 200 {accessToken} + Set-Cookie R2
  B->>A: GET /api/users/me (Bearer new) — replayed once
  A-->>B: 200 user
```

### Reuse detection

If `R1` is presented after it was rotated, the compare-and-swap fails. The API then clears the
stored hash, so every session token for that user (including `R2`) stops working, and answers `401`.

## Cross-cutting concerns

| Concern          | Where                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Validation       | `ValidationPipe` (global) + DTOs. zod on the client                           |
| Errors           | `AllExceptionsFilter` → `{statusCode,error,message,path,timestamp,requestId}` |
| Logging          | nestjs-pino. `x-request-id` in/out. Redaction of auth headers and cookies     |
| Security headers | Helmet (API), nginx CSP (SPA)                                                 |
| Rate limiting    | `@nestjs/throttler` on `AuthController`                                       |
| Config           | `ConfigModule.validate` (Joi), typed `ConfigService<AppConfig, true>`         |
| API docs         | Swagger at `/api/docs`. Exported OpenAPI in `specs/001-auth-module/contracts` |
