# ADR-0009: Local quality gates instead of a CI pipeline

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

A GitHub Actions workflow was generated in the first iteration (lint, typecheck, tests, e2e
against MongoDB, build, Docker build). This is a single-developer assessment repository.
A pipeline there adds maintenance and secrets surface, and reviewers judge the code, not a badge.

## Options considered

1. **Keep GitHub Actions**: automatic checks on every push. More moving parts to maintain.
2. **Local gates only**: git hooks + one `verify` script. Zero infrastructure, but relies on running them.

## Decision

Remove the workflow. Quality is enforced locally:

- `pre-commit` → lint-staged (ESLint + Prettier on staged files)
- `commit-msg` → commitlint (Conventional Commits)
- `npm run verify` → lint, typecheck, unit + e2e tests, builds (required before pushing / PRs)
- `npm run openapi:check` → contract drift. `npm run audit` → dependency audit

## Consequences

- ✅ No pipeline to maintain. The same commands work identically on any machine.
- ⚠️ Nothing stops a push that skipped `verify`. Mitigated by hooks and the PR checklist.
- ⚠️ The e2e run against a real MongoDB is manual (`DB_DRIVER=mongo`, see `docs/testing.md`).
- 🔁 Re-introduce CI (the commands above map 1:1 to pipeline steps) if the project gains contributors.
