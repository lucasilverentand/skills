# Conflicts
Use this reference for rebases, merges, cherry-picks, and conflict resolution.

## Detect The Operation
```bash
git status --short --branch
test -d "$(git rev-parse --git-dir)/rebase-merge" -o -d "$(git rev-parse --git-dir)/rebase-apply" && echo rebase
test -f "$(git rev-parse --git-dir)/MERGE_HEAD" && echo merge
test -f "$(git rev-parse --git-dir)/CHERRY_PICK_HEAD" && echo cherry-pick
git diff --name-only --diff-filter=U
```

If the working tree is dirty and no operation is in progress, commit first or create a worktree. Do not hide unrelated work in a stash without explaining why.

## Start A Rebase Or Merge
```bash
git fetch origin
git rebase origin/<target>
```

Use merge only when the repo or branch ownership makes rebasing inappropriate.

```bash
git merge origin/<target>
```

## Resolve Conflicts
For each conflicted file:

1. Read the conflict markers and surrounding code.
2. Inspect both sides' intent:

```bash
git log --oneline -5 -- <file>
git log --oneline -5 REBASE_HEAD -- <file>
```

Use `MERGE_HEAD` or `CHERRY_PICK_HEAD` instead of `REBASE_HEAD` for those operations.

3. Classify the conflict:

- Same change on both sides: keep one.
- Additive or non-overlapping changes: combine.
- Import, dependency, or generated ordering: combine and regenerate/sort with repo tooling.
- One side deletes code the other only moved mechanically: preserve the intended current behavior.
- Both sides change behavior differently: stop and ask unless repo history makes the correct result clear.

4. Edit the file, remove markers, and stage it:

```bash
git add <file>
```

5. Continue:

```bash
git rebase --continue
git merge --continue
git cherry-pick --continue
```

Loop until the operation finishes.

## Validation
After conflict resolution, run targeted validation for the touched area, then the repo's standard checks when feasible.

## Push After History Rewrites
Use `--force-with-lease` for your own rebased branches:

```bash
git push --force-with-lease
```

For branches owned by someone else, stop before force-pushing unless the user explicitly approved it.

## Abort
If the user asks to stop or the conflict requires product judgment:

```bash
git rebase --abort
git merge --abort
git cherry-pick --abort
```

Report exactly what remains unresolved.
