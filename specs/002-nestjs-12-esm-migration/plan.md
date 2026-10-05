# Plan 002: NestJS 12 ESM migration

|            |                      |
| ---------- | -------------------- |
| **Status** | Implemented          |
| **Spec**   | [spec.md](./spec.md) |

## 1. Summary

Mirror the official `@nestjs/schematics@12` **`ts-esm`** application template: ESM package,
`nodenext` resolution, `.js` extensions on relative imports, Vitest for unit and e2e. Upgrade
the companion libraries Nest 12 requires, adapt the few APIs that changed, and keep every test.

## 2. Decisions

| Topic                 | Decision                                          | Rationale                                                                                                                                                     |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test runner           | **Vitest 5** (unit + e2e configs)                 | Native ESM. Matches the official Nest 12 starter and the frontend. Decorator metadata is emitted by Vite's oxc transformer when `emitDecoratorMetadata` is on |
| Alternatives rejected | Jest `--experimental-vm-modules`. Stay on Nest 11 | Experimental flag + slow. Upgrade debt                                                                                                                        |
| TypeScript            | **6.0** (not 7.0)                                 | Nest schematics require ≥ 6. typescript-eslint supports < 6.1. TS 7 (native) lacks ecosystem support yet                                                      |
| Lint                  | Keep **typescript-eslint (type-checked)**         | Catches unsafe `any`/floating promises that oxlint does not. Speed isn't an issue at this size                                                                |
| Env validation        | `ConfigModule.validate` + Joi                     | `@nestjs/config@12` moved `validationSchema` to Standard Schema. A `validate` function keeps Joi explicit and testable                                        |
| Entry point           | top-level `await bootstrap()`                     | Idiomatic ESM, as in the starter                                                                                                                              |

## 3. Changes by area

| Area             | Change                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`   | `"type": "module"`. Nest 12, TS 6, mongoose 9, nestjs-pino 5 / pino 10 / pino-http 11, vitest + coverage-v8. Removed jest, ts-jest, ts-node, tsconfig-paths |
| `tsconfig*.json` | `nodenext`, `resolvePackageJsonExports`, `isolatedModules`, `types: [node, vitest/globals]`                                                                 |
| Source           | `.js` suffix on every relative import (scripted). `import Joi from 'joi'`. `await bootstrap()`                                                              |
| Config           | `validate: validateEnv` (Joi, abortEarly false)                                                                                                             |
| Tests            | `vitest.config.ts`, `vitest.config.e2e.ts` (env defaults; shell env wins so CI can set `DB_DRIVER=mongo`). `jest.*` → `vi.*`                                |
| Tooling          | `npm run openapi` exports the contract. CI checks drift                                                                                                     |
| Docs             | ADR-0006, README, CLAUDE.md, skills, AI.md, CHANGELOG                                                                                                       |

## 4. Risks

| Risk                                                                       | Mitigation                                                                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| CJS-only dependencies imported from ESM (`joi`, `cookie-parser`, `argon2`) | Default imports through Node's CJS interop. Verified by boot + e2e                                           |
| Decorator metadata missing under Vitest → DI fails silently                | Service specs resolve real providers via `Test.createTestingModule`. They fail loudly if metadata is missing |
| Mongoose 9 typing changes                                                  | `tsc --noEmit` + e2e on real MongoDB in CI                                                                   |

## 5. Rollback

Revert the migration commit. The behaviour contract (OpenAPI + e2e suite) is unchanged, so a
rollback is safe.
