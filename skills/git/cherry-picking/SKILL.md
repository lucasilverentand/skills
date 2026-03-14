---
name: cherry-picking
description: Cherry-pick commits across branches, backport fixes to release branches, and verify picks landed. Use when the user wants to cherry-pick a commit, apply a fix to another branch, backport a patch, check if a commit was already picked, or selectively merge changes. Trigger phrases: "cherry-pick", "backport", "pick commit", "apply to release branch", "port fix", "was this commit picked", "selective merge".
allowed-tools: Read Grep Glob Bash
---

# Cherry-picking

## Current context

- Branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Decision Tree

- What do you need to do?
  - **Cherry-pick a single commit** → follow "Single pick" below
  - **Cherry-pick a range of commits** → run `tools/cherry-pick-range.ts <start> <end>`
  - **Backport to a release branch** → run `tools/backport.ts <target-branch> <commit...>`
  - **Check if a commit was already picked** → `git log --cherry-pick --oneline <branch> --right-only <source>...<branch> | grep <short-hash>`
  - **Resolve conflicts during a pick** → follow "Conflict resolution" below

## Single pick

1. Identify the commit hash to pick: `git log --oneline <source-branch> | head -20`
2. Ensure your working tree is clean: `git status`
3. Run: `git cherry-pick <commit-hash>`
4. If there are conflicts, follow "Conflict resolution" below
5. Verify the pick landed: `git log --oneline -3`

## Range picks

1. Identify the start and end of the range on the source branch
2. Run: `tools/cherry-pick-range.ts <start-hash> <end-hash>`
   - Use `--no-commit` to stage changes without committing (useful for squashing)
3. The tool picks commits one by one and reports success/failure for each
4. If a pick fails mid-range, resolve the conflict and the tool will continue

## Conflict resolution during picks

1. When a cherry-pick stops due to conflict:
   - Run `git status` to see which files conflict
   - Open the conflicting files — look for `<<<<<<<`, `=======`, `>>>>>>>` markers
   - Resolve each conflict, keeping the intended changes
2. After resolving all conflicts:
   - Stage resolved files: `git add <file...>`
   - Continue the pick: `git cherry-pick --continue`
3. To abort a cherry-pick entirely: `git cherry-pick --abort`
4. Common conflict causes:
   - **Context drift** — surrounding code changed between branches
   - **Dependent commits** — the picked commit relies on earlier work not present
   - **Renamed files** — file was moved in the target branch

## Backporting workflow

1. Identify which commits need backporting (usually bug fixes or security patches)
2. Run: `tools/backport.ts <release-branch> <commit1> [commit2 ...]`
   - Use `--no-push` to skip pushing the result
3. The tool checks out the target branch, picks the commits, and reports results
4. Verify the backport: `git log --oneline <release-branch> -5`
5. Test the backported changes before pushing

## Verifying picks landed

Check if a commit's changes exist in a target branch using patch-id comparison:

```bash
# Check if a commit is already in the target branch
git log --cherry-pick --oneline <source-branch>...<target-branch> | grep <short-hash>

# Or compare patch IDs directly
git show <commit> | git patch-id   # get the patch ID
git log --format="%H" <target-branch> | while read h; do git show $h | git patch-id; done | grep <patch-id>
```

For a quick check, `git branch --contains <commit>` shows all branches containing that exact commit (but misses cherry-picks with different hashes).

## Key references

| File / Command | What it covers |
|---|---|
| `tools/cherry-pick-range.ts` | Pick a range of commits with per-commit status reporting |
| `tools/backport.ts` | Cherry-pick commits onto a release or maintenance branch |
| `git log --cherry-pick` | Detect equivalent commits across branches |
| `git branch --contains <hash>` | Check which branches contain an exact commit |
