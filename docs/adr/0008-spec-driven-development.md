# ADR-0008: Spec-driven development workflow

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Most code in this repo is written with AI assistance. AI is fast but drifts without a clear
target. Reviewers also evaluate judgement: what was decided, and why.

## Decision

Every feature or significant change goes through `specs/NNN-name/`:
**spec.md** (what/why, acceptance criteria with IDs) → **plan.md** (how) → **tasks.md** (ordered,
verifiable steps) → implement → verify. Slash commands (`/specify`, `/plan`, `/tasks`,
`/implement`, `/verify`, `/review`) and project skills in `.claude/` encode the workflow for AI
agents. `CLAUDE.md` and `AGENTS.md` point every agent to it.

## Consequences

- ✅ Traceability from requirement → task → test → code.
- ✅ AI output is checked against explicit acceptance criteria, not vibes.
- ⚠️ Overhead for tiny changes. Bug fixes and chores can skip straight to a PR with a test.
