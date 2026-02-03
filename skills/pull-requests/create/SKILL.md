---
name: pr-create
description: Creates well-structured pull requests with proper descriptions, linked issues, and context. Use when opening PRs, drafting PR descriptions, preparing code for review, or submitting changes for merge.
argument-hint: [branch-name or issue-number]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Create Pull Request

Creates comprehensive pull requests with conventional titles, linked issues, and complete descriptions.

## Your Task

<!-- TODO: Implement skill logic -->

1. Analyze current branch and commits
2. Detect linked issues from branch name or commits
3. Generate PR title following conventional format
4. Create description with summary, changes, and test plan
5. Apply appropriate labels and reviewers
6. Create PR via `gh pr create`

## Examples

```bash
# Basic usage
/pr-create

# With specific base branch
/pr-create main

# Linking to issue
/pr-create #123
```

## Templates

<!-- TODO: Add PR description templates -->

## Validation Checklist

- [ ] PR title follows conventional format
- [ ] Description includes summary of changes
- [ ] Related issues are linked
- [ ] Labels are applied
- [ ] Reviewers are assigned (if applicable)
