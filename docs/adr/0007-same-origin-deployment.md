# ADR-0007: Serve SPA and API from the same origin

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The refresh cookie is `SameSite=Strict` ([ADR-0003](./0003-token-strategy-access-in-memory-refresh-cookie.md)).
A cross-site API would need `SameSite=None`, which makes the cookie CSRF-able and requires CSRF
tokens plus credentialed CORS.

## Decision

The browser always talks to **one origin**. In dev, Vite proxies `/api` to the API. In Docker,
nginx serves the SPA and reverse-proxies `/api`. CORS stays configured (allow-list + credentials)
for tooling, but isn't required by the app.

## Consequences

- ✅ No CSRF tokens, no preflight requests, simpler cookies.
- ✅ nginx adds CSP and security headers in one place.
- ⚠️ A separate API domain later must be a **same-site** subdomain (e.g. `api.example.com` with `app.example.com`) or revisit this ADR.
