# AI.md: How AI was used

I built this AI-first: I set the direction, the constraints and the review bar, and the AI did most of the typing. Below is what was generated, what worked, what I had to correct, and where I went against the AI's (or my own references') defaults.

**Tooling:** Claude (Anthropic) in an agentic coding session with shell access. It scaffolded, wrote code, ran lint/tests/builds and drove a headless browser to check the UI.

## 1. Context I gave the AI

The most effective thing I did was **give the AI my own previous work as reference** instead of describing a style from scratch:

- **`goal-track`**: an earlier NestJS + Angular assessment of mine. Reference for NestJS auth (JWT strategy, `@Public` decorator, exception filter, Swagger, FRD/TRD documents, CI workflow).
- **`bewafra`**: a production NestJS + React (TanStack, shadcn, react-hook-form + zod) project of mine. Reference for the hexagonal "repository port + adapter" layout, the `CLAUDE.md` + project skills approach, and the React API-client pattern (single-flight 401 refresh, Web Lock across tabs).

The opening prompt was roughly:

> "Build the attached Full Stack Test Task. Use my goal-track and bewafra projects as references, and add every .md file and skill the repo needs."

The follow-up instructions that shaped the result:

- *"Production-ready, but it's a few-hours task: borrow bewafra's port/adapter idea, drop its CQRS/event bus."*
- *"Refresh tokens must rotate and detect reuse. Store only a hash. Don't keep the access token in localStorage."*
- *"Tests must hit the real HTTP stack (`configureApp` shared with `main.ts`), and the e2e suite must run both in-memory and against a real MongoDB in CI."*
- *"Prove the UI works: run both servers and drive the full flow in a headless browser (sign up → welcome → reload keeps the session → log out → bad sign-in), plus a mobile screenshot."*

## 2. What was AI-generated

Almost all of the code was AI-generated and then reviewed by me:

| Area | AI-generated | My part |
|---|---|---|
| Backend scaffolding, configs, DTOs, Swagger decorators | ✅ | Reviewed and trimmed |
| Auth service, token rotation, password hasher | ✅ from my spec | Specified the session model, reviewed the security logic line by line |
| Repository port + Mongoose/in-memory adapters | ✅ | Chose the pattern (from bewafra) and the `DB_DRIVER` switch |
| Tests (backend unit + e2e, frontend Vitest) | ✅ | Defined what must be covered (enumeration, reuse detection, injection, secrets never in responses) |
| Frontend pages, form components, API client | ✅ | Design direction, UX details (live password checklist, 409 → email field) |
| Docker, nginx, CI, README/FRD/TRD, CLAUDE.md, skills | ✅ | Reviewed for accuracy against the code |

## 3. What had to be corrected or reworked

These are real problems from the session. Most were caught by lint, the type checker or tests, not by eye, which is why "verify before done" is a rule in `CLAUDE.md`.

1. **NestJS 12 is ESM-only and broke Jest.** The AI installed the latest Nest (v12). It compiled and ran under Node 22, but every Jest suite failed with `Must use import to load ES Module`. Options were an ESM Jest setup, switching to Vitest+SWC, or Nest 11. **I chose NestJS 11** (CommonJS, LTS-style, what reviewers expect) and pinned TypeScript 5.9 for ecosystem compatibility. Bleeding-edge majors weren't worth the risk for a deliverable.
2. **The health check reported MongoDB "down" in in-memory mode.** The first version injected `MongooseHealthIndicator` with `@Optional()`, but `TerminusModule` always provides it, so it was never `undefined`. Fixed with a `HEALTH_INDICATORS` provider built per driver.
3. **Error `error` field leaked class names.** Passport's 401 produced `"error": "UnauthorizedException"`. Changed the filter to use the HTTP reason phrase (`"Unauthorized"`).
4. **Refresh race in React StrictMode / multiple tabs (caught in design review).** With rotation and reuse detection, two concurrent refreshes using the same cookie revoke the session. StrictMode mounts effects twice, so a naive "refresh on mount" would log users out on every reload in dev. On the server, rotation is a compare-and-swap (`updateOne({ _id, refreshTokenHash: old })`) so two parallel refreshes can never both win. On the client, I required a single-flight promise plus a cross-tab `navigator.locks` lock (pattern taken from bewafra), and a unit test that proves concurrent callers share one request.
5. **argon2 typings changed** (`argon2.Options` no longer exists, and `hash()` can return a Buffer). Fixed with `satisfies argon2.HashOptions` and an explicit `raw: false`.
6. **Lint caught unsafe `any` in `@Transform` callbacks.** Moved them into typed shared helpers (`common/validation/transforms.ts`).
7. **UI bug:** the password checklist rendered twice when the password field had an error. Fixed in `FormField` (error and hint render independently).
8. **Wrong test expectation:** a test expected "valid email" for an empty field, but the schema correctly says "Email is required". The test was fixed, not the schema.
9. **Bundle-size warning** (one 546 kB chunk). Split into cacheable `react` and `vendor` chunks.
10. **No MongoDB binary in the sandbox** (downloads blocked), so `mongodb-memory-server` wasn't an option. That pushed me toward the in-memory adapter for fast e2e runs, with the **same e2e suite running against a real MongoDB service in GitHub Actions**. That's better coverage than mocking Mongoose anyway.

## 4. Decisions I made differently from the AI or the references

- **No CQRS/event bus** (unlike bewafra). For a two-entity auth module it's ceremony. I kept only the part that pays off here: a repository **port** with swappable adapters.
- **Access token in memory, not localStorage** (bewafra keeps tokens in localStorage). Here the refresh token lives in an httpOnly, SameSite=Strict cookie scoped to `/api/auth`, so XSS can't steal a long-lived credential.
- **argon2id instead of bcrypt** (goal-track used bcryptjs). It's the current OWASP first choice, has no 72-byte truncation, and has prebuilt binaries.
- **Sign-in does not re-check password strength.** Only sign-up enforces the policy, and sign-in returns one generic message for both failure cases, with a dummy-hash verify so timing doesn't reveal which emails exist.
- **Same-origin by design** (Vite proxy in dev, nginx in Docker) instead of cross-origin CORS with `SameSite=None` cookies, which would also need CSRF tokens.
- **Single active session per user**, a conscious scope cut that's documented in the README with the upgrade path (a sessions collection).
- **goal-track's CI had `continue-on-error: true` on tests.** Removed: a red test must fail the pipeline.

## 5. Prompts and approaches that worked well

- **References over descriptions.** Pointing at my own repos gave the AI concrete conventions (folder layout, naming, decorators) in one step.
- **Constraints stated as invariants**, e.g. *"a forgotten decorator must fail closed"*, *"secrets must be structurally impossible to serialise"*. These produced the global guard + `@Public()` and the `toPublicUser` mapper + `select: false`.
- **Asking for tests that attack the code**: NoSQL operator injection, mass assignment (`role: "admin"`), token replay, enumeration via error messages. Each one is now a regression test in `test/auth.e2e-spec.ts`.
- **Making the AI verify its own work**: lint → typecheck → unit → e2e → build → headless-browser run of the full user flow, with screenshots reviewed before calling anything done.
- **Encoding the conventions back into the repo** (`CLAUDE.md` + `.claude/skills/`) so the next AI-assisted change follows the same rules without re-explaining them.
