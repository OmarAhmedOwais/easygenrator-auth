# CLAUDE.md: Easygenerator auth module

Guidance for Claude Code and other AI coding agents working in this repo (humans too). Follow the
existing patterns and don't introduce new ones. When unsure, read the matching skill in
`.claude/skills/` and the worked example (`backend/src/modules/auth`, `frontend/src/features/auth`).

## Layout

```
backend/   NestJS 11 + MongoDB (Mongoose) API, prefix /api, Swagger at /api/docs
frontend/  React 19 + TS + Vite SPA, calls same-origin /api (Vite proxy / nginx)
docs/      FRD.md (what), TRD.md (how)
```

## Commands (run inside `backend/` or `frontend/`)

| Task | Backend | Frontend |
|---|---|---|
| dev | `npm run start:dev` | `npm run dev` |
| verify before finishing | `npm run lint && npm run typecheck && npm test && npm run test:e2e` | `npm run lint && npm run typecheck && npm test && npm run build` |

A change is not done until its package's verify line passes.

## Non-negotiable rules

1. **Routes are protected by default.** The global `JwtAuthGuard` applies everywhere; only add `@Public()` on purpose.
2. **Services depend on ports, not on Mongoose.** `UsersRepository` is an abstract class (and the DI token). Adapters live in `modules/users/infrastructure/{mongoose,in-memory}` and are bound in `persistence/persistence.module.ts`. Both adapters must keep the same behaviour.
3. **Controllers are thin.** They validate (DTO), call a service, and shape the response. No business logic.
4. **Never return or log secrets.** Map through `toPublicUser`. Hash fields are `select: false`. Logs redact auth headers and cookies.
5. **Validation rules live in one place per side:** `backend/src/common/validation/auth-rules.ts` and `frontend/src/features/auth/schemas.ts`. If you change one, change the other in the same commit.
6. **One error shape.** Throw Nest `HttpException`s. `AllExceptionsFilter` formats them. Don't hand-build error JSON.
7. **Access token stays in memory** on the frontend (`api/session.ts`). Never put tokens in localStorage. Every request goes through `apiFetch`.
8. **Every behaviour change ships with tests** (see the `auth-testing` skill).
9. **Config goes through `ConfigService<AppConfig, true>`.** New env vars go in `env.validation.ts`, `configuration.ts` and `.env.example`.

## Skills

| Skill | Use when |
|---|---|
| `nest-auth-backend` | adding or changing endpoints, modules, persistence, auth/session logic |
| `react-auth-frontend` | adding pages, forms, API calls, route guards, UI components |
| `auth-testing` | writing tests at any layer, on either side |
