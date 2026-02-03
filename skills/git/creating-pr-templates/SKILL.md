---
name: creating-pr-templates
description: Creates and configures pull request templates for consistent code reviews with appropriate sections, checklists, and guidelines. Use when standardizing PR descriptions, adding review checklists, improving code review processes, setting up PR template files, or creating multiple templates for different change types.
argument-hint: [template-type]
allowed-tools: Read Write Edit Glob Grep Bash
---

# Creating PR Templates

Creates pull request templates for consistent, high-quality code reviews across your repository.

## Your Task

Guide the user through creating PR templates:

1. **Analyze needs** - Understand review requirements and team workflow
2. **Choose template strategy** - Single default or multiple specialized templates
3. **Create template files** - Write PR template(s) with appropriate sections
4. **Add checklists** - Include review criteria and validation items
5. **Configure location** - Set up in correct GitHub/GitLab path
6. **Document usage** - Update contributing guide if needed

## Task Progress Checklist

Copy and track progress:

```
PR Template Creation Progress:
==============================

Phase 1: Analysis
- [ ] Check for existing PR templates
- [ ] Review repository conventions
- [ ] Identify change types needing templates
- [ ] Understand team review requirements

Phase 2: Template Strategy
- [ ] Decide: single default vs multiple templates
- [ ] If multiple: identify template types needed
- [ ] Plan template sections for each type

Phase 3: Template Creation
- [ ] Create base template structure
- [ ] Add appropriate sections
- [ ] Include relevant checklists
- [ ] Add placeholder guidance comments

Phase 4: Configuration
- [ ] Place in correct location (.github/)
- [ ] Test template loads on new PR
- [ ] Verify formatting renders correctly

Phase 5: Documentation
- [ ] Update CONTRIBUTING.md if exists
- [ ] Add usage notes for multiple templates
```

## Phase 1: Analysis

### Check Existing Templates

```bash
# Check for existing PR templates
ls -la .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null
ls -la .github/pull_request_template.md 2>/dev/null
ls -la .github/PULL_REQUEST_TEMPLATE/ 2>/dev/null
ls -la docs/pull_request_template.md 2>/dev/null
ls -la PULL_REQUEST_TEMPLATE.md 2>/dev/null

# Check contributing guide for PR guidelines
cat CONTRIBUTING.md 2>/dev/null | grep -i "pull request" -A 10
```

### Identify Template Needs

| Change Type | Template Focus |
|-------------|----------------|
| Feature | Summary, changes, screenshots, testing |
| Bug fix | Bug description, root cause, fix, regression test |
| Hotfix | Urgency, impact, testing, rollback plan |
| Documentation | What changed, preview links |
| Dependency update | What updated, breaking changes, testing |
| Refactoring | Motivation, approach, before/after |

## Phase 2: Template Strategy

### Single Default Template

Best for:
- Small teams
- Consistent change types
- Simple review process

Location: `.github/PULL_REQUEST_TEMPLATE.md`

### Multiple Specialized Templates

Best for:
- Large teams with different workflows
- Distinct change types (features vs hotfixes)
- Different review requirements by type

Location:

```
.github/
└── PULL_REQUEST_TEMPLATE/
    ├── feature.md
    ├── bugfix.md
    ├── hotfix.md
    ├── docs.md
    └── dependency.md
```

Usage: Add `?template=feature.md` to PR URL or select from dropdown.

## Phase 3: Template Creation

### Default Template

```markdown
## Summary

<!-- Brief description of what this PR does and why -->

## Changes

<!-- List the specific changes made -->
-
-
-

## Type of Change

<!-- Check the relevant option -->
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Dependency update

## Testing

<!-- Describe how this was tested -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

<!-- Ensure all items are checked before requesting review -->
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated relevant documentation
- [ ] My changes generate no new warnings

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Related Issues

<!-- Link related issues using keywords: Closes #123, Fixes #456 -->
```

### Feature Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE/feature.md -->

## Feature Summary

<!-- What does this feature do? Why is it needed? -->

## Implementation

<!-- How was this implemented? Key design decisions? -->

## Changes

- [ ] New files added
- [ ] Existing files modified
- [ ] Database changes
- [ ] API changes
- [ ] UI changes

## Screenshots/Demo

<!-- For UI features, add before/after screenshots or demo GIF -->

## Testing

- [ ] Unit tests cover new functionality
- [ ] Integration tests added
- [ ] Edge cases handled
- [ ] Performance tested (if applicable)

