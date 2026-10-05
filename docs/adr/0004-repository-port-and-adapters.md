# ADR-0004: Repository port + adapters, without CQRS

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The reference project (bewafra) uses DDD + hexagonal + CQRS with a command/query bus. This
module has one aggregate (User) and five use cases, and delivery speed is scored. We still want
services that are testable without a database and persistence that is swappable.

## Options considered

1. **Inject the Mongoose model into services**: fastest to write, but Mongoose leaks everywhere and tests need a DB or heavy mocks.
2. **Port (abstract class) + adapters**: one small abstraction with high testability.
3. **Full CQRS + event bus**: great for large domains, ceremony here.

## Decision

Option 2. `UsersRepository` is an abstract class (it doubles as the DI token). Adapters:
**Mongoose** (production) and **in-memory** (tests and demo). The binding is chosen once in
`PersistenceModule.forRoot(DB_DRIVER)`.

## Consequences

- ✅ Service tests use the real in-memory adapter, not mocks. E2E runs without MongoDB locally.
- ✅ The same e2e suite runs against a real MongoDB (`DB_DRIVER=mongo`) to keep both adapters honest.
- ⚠️ Two adapters must keep identical semantics (uniqueness, CAS). The shared e2e suite enforces this.
