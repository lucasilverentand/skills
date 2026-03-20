---
name: conflicts
description: Resolves merge conflicts, detects conflict-prone files before merging, and identifies recurring conflict hotspots. Use when the user encounters merge conflicts, wants to check whether a merge is likely to conflict before running it, or needs to understand which files historically cause the most conflicts. Trigger phrases: "merge conflict", "conflict", "<<<<<<", "both modified", "resolve", "conflict hotspots", "lockfile conflict".
allowed-tools: Read Grep Glob Bash
---

# Conflicts

## Current context

- Branch: !`git branch --show-current`
- Conflicts: !`git diff --name-only --diff-filter=U 2>/dev/null || echo "none"`

## Decision Tree

- What is your situation?
  - **Currently in a conflicted merge/rebase** → follow "Resolving conflicts" below
  - **About to merge and want to check first** → run `tools/conflict-forecast.ts <base> <target>`
  - **Recurring conflicts on specific files** → run `tools/conflict-hotspots.ts`
  - **Lockfile conflict (bun.lockb, package-lock.json)** → run `tools/lockfile-resolve.ts`

## Resolving conflicts

1. List all conflicting files: `git diff --name-only --diff-filter=U`
2. For each conflicting file:
   - Open the file and find conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Understand both sides before choosing — read the full context, not just the markers
   - **Trivial: one side is clearly right** → take that side and remove markers
   - **Both sides have valid changes** → merge the intent manually
   - **Semantic conflict (both compile but logic is wrong)** → understand what each side intended; the correct resolution is often neither A nor B verbatim
3. After resolving each file: `git add <file>`
4. Continue the operation: `git rebase --continue` or `git merge --continue`
5. Abort if stuck: `git rebase --abort` or `git merge --abort`

## Lockfile conflicts

Lockfile conflicts (bun.lockb, package-lock.json, yarn.lock) are almost always best resolved by regeneration rather than manual editing:

1. Run `tools/lockfile-resolve.ts` — this accepts both sides and regenerates the lockfile
2. Or manually: take either version of the lockfile, then run `bun install` to regenerate
3. Stage the result: `git add bun.lockb`

## Prevention strategies

- Merge or rebase from main frequently to keep branches short-lived
- Run `tools/conflict-forecast.ts <base> <target>` before starting a long merge
- Keep files small and focused — large files with many collaborators are hotspots
- For generated files (lockfiles, generated types), agree on a team regeneration workflow

## Key references

| File | What it covers |
|---|---|
| `tools/conflict-forecast.ts` | Detect files likely to conflict between two branches |
| `tools/conflict-hotspots.ts` | Report files with the most merge conflicts in recent history |
| `tools/lockfile-resolve.ts` | Auto-resolve lockfile conflicts by regenerating with bun install |
