---
description: Break a planned spec into ordered, verifiable tasks (tasks.md)
argument-hint: <spec folder>
---

Use the `spec-driven-development` skill.

Spec: $ARGUMENTS

1. Read `spec.md` and `plan.md`.
2. Create `tasks.md` from `specs/_templates/tasks-template.md`. Group tasks into the plan's phases, keep each one ≤ ~1h, reference requirement IDs, and state how each is verified (test name or command). Mark parallelisable tasks `[P]`.
3. Add the AC → test mapping table and the definition of done.
4. Make sure no FR or AC is left without a task, and no task without a requirement.
