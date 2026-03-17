---
name: cleaning-repo
description: Cleans up the local repository state — analyzes all uncommitted and unpushed changes, splits them into atomic conventional commits by type (feat, fix, refactor, test, docs, chore) at hunk level, stashes WIP, cleans up stale worktrees and branches, ensures everything is pushed to the remote, and offers to create PRs or push directly. Use when the user wants to tidy up their repo, organize messy uncommitted work into proper commits, push outstanding changes, clean up after a work session, or prepare a repo for release. Trigger phrases: "clean repo", "clean up", "tidy up", "organize commits", "push everything", "ship it", "wrap up".
allowed-tools: Read Grep Glob Bash Agent
invocation: /clean-repo
---

# Clean Repo

## Current context

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Stash list: !`git stash list --format="%gd: %s (%cr)" 2>/dev/null | head -5`
- Worktrees: !`git worktree list 2>/dev/null`
- Unpushed commits: !`git log --oneline @{upstream}..HEAD 2>/dev/null || echo "(no upstream)"`
- Stale branches: !`git branch --merged main 2>/dev/null | grep -v '^\*\|main$' | head -10`

## Interaction model

This skill is **interactive by default**. At each phase, inform the user what you found and what you plan to do. Give them control:
- Present findings before acting
- Propose actions and wait for confirmation on destructive or opinionated steps
- Accept adjustments ("skip that", "combine those two", "use fix instead of refactor", "leave that branch")
- If the user says "just do it" or "auto", proceed through remaining phases without asking

Use `AskUserQuestion` for structured choices. Keep status updates concise — a short line per action taken, not paragraphs.

## Decision tree

Run these phases in order. Skip phases that have nothing to do.

