---
name: actions-init
description: Creates GitHub Actions workflows for CI/CD pipelines. Use when setting up CI, adding automated testing, configuring deployment workflows, or initializing GitHub Actions in a repository.
argument-hint: [workflow-type]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Initialize GitHub Actions

Creates GitHub Actions workflows tailored to the project's tech stack.

## Your Task

<!-- TODO: Implement skill logic -->

1. Detect project language and framework
2. Identify existing workflows in `.github/workflows/`
3. Determine appropriate workflow type (CI, CD, release, etc.)
4. Generate workflow YAML with:
   - Appropriate triggers
   - Matrix builds if needed
   - Caching configuration
   - Required secrets placeholders
5. Create workflow file
6. Provide setup instructions for secrets

## Examples

```bash
# Auto-detect and create CI workflow
/actions-init

# Create specific workflow type
/actions-init ci
/actions-init deploy
/actions-init release
```

## Workflow Types

<!-- TODO: Add workflow templates -->

- **CI**: Test, lint, build on push/PR
- **CD**: Deploy on merge to main
- **Release**: Create releases on tags
- **Scheduled**: Cron-based maintenance tasks

## Validation Checklist

- [ ] Workflow syntax is valid
- [ ] Triggers are appropriate
- [ ] Caching is configured
- [ ] Secrets are documented
