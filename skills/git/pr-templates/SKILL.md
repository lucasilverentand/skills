---
name: pr-templates
description: Creates pull request templates and guidelines. Use when standardizing PR descriptions, adding checklists, or improving code review processes.
argument-hint:
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# PR Templates

Creates pull request templates for consistent code reviews.

## Your Task

1. **Identify needs**: Understand review requirements
2. **Create template**: Write PR template file
3. **Add checklists**: Include review criteria
4. **Configure**: Set up GitHub/GitLab templates
5. **Document**: Update contributing guide

## GitHub PR Template

```markdown
<!-- .github/pull_request_template.md -->

## Summary
<!-- Brief description of changes -->

## Changes
-
-
-

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added necessary documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Related Issues
<!-- Link related issues: Closes #123 -->
```

## Multiple Templates

```
.github/
├── PULL_REQUEST_TEMPLATE/
│   ├── feature.md
│   ├── bugfix.md
│   └── docs.md
└── PULL_REQUEST_TEMPLATE.md  # Default
```

## Bug Fix Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE/bugfix.md -->

## Bug Description
<!-- What was the bug? -->

## Root Cause
<!-- Why did this happen? -->

## Fix
<!-- How does this fix it? -->

## Verification
- [ ] Bug can no longer be reproduced
- [ ] Regression test added
- [ ] No side effects observed

## Related Issues
Fixes #
```

## Tips

- Keep templates concise
- Include relevant checklists
- Link to coding standards
- Add label suggestions
