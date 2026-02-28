---
name: worktrees
description: Creates and manages git worktrees for parallel work across multiple branches. Use when the user wants to work on multiple branches simultaneously without switching context, create a worktree for a branch, clean up stale worktrees, or repair broken worktree references. Trigger phrases: "worktree", "work on multiple branches", "parallel branches", "create worktree", "stale worktree", "broken worktree".
allowed-tools: Read Grep Glob Bash
---

# Worktrees

## Current context

- Worktrees: !`git worktree list 2>/dev/null`

## Decision Tree

- What do you need to do?
  - **Create a new worktree** → run `tools/worktree-create.ts <branch>` or follow "Creating a worktree" below
  - **List all worktrees and their status** → run `tools/worktree-status.ts`
  - **Clean up stale or merged worktrees** → run `tools/worktree-prune.ts`
  - **Repair a broken worktree reference** → follow "Repairing worktrees" below

## Creating a worktree

Worktrees let you check out a different branch into a separate directory without disturbing the current working tree.

1. Use the automated tool for standard layout: `tools/worktree-create.ts <branch-name>`
   - Creates the worktree at a standard path (e.g. `../repo-name-<branch>`)
   - Links to an existing branch, or creates a new one
2. Or create manually:
   ```sh
   # Existing branch
   git worktree add ../<repo>-<branch> <branch>
   # New branch
   git worktree add -b <new-branch> ../<repo>-<branch> origin/main
   ```
3. The new worktree is a full checkout — run `bun install` there if needed

## Working with worktrees

- Each worktree shares the same git history and objects — commits made in any worktree are immediately visible in others
- You cannot check out the same branch in two worktrees simultaneously
- Keep worktrees short-lived — one per active issue or feature

## Cleaning up

1. Check what's stale: `tools/worktree-prune.ts` — lists worktrees whose branches are merged or deleted
2. Remove a specific worktree: `git worktree remove <path>`
   - If the working tree has uncommitted changes, use `--force` only after confirming nothing is needed
3. Run `git worktree prune` to clean up stale administrative files even if directories are already gone

## Repairing worktrees

If a worktree shows as broken (directory deleted or moved):
1. List all worktrees: `git worktree list`
2. Remove the broken entry: `git worktree remove --force <path>`
3. Prune stale refs: `git worktree prune`
4. Re-create if still needed: `tools/worktree-create.ts <branch>`

## Key references

| File | What it covers |
|---|---|
| `tools/worktree-status.ts` | List all worktrees with their branch, path, and staleness info |
| `tools/worktree-create.ts` | Create a new worktree linked to a branch with standard directory layout |
| `tools/worktree-prune.ts` | Detect and remove worktrees whose branches have been merged or deleted |
