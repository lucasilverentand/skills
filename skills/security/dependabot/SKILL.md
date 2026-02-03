---
name: dependabot-config
description: Configures Dependabot for automated dependency updates. Use when setting up security updates, managing dependency freshness, configuring update schedules, or automating package updates.
argument-hint: [ecosystem]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Configure Dependabot

Sets up Dependabot for automated dependency management.

## Your Task

<!-- TODO: Implement skill logic -->

1. Detect package ecosystems in repository:
   - npm, pip, cargo, go, maven, etc.
2. Check existing `.github/dependabot.yml`
3. Generate configuration with:
   - Update schedules
   - Target branches
   - Reviewers/assignees
   - Grouping rules
   - Ignore patterns
4. Create or update dependabot.yml
5. Document expected behavior

## Examples

```bash
# Auto-detect and configure all ecosystems
/dependabot-config

# Configure specific ecosystem
/dependabot-config npm
/dependabot-config pip
```

## Configuration Options

<!-- TODO: Add configuration templates -->

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      dev-dependencies:
        patterns:
          - "*"
        dependency-type: "development"
```

## Validation Checklist

- [ ] All ecosystems detected
- [ ] Schedule is appropriate
- [ ] Grouping reduces PR noise
- [ ] Ignore patterns are reasonable
