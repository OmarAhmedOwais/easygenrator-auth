# ADR-0002: MongoDB with Mongoose as the ODM

- **Status:** Accepted
- **Date:** 2026-10-05
- **Related:** [spec 001](../../specs/001-auth-module/spec.md), [data model](../../specs/001-auth-module/data-model.md)

## Context

The task mandates MongoDB and leaves the ORM open. We need schema validation, a **unique index on
email**, field-level projection for secrets, and first-class NestJS integration.

## Options considered

1. **Mongoose + `@nestjs/mongoose`**: mature, official Nest module, schemas, indexes, `select: false`. Heavier than the raw driver.
2. **Native MongoDB driver**: minimal, but every concern (schemas, indexes, mapping) is hand-written.
3. **Prisma (MongoDB connector)**: good DX, but limited Mongo features and an extra generate step.
4. **Typegoose**: class-based Mongoose. Adds another abstraction for little gain here.

## Decision

Use **Mongoose** via `@nestjs/mongoose`, confined to `modules/users/infrastructure/mongoose`
behind the `UsersRepository` port ([ADR-0004](./0004-repository-port-and-adapters.md)).

## Consequences

- ✅ Unique index guarantees race-free duplicate detection (`E11000` → `409`).
- ✅ `select: false` keeps hashes out of every query by default.
- ⚠️ Mongoose types leak easily. The port boundary contains them.
