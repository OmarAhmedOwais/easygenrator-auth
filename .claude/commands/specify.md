---
description: Create a new feature spec (specs/NNN-name/spec.md) from a short description
argument-hint: <feature description>
---

Use the `spec-driven-development` skill.

Feature request: $ARGUMENTS

1. Pick the next spec number from `specs/` and a short kebab-case name.
2. Create `specs/NNN-name/spec.md` from `specs/_templates/spec-template.md`.
3. Fill in the problem, user stories, functional requirements (with IDs and MoSCoW), Given/When/Then acceptance criteria referencing the FRs, NFRs, edge cases and non-goals. Describe behaviour, not implementation.
4. List anything ambiguous under **Open questions** and ask me about them before moving on. Don't guess.
5. Add the spec to the index in `specs/README.md` with status `Draft`.
