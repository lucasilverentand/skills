---
name: stashing
description: Saves and restores work-in-progress changes using git stash — creates stashes with descriptive messages, restores with pop or apply, inspects stash contents, manages partial stashes, creates branches from stashes, and cleans up old entries. Use when saving uncommitted work, shelving changes temporarily, switching context, restoring stashed changes, inspecting what's in a stash, cleaning up old stashes, or doing a partial stash of selected files.
allowed-tools: Read Grep Glob Bash
---

# Stashing

## Current context

- Stash list: !`git stash list --format="%gd: %s (%cr)"`
- Working tree status: !`git status --short`
- Current branch: !`git branch --show-current`

## Decision tree

- What are you doing?
  - **Saving current changes to a stash** -> what should be included?
    - **All tracked changes (default)** -> run `bun run tools/stash-save.ts`
    - **Include untracked files too** -> run `bun run tools/stash-save.ts --include-untracked`
    - **Only specific files** -> follow "Partial stash" below
    - **With a custom message** -> run `bun run tools/stash-save.ts --message "description"`
  - **Restoring stashed changes** -> how should the stash be handled after restoring?
    - **Restore and remove from stash list** -> follow "Restoring with pop" below
    - **Restore but keep in stash list** -> follow "Restoring with apply" below
    - **Not sure which stash to restore** -> run `git stash list` to see all, `git stash show stash@{n}` for details
  - **Inspecting stash contents** -> `git stash show stash@{n}` for stats, `git stash show -p stash@{n}` for full diff
  - **Creating a branch from a stash** -> follow "Stash branches" below
  - **Cleaning up old stashes** -> follow "Cleanup" below
  - **Resolving a stash conflict** -> follow "Restoring with pop" conflict resolution steps

## Saving

Run `bun run tools/stash-save.ts` to stash with an auto-generated descriptive message based on the changed files. The tool summarizes what files are being stashed so you can identify stashes later.

Options:
- `--include-untracked` — also stash untracked files (git stash -u)
- `--message "your message"` — override the auto-generated message

If you only want to stash staged changes (keep unstaged changes in the working tree):

```bash
git stash push --keep-index
```

## Restoring with pop

Pop removes the stash entry after applying. Use this when you're done context-switching and want to resume work.

```bash
# Restore the most recent stash
git stash pop

# Restore a specific stash
git stash pop stash@{2}
```

If pop produces merge conflicts:
1. The stash is NOT dropped (it stays in the list)
2. Resolve the conflicts in the working tree
3. Stage the resolved files with `git add`
4. Manually drop the stash: `git stash drop stash@{n}`

## Restoring with apply

Apply keeps the stash in the list. Use this when you want to apply the same stash to multiple branches or keep it as a backup.

```bash
# Apply the most recent stash
git stash apply

# Apply a specific stash
git stash apply stash@{1}

# Apply and try to reinstate the index (staged vs unstaged distinction)
git stash apply --index
```

## Partial stash

Stash only specific files when you want to save some changes but keep others in the working tree.

```bash
# Stash specific files only
git stash push -m "description" -- path/to/file1 path/to/file2

# Interactive selection (choose hunks to stash)
git stash push -p
```

To stash everything except already-staged changes:

```bash
git stash push --keep-index
```

This is useful when you've staged the changes you want to commit but need to test them in isolation — stash the rest, run your tests, then pop.

## Stash branches

Create a branch from a stash when the stash conflicts with current work or when the stashed changes deserve their own branch.

```bash
# Create a new branch from a stash, apply the stash, and drop it
git stash branch <branch-name> stash@{n}
```

This checks out the commit where the stash was originally created, creates a new branch, applies the stash, and drops it if successful. It avoids conflicts because you're applying changes to the exact state they were saved from.

## Cleanup

```bash
# List all stashes with dates
git stash list

# Drop a single stash entry
git stash drop stash@{n}

# Clear ALL stashes (destructive — confirm with user first)
git stash clear
```

Never run `git stash clear` without explicit user confirmation — it permanently deletes all stashes.

## Key references

| File / Command | What it covers |
|---|---|
| `tools/stash-save.ts` | Smart save with auto-generated message |
| `git stash list` | Show all stash entries |
| `git stash show [-p] stash@{n}` | Show diff stat (or full patch) for a stash |
| `git stash drop stash@{n}` | Delete a single stash entry |
