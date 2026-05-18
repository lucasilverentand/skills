---
name: resolving-conflicts
description: Resolves merge conflicts during rebases, merges, and cherry-picks — reads both sides, understands intent from git history, auto-resolves clear-cut cases, and asks about ambiguous ones. Also handles end-to-end rebase workflows (fetch, rebase onto target, resolve, continue). Use when the user says "rebase onto main", "resolve conflicts", "fix these conflicts", "merge main in", "finish this rebase", or when a rebase/merge/cherry-pick has stopped due to conflicts.
allowed-tools: Read Bash Glob Grep Edit AskUserQuestion
---

# Resolving Conflicts
Resolve merge conflicts intelligently by understanding the intent behind both sides of each conflict.

## Current context
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Rebase in progress: !`test -d "$(git rev-parse --git-dir)/rebase-merge" -o -d "$(git rev-parse --git-dir)/rebase-apply" && echo "yes" || echo "no"`
- Merge in progress: !`test -f "$(git rev-parse --git-dir)/MERGE_HEAD" && echo "yes" || echo "no"`
- Cherry-pick in progress: !`test -f "$(git rev-parse --git-dir)/CHERRY_PICK_HEAD" && echo "yes" || echo "no"`

## Decision tree
- What's the situation?
  - **Conflicts exist right now** (rebase/merge/cherry-pick in progress with unresolved conflicts) -> go to "Resolve conflicts"
  - **User wants to rebase onto another branch** (clean working tree, no operation in progress) -> go to "Start rebase"
  - **User wants to merge another branch in** -> go to "Start merge"
  - **Dirty working tree, wants to rebase** -> commit or stash first using the `creating-commits` skill, then go to "Start rebase"

## Start rebase

### 1. Determine the target
Default target is `main` (or `master` if that's what the repo uses). If the user specified a branch, use that.

### 2. Fetch and rebase
```bash
git fetch origin
```

```bash
git rebase origin/<target>
```

- **No conflicts** -> rebase completed cleanly. Go to "Finish".
- **Conflicts** -> go to "Resolve conflicts"

## Start merge
```bash
git fetch origin
```

```bash
git merge origin/<target>
```

- **No conflicts** -> merge completed cleanly. Go to "Finish".
- **Conflicts** -> go to "Resolve conflicts"

## Resolve conflicts

### 1. Inventory conflicted files
```bash
git diff --name-only --diff-filter=U
```

List all conflicted files. Process them one at a time.

### 2. For each conflicted file

#### a. Read the conflict
Read the file to see the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). Understand what each side changed.

#### b. Understand intent
For each conflict, gather context:

- `git log --oneline -5 -- <file>` on the current branch — what recent changes were made and why
- `git log --oneline -5 REBASE_HEAD -- <file>` (or `MERGE_HEAD` / `CHERRY_PICK_HEAD`) — what the incoming side changed and why
- Read surrounding code for context about what the conflicting section does

#### c. Classify the conflict
- **Clear-cut: one side only added** — the other side didn't touch those lines. Take the addition.
- **Clear-cut: one side deleted, other unchanged** — the deletion wins (it was intentional).
- **Clear-cut: non-overlapping edits** — both sides changed different things in the same region. Combine them.
- **Clear-cut: identical changes** — both sides made the same change. Take either (they're the same).
- **Clear-cut: import/dependency ordering** — both sides added imports or dependencies. Combine and sort.
- **Ambiguous: both sides made substantive, different changes to the same lines** — needs human judgment.

#### d. Resolve
For **clear-cut** conflicts:

- Edit the file to remove conflict markers and apply the resolution
- Stage the file: `git add <file>`
- Move to the next conflicted file

For **ambiguous** conflicts:

- Prepare your best resolution based on understanding both sides' intent
- Show the user:
  - What each side was trying to do (with commit context)
  - Your proposed resolution
  - Why you chose this resolution
- Use `AskUserQuestion` with options:
  - **Accept resolution** — use the proposed resolution
  - **Take ours** — keep the current branch's version
  - **Take theirs** — keep the incoming branch's version
- Apply the chosen resolution, edit the file, and stage it

### 3. Continue the operation
After all conflicts in the current round are resolved:

```bash
git rebase --continue
```

(Or `git merge --continue` / `git cherry-pick --continue` depending on the operation.)

If this produces **more conflicts** (common during rebase when replaying multiple commits), loop back to step 1 of "Resolve conflicts". Each round may have different files conflicting.

If `git rebase --continue` needs a commit message, use the original commit message — don't modify it unless the resolution changed the commit's intent.

### 4. Repeat until done
Keep resolving and continuing until the operation completes. Track progress:

```text
Resolving commit 3/7: fix(auth): handle token expiry
```

## Finish

### Show the result
```bash
git log --oneline -10
```

Show what the branch looks like after the operation. Summarize:

- How many conflicts were resolved (and how many were auto-resolved vs. asked about)
- Which commits were replayed (for rebase)

### Offer to push
If the branch has a remote tracking branch and this was a rebase (which rewrites history):

Use `AskUserQuestion`:

- **Force-push** — run `git push --force-with-lease` to update the remote branch
- **Don't push** — leave the changes local for now

Always use `--force-with-lease` over `--force` — it's safer because it fails if someone else pushed to the branch in the meantime.

For merges (which don't rewrite history), offer a regular `git push` instead.

## Aborting
If the user wants to stop mid-resolution, or if the conflicts are too complex:

```bash
git rebase --abort
```

(Or `git merge --abort` / `git cherry-pick --abort`.)

This restores the branch to its state before the operation started. Always mention this option if the user seems unsure about a resolution.
