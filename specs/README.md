# Specs: spec-driven development

Every feature or significant change starts here, before any code. The flow is inspired by
GitHub Spec Kit and Amazon's "working backwards": write down **what** and **why**, agree on
**how**, break the work into **tasks**, then implement and verify against the spec.

```
 /specify ─► spec.md      WHAT & WHY   user stories, acceptance criteria, scope, non-goals
 /plan    ─► plan.md      HOW          architecture, contracts, data model, risks, test strategy
             research.md  WHY THIS WAY options considered and decisions (big ones become ADRs)
 /tasks   ─► tasks.md     STEPS        ordered, small, verifiable tasks mapped to requirements
 /implement               DO           one task at a time, tests first where practical
 /verify                  PROVE        every acceptance criterion checked, `npm run verify` green
```

The slash commands live in [`.claude/commands/`](../.claude/commands) and the conventions in
the [`spec-driven-development`](../.claude/skills/spec-driven-development/SKILL.md) skill.

## Rules

- **One folder per change:** `specs/NNN-short-name/` (zero-padded, never reused).
- **Requirements have IDs** (`FR-1`, `NFR-2`, `AC-3`); tasks and tests reference them, so you can
  trace any line of code back to a requirement.
- **Specs are living until merged**, then frozen. A later change gets a new spec that links back.
- **Status** sits at the top of each file: `Draft → Approved → Implemented`.
- Decisions with long-lived consequences are also written as an [ADR](../docs/adr/README.md).

## Index

| #   | Spec                                                             | Status      | Summary                                                     |
| --- | ---------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| 001 | [auth-module](./001-auth-module/spec.md)                         | Implemented | Sign up, sign in, protected app page, sessions              |
| 002 | [nestjs-12-esm-migration](./002-nestjs-12-esm-migration/spec.md) | Implemented | Upgrade the API to NestJS 12 (native ESM) and Jest → Vitest |

## Templates

[spec](./_templates/spec-template.md) · [plan](./_templates/plan-template.md) · [tasks](./_templates/tasks-template.md)
