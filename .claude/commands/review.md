---
description: Review the current changes (or a branch/PR) like a senior engineer
argument-hint: [base branch, default main]
---

Base branch: $ARGUMENTS (use `main` if empty). Review `git diff <base>...HEAD` plus any uncommitted changes.

Use the `code-reviewer` subagent for correctness/design and the `security-reviewer` subagent for
anything touching auth, sessions, validation, logging, headers or dependencies. Then merge their
findings into one list, ordered by severity (blocking → should fix → nit). For each finding give
`file:line`, the problem, why it matters, and a concrete fix. Finish with what's done well and
whether the change is ready to merge.
