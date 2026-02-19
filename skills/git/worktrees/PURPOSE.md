# Worktrees

Create and manage worktrees, clean up stale ones, and optimize worktree workflows.

## Responsibilities

- Create and manage git worktrees
- Clean up stale worktrees
- Optimize worktree-based workflows
- Link worktrees to issues or branches automatically
- Detect and repair broken worktree references

## Tools

- `tools/worktree-status.ts` — list all worktrees with their branch, path, and staleness info
- `tools/worktree-create.ts` — create a new worktree linked to a branch with standard directory layout
- `tools/worktree-prune.ts` — detect and remove worktrees whose branches have been merged or deleted
