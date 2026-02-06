---
name: next-steps
description: Analyzes repository state to recommend what to work on next. Use when unsure what to do, planning work, triaging tasks, starting a session, or asking "what should I work on next".
argument-hint: [focus-area]
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Task
---

# Decide What To Do Next

Analyzes the current state of a repository and recommends the highest-impact next steps.

## Project Context

### Git State

- Branch: !`git branch --show-current`
- Status:

```
!`git status --short`
```

- Stash:

```
!`git stash list 2>/dev/null | head -5`
```

- Recent commits:

```
!`git log --oneline -10`
```

### Open Issues

```
!`gh issue list --limit 15 --json number,title,labels,assignees,updatedAt --jq '.[] | "#\(.number) \(.title) [\(.labels | map(.name) | join(","))] \(.assignees | map(.login) | join(","))"' 2>/dev/null || echo "No GitHub CLI or not a GitHub repo"`
```

### Open Pull Requests

```
!`gh pr list --limit 10 --json number,title,isDraft,reviewDecision,statusCheckRollup --jq '.[] | "#\(.number) \(.title) draft=\(.isDraft) review=\(.reviewDecision) checks=\(.statusCheckRollup | map(.status) | unique | join(","))"' 2>/dev/null || echo "No GitHub CLI or not a GitHub repo"`
```

### TODOs and FIXMEs

```
!`grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" --include="*.rs" --include="*.go" --include="*.md" . 2>/dev/null | head -20 || echo "None found"`
```

### Recent Activity (last 7 days)

```
!`git log --oneline --since="7 days ago" --pretty=format:"%h %s (%an, %ar)" 2>/dev/null | head -15`
```

## Your Task

Analyze the injected context above and recommend what to work on next.

### Step 1: Assess Current State

Evaluate what's in-flight:
- **Uncommitted work**: Is there work-in-progress that should be finished or stashed?
- **Current branch**: Is there an active feature branch with pending work?
- **Stashed changes**: Are there stashed changes that were forgotten?
- **Draft PRs**: Are there draft PRs that need finishing?

### Step 2: Identify Priorities

Score each potential work item by:

| Factor | Weight | Signal |
|--------|--------|--------|
| Blocking others | High | PRs awaiting review, issues blocking milestones |
| Nearly done | High | Draft PRs close to merge, branches with recent commits |
| Bug fixes | High | Issues labeled `bug`, `critical`, `urgent` |
| Review requests | Medium | PRs with pending review decisions |
| Failing checks | Medium | PRs with failing CI/status checks |
| Tech debt | Low | TODOs, FIXMEs, stale branches |
| New features | Low | Feature issues without assignees |

### Step 3: Consider Focus Area

If `$ARGUMENTS` specifies a focus area (e.g., "frontend", "tests", "bugs"), filter recommendations to that area.

### Step 4: Present Recommendations

Output a ranked list of 3-5 actionable next steps:

```
## What To Do Next

### 1. [Highest Priority] Title
**Why**: Reason this is most important
**Action**: Specific command or steps to start
**Effort**: Small / Medium / Large

### 2. [Next Priority] Title
**Why**: ...
**Action**: ...
**Effort**: ...

### 3. [If Time Allows] Title
**Why**: ...
**Action**: ...
**Effort**: ...
```

### Step 5: Offer To Start

After presenting recommendations, ask:

> Want me to start on any of these? I can begin with #1, or pick a different one.

## Example

```
User: what should I work on next

## What To Do Next

### 1. [Finish In-Progress] Complete authentication middleware (#42)
**Why**: Branch `feat/auth-middleware` has 3 uncommitted files and a draft PR #87
**Action**: `git checkout feat/auth-middleware` then finish the token validation
**Effort**: Small - most work is already done

### 2. [Unblock Team] Review PR #85 - Database migration
**Why**: PR has been waiting for review for 3 days, blocking backend work
**Action**: `gh pr checkout 85` and review the migration scripts
**Effort**: Medium

### 3. [Bug Fix] Fix login redirect loop (#39)
**Why**: Labeled `bug` and `high-priority`, reported 5 days ago
**Action**: Start investigating from `src/auth/callback.ts:142` (TODO comment)
**Effort**: Medium

Want me to start on any of these? I can begin with #1, or pick a different one.
```

## Error Handling

| Issue | Response |
|-------|----------|
| Not a git repo | Note this, analyze based on file structure and TODOs only |
| No GitHub CLI | Skip issues/PRs, focus on git state and TODOs |
| Empty repo | Suggest initial setup tasks (README, CI, project structure) |
| No open issues/PRs | Focus on TODOs, code quality, and proactive improvements |
| Too many items | Group by category, show top 3-5 per category |
