---
name: templates-setup
description: Creates issue and PR templates for consistent contributions. Use when standardizing issues, improving PR quality, onboarding contributors, or setting up GitHub issue forms.
argument-hint: [template-type]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Setup Issue/PR Templates

Creates GitHub issue and PR templates for consistent contributions.

## Your Task

<!-- TODO: Implement skill logic -->

1. Check existing templates in `.github/`
2. Analyze repository type and needs
3. Create appropriate templates:
   - Issue templates (bug, feature, question)
   - PR template
   - Issue forms (YAML-based)
4. Set up template chooser config
5. Add template documentation

## Examples

```bash
# Create all standard templates
/templates-setup

# Create specific template type
/templates-setup bug
/templates-setup feature
/templates-setup pr
```

## Template Types

<!-- TODO: Add template content -->

### Issue Templates
- **Bug Report**: Steps to reproduce, expected vs actual
- **Feature Request**: Problem, proposed solution, alternatives
- **Question**: Context, what you've tried

### PR Template
- Summary of changes
- Related issues
- Test plan
- Checklist

## Validation Checklist

- [ ] Templates are in correct location
- [ ] YAML syntax is valid (for forms)
- [ ] Template chooser configured
- [ ] Placeholders are helpful
