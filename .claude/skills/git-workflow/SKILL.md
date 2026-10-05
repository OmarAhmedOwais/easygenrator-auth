---
name: git-workflow
description: >-
  Branching, Conventional Commits, PR and release conventions for this repo. Use whenever
  committing, writing a commit message, preparing or describing a pull request, updating the
  CHANGELOG, or tagging a release.
---

# Git workflow

## Branches

`main` is always releasable. Work on short-lived branches: `feat/<name>`, `fix/<name>`,
`docs/<name>`, `chore/<name>`, `refactor/<name>`. Rebase on `main` before opening a PR. Never
force-push to `main`.

## Commits (enforced by commitlint)

```
<type>(<scope>): <imperative summary, ≤ 72 chars, no trailing period>

<body: what and why, wrapped at 100>

<footer: BREAKING CHANGE: …, Refs #123>
```

- **types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **scopes:** backend, frontend, docs, ci, deps, specs, repo
- One logical change per commit. Tests go in the same commit as the code they cover.
- Examples: `feat(backend): add password reset endpoint` · `fix(frontend): keep session after reload` · `docs(specs): add spec 003 password reset`

## Pull requests

- Title in Conventional Commit form (it becomes the squash commit).
- Fill in `.github/PULL_REQUEST_TEMPLATE.md`: link the spec/issue, explain _how_, tick the checklist.
- Small PRs (< ~400 changed lines excluding lockfiles/generated). `npm run verify` must pass (no CI pipeline; ADR-0009).
- API change → regenerate `specs/*/contracts/openapi.json` (`npm run openapi` in backend).

## Changelog & releases

- Every user-visible change adds a line to `CHANGELOG.md` → `## [Unreleased]` under Added/Changed/Fixed/Removed/Security.
- Release: move Unreleased into `## [x.y.z] - YYYY-MM-DD`, bump versions (SemVer), commit `chore(repo): release vx.y.z`, tag `vx.y.z`.

## Never

Commit `.env` files, secrets or tokens. Skip hooks (`--no-verify`) without saying why in the PR.
Rewrite published history.
