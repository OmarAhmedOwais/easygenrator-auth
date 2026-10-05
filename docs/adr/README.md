# Architecture Decision Records

An ADR captures one significant decision: its context, the options, the choice, and the
consequences. They are short, numbered and **immutable**. To change a decision, write a new ADR
that supersedes the old one. Format: a lightweight [MADR](https://adr.github.io/madr/). Use the
[template](./template.md) and the [`architecture-decision-records`](../../.claude/skills/architecture-decision-records/SKILL.md) skill.

| #                                                                | Decision                                                             | Status                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| [0001](./0001-record-architecture-decisions.md)                  | Record architecture decisions                                        | Accepted                                |
| [0002](./0002-mongodb-with-mongoose.md)                          | MongoDB with Mongoose as the ODM                                     | Accepted                                |
| [0003](./0003-token-strategy-access-in-memory-refresh-cookie.md) | Access token in memory, rotating refresh token in an httpOnly cookie | Accepted                                |
| [0004](./0004-repository-port-and-adapters.md)                   | Repository port + adapters, without CQRS                             | Accepted                                |
| [0005](./0005-argon2id-password-hashing.md)                      | argon2id for password hashing                                        | Accepted                                |
| [0006](./0006-nestjs-12-native-esm-and-vitest.md)                | NestJS 12 as native ESM, tested with Vitest                          | Accepted (supersedes the NestJS 11 pin) |
| [0007](./0007-same-origin-deployment.md)                         | Serve SPA and API from the same origin                               | Accepted                                |
| [0008](./0008-spec-driven-development.md)                        | Spec-driven development workflow                                     | Accepted                                |
| [0009](./0009-local-quality-gates-instead-of-ci.md)              | Local quality gates instead of a CI pipeline                         | Accepted                                |
