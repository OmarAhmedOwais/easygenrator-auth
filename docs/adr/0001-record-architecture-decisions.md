# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-05
- **Deciders:** Omar Ahmed Owais

## Context

Reviewers, future maintainers and AI coding agents need to know _why_ the code looks the way it
does, not only _what_ it does. Decisions buried in chat logs or commit messages get lost.

## Decision

We will record every significant decision as an ADR in `docs/adr/`. That covers anything that
is costly to reverse or that a new contributor would question.

## Consequences

- ✅ Rationale is versioned next to the code and linkable from specs, PRs and `CLAUDE.md`.
- ⚠️ Small overhead per decision. Mitigated by a one-page template.
