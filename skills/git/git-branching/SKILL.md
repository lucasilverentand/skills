---
name: git-branching
description: Sets up Git branching strategies and workflows. Use when establishing team Git workflows, branch naming conventions, or merge strategies.
argument-hint: [strategy]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Git Branching

Sets up Git branching strategies for teams.

## Your Task

1. **Assess needs**: Understand team size and release cadence
2. **Choose strategy**: Select appropriate workflow
3. **Document**: Create branching guidelines
4. **Configure**: Set up branch protection
5. **Communicate**: Share with team

## Common Strategies

### GitHub Flow (Recommended for most)

```
main ─────●─────●─────●─────●─────●
          │     ↑     │     ↑
          └──●──┘     └──●──┘
          feature-1   feature-2
```

- Simple, one main branch
- Feature branches for all changes
- Deploy from main after merge
- Best for: Continuous deployment

### GitFlow

```
main    ─────────●─────────────●
                 ↑             ↑
develop ───●───●─┴───●───●───●─┴───●
           │         ↑
           └────●────┘
           feature
```

- main for releases, develop for integration
- Feature, release, and hotfix branches
- Best for: Scheduled releases

## Branch Naming

```bash
# Features
feature/add-user-auth
feature/JIRA-123-payment-integration

# Bug fixes
fix/login-redirect
fix/JIRA-456-null-pointer

# Other
docs/update-readme
refactor/user-service
chore/update-deps
```

## Branch Protection (GitHub)

```yaml
# Required for main:
- Require pull request reviews (1-2 approvers)
- Require status checks to pass
- Require branches to be up to date
- Require signed commits (optional)
- Do not allow force pushes
- Do not allow deletions
```

## Workflow Commands

```bash
# Start feature
git checkout -b feature/my-feature main

# Keep up to date
git fetch origin
git rebase origin/main

# Prepare for PR
git push -u origin feature/my-feature
```

## Tips

- Keep branches short-lived
- Rebase before merging (cleaner history)
- Delete branches after merge
- Use descriptive branch names
