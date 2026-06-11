---
description: Cleans up the repo — commits changes, clears stashes, opens PRs, prunes branches and worktrees, returns to main
allowed-tools: Read Bash Glob Grep Edit Agent AskUserQuestion
---

Clean up this repo and leave it in a pristine state.

## Current state
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Stashes: !`git stash list`
- Branches: !`git branch --list`
- Worktrees: !`git worktree list`
- Last 5 commits: !`git log --oneline -5`
- Remote status: !`git remote -v 2>/dev/null | head -2`

Follow the full workflow in the `cleaning-repos` skill. Use the current state above to skip straight to the right step in the decision tree — don't re-run commands that are already answered by this context.
