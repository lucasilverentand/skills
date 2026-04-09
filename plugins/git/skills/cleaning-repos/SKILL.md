---
name: cleaning-repos
description: Leaves a repo in a pristine state — commits all changes cleanly, prompts about leftover files, clears stale stashes, opens a PR if on a feature branch, cleans up merged branches and stale worktrees, and returns to main. Use when the user says "clean up the repo", "wrap up this branch", "tidy up", or wants to get back to a clean main branch after finishing work.
allowed-tools: Read Bash Glob Grep Edit Agent AskUserQuestion
---

# Clean Repo

Get the repo into a clean, shippable state in one pass.

## Current context

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Worktrees: !`git worktree list`
- Stashes: !`git stash list`

## Decision tree

- What's the state?
  - **Dirty working tree** -> start at "Step 1: Commit everything"
  - **Clean tree, on a feature branch** -> start at "Step 3: Clear stashes"
  - **Clean tree, on main** -> start at "Step 4: Open a PR" (skip to Step 5 if no other branches)
  - **Everything is already clean** -> tell the user, done

## Step 1: Commit everything

Use the `creating-commits` skill to commit all working changes. Route through its decision tree — if changes are mixed concerns, use its multi-commit split or repo cleanup flow to produce line-level clean commits.

After committing, run `git status` to check for leftover files.

## Step 2: Handle leftover files

Run `git status` and look for untracked or ignored files that seem out of place. Categorize them:

- **Generated files** that should be gitignored (build output, `.DS_Store`, `node_modules`, `*.log`) -> add to `.gitignore` and commit
- **Clearly intentional files** that belong in the repo -> stage and commit
- **Ambiguous files** you're not sure about -> ask the user

For ambiguous files, use `AskUserQuestion` with options per file (or group of similar files):

- **Commit it** — stage and commit with an appropriate message
- **Add to .gitignore** — add the pattern and commit the .gitignore change
- **Delete it** — remove the file
- **Leave it** — skip, the user will deal with it later

Keep going until `git status` shows a clean working tree (or only intentionally skipped files).

## Step 3: Clear stashes

Run `git stash list`. If there are stashes, check each one:

```bash
git stash show -p stash@{N}
```

For each stash, check whether its changes already exist in the current codebase. Compare the stash diff against the current state of the files it touches — if the changes are already present (committed or in the working tree), the stash is stale.

- **Stash changes already in the codebase** -> drop it silently, it's obsolete
- **Stash changes NOT in the codebase** -> ask the user with `AskUserQuestion`:
  - **Apply and commit** — apply the stash, commit the changes, drop the stash
  - **Drop it** — discard the stash
  - **Keep it** — leave it for now

## Step 4: Open a PR

Only do this if on a branch other than `main` or `master`.

Use the `creating-prs` skill. It handles rebasing onto main, checking for PR templates and contributing guides, and creating the PR.

## Step 5: Clean up branches and worktrees

### 5a. Prune stale worktrees

```bash
git worktree prune
```

Then list remaining worktrees with `git worktree list`. For any linked worktrees (not the main one) where the branch has been merged or deleted on the remote, remove them:

```bash
git worktree remove <path>
```

If a worktree has uncommitted changes, warn the user and skip it — don't force-remove.

### 5b. Delete merged branches

Fetch and prune remote tracking branches:

```bash
git fetch --prune
```

Find local branches that have been merged into main:

```bash
git branch --merged main
```

Delete each merged branch (except `main`/`master` and the current branch):

```bash
git branch -d <branch>
```

If a branch isn't merged but its remote counterpart is gone (deleted after PR merge), it's likely safe to delete — but ask the user first with `AskUserQuestion` listing the branch names and offering to delete or keep each one.

## Step 6: Return to main

If not already on `main` (or `master`):

```bash
git checkout main
git pull
```

## Step 7: Garbage collect

Run git garbage collection to clean up dangling objects left behind by branch deletions, rebases, and dropped stashes:

```bash
git gc
```

This repacks objects and removes unreachable ones. Safe to run — it only cleans up what's already orphaned.

## Done

Run a final `git status`, `git branch`, and `git stash list` to confirm everything is clean. Report what was done:

- Commits created
- Stashes cleared
- PR opened (with URL)
- Branches deleted
- Worktrees cleaned
