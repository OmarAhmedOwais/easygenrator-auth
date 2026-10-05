---
description: Verify a spec end to end before marking it Implemented
argument-hint: <spec folder>
---

Spec: $ARGUMENTS

1. Run `npm run verify` from the repo root (lint, typecheck, unit, e2e, builds). Fix failures before continuing.
2. If the API changed, run `npm run openapi` in `backend/` and confirm the contract diff is intended.
3. Walk every acceptance criterion in `spec.md` and name the test that proves it. Flag any AC without one.
4. Check the docs: README/`docs/*` accurate, CHANGELOG entry under Unreleased, ADRs linked, `specs/README.md` status.
5. Report a pass/fail table per AC and the remaining gaps. Set the spec status to `Implemented` only if everything passes.
