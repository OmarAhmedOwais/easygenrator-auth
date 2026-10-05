---
description: Write the technical plan (plan.md, research.md, data model, contracts) for a spec
argument-hint: <spec folder, e.g. specs/003-password-reset>
---

Use the `spec-driven-development` and `architecture-decision-records` skills.

Spec: $ARGUMENTS

1. Read the spec, `CLAUDE.md`, `docs/architecture.md` and the existing code patterns it will touch.
2. Create `plan.md` from `specs/_templates/plan-template.md`: architecture (mermaid), contracts, data model, security, test strategy per layer, rollout/config, risks, phases.
3. Record each real choice (options + decision) in `research.md`. Write an ADR for long-lived decisions.
4. Add `data-model.md` and `contracts/` if the data or the API changes.
5. Check that every FR and AC in the spec is addressed. Show me a summary and the open risks.
