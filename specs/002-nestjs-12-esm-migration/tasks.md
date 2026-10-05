# Tasks 002: NestJS 12 ESM migration

|          |                                                                                     |
| -------- | ----------------------------------------------------------------------------------- |
| **Spec** | [spec.md](./spec.md) · **Plan** [plan.md](./plan.md) · **Status** All tasks done ✅ |

- [x] **T001** Inspect the official `@nestjs/schematics@12` `ts-esm` template (package.json, tsconfig, vitest configs) · verify: notes in plan §2
- [x] **T002** Bump `@nestjs/*` to 12, TS 6.0, mongoose 9, nestjs-pino 5, pino 10. Drop the Jest toolchain · _FR-1, FR-5_ · verify: `npm ls`, `npm audit --omit=dev` = 0
- [x] **T003** `"type": "module"` + `nodenext` tsconfig · _FR-2_
- [x] **T004** Add `.js` to all relative imports (scripted, reviewed) · _FR-2_ · verify: `tsc --noEmit`
- [x] **T005** Replace `validationSchema`/`validationOptions` with `validate: validateEnv` · _AC-4_ · verify: boot with a short secret → readable error
- [x] **T006** `vitest.config.ts` + `vitest.config.e2e.ts`. Port specs (`jest.*` → `vi.*`). e2e env via config · _FR-3, AC-2_ · verify: 28 unit + 20 e2e green
- [x] **T007** Build + boot smoke: signup, health, Swagger · _AC-3_
- [x] **T008** [P] OpenAPI export script + CI drift check · _AC-6_
- [x] **T009** [P] Update CI (Vitest coverage), Dockerfile check, docs, ADR-0006, CHANGELOG · _FR-6_
- [x] **T010** Full `npm run verify` + browser smoke of the whole journey · _FR-4_
