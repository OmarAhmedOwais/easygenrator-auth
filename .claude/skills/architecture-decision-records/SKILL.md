---
name: architecture-decision-records
description: >-
  Write or update Architecture Decision Records in docs/adr/. Use when choosing between
  technologies, patterns or approaches with long-lived consequences (database, auth model,
  framework version, deployment topology), when a plan's research shows a significant decision,
  or when superseding an earlier decision.
---

# Architecture Decision Records

## When an ADR is needed

Write one if the decision is costly to reverse, affects several modules, or a new contributor would
reasonably ask "why did we do it this way?". Examples: datastore, token strategy, framework major,
test runner, deployment topology. Not needed for: library patch bumps, naming, local refactors.

## How

1. Next number: `ls docs/adr | grep -E '^[0-9]{4}' | tail -1`, plus one. File: `NNNN-kebab-title.md`.
2. Copy `docs/adr/template.md`. The title is a decision in the imperative ("Use argon2id for password hashing").
3. **Context:** the forces (requirements, constraints, evidence). **Options:** at least 2, with honest pros/cons. **Decision:** "We will …". **Consequences:** positive, negative, follow-ups.
4. Add a row to `docs/adr/README.md`. Link the ADR from the relevant spec/plan and from `CLAUDE.md` if it creates a rule.
5. ADRs are immutable once Accepted. To change course, write a new ADR with `Supersedes ADR-XXXX` and set the old one's status to `Superseded by ADR-YYYY` (the only edit allowed).

Keep it to one page. Link evidence (benchmarks, docs, failing CI runs) instead of pasting it.
