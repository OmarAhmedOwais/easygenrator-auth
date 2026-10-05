# ADR-0005: argon2id for password hashing

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Passwords must survive a database leak. The previous project (goal-track) used `bcryptjs`.

## Options considered

1. **bcrypt / bcryptjs**: widely used, but silently truncates input at 72 bytes and isn't memory-hard. bcryptjs is slow pure JS.
2. **scrypt** (Node built-in): memory-hard, no dependency, but the parameters are easy to get wrong.
3. **argon2id**: winner of the Password Hashing Competition and the OWASP first choice. Memory-hard, with prebuilt native binaries.

## Decision

**argon2id** with OWASP's minimum profile: `m=19 MiB, t=2, p=1`. Input is capped at 128 chars to
prevent hash-DoS. A dummy hash is verified for unknown emails to equalise timing.

## Consequences

- ✅ Strong against GPU cracking. No truncation surprises.
- ⚠️ Native module. Prebuilds cover linux/macOS/windows x64/arm64 (incl. Alpine musl).
