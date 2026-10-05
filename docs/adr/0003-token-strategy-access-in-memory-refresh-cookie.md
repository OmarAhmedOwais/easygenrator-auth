# ADR-0003: Access token in memory, rotating refresh token in an httpOnly cookie

- **Status:** Accepted
- **Date:** 2026-10-05
- **Related:** [spec 001](../../specs/001-auth-module/spec.md) NFR-4, AC-13–AC-15 · [security](../security.md)

## Context

The SPA must stay signed in across reloads (FR-12) without exposing a long-lived credential to
XSS, and without opening a CSRF hole.

## Options considered

1. **JWT in localStorage**: simple, but any XSS steals a long-lived token.
2. **Server session cookie only**: robust, but every request is cookie-authenticated, so it needs CSRF tokens. Stateful.
3. **Short access JWT in memory + refresh token in an httpOnly, SameSite=Strict, path-scoped cookie**, with rotation and reuse detection.

## Decision

Option 3. Access token: 15 min, returned in the body, kept in a JS variable, sent as `Bearer`.
Refresh token: 7 days, `httpOnly; SameSite=Strict; Path=/api/auth; Secure` (prod). Only its
**sha256** is stored. Each refresh atomically swaps the stored hash (compare-and-swap). Presenting
an old token revokes the session.

## Consequences

- ✅ XSS can't read the refresh token. CSRF can't use it (Strict + path-scoped + header auth for the API).
- ✅ Stolen refresh tokens are single-use, and replay is detected.
- ⚠️ Concurrent refreshes must be serialised on the client (single-flight + Web Locks).
- ⚠️ One active session per user. A `sessions` collection is the upgrade path for multi-device.
- ⚠️ Requires same-site deployment ([ADR-0007](./0007-same-origin-deployment.md)).
