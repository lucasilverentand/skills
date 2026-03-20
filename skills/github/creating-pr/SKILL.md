---
name: creating-pr
description: Creates high-quality pull requests with clean commit history, structured descriptions (context, changes, dependency bill of materials, test plan), conventional commit titles, CODEOWNERS-based reviewer assignment, and linked issues. Always creates as draft first. Use when the user wants to create a PR, open a pull request, prepare changes for review, submit work for merge, or finalize a branch into a PR. Trigger phrases: "create a PR", "open a PR", "pull request", "ready for review", "submit PR", "make a PR".
allowed-tools: Read Grep Glob Bash
---

# Creating a PR

## Current context

- Branch: !`git branch --show-current`
- Base: !`git log --oneline --decorate @{upstream}..HEAD 2>/dev/null | tail -1 | grep -oP 'origin/\K[^,)]+' || echo "main"`
- Unpushed: !`git log --oneline @{upstream}..HEAD 2>/dev/null | wc -l | tr -d ' '` commits
- Uncommitted: !`git status --porcelain | wc -l | tr -d ' '` files
- CI: !`gh run list --branch "$(git branch --show-current)" --limit 1 --json status,conclusion --jq '.[0] | "\(.status) \(.conclusion // "")"' 2>/dev/null || echo "unknown"`

## Decision Tree

- What do you need to do?
  - **Create a PR from the current branch** → follow "Full workflow" below
  - **Check if the branch is PR-ready** → run `tools/pr-preflight.ts`
  - **Write just the title and description** → use the `writing-pr-message` skill
  - **Clean up history before creating the PR** → follow "Preparing history" below, then come back

## Full workflow

Run these steps in order. Skip any that are already done.

### 1. Prepare history

1. Fetch latest from the base branch: `git fetch origin`
2. Check commit quality: `tools/pr-preflight.ts --check history`
3. If there are fixup/WIP commits or the history is messy:
   - Rebase interactively: `git rebase -i origin/main`
   - Squash fixups, drop WIP markers, reword vague messages
   - Every commit should pass `tools/commit-lint.ts`
4. If the branch has diverged from the base, rebase onto it: `git rebase origin/main`
5. Force-push the cleaned branch: `git push --force-with-lease`

### 2. Pre-flight checks

Run `tools/pr-preflight.ts` and resolve any failures before continuing:

| Check | What it verifies |
|---|---|
| Clean worktree | No uncommitted changes |
| Pushed | All commits are pushed to remote |
| Commit messages | All follow conventional commit format |
| No WIP/fixup | No `fixup!`, `squash!`, or `WIP` commits |
| CI status | Latest CI run passed (or no CI configured) |
| Linked issues | At least one commit references an issue |

### 3. Write the description

Use the `writing-pr-message` skill to generate the title and body. It handles:
- Conventional commit title format
- Repo-specific PR template detection
- Structured body (Context → Changes → Dependencies → Testing → Notes)
- Dependency bill of materials via `tools/dep-diff.ts`

### 4. Create the PR

```sh
gh pr create \
  --title "<type>(<scope>): <description>" \
  --body "<generated body>" \
  --draft
```

Always create as **draft**. The user decides when to mark it ready.

### 5. Post-creation

1. **Labels**: If the repo has labels matching the commit type (e.g. `feature`, `bug`, `refactor`), apply them: `gh pr edit <number> --add-label <label>`
2. **Reviewers**: Let CODEOWNERS handle assignment automatically. Do not manually assign reviewers unless the user asks.
3. **Linked issues**: If not already linked via `Closes #`, link them manually: `gh issue develop <issue> --base <branch>` or add a comment referencing the issue.
4. **CI**: Confirm CI has started. If it fails, diagnose and fix before the PR leaves draft.

## Preparing history

Use this when the branch has a messy commit history before creating a PR.

### Principles

- Every commit should be a meaningful, atomic change
- Each commit should compile and pass tests independently
- All messages follow conventional commit format
- One logical change per commit — don't mix features and refactors

### Process

1. Review the full log: `git log --oneline origin/main..HEAD`
2. Identify commits that need cleanup:
   - **`fixup!` / `squash!`** → rebase with `--autosquash`
   - **`WIP` or vague messages** → reword during rebase
   - **Mixed concerns in one commit** → split during rebase
   - **Multiple commits for the same logical change** → squash
3. Rebase: `git rebase -i origin/main`
4. Validate all messages: for each commit, run `tools/commit-lint.ts "<message>"`
5. Push: `git push --force-with-lease`

## Conventions

- **PR sizing**: Bundle related work into a single well-scoped PR. Prefer one complete, reviewable PR over many fragmented ones. Split only when changes are genuinely independent (e.g., a refactor PR before a feature PR that depends on it).
- **Repo-specific templates**: Always check for `.github/PULL_REQUEST_TEMPLATE.md` first. Use it when present, fill gaps with conventions from this skill.
- **Draft first**: Always create PRs as drafts. Mark ready only after CI passes and the description is complete.
- **No self-review**: Never request review from the PR author.
- **Conventional titles**: PR title follows the same format as commit messages.
- **Clean history**: Rebase and clean up commits before creating the PR. No fixup, squash, or WIP commits should remain.
- **Linked issues**: Every PR should reference the issue it addresses.

## Key references

| File | What it covers |
|---|---|
| `tools/pr-preflight.ts` | Pre-flight checks: clean worktree, pushed, commit lint, CI, linked issues |
| `tools/dep-diff.ts` | Generate a dependency diff table comparing branch to base |
| `tools/commit-lint.ts` | Validate individual commit messages |
