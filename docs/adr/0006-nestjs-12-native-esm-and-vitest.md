# ADR-0006: NestJS 12 as native ESM, tested with Vitest

- **Status:** Accepted. Supersedes the initial NestJS 11 pin.
- **Date:** 2026-10-05
- **Related:** [spec 002](../../specs/002-nestjs-12-esm-migration/spec.md)

## Context

NestJS 12 is the current major and is published **as ES modules only**. Our first cut pinned
NestJS 11 because Jest + ts-jest (CommonJS) couldn't load ESM packages. Starting a greenfield
project on the previous major is upgrade debt from day one.

## Options considered

1. **Stay on NestJS 11 + Jest**: zero migration effort. Outdated from day one.
2. **NestJS 12 + Jest in ESM mode** (`--experimental-vm-modules`): an experimental flag, slow, brittle config.
3. **NestJS 12 + Vitest**: what the official `@nestjs/schematics@12` `ts-esm` starter generates. Native ESM, fast, same runner as the frontend.

## Decision

Option 3. The backend is `"type": "module"` with `nodenext` resolution and `.js` import suffixes.
Unit and e2e tests run on Vitest. Companion upgrades: TypeScript 6.0, Mongoose 9,
nestjs-pino 5 / pino 10. `@nestjs/config@12` moved schema validation to Standard Schema, so env
validation uses `ConfigModule.validate` with Joi.

## Consequences

- ✅ Latest framework, one test runner across the repo, faster test startup.
- ✅ Follows the official starter, so future Nest upgrades follow the documented path.
- ⚠️ Relative imports need `.js` extensions (enforced by the compiler).
- ⚠️ TypeScript stays on 6.0 until typescript-eslint supports 7.x.
