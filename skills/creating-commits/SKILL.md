---
name: creating-commits
description: Creates well-structured conventional commits from working tree changes — analyzes diffs, writes short snappy commit titles with detailed bodies, and splits messy working trees into multiple focused commits with line-level precision. Use when committing changes, organizing uncommitted work into commits, splitting a large changeset into atomic commits, writing commit messages, cleaning up a repo into clean commits, or proactively after completing a piece of implementation work to keep the repo clean.
allowed-tools: Read Bash Glob Grep Edit
---

# Creating Commits
Use this skill proactively whenever you finish implementing something — don't wait for the user to ask. After completing a task, check `git status` and if there are uncommitted changes, commit them using this workflow. Clean commits after each piece of work keeps the repo history readable and reviewable.

## Current context
- Branch: !`git branch --show-current`
- Repo: !`basename $(git rev-parse --show-toplevel)`

## Decision tree
- What are you doing?
  - **Committing current changes** -> are the changes focused on one concern?
    - **Yes, one concern** -> follow "Single commit" below
    - **No, multiple concerns mixed together** -> follow "Multi-commit split" below
  - **Just writing a commit message** (changes already staged) -> skip to "Write the message" in "Single commit"
  - **Proactively committing after finishing work** -> run `git status` and `git diff`, then route to single or multi-commit based on whether changes are focused
  - **Cleaning up a repo** (messy working tree, many unrelated changes) -> follow "Repo cleanup" below

## Commit scope discipline
Every commit should touch **one logical concern**. If you find yourself needing "and" in the subject line, split it. Examples of clean scope:

- Adding a new API endpoint (route + handler + types)
- Fixing a specific bug (the fix + its test)
- Refactoring a module (rename + restructure, no behavior change)
- Updating dependencies (lockfile + any code changes required)

Examples of scope violations — split these:

- A feature + an unrelated lint fix -> two commits
- A refactor + a bug fix found during refactoring -> two commits
- Config changes + the code that uses the new config -> depends: if the config is meaningless without the code, one commit is fine

When in doubt, fewer larger commits are better than many trivial ones. Don't split for the sake of splitting — split when the changes are genuinely unrelated.

## Single commit

### 1. Understand the changes
Run these in parallel:

- `git status` — see what's tracked, staged, untracked
- `git diff` and `git diff --staged` — see actual changes
- `git log --oneline -5` — match the repo's commit style

Read changed files if you need more context. Don't commit blindly — understand what the changes do and why.

### 2. Stage the changes
Stage files by name — avoid `git add -A` or `git add .` which can pull in secrets or binaries. If there are untracked files, decide whether they belong in this commit or should be ignored.

Never stage files that look like secrets (`.env`, credentials, tokens, private keys). Warn the user if they ask to commit these.

### 3. Write the message

#### Subject line
Short, snappy, conventional commit format. Under 50 characters is ideal, 72 is the hard max.

```text
type(scope): what changed
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `build`, `style`

The subject is a headline — terse and scannable. Imperative mood ("add", not "added"). No period.

Good subjects:

- `feat(api): add webhook endpoint`
- `fix(auth): handle expired refresh tokens`
- `refactor(db): extract query builder`
- `chore: update biome config`

Bad subjects (too long, too vague, describes files not intent):

- `fix: update auth.ts and session.ts to handle edge case with tokens` (too long)
- `fix: update files` (too vague)
- `feat(api): add new webhook endpoint for processing incoming events from third-party services` (way too long)

#### Body
The body has two jobs — **what changed** and **why**.

```text
<blank line after subject>
What changed — a brief summary of the concrete changes. What files,
what was added/removed/modified, what behavior is different. A reader
should understand the shape of the diff without opening it.

Why — the reasoning behind this change. What problem it solves, what
motivated it, what alternative was considered and rejected. This is
the part that's invisible in the diff.
```

Skip the body only for truly trivial changes (typo fix, version bump). Everything else gets a body.

#### Format
Always use a heredoc:

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line

What changed: added X, removed Y, modified Z to do W.

Why: the previous approach caused <problem>. This fixes it by
<approach>. Considered <alternative> but rejected because <reason>.
EOF
)"
```

### 4. Verify
Run `git status` after committing to confirm the working tree is clean or has only the expected remaining changes.

## Multi-commit split
Use this when the working tree has unrelated changes mixed together.

### 1. Analyze the changeset
Run `git diff` (and `git diff --staged`) to see all changes. Group them by logical concern — apply the scope discipline rules above. Each group becomes one commit.

### 2. Plan the commit order
Order commits so dependencies come first:

- Refactor before feature (the refactor enables the feature)
- Implementation before tests (tests reference the implementation)
- Dependencies/config before code that uses them

Present the plan to the user before starting — list the planned commits with their types, scopes, and subject lines.

### 3. Stage and commit each group
For each planned commit:

1. Stage only the files for this group: `git add <specific files>`
2. Write the message following the same subject + body format
3. Commit
4. Run `git status` to confirm remaining changes are as expected

### 4. Final check
Run `git log --oneline -N` (N = number of commits created) to show the result. The sequence should read as a coherent narrative.

## Repo cleanup
Use this when asked to "clean up" a repo, or when the working tree is a mess of interleaved changes across many files. This is the most rigorous mode — commits are split at the **line level**, not just the file level.

### 1. Full inventory
Run `git diff` to get the complete picture. For each changed file, read the diff carefully and annotate which lines belong to which logical concern. A single file often contains changes for multiple concerns:

- A function rename (refactor) + a bug fix in the same function (fix) -> two concerns
- An import added for a new feature + an import removed as cleanup -> two concerns
- Whitespace/formatting changes mixed with logic changes -> two concerns

### 2. Build a commit plan
Group every changed line into a logical concern. Each concern becomes a commit. Be granular — the goal is that every commit in the resulting history is independently reviewable and tells one story.

Present the plan as a table:

```text
| # | Type     | Scope   | Subject                        | Files (lines)                        |
|---|----------|---------|--------------------------------|--------------------------------------|
| 1 | refactor | auth    | extract token validation       | auth.ts (12-45), utils.ts (3-8)      |
| 2 | fix      | session | prevent double-refresh race    | auth.ts (67-89)                      |
| 3 | chore    | deps    | update biome config            | biome.json, package.json             |
```

Wait for user approval before proceeding.

### 3. Line-level staging
For each commit, use `git add -p` or targeted approaches to stage only the exact lines for that concern:

- **Whole files** that belong entirely to one concern: `git add <file>`
- **Partial files** where only some lines belong: use the Edit tool to temporarily stash unrelated changes, stage the file, then restore. Workflow:
  1. Save the current file content
  2. Edit the file to contain only the state you want committed (revert the lines that belong to later commits)
  3. `git add <file>`
  4. Restore the full file content: `git checkout -- <file>` does NOT work here since it would undo staging. Instead, after `git add`, write back the saved content so the working tree has all remaining changes
- **New files** that belong to one concern: `git add <file>`

This is tedious but produces a clean history. Take it one commit at a time.

### 4. Commit each group
For each planned commit, after staging the right lines:

1. Verify with `git diff --staged` that only the intended changes are staged
2. Write the message following the subject + body format
3. Commit
4. `git diff` to confirm remaining unstaged changes are what you expect

### 5. Final check
Run `git log --oneline -N` and `git status` to show the result. The working tree should be clean (or have only intentionally uncommitted files). The log should read as a clean, reviewable history.
