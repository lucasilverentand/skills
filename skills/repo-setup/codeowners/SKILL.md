---
name: codeowners-manage
description: Manages CODEOWNERS files for automated review assignments. Use when setting up code ownership, distributing review load, protecting critical paths, or configuring automatic reviewers.
argument-hint: [action]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Manage CODEOWNERS

Creates and maintains CODEOWNERS files for automated review assignments.

## Your Task

<!-- TODO: Implement skill logic -->

1. Analyze repository structure
2. Read existing CODEOWNERS (if any)
3. Identify ownership patterns:
   - By directory/module
   - By file type
   - By component
4. Fetch team/user information via `gh api`
5. Generate or update CODEOWNERS
6. Validate patterns match existing files
7. Check for coverage gaps

## Examples

```bash
# Generate CODEOWNERS from git history
/codeowners-manage generate

# Validate existing CODEOWNERS
/codeowners-manage validate

# Show coverage report
/codeowners-manage coverage
```

## CODEOWNERS Syntax

<!-- TODO: Add pattern examples -->

```
# Global owners
* @org/team-leads

# Directory owners
/src/api/ @org/backend-team
/src/ui/ @org/frontend-team

# File type owners
*.sql @org/dba-team
```

## Validation Checklist

- [ ] All patterns are valid
- [ ] Users/teams exist
- [ ] Critical paths covered
- [ ] No conflicting rules
