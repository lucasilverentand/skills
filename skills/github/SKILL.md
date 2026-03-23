---
name: github
description: GitHub PR workflow — create pull requests with clean history, structured descriptions, pre-flight checks, and draft-first conventions. Use for creating PRs, writing PR descriptions, or preparing changes for review.
allowed-tools: Read Grep Glob Bash
---

# GitHub

## Current context

- Branch: !`git branch --show-current`
- Unpushed: !`git log --oneline @{upstream}..HEAD 2>/dev/null | wc -l | tr -d ' '` commits
- Open PRs: !`gh pr list --author @me --state open --json number,title --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null | head -5`

## Decision Tree

- What do you need to do?
  - **Create a PR** → follow "PR workflow"
  - **Write/improve a PR description** → follow "PR message"
  - **Check if branch is PR-ready** → run `tools/pr-preflight.ts`

---

# PR workflow

### 1. Prepare history

Clean up commits before creating the PR:
- Squash fixup/WIP commits: `git rebase -i origin/main`
- Every commit should be atomic, compilable, and follow conventional commit format
- Validate messages: `tools/commit-lint.ts` (from git plugin)
- Push cleaned branch: `git push --force-with-lease`

### 2. Pre-flight

Run `tools/pr-preflight.ts` — checks: clean worktree, all pushed, conventional commits, no WIP/fixup, CI status, linked issues.

### 3. Create

```sh
gh pr create --title "<type>(<scope>): <desc>" --body "<body>" --draft
```

Always create as **draft**. The user decides when to mark ready.

### 4. Post-creation

- **Labels**: apply labels matching commit type if the repo has them
- **Reviewers**: let CODEOWNERS handle it — don't manually assign unless asked
- **Issues**: link via `Closes #` or `gh pr edit --add-issue`

## PR conventions

- **Sizing**: bundle related work into one well-scoped PR over many small ones. Split only when changes are genuinely independent.
- **Draft first**: always create as draft
- **Clean history**: no fixup/squash/WIP commits in the final PR
- **No self-review**: never request review from the PR author
- **Linked issues**: every PR should reference the issue it addresses
- **Repo templates**: check for `.github/PULL_REQUEST_TEMPLATE.md` first, use it when present

---

# PR message

## Title

Conventional commit format: `<type>(<scope>): <description>`

- Single commit type across the branch → use that type
- Mixed types → use the primary one (main reason the PR exists)
- Scope = most-affected package or module; omit for broad changes
- Max 72 chars, imperative mood, lowercase after colon, no period
- Breaking change: `feat(api)!: remove legacy endpoint`

## Body

Check for `.github/PULL_REQUEST_TEMPLATE.md` first. If found, use it. Otherwise:

```markdown
## Context
{Why this change — problem, motivation, link to issue.}

## Changes
- **New:** {new features, files, endpoints}
- **Updated:** {modified behavior}
- **Removed:** {deleted code}
- **Migration:** {database or config changes}

## Dependencies
| Package | Version | Why |
|---------|---------|-----|
| {name}  | {ver}   | {reason} |

## Testing
- [ ] {specific scenarios verified}

## Notes
{Deployment notes, env vars, breaking changes — omit if none.}

Closes #{issue}
```

Section rules:
- **Context** (mandatory) — explain *why*, 2-4 sentences, link the issue
- **Changes** (mandatory) — categorize as New/Updated/Removed/Migration, omit empty categories
- **Dependencies** (conditional) — only when deps changed, run `tools/dep-diff.ts`. Omit entirely if no changes.
- **Testing** (mandatory) — specific scenarios with checkboxes, not just "tests pass"
- **Notes** (conditional) — only for deployment/reviewer info. Omit if nothing.
- End with `Closes #<issue>` or `Fixes #<issue>`

## Analyze changes before writing

1. Read commit log: `git log --format="### %s%n%b" origin/main..HEAD`
2. Diff stat: `git diff --stat origin/main..HEAD`
3. Dependency changes: `tools/dep-diff.ts`
4. Look for migrations, new config, or env vars

## Writing style

- Be direct — no filler words
- Present tense: "Adds rotation" not "Added rotation"
- Name specific files, functions, endpoints — don't be vague

---

# Tool reference

| Tool | What it does |
|---|---|
| `tools/pr-preflight.ts` | Pre-flight checks: clean worktree, pushed, commit lint, CI, linked issues |
| `tools/dep-diff.ts` | Generate dependency diff table comparing branch to base |
