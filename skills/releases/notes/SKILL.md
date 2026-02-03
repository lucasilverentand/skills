---
name: release-notes
description: Generates release notes from commits, PRs, and issues between versions. Use when preparing releases, writing changelogs, summarizing changes, or creating release documentation.
argument-hint: [version or tag-range]
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Generate Release Notes

Creates comprehensive release notes from repository history.

## Your Task

<!-- TODO: Implement skill logic -->

1. Determine version range (last tag to HEAD or specified range)
2. Fetch commits via `git log`
3. Fetch merged PRs via `gh pr list --state merged`
4. Categorize changes:
   - Features
   - Bug fixes
   - Breaking changes
   - Dependencies
   - Documentation
5. Extract contributor information
6. Generate formatted release notes
7. Optionally create GitHub release via `gh release create`

## Examples

```bash
# Generate notes since last tag
/release-notes

# Generate notes for specific version
/release-notes v1.2.0

# Generate notes between tags
/release-notes v1.1.0..v1.2.0
```

## Output Format

<!-- TODO: Add release notes templates -->

- **Highlights**: Key features and changes
- **Breaking Changes**: Migration notes
- **What's Changed**: Categorized list
- **Contributors**: New and returning

## Validation Checklist

- [ ] All merged PRs included
- [ ] Breaking changes highlighted
- [ ] Contributors credited
- [ ] Links to PRs/issues included
