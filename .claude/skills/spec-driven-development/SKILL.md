---
name: spec-driven-development
description: >-
  The spec → plan → tasks → implement → verify workflow used in this repo. Use whenever starting
  a new feature or a significant change, when asked to "plan", "spec", "design" or "break down"
  work, or before writing code for anything that changes behaviour. Produces specs/NNN-name/
  {spec,plan,tasks}.md from the templates and keeps requirement IDs traceable to tests.
---

# Spec-driven development

Write down **what and why** before **how**, and **how** before code. AI output is then checked
against explicit acceptance criteria instead of intuition.

## 1. Specify: `specs/NNN-name/spec.md`

- Next free number: `ls specs | sort | tail -1`. Kebab-case name, zero-padded (`003-password-reset`).
- Copy `specs/_templates/spec-template.md`. Fill in: problem, user stories (`US-n`), functional requirements (`FR-n`, MoSCoW), **acceptance criteria (`AC-n`, Given/When/Then, each referencing an FR)**, NFRs, edge cases, non-goals, open questions.
- No technology in the spec unless it's a hard constraint. Stop and ask the user about anything you would otherwise guess (list them under _Open questions_).

## 2. Plan: `plan.md` (+ `research.md`, `data-model.md`, `contracts/`)

- Copy `plan-template.md`. Respect `CLAUDE.md` rules and existing patterns (read `backend/src/modules/auth` and `frontend/src/features/auth` first).
- Cover architecture (mermaid), contracts (routes, payloads, errors), data model, security, test strategy per layer, rollout/config, risks.
- For each real choice, record options + decision in `research.md`. If it's long-lived or costly to reverse, write an ADR (`architecture-decision-records` skill).
- API changes: update DTOs/decorators, then `npm run openapi` regenerates `contracts/openapi.json`.

## 3. Tasks: `tasks.md`

- Copy `tasks-template.md`. Group the work into phases. Each task is ≤ ~1h, names the IDs it satisfies, and says **how it is verified** (test name or command). Mark parallelisable tasks `[P]`.
- End with an **AC → test mapping table** and the definition of done.

## 4. Implement

- One task at a time, in order. Tests first where practical. Tick the box when its verification passes.
- If reality diverges from the plan, update the plan (and the ADR) in the same change. Never leave docs lying.

## 5. Verify

- Every AC has a passing automated test. `npm run verify` is green. CHANGELOG has an entry. The spec status is set to `Implemented`. Index row added to `specs/README.md`.

## When to skip

Typos, dependency bumps, refactors without behaviour change, and small bug fixes (a failing test plus the fix is enough).
