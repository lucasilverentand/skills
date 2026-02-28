---
name: branching
description: Manages git branch strategy, creation, rebase workflows, and cleanup. Use when the user wants to create a branch, rebase onto another branch, compare branches, clean up merged or stale branches, or enforce a branch naming convention. Trigger phrases: "create a branch", "rebase", "compare branches", "clean up branches", "stale branches", "branch naming", "branch strategy".
allowed-tools: Read Grep Glob Bash
---

# Branching

## Current context

- Branch: !`git branch --show-current`
- Unpushed branches: !`git branch --no-merged origin/main 2>/dev/null | head -20`

## Decision Tree

- What do you need to do?
  - **Create a new branch** → follow "Creating a branch" below
  - **Rebase a branch** → follow "Rebase workflow" below
  - **Compare two branches** → run `tools/branch-diff-summary.ts <base> <target>`
  - **Clean up merged or stale branches** → follow "Branch cleanup" below
  - **Check branch naming** → run `tools/branch-naming-check.ts`

## Creating a branch

1. Determine the branch type and name it using the convention:
   - `feat/<short-description>` — new feature
   - `fix/<short-description>` — bug fix
   - `refactor/<short-description>` — code refactoring
   - `chore/<short-description>` — tooling, deps, config
   - `docs/<short-description>` — documentation only
2. Branch from the correct base:
   - **Feature or fix** → branch from `main` (or the team's integration branch)
   - **Hotfix on a release** → branch from the release tag
3. Run: `git checkout -b <branch-name>`
4. Validate the name: `tools/branch-naming-check.ts`

## Rebase workflow

1. Fetch latest: `git fetch origin`
2. Check what has diverged: `git log --oneline HEAD..origin/main`
3. Rebase interactively if you need to squash or reorder: `git rebase -i origin/main`
   - **Fixup commits present** → squash them into their parent during the rebase
   - **Only trivial updates** → `git rebase origin/main` (non-interactive)
4. Resolve any conflicts that arise (see the `conflicts` skill)
5. Force-push only your own branch (never shared/protected branches): `git push --force-with-lease`

## Branch cleanup

1. List stale branches: `tools/stale-branches.ts` — shows branches with no commits in 30+ days
2. Verify a branch is safe to delete:
   - **Already merged into main** → safe to delete
   - **Not merged** → confirm with the user before deleting
3. Delete local: `git branch -d <branch-name>`
4. Delete remote: `git push origin --delete <branch-name>`
5. Prune remote-tracking refs: `git remote prune origin`

## Key references

| File | What it covers |
|---|---|
| `tools/stale-branches.ts` | List branches with no commits in the last 30 days |
| `tools/branch-naming-check.ts` | Validate branch names against naming conventions |
| `tools/branch-diff-summary.ts` | Summarize changes between two branches |
