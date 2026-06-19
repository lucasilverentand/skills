---
description: Rebases the current branch onto main or a specified branch, resolving conflicts along the way
allowed-tools: Read Bash Glob Grep Edit AskUserQuestion
---

Rebase the current branch onto the target branch, resolving any conflicts that arise.

## Current state
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Rebase in progress: !`test -d "$(git rev-parse --git-dir)/rebase-merge" -o -d "$(git rev-parse --git-dir)/rebase-apply" && echo "yes" || echo "no"`
- Upstream: !`git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "none"`
- Commits ahead of main: !`git rev-list --count origin/main..HEAD 2>/dev/null || echo "unknown"`

Use the `repo-management` skill. If a rebase is already in progress, read `references/conflicts.md` and continue conflict resolution. Otherwise, determine the target branch from the user's arguments, default to `main` or `master`, then follow the rebase flow in that reference.
