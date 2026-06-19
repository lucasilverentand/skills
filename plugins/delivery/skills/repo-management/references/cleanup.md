# Cleanup
Use this reference when the user asks to clean, tidy, wrap up, finish a branch, clear stale repo state, or get back to a clean default branch.

## Inventory
```bash
git status --short --branch
git branch --show-current
git stash list
git worktree list
git branch --list
git remote -v
git log --oneline -5
```

Classify the starting state:

- Dirty tree: commit, ignore, or explicitly leave changes.
- Clean feature branch: ensure PR exists or create one when appropriate.
- Clean default branch: clear stale branches, worktrees, and stashes.
- Detached HEAD: identify the commit and branch before making changes.

## Handle Working Tree Changes
Use [commits.md](commits.md) for real changes. For leftovers:

- Generated build output: add or update ignore rules only when clearly appropriate.
- Intentional source files: stage and commit with the related change.
- Ambiguous files: ask before deleting, ignoring, or committing.

Keep going until `git status --short` is clean or the remaining files are intentionally deferred.

## Stashes
Inspect each stash before dropping it:

```bash
git stash list
git stash show -p stash@{N}
```

- Drop stashes whose changes already exist in the codebase.
- Apply and commit stashes that contain still-needed work.
- Ask before dropping unique work.

## PR Before Cleanup
If the current branch has unpublished or unreviewed work, use [pull-requests.md](pull-requests.md). Do not delete or abandon a feature branch that has no PR unless the user explicitly wants that.

## Worktrees
```bash
git worktree prune
git worktree list
```

Remove stale linked worktrees only when their branch has merged or the remote branch has been deleted and the worktree is clean:

```bash
git worktree remove <path>
```

Skip dirty worktrees and report them.

## Branches
Fetch and prune first:

```bash
git fetch --all --prune
```

Find merged branches:

```bash
git branch --merged main
```

Delete only branches that are safely merged and not checked out in another worktree:

```bash
git branch -d <branch>
```

If a branch is stale relative to a repo reset or would resurrect deleted paths, surface that instead of treating it as routine cleanup. `git merge-tree` is useful for checking stale branch effects before merging.

## Return To Default Branch
```bash
git switch main
git pull --ff-only
```

Use `master` only when that is the repo default.

## Final Proof
```bash
git status --short --branch
git branch --show-current
git stash list
git worktree list
```

Report commits, PRs, stashes, branches, worktrees, and anything intentionally left behind.
