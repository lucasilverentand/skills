---
name: pr-update
description: Updates PR descriptions, titles, and metadata to match repository standards. Use when cleaning up PRs, adding missing context, improving reviewability, or fixing PR formatting.
argument-hint: [pr-number]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Update Pull Request

Improves existing PR descriptions and metadata for better reviewability.

## Your Task

<!-- TODO: Implement skill logic -->

1. Fetch current PR details via `gh pr view`
2. Detect repository PR template
3. Analyze current description gaps
4. Enhance title to follow conventions
5. Update description with missing sections
6. Apply appropriate labels
7. Update via `gh pr edit`

## Examples

```bash
# Update specific PR
/pr-update 123

# Update current branch's PR
/pr-update
```

## Enhancement Areas

<!-- TODO: Add detailed enhancement logic -->

- **Title**: Conventional commit format
- **Description**: Summary, changes, test plan, screenshots
- **Labels**: Type, scope, priority
- **Metadata**: Assignees, reviewers, milestone

## Validation Checklist

- [ ] Title follows repository conventions
- [ ] Description has all required sections
- [ ] Labels accurately reflect PR content
- [ ] Linked issues are correct
