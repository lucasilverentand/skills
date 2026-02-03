---
name: changelog-update
description: Maintains CHANGELOG.md following Keep a Changelog format. Use when updating changelogs, documenting breaking changes, preparing version bumps, or maintaining release history.
argument-hint: [version]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Update Changelog

Maintains CHANGELOG.md following Keep a Changelog conventions.

## Your Task

<!-- TODO: Implement skill logic -->

1. Read existing CHANGELOG.md (or create if missing)
2. Parse current structure and format
3. Gather changes since last version:
   - From commits (conventional commit messages)
   - From merged PRs
   - From Unreleased section
4. Categorize into standard sections:
   - Added, Changed, Deprecated
   - Removed, Fixed, Security
5. Update Unreleased section or create new version
6. Maintain comparison links at bottom
7. Write updated CHANGELOG.md

## Examples

```bash
# Update Unreleased section
/changelog-update

# Release current unreleased as version
/changelog-update v1.2.0
```

## Keep a Changelog Format

<!-- TODO: Add format templates -->

```markdown
## [Unreleased]
### Added
### Changed
### Fixed

## [1.0.0] - 2024-01-15
### Added
- Initial release
```

## Validation Checklist

- [ ] Follows Keep a Changelog format
- [ ] Versions in descending order
- [ ] Comparison links are correct
- [ ] Date format is ISO 8601
