# Tasks NNN: <Feature name>

|          |                      |
| -------- | -------------------- |
| **Spec** | [spec.md](./spec.md) |
| **Plan** | [plan.md](./plan.md) |

Legend: `[P]` = can run in parallel with the previous task · each task lists the requirement IDs it
satisfies and how it is verified. Keep tasks small (≤ ~1 hour) and independently verifiable.

## Phase 1: <name>

- [ ] **T001** <task> · _FR-1_ · verify: <test / command>
- [ ] **T002** [P] <task> · _AC-1_ · verify: …

## Definition of done

- [ ] All acceptance criteria in `spec.md` covered by automated tests
- [ ] `npm run verify` green
- [ ] Docs, CHANGELOG and ADRs updated
