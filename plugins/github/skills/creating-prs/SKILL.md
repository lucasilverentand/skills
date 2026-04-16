---
name: creating-prs
description: Creates pull requests with clear titles and well-structured descriptions — rebases onto the target branch, checks for PR templates and contributing guides, summarizes commits into a coherent narrative, and opens the PR via gh CLI. Use when opening a pull request or preparing a branch for review.
allowed-tools: Read Bash Glob Grep Edit Agent AskUserQuestion
---

# Creating PRs
Use this skill proactively when work on a feature branch is done and committed. A branch with commits that hasn't been turned into a PR is unfinished work. Always confirm with the user before actually creating the PR.

## Current context
- Branch: !`git branch --show-current`
- Remote: !`git remote get-url origin 2>/dev/null || echo "no remote"`

## Decision tree
- What are you doing?
  - **Opening a PR for the current branch** -> follow the steps below
  - **On main/master** -> nothing to open a PR for, tell the user

## Step 1: Check if a PR already exists
```bash
gh pr view --json number,title,url 2>/dev/null
```

If a PR already exists, tell the user and show the URL. Don't create a duplicate.

## Step 2: Rebase onto target branch
Always rebase before opening a PR to keep history linear.

Determine the target branch — usually `main`, fall back to `master`:

```bash
git fetch origin
```

```bash
git rebase origin/main
```

If the rebase has conflicts:

1. Show the conflicting files
2. Attempt to resolve obvious conflicts (e.g., lockfile regeneration, import ordering)
3. For non-obvious conflicts, stop and ask the user — don't guess at conflict resolution

## Step 3: Check for project conventions
Before writing the PR, look for guidance on how this project handles PRs:

1. `CONTRIBUTING.md` or `CONTRIBUTING` in the repo root
2. `.github/PULL_REQUEST_TEMPLATE.md` or `.github/pull_request_template.md` — if a template exists, fill it out instead of the default format
3. `CLAUDE.md` — check for PR conventions
4. `.github/CODEOWNERS` — note who will be auto-assigned

Follow any conventions found. Project-specific rules override the defaults below.

## Step 4: Understand the changes
```bash
git log --oneline main..HEAD
```

```bash
git diff main...HEAD --stat
```

Read the commit messages carefully — they contain the what and why. The PR description should synthesize these, not just list them.

For larger branches, read key changed files to understand the full picture.

## Step 5: Determine the title style
Check existing PR titles for the repo to match the convention:

```bash
gh pr list --state merged --limit 10 --json title --jq '.[].title'
```

Match whatever style is used in the project:

- If the repo uses conventional commit prefixes in PR titles (`feat:`, `fix:`), use them
- If the repo uses plain descriptive titles, use those
- If unclear, default to plain descriptive titles

Keep titles under 70 characters. They should communicate the purpose of the whole branch.

## Step 6: Push the branch
```bash
git push -u origin HEAD
```

If the push is rejected after a rebase, force push — this is expected after rebasing:

```bash
git push --force-with-lease origin HEAD
```

## Step 7: Decide draft vs. ready
Open as a **draft** when:

- Work is still in progress but you want early visibility or CI feedback
- The branch is missing tests, docs, or final polish
- The user says "WIP", "draft", or "not ready yet"

Open as **ready for review** when the work is complete, tests pass, and there's nothing left to do.

When in doubt, default to draft — it's easy to mark ready later.

## Step 8: Create the PR
If a PR template exists, fill it out. Otherwise use this structure:

Add `--draft` if opening as a draft (see step 7).

```bash
gh pr create --title "the title" --body "$(cat <<'EOF'
## Summary

Brief description of what this PR does and why. 2-3 sentences max, drawn from the commit bodies. A reviewer should understand the motivation without reading the code.

- Key change 1
- Key change 2
- Key change 3

## Test plan

- [ ] How to verify this works
- [ ] Edge cases to check

## Deploy notes

Any migration steps, environment variable changes, feature flags, or sequencing considerations for shipping this. Omit this section if there's nothing special about deploying this change.
EOF
)"
```

Guidelines for the body:

- **Summary** explains intent, not mechanics — the diff shows the mechanics
- **Bullet points** for concrete changes — keep them scannable
- **Test plan** with actionable steps, not "run the tests"
- **Deploy notes** for anything a deployer needs to know — migrations, env vars, ordering. Skip the section entirely if it's a straightforward deploy.
- **Link issues** when relevant: `Closes #123`, `Fixes #456`
- Don't repeat the title in the body
- Don't list every file changed — that's what the diff tab is for

## Step 9: Monitor CI
After creating the PR, use the `monitoring-ci` skill to watch CI in the background. It will diagnose and fix any failures automatically, then re-watch until green.

### If gh is unavailable
If `gh` is not installed or auth fails, print the branch name and remote URL so the user can create the PR manually.