- **Phase 1: Inventory** → follow "Inventory" below
- **Phase 2: Stash WIP** → follow "Stash WIP" below (only if there are changes the user isn't ready to commit)
- **Phase 3: Organize commits** → follow "Organize commits" below (the core phase)
- **Phase 4: Clean worktrees** → follow "Clean worktrees" below
- **Phase 5: Clean branches** → follow "Clean branches" below
- **Phase 6: Push and PR** → follow "Push and PR" below

---

## Phase 1: Inventory

Assess the full state before doing anything:

1. Run `tools/repo-status.ts --json` to get a structured overview
2. Present a summary to the user as a concise table or bullet list:
   - How many uncommitted files (staged, unstaged, untracked)
   - How many unpushed commits on current branch
   - How many stale worktrees
   - How many merged/stale branches
   - Whether the branch tracks a remote
3. Ask the user:
   - Should anything be excluded or treated as WIP?
   - Are there any phases to skip? (e.g., "don't touch branches", "skip PR")
   - Or "looks good, go ahead" to proceed with defaults

## Phase 2: Stash WIP

If the user marks some changes as not ready to commit:

1. Identify WIP files the user wants to keep uncommitted
2. Confirm which files will be stashed before stashing
3. Stash them with a descriptive message: `git stash push -m "WIP: <description>" -- <files>`
4. Confirm the stash was created: `git stash list | head -1`
5. Continue with the remaining changes

If the user didn't mark any WIP, skip this phase.

## Phase 3: Organize commits

This is the core logic. All uncommitted changes (staged + unstaged + untracked) need to become clean conventional commits.

### Step 1: Analyze changes at hunk level

Run `tools/change-analyzer.ts --json` to get a hunk-level breakdown. The tool:
- Runs `git diff` and `git diff --cached` to get all hunks
- Classifies each hunk by conventional commit type using file path and content signals
- Groups hunks into proposed commits
- Handles untracked files as additions

### Step 2: Propose commit plan

Present the proposed commits to the user in a numbered list. For each commit show:
- The conventional commit type and suggested message
- The files (and which hunks, if a file is split across commits)
- The scope if detectable (e.g., directory name in a monorepo)

Example output:
```
Proposed commits:
  1. refactor(utils): extract shared validation helpers
     - src/utils/validate.ts (all hunks)
     - src/utils/index.ts (hunk 1 of 2)
  2. feat(auth): add token refresh endpoint
     - src/auth/refresh.ts (new file)
     - src/auth/router.ts (hunk 2 of 3)
  3. test(auth): add refresh token tests
     - src/auth/__tests__/refresh.test.ts (new file)
  4. chore: update dependencies
     - package.json (hunk 1 of 1)
     - bun.lockb (all hunks)
```

**Wait for user confirmation.** The user may:
- Approve as-is
- Merge commits ("combine 1 and 2")
- Change types ("make 2 a fix instead")
- Reword messages
- Reorder commits
- Exclude files ("skip the lockfile")

Apply adjustments and re-present if significant changes were made.

### Step 3: Execute commits

For each approved commit, in order:

1. Reset the staging area: `git reset HEAD`
2. Stage the specific hunks for this commit using `tools/stage-hunks.ts <commit-index>`
   - For whole-file changes: `git add <file>`
   - For partial files: use `git add -p` with automated patch selection
   - For untracked files: `git add <file>`
3. Validate the commit message: run the committing skill's `tools/commit-lint.ts` if available
4. Create the commit with the conventional message
5. Report: `created: <short hash> <message>`

### Commit type classification rules

| Signal | Type |
|---|---|
| New file with feature code | `feat` |
| Bug fix (error handling, null check, off-by-one) | `fix` |
| Code restructure, rename, extract, inline (no behavior change) | `refactor` |
| Test files (`.test.`, `.spec.`, `__tests__/`) | `test` |
| Documentation files (`.md`, `docs/`) | `docs` |
| Config, CI, deps, tooling | `chore` |
| Performance improvement | `perf` |

When a file has hunks that belong to different types, split at the hunk level. When in doubt between `feat` and `refactor`, check if the change adds new capability visible to callers — if yes, `feat`; if it restructures existing behavior, `refactor`.

### Scope detection

Detect scope from the file path:
- Monorepo packages: `packages/<name>/` → scope is `<name>`
- Top-level directories: `src/<module>/` → scope is `<module>`
- Single file in root: no scope needed

## Phase 4: Clean worktrees

1. Run `git worktree list` to find all worktrees
2. If there are worktrees beyond the main working directory, present them:
   - Show path, branch, and whether it has uncommitted changes
   - Mark which ones are safe to remove (branch merged, no uncommitted changes)
3. Ask the user which to remove (default: all safe ones)
4. For confirmed removals: `git worktree remove <path>`
5. If a worktree has uncommitted changes, warn clearly — only remove if the user explicitly confirms
6. Prune stale refs: `git worktree prune`

If no extra worktrees exist, report "no worktrees to clean" and move on.

## Phase 5: Clean branches

1. Find merged branches: `git branch --merged main | grep -v '^\*\|main$'`
2. Find branches with deleted remotes: `git branch -vv | grep ': gone]'`
3. If any found, present the list and ask which to delete (default: all merged + gone)
4. Delete confirmed branches: `git branch -d <branch>` for each
5. Prune remote tracking refs: `git remote prune origin`
6. Report what was cleaned

If no stale branches exist, report "no branches to clean" and move on.

## Phase 6: Push and PR

1. Check if the current branch tracks a remote: `git rev-parse --abbrev-ref @{upstream}`
2. Check for unpushed commits: `git log --oneline @{upstream}..HEAD`
3. If there are unpushed commits, ask the user what to do:
   - **Push directly to current branch** — good for feature branches
   - **Create a new branch and PR** — if on main and changes should be reviewed
   - **Push to main** — only if they explicitly choose this
   - **Skip** — leave unpushed for now
4. Push with: `git push -u origin <branch>`
5. If creating a PR, generate title and body from the commit messages using `gh pr create`

## Final summary

After all phases, show a concise recap:

```
Done:
  commits: 3 created (refactor, feat, test)
  worktrees: 2 removed
  branches: 1 deleted (feat/old-thing)
  pushed: main → origin/main (3 commits)
  stashed: 1 WIP saved
```

## Key references

| File | What it covers |
|---|---|
| `tools/repo-status.ts` | Full repository state assessment (uncommitted, unpushed, worktrees, branches) |
| `tools/change-analyzer.ts` | Hunk-level change analysis and commit type classification |
| `tools/stage-hunks.ts` | Stage specific hunks for a proposed commit group |
