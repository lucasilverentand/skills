---
name: writing-pr-message
description: Authors structured pull request titles and descriptions with context, categorized changes, dependency bill of materials, test plans, and linked issues. Respects repo-specific PR templates. Use when the user wants to write a PR description, draft a PR message, improve an existing PR body, or generate a summary of branch changes for a pull request. Trigger phrases: "write PR description", "PR message", "PR body", "describe my changes", "summarize for PR", "PR summary".
allowed-tools: Read Grep Glob Bash
---

# Writing a PR Message

## Current context

- Branch: !`git branch --show-current`
- Commits: !`git log --oneline origin/main..HEAD 2>/dev/null | head -20`
- Files changed: !`git diff --stat origin/main..HEAD 2>/dev/null | tail -1`

## Decision Tree

- What do you need to do?
  - **Write a full PR title + description from scratch** → follow "Analyze changes" then "Title" then "Body" below
  - **Write just the title** → follow "Title" below
  - **Write just the body/description** → follow "Analyze changes" then "Body" below
  - **Improve an existing PR description** → read the current PR body, then apply the structure from "Body" below

## Analyze changes

Before writing anything, understand what changed and why:

1. Read the full commit log with messages and bodies:
   ```sh
   git log --format="### %s%n%b" origin/main..HEAD
   ```
2. Review the diff stat for scope:
   ```sh
   git diff --stat origin/main..HEAD
   ```
3. Check for dependency changes: `tools/dep-diff.ts`
4. Look for migrations, new config, or env vars in the diff
5. Identify the primary motivation — is this a feature, fix, refactor, or chore?

## Title

Conventional commit format: `<type>(<scope>): <description>`

### Choosing the type

- Single commit type across the branch → use that type
- Mixed types → use the primary one (the main reason the PR exists)
- When in doubt: `feat` for new capability, `fix` for bug fix, `refactor` for restructuring

### Choosing the scope

- Monorepo: use the package name (`feat(api):`, `fix(web):`)
- Single-package repo: use the most-affected module or area (`feat(auth):`, `fix(routing):`)
- Broad changes across the whole codebase: omit scope (`refactor: ...`)

### Rules

- Imperative mood: "add", not "adds" or "added"
- Lowercase after the colon
- No trailing period
- Max 72 characters
- Breaking change: add `!` → `feat(api)!: remove legacy endpoint`

## Body

### Check for repo template first

Look for a PR template in this order:
1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/pull_request_template.md`
3. `docs/pull_request_template.md`

If a template exists, **use it** — fill it in completely and supplement with the conventions below for any sections it doesn't cover. If no template exists, use the full structure below.

### Structure

```markdown
## Context
{Why this change exists — the problem, motivation, or business need.
Link to the issue, design doc, or discussion that prompted this.}

## Changes
- **New:** {new files, features, endpoints, components}
- **Updated:** {modified existing behavior}
- **Removed:** {deleted code, deprecated features}
- **Migration:** {database migrations, config changes}

## Dependencies
| Package | Version | Why |
|---------|---------|-----|
| {name}  | {ver}   | {what it's used for} |

## Testing
- [ ] {specific scenario that was verified}

## Notes
{Deployment steps, required env vars, breaking changes, rollback plan.}

Closes #{issue}
```

### Section rules

**Context** (mandatory)
- Lead with the *why* — what problem exists, what motivated this change
- Link to the issue, ticket, or design doc
- Keep it to 2-4 sentences — enough to orient a reviewer who has no prior context

**Changes** (mandatory)
- Categorize every change as **New**, **Updated**, **Removed**, or **Migration**
- Each bullet should name the specific thing (file, service, endpoint, component)
- Omit empty categories — don't include "Removed" if nothing was removed
- Order: New → Updated → Removed → Migration

**Dependencies** (conditional)
- Include only when dependencies were added, changed, or removed
- Run `tools/dep-diff.ts` to generate the table automatically
- Every new dependency needs a "Why" — what it's used for in this PR
- Omit the section entirely if no deps changed

**Testing** (mandatory)
- List specific scenarios that were verified, not just "tests pass"
- Use checkboxes `- [ ]` so reviewers can verify
- Include both automated tests and any manual verification

**Notes** (conditional)
- Include only when there's something a reviewer or deployer needs to know
- Examples: required env vars, deployment order, breaking changes, rollback steps
- Omit entirely if there's nothing special

**Issue links** (mandatory when an issue exists)
- Use `Closes #<number>` or `Fixes #<number>` at the end to auto-close
- Multiple issues: `Closes #12, closes #15`

### Writing style

- Be direct — no filler words or hedging
- Use present tense: "Adds rotation" not "Added rotation"
- Name specific files, functions, and endpoints — don't be vague
- The description is for reviewers — give them what they need to understand and approve the PR quickly

## Key references

| File | What it covers |
|---|---|
| `tools/dep-diff.ts` | Generate a dependency diff table comparing branch to base |
