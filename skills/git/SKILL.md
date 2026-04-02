---
name: git
description: Git workflow conventions — branching, commits, and repo cleanup. Use for any git operation.
allowed-tools: Read Grep Glob Bash Agent
invocation: /clean-repo
---

# Git Conventions

## Branches

Name branches: `feat/<desc>`, `fix/<desc>`, `refactor/<desc>`, `chore/<desc>`, `docs/<desc>`, `test/<desc>`, `hotfix/<desc>`

- Description: lowercase, hyphens, no underscores/dots, max 50 chars
- Branch from `main` for features/fixes; from the release tag for hotfixes
- Prefer `--force-with-lease` over `--force` when pushing rebased branches

## Commits

Conventional commit format: `<type>(<scope>): <short description>`

- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`
- Subject: imperative mood, lowercase after colon, no period, max 72 chars
- Scope: optional — derive from directory structure:
  - `packages/<name>/` or `apps/<name>/` → scope is `<name>`
  - `src/<module>/` → scope is `<module>`
- Body: explain *why*, not *what*
- Breaking change: `feat!:` + `BREAKING CHANGE:` footer
- Only amend unpushed commits. If already pushed, make a new commit instead.

## Clean Repo (`/clean-repo`)

Interactive workflow to organize messy changes into atomic conventional commits.

**Interactive by default** — present findings before acting, wait for confirmation. If the user says "just do it" or "auto", proceed without asking.

### Flow

1. **Inventory** — assess repo state (uncommitted files, unpushed commits, stale worktrees, merged branches). Present summary, ask what to exclude.
2. **Stash WIP** — if the user marks changes as not ready, stash them with a descriptive message.
3. **Organize commits** — analyze the diff, classify each change by commit type, propose a numbered commit plan (type, message, files). Wait for confirmation. User may merge, reorder, retype, or exclude. Then execute each commit.
4. **Clean branches** — delete merged branches and branches with deleted remotes. Prune remotes.
5. **Push** — check for unpushed commits, ask whether to push.
6. **Summary** — report what was done.

### Classifying changes

| Signal | Type |
|---|---|
| New file with feature code, new exports/functions | `feat` |
| Bug fix (error handling, null check, off-by-one) | `fix` |
| Code restructure, rename, extract (no behavior change) | `refactor` |
| Test files (`.test.`, `.spec.`, `__tests__/`) | `test` |
| Documentation files (`.md`, `docs/`) | `docs` |
| Config, CI, deps, tooling | `chore` |
| Performance improvement | `perf` |

## Lockfile conflicts

Resolve by regenerating (`bun install`), not by manual editing.
