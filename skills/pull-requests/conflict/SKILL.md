---
name: pr-conflict
description: Guides resolution of merge conflicts with context-aware suggestions. Use when handling merge conflicts, rebasing branches, resolving competing changes, or fixing failed merges.
argument-hint: [branch-name]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Resolve PR Conflicts

Provides guidance and assistance for resolving merge conflicts.

## Your Task

<!-- TODO: Implement skill logic -->

1. Identify conflicting files via `git status`
2. Analyze conflict markers in each file
3. Fetch context from both branches
4. Understand intent of competing changes
5. Suggest resolution strategies
6. Guide through resolution process
7. Verify resolution and test

## Examples

```bash
# Resolve conflicts in current branch
/pr-conflict

# Resolve conflicts with specific base
/pr-conflict main
```

## Resolution Strategies

<!-- TODO: Add detailed resolution guidance -->

- **Ours**: Keep current branch changes
- **Theirs**: Accept incoming changes
- **Merge**: Combine both changes
- **Rewrite**: Create new implementation

## Validation Checklist

- [ ] All conflict markers resolved
- [ ] Code compiles/passes lint
- [ ] Tests pass after resolution
- [ ] No unintended changes introduced
