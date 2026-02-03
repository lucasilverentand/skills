---
name: version-bump
description: Manages semantic versioning based on commit history and breaking changes. Use when determining version numbers, tagging releases, following semver, or bumping package versions.
argument-hint: [bump-type]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Bump Version

Determines and applies semantic version bumps based on changes.

## Your Task

<!-- TODO: Implement skill logic -->

1. Get current version from:
   - package.json
   - Cargo.toml
   - pyproject.toml
   - Git tags
2. Analyze commits since last version
3. Determine bump type using conventional commits:
   - `BREAKING CHANGE` or `!` → major
   - `feat:` → minor
   - `fix:` → patch
4. Calculate new version
5. Update version files
6. Create git tag
7. Optionally push tag

## Examples

```bash
# Auto-determine bump from commits
/version-bump

# Specific bump type
/version-bump major
/version-bump minor
/version-bump patch

# Prerelease
/version-bump prerelease alpha
```

## Semver Rules

<!-- TODO: Add version calculation logic -->

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Validation Checklist

- [ ] Version follows semver
- [ ] All version files updated
- [ ] Tag created correctly
- [ ] No uncommitted changes
