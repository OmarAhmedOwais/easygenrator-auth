# Contributing

Thanks for helping! This repo follows a **spec-driven, test-first** workflow. The full
developer guide is [docs/development.md](./docs/development.md). This page is the short version.

## Setup

```bash
nvm use && npm run install:all
cp backend/.env.example backend/.env && cp frontend/.env.example frontend/.env
```

## Making a change

| Change type                    | Process                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| New feature / behaviour change | Spec in `specs/NNN-name/` (spec → plan → tasks), then code |
| Significant technical decision | ADR in `docs/adr/`                                         |
| Bug fix                        | Failing test first, then the fix. Link the issue           |
| Docs / chore                   | PR directly                                                |

1. Branch: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
2. Commits: [Conventional Commits](https://www.conventionalcommits.org), e.g. `fix(backend): return 404 for deleted user`. Enforced by commitlint.
3. Before pushing: `npm run verify` (lint, typecheck, tests, builds).
4. Open a PR with the template filled in and keep it small and focused. CI must be green.
5. Update `CHANGELOG.md` under **Unreleased**.

## Code standards

- TypeScript strict, no `any`, no unused code.
- Follow [CLAUDE.md](./CLAUDE.md) (architecture rules) and the skills in [`.claude/skills`](./.claude/skills).
- Every behaviour change ships with tests at the right layer ([docs/testing.md](./docs/testing.md)).
- Never commit secrets. `.env` files are git-ignored.

## Review checklist (for reviewers)

Correctness against the spec's acceptance criteria · security (see [docs/security.md](./docs/security.md)) ·
tests prove the behaviour · naming and readability · docs and contract (`npm run openapi`) updated.
