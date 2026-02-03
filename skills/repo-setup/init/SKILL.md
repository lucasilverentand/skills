---
name: repo-init
description: Initializes GitHub repositories with best-practice configurations. Use when creating new repos, setting up branch protection, configuring repository settings, or establishing repo standards.
argument-hint: [repo-name]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Initialize Repository

Sets up GitHub repositories with best-practice configurations.

## Your Task

<!-- TODO: Implement skill logic -->

1. Check if repository exists (local or remote)
2. Configure repository settings via `gh repo edit`:
   - Description and topics
   - Visibility settings
   - Feature toggles (issues, wiki, projects)
3. Set up branch protection rules via `gh api`
4. Create default labels
5. Configure merge settings
6. Set up security settings
7. Create initial documentation files

## Examples

```bash
# Initialize current repository
/repo-init

# Create and initialize new repo
/repo-init my-new-project

# Initialize with template
/repo-init --template typescript
```

## Configuration Areas

<!-- TODO: Add configuration templates -->

- **Branch Protection**: Required reviews, status checks
- **Labels**: Standard label set with colors
- **Merge Settings**: Squash, rebase, merge options
- **Security**: Vulnerability alerts, secret scanning

## Validation Checklist

- [ ] Branch protection configured
- [ ] Default labels created
- [ ] Merge settings appropriate
- [ ] Security features enabled
