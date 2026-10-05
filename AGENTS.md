# AGENTS.md

Instructions for AI coding agents (Codex, Cursor, Copilot, Gemini, Claude, …).

**The canonical guide is [CLAUDE.md](./CLAUDE.md). Read it first.** It holds the commands, the
architecture rules and the definition of done. Detailed conventions live in
[`.claude/skills/*/SKILL.md`](./.claude/skills) as plain Markdown that any agent can read:

| Skill                           | Use for                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `spec-driven-development`       | new features: spec → plan → tasks → implement → verify (`specs/`) |
| `nest-auth-backend`             | API code (NestJS 12 ESM, Mongo, auth)                             |
| `react-auth-frontend`           | SPA code (React 19, forms, API client, guards)                    |
| `auth-testing`                  | tests on either side                                              |
| `security-review`               | anything touching auth, data, logging, headers, deps              |
| `architecture-decision-records` | significant decisions (`docs/adr/`)                               |
| `git-workflow`                  | commits, PRs, changelog, releases                                 |

Quick rules: run `npm run verify` before claiming done · never commit secrets · backend relative
imports end in `.js` · routes are protected by default · tokens never go in localStorage.
