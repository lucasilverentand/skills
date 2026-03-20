---
name: github
description: GitHub workflow toolkit — pull request creation (structured descriptions, pre-flight checks, draft-first, CODEOWNERS reviewers) and PR message authoring (context, changes, dependency bill of materials, test plan). Use for any GitHub operation including creating pull requests, writing PR descriptions, or preparing changes for review.
allowed-tools: Read Grep Glob Bash
---

# GitHub

## Current context

- Branch: !`git branch --show-current`
- Unpushed: !`git log --oneline @{upstream}..HEAD 2>/dev/null | wc -l | tr -d ' '` commits
- Open PRs: !`gh pr list --author @me --state open --json number,title --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null | head -5`

## Decision Tree

- What do you need to do?
  - **Pull requests** — create PRs, pre-flight checks, draft-first workflow → go to "Creating PRs"
  - **PR messages** — write or improve PR titles and descriptions → go to "Writing PR Messages"

---

# Creating PRs

## Decision Tree

- What do you need to do?
  - **Create a PR from the current branch** → follow "Full PR workflow" below
  - **Check if the branch is PR-ready** → run `tools/pr-preflight.ts`
  - **Write just the title and description** → go to "Writing PR Messages"
  - **Clean up history before creating the PR** → see "Preparing history" below, then come back

## Full PR workflow

### 1. Prepare history

1. Fetch latest: `git fetch origin`
2. Check commit quality: `tools/pr-preflight.ts --check history`
3. If fixup/WIP commits exist → rebase: `git rebase -i origin/main`
4. Validate all messages with `tools/commit-lint.ts` (from the git plugin)
5. Push: `git push --force-with-lease`

### 2. Pre-flight checks

Run `tools/pr-preflight.ts` — it checks: clean worktree, all pushed, conventional commits, no WIP/fixup, CI status, linked issues.

### 3. PR description

Use the "Writing PR Messages" section to generate the title and body.

### 4. Create the PR

```sh
gh pr create --title "<type>(<scope>): <desc>" --body "<body>" --draft
```

Always create as **draft**. The user decides when to mark it ready.

### 5. Post-creation

- **Labels**: apply labels matching commit type if the repo has them
- **Reviewers**: let CODEOWNERS handle it — don't manually assign
- **Issues**: link via `Closes #` or `gh pr edit --add-issue`

## Preparing history

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
4. Validate all messages with `tools/commit-lint.ts` (from the git plugin)
5. Push: `git push --force-with-lease`

## PR conventions

- **Sizing**: bundle related work into one well-scoped PR over many small ones
- **Repo templates**: check for `.github/PULL_REQUEST_TEMPLATE.md` first, fill gaps with conventions above
- **Draft first**: always create as draft
- **Clean history**: no fixup/squash/WIP commits in the final PR
- **No self-review**: never request review from the PR author
- **Linked issues**: every PR should reference the issue it addresses

---

# Writing PR Messages

## Decision Tree

- What do you need to do?
  - **Write a full PR title + description from scratch** → follow "Analyze changes" then "Title" then "Body" below
  - **Write just the title** → follow "Title" below
  - **Write just the body/description** → follow "Analyze changes" then "Body" below
  - **Improve an existing PR description** → read the current PR body, then apply the structure from "Body" below

## Analyze changes

Before writing anything, understand what changed and why:

1. Read the full commit log: `git log --format="### %s%n%b" origin/main..HEAD`
2. Review the diff stat: `git diff --stat origin/main..HEAD`
3. Check for dependency changes: `tools/dep-diff.ts`
4. Look for migrations, new config, or env vars in the diff
5. Identify the primary motivation — feature, fix, refactor, or chore?

## Title

Conventional commit format: `<type>(<scope>): <description>`

- Single commit type across the branch → use that type
- Mixed types → use the primary one (the main reason the PR exists)
- Scope = most-affected package or module; omit for broad changes
- Max 72 characters, imperative mood, lowercase after colon, no period
- Breaking change: add `!` → `feat(api)!: remove legacy endpoint`

## Body

Check for `.github/PULL_REQUEST_TEMPLATE.md` (or `pull_request_template.md`, `docs/pull_request_template.md`) first. If a template exists, use it and fill gaps. If none, use:

```markdown
## Context
{Why this change — problem, motivation, link to issue or design doc.}

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
- **Dependencies** (conditional) — only when deps changed, run `tools/dep-diff.ts`, omit entirely if no changes
- **Testing** (mandatory) — specific scenarios with checkboxes, not just "tests pass"
- **Notes** (conditional) — only for deployment/reviewer-relevant info, omit if nothing
- End with `Closes #<issue>` or `Fixes #<issue>`

### Writing style

- Be direct — no filler words or hedging
- Use present tense: "Adds rotation" not "Added rotation"
- Name specific files, functions, and endpoints — don't be vague

---

# Tool reference

| Tool | What it does |
|---|---|
| `tools/pr-preflight.ts` | Pre-flight checks: clean worktree, pushed, commit lint, CI, linked issues |
| `tools/dep-diff.ts` | Generate a dependency diff table comparing branch to base |
