---
name: security-review
description: >-
  Security checklist for reviewing or writing code in this auth-focused repo (OWASP ASVS / Top 10
  oriented). Use when touching authentication, sessions, tokens, cookies, validation, user data,
  logging, headers, CORS, dependencies or Docker/nginx config, and before approving any PR in
  those areas.
---

# Security review

Read `docs/security.md` (threat model) first. Then check every item that applies. A "no" is a
blocking finding unless the PR explains why.

## Authentication & sessions

- [ ] New routes are protected by default (no stray `@Public()`). Anything reading user data requires a Bearer token.
- [ ] Passwords only ever go through `PasswordHasher` (argon2id). No plaintext persisted, logged or returned.
- [ ] Auth failures use one generic message. No branch reveals whether an account exists (messages **or** timing).
- [ ] Refresh flow keeps rotation via `rotateRefreshTokenHash` (CAS) and revocation on reuse.
- [ ] Cookies stay `httpOnly`, `SameSite=Strict`, `Path=/api/auth`, `Secure` behind HTTPS.
- [ ] JWT verify pins `algorithms: ['HS256']` and uses the right secret (access ≠ refresh).

## Input & data

- [ ] Every body/query/param is a DTO with class-validator rules. The global pipe is not loosened.
- [ ] Mongo queries take typed values (`$eq`). No spreading of request objects into filters/updates.
- [ ] Responses go through mappers (`toPublicUser`). New secret fields are `select: false`.
- [ ] Length limits on strings (DoS), especially anything hashed or regex-tested.

## Output, logging, errors

- [ ] Errors go through `HttpException` → `AllExceptionsFilter`. 5xx bodies contain no internals.
- [ ] Logs contain no passwords, tokens, hashes or full request bodies on auth routes. Redaction paths cover new headers.

## Frontend

- [ ] No tokens in localStorage/sessionStorage/URLs. All requests use `apiFetch`.
- [ ] No `dangerouslySetInnerHTML` with user data. External links get `rel="noopener noreferrer"`.

## Config, infra, supply chain

- [ ] New env vars validated in `env.validation.ts` (secrets with a minimum length) and documented.
- [ ] CORS stays an allow-list. CSP in `nginx.conf` updated only as narrowly as needed.
- [ ] New dependencies are maintained and widely used. `npm audit --omit=dev` is clean.
- [ ] Docker images stay multi-stage, prod-only deps, non-root.

## Tests

- [ ] Each security property touched has a test (enumeration, injection, mass assignment, replay, 401 without token).