## Documentation

- [ ] README updated (if applicable)
- [ ] API docs updated (if applicable)
- [ ] Code comments added for complex logic

## Checklist

- [ ] Feature matches acceptance criteria
- [ ] Code follows project conventions
- [ ] No unnecessary dependencies added
- [ ] Feature flag added (if applicable)

## Related Issues

Closes #
```

### Bug Fix Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE/bugfix.md -->

## Bug Description

<!-- What was the bug? How did it manifest? -->

## Root Cause

<!-- Why did this bug occur? -->

## Fix

<!-- How does this PR fix the bug? -->

## Verification

- [ ] Bug can no longer be reproduced
- [ ] Regression test added
- [ ] Related edge cases checked
- [ ] No side effects observed

## Checklist

- [ ] Fix is minimal and focused
- [ ] Tests prove the fix works
- [ ] No new warnings introduced

## Related Issues

Fixes #
```

### Hotfix Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE/hotfix.md -->

## 🚨 Hotfix Summary

<!-- What critical issue does this fix? -->

## Impact

- **Severity:** Critical / High / Medium
- **Users affected:** All / Subset / Internal only
- **Downtime:** Yes / No

## Root Cause

<!-- Brief explanation of what caused the issue -->

## Fix

<!-- What does this fix do? -->

## Testing

- [ ] Tested in staging
- [ ] Smoke tests pass
- [ ] Rollback plan ready

## Rollback Plan

<!-- How to rollback if this fix causes issues -->

## Deployment Notes

<!-- Any special deployment considerations -->

## Related Issues

Fixes #
```

## Phase 4: Configuration

### Create Template Directory

```bash
# For single template
mkdir -p .github
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
# Template content here
EOF

# For multiple templates
mkdir -p .github/PULL_REQUEST_TEMPLATE
# Create each template file
```

### GitHub Template Locations

| Location | Precedence | Notes |
|----------|------------|-------|
| `.github/PULL_REQUEST_TEMPLATE.md` | 1st | Recommended |
| `.github/pull_request_template.md` | 2nd | Lowercase variant |
| `docs/pull_request_template.md` | 3rd | Alternative location |
| `PULL_REQUEST_TEMPLATE.md` | 4th | Root fallback |

### GitLab Template Configuration

```yaml
# .gitlab/merge_request_templates/Default.md
# .gitlab/merge_request_templates/Feature.md
# .gitlab/merge_request_templates/Bug.md
```

## Error Handling

| Issue | Solution |
|-------|----------|
| Template not loading | Check file location and naming (case-sensitive) |
| Markdown not rendering | Verify no syntax errors, test in preview |
| Multiple templates not showing | Ensure directory structure is correct |
| Template too long | Split into sections, use collapsible details |
| Team not using templates | Add contributing guide reference, PR checks |

## Examples

### Basic Setup

```bash
# Create simple default template
mkdir -p .github
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Summary

## Changes

-

## Testing

- [ ] Tests pass

## Related Issues

EOF
```

### Full Multi-Template Setup

```bash
# Create template directory
mkdir -p .github/PULL_REQUEST_TEMPLATE

# Create feature template
cat > .github/PULL_REQUEST_TEMPLATE/feature.md << 'EOF'
## Feature Summary

## Changes

## Testing

## Related Issues
Closes #
EOF

# Create bugfix template
cat > .github/PULL_REQUEST_TEMPLATE/bugfix.md << 'EOF'
## Bug Description

## Root Cause

## Fix

## Related Issues
Fixes #
EOF

# Create default template (shown when no specific template selected)
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Summary

## Changes

## Testing

## Related Issues
EOF
```

## Validation Checklist

Before completing template creation:

- [ ] Template file is in correct location
- [ ] File name follows conventions (case-sensitive)
- [ ] Markdown renders correctly in preview
- [ ] All sections are relevant to the repo's workflow
- [ ] Checklists include actionable items
- [ ] Comment placeholders guide contributors
- [ ] Template is not excessively long
- [ ] Related issues section uses proper keywords (Closes, Fixes)
- [ ] Contributing guide references PR template (if applicable)

## Tips

- Keep templates concise - long templates get ignored
- Use HTML comments for guidance that won't render
- Include only relevant checklists for the change type
- Link to coding standards rather than duplicating them
- Test templates by creating a draft PR
- Consider collapsible sections for optional content
- Update templates as team processes evolve
- Add label suggestions in template comments
