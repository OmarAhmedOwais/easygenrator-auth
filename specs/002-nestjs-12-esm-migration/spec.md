# Spec 002: Upgrade the API to NestJS 12 (native ESM) and Vitest

|             |                                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**  | Implemented                                                                                                                                                |
| **Author**  | Omar Ahmed Owais                                                                                                                                           |
| **Created** | 2026-10-05                                                                                                                                                 |
| **Related** | [plan](./plan.md) · [tasks](./tasks.md) · [ADR-0006](../../docs/adr/0006-nestjs-12-native-esm-and-vitest.md) · supersedes the NestJS 11 choice in spec 001 |

## 1. Problem & goal

The first delivery pinned **NestJS 11** because NestJS 12 ships as **ES modules only**, which
broke the Jest + ts-jest (CommonJS) test setup. Staying a major version behind on a new codebase
creates upgrade debt from day one and signals outdated practice. Goal: run the API on the
**latest NestJS 12** as a **native ESM** package, with a test runner that supports ESM natively,
and no behaviour change.

## 2. User stories

- **US-1** As a maintainer, I want the API on the current NestJS major, so that I get fixes and features without a forced migration later.
- **US-2** As a developer, I want fast tests that run ESM natively, so that I don't fight transpiler configuration.

## 3. Functional requirements

| ID   | Requirement                                                                               | Priority |
| ---- | ----------------------------------------------------------------------------------------- | -------- |
| FR-1 | All `@nestjs/*` packages on v12 (throttler on its latest compatible 6.x)                  | Must     |
| FR-2 | Backend is `"type": "module"`, compiled with `module/moduleResolution: nodenext`          | Must     |
| FR-3 | Unit + e2e tests run on **Vitest**, following the official Nest 12 `ts-esm` starter       | Must     |
| FR-4 | No API behaviour change: same routes, status codes, payloads, cookies                     | Must     |
| FR-5 | Companion upgrades required by Nest 12: TypeScript 6, Mongoose 9, nestjs-pino 5 / pino 10 | Must     |
| FR-6 | Docker image, CI and docs updated                                                         | Must     |

## 4. Acceptance criteria

- **AC-1** `npm ls @nestjs/core` shows 12.x. `package.json` has `"type": "module"`.
- **AC-2** The full existing test suite (28 unit + 20 e2e) passes unchanged in intent on Vitest.
- **AC-3** `npm run build && node dist/main.js` boots. Swagger, health and the full auth flow work (smoke test).
- **AC-4** An invalid env still fails fast at boot with a readable message.
- **AC-5** `npm audit --omit=dev` reports no high-severity vulnerabilities. Lint and typecheck are clean.
- **AC-6** The generated OpenAPI contract is identical in routes and schemas to the pre-migration one.

## 5. Non-functional requirements

| ID    | Requirement                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| NFR-1 | Decorator metadata (`emitDecoratorMetadata`) keeps working under the Vitest transformer, because DI depends on it |
| NFR-2 | Test runtime equal or better than Jest                                                                            |

## 6. Out of scope

Frontend changes (already on Vite + Vitest). Changing ESLint to oxlint (the official starter
uses oxlint; we keep type-aware typescript-eslint rules, see plan §2).
