# Security

Threat model for the auth module (STRIDE), with the control that addresses each threat and where
it lives in the code. To report a vulnerability, see [SECURITY.md](../SECURITY.md).

## Assets

User credentials (passwords), sessions (access/refresh tokens), user PII (email, name),
JWT signing secrets.

## Threats & controls

| STRIDE                     | Threat                            | Control                                                                         | Where                                                 |
| -------------------------- | --------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **S**poofing               | Credential stuffing / brute force | 10 req/min/IP throttle on `/auth/*`                                             | `AuthController` `@UseGuards(ThrottlerGuard)`         |
| Spoofing                   | Forged / tampered JWT             | HS256 pinned, separate access/refresh secrets (≥ 32 chars, must differ)         | `JwtStrategy`, `TokensService`, `env.validation.ts`   |
| Spoofing                   | Stolen refresh token reused       | Single-use rotation + reuse detection → session revoked                         | `AuthService.refresh`, `rotateRefreshTokenHash` (CAS) |
| **T**ampering              | Mass assignment (`role: "admin"`) | `whitelist` + `forbidNonWhitelisted`                                            | `app.setup.ts`                                        |
| Tampering                  | NoSQL operator injection          | Typed DTOs (`@IsEmail` rejects objects) + `$eq` in queries                      | DTOs, `MongooseUsersRepository`                       |
| **R**epudiation            | Can't trace a request             | Request id in logs and the `x-request-id` header. Sign-up/failure events logged | `app.module.ts` (pino), `AuthService`                 |
| **I**nformation disclosure | Account enumeration               | Generic 401 + dummy argon2 verify (equal timing)                                | `AuthService.signIn`, `PasswordHasher`                |
| Information disclosure     | Hash/token leakage                | `select: false`, `toPublicUser` mapper, log redaction, generic 500s             | schema, domain, logger, filter                        |
| Information disclosure     | XSS steals tokens                 | Access token in memory only, refresh token httpOnly. CSP in nginx               | `api/session.ts`, `nginx.conf`                        |
| Information disclosure     | DB leak → passwords               | argon2id (19 MiB, t=2). Refresh tokens stored as sha256                         | `PasswordHasher`, `TokensService.hash`                |
| **D**enial of service      | Hash-DoS with huge passwords      | Password max 128 chars                                                          | `auth-rules.ts`                                       |
| Denial of service          | Request floods on auth            | Throttler. Body size limited by Express defaults                                |                                                       |
| **E**levation of privilege | Forgotten auth on a new route     | Global guard, deny by default, explicit `@Public()`                             | `AuthModule` `APP_GUARD`                              |
| —                          | CSRF                              | SameSite=Strict, `Path=/api/auth` cookie. API auth uses a header, not a cookie  | `AuthController.cookieOptions`                        |
| —                          | Clickjacking, MIME sniffing       | Helmet. nginx `X-Frame-Options DENY`, `frame-ancestors 'none'`, `nosniff`       | `app.setup.ts`, `nginx.conf`                          |

## Secure configuration (production)

- `COOKIE_SECURE=true` (HTTPS only), `NODE_ENV=production`, `LOG_LEVEL=info`.
- Secrets from a secret manager. Generate them with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- Rotating `JWT_REFRESH_SECRET` signs everyone out. Rotating `JWT_ACCESS_SECRET` forces a refresh within 15 minutes.
- `SWAGGER_ENABLED=false` if the API docs must not be public.
- MongoDB with auth + TLS, and a least-privilege user limited to the app database.

## Supply chain

- Lockfiles committed. `npm run install:all` uses `npm ci`. `npm run audit` runs `npm audit --omit=dev --audit-level=high` on both packages.
- Dependabot weekly for npm (grouped), monthly for Actions and Docker base images.
- Docker: multi-stage builds, production deps only, non-root `node` user.

## Known limitations

- Rate-limit counters live in memory per instance. Use a Redis store when scaling horizontally.
- No account lockout or CAPTCHA after repeated failures (the throttle mitigates).
- One active session per user (see [ADR-0003](./adr/0003-token-strategy-access-in-memory-refresh-cookie.md)).
