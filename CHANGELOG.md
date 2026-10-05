# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

## [Unreleased]

### Removed

- GitHub Actions workflow. Quality gates are local: git hooks (lint-staged, commitlint) + `npm run verify` ([ADR-0009](./docs/adr/0009-local-quality-gates-instead-of-ci.md)).

### Added

- `npm run openapi:check` (backend and root) to fail when the OpenAPI contract is out of date, and `npm run audit` at the root.

## [1.1.0] - 2026-10-05

### Changed

- **Backend upgraded to NestJS 12** as a native ES module package, following the official `ts-esm` starter ([spec 002](./specs/002-nestjs-12-esm-migration/spec.md), [ADR-0006](./docs/adr/0006-nestjs-12-native-esm-and-vitest.md)).
- Backend tests moved from Jest to **Vitest** (unit + e2e).
- TypeScript 6.0, Mongoose 9, nestjs-pino 5 / pino 10.
- Env validation now runs through `ConfigModule.validate` (Joi).

### Added

- Spec-driven docs: `specs/` (templates, spec 001, spec 002), ADRs 0001–0008, architecture / API / security / testing / development / deployment / runbook guides.
- `npm run openapi` exports the OpenAPI contract, and CI fails on drift.
- Root tooling: husky + lint-staged + commitlint, `.nvmrc`, VS Code recommendations.
- GitHub: PR and issue templates, CODEOWNERS, Dependabot, commit lint job, `npm audit` in CI.
- AI tooling: `AGENTS.md`, slash commands (`/specify`, `/plan`, `/tasks`, `/implement`, `/verify`, `/review`), subagents and more project skills.
- Community files: CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, LICENSE.

### Removed

- `docs/FRD.md` and `docs/TRD.md`, superseded by `specs/001-auth-module/spec.md` and `plan.md`.

## [1.0.0] - 2026-10-05

### Added

- Sign up, sign in, protected application page and logout ([spec 001](./specs/001-auth-module/spec.md)).
- NestJS + MongoDB API: argon2id, JWT access token + rotating httpOnly refresh cookie with reuse detection, global auth guard, throttling, Helmet, Swagger, pino logging, health check.
- React 19 + TypeScript SPA: react-hook-form + zod, live password checklist, route guards, transparent token refresh.
- Tests (unit, e2e, UI), Docker Compose, GitHub Actions CI, README, AI.md, CLAUDE.md, project skills.

[Unreleased]: https://github.com/OmarAhmedOwais/easygenerator-auth/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/OmarAhmedOwais/easygenerator-auth/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/OmarAhmedOwais/easygenerator-auth/releases/tag/v1.0.0
