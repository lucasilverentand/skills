# Changelogs

## When to use

Maintaining a running record of all notable changes to a project across releases. A changelog is a developer-facing, version-organized list — more granular than release notes, less narrative than a blog post.

## Format

Follow the [Keep a Changelog](https://keepachangelog.com/) standard:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- <new feature or capability>

### Changed
- <modification to existing functionality>

### Fixed
- <bug fix>

## [1.2.0] - 2026-03-15

### Added
- Dark mode support for the dashboard (#142)
- Export to CSV from any data table (#138)

### Changed
- Default pagination increased from 20 to 50 items (#140)

### Fixed
- Date picker no longer resets when switching tabs (#135)
- API rate limit headers now return correct remaining count (#137)

### Removed
- Legacy v1 API endpoints (deprecated since 1.0.0) (#130)

## [1.1.0] - 2026-02-28

### Added
- Webhook support for new events (#125)

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
```

## Categories

Use these categories in this order. Only include categories that have entries.

| Category | What goes here |
|---|---|
| **Added** | New features, new endpoints, new commands |
| **Changed** | Changes to existing functionality, behavior changes |
| **Deprecated** | Features that will be removed in a future version |
| **Removed** | Features removed in this version |
| **Fixed** | Bug fixes |
| **Security** | Vulnerability fixes, security improvements |

## Writing Guidance

### Entry format
Each entry should be:
- One line, starting with a brief description
- Written from the user's perspective where possible
- Linked to the PR or issue number
- Specific enough to understand without clicking through

Good: `- API responses now include pagination metadata in headers (#142)`
Bad: `- Updated API controller`

### What to include
- Changes that affect users or developers consuming the project
- Breaking changes (clearly marked)
- Security fixes (even minor ones)
- Deprecation notices

### What NOT to include
- Internal refactors that don't change behavior
- Dependency bumps (unless they fix a user-facing issue)
- CI/CD changes
- Documentation-only changes

### Versioning
Follow [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0 → 2.0.0): breaking changes
- **Minor** (1.0.0 → 1.1.0): new features, backwards-compatible
- **Patch** (1.0.0 → 1.0.1): bug fixes, backwards-compatible

### Unreleased section
Keep an `[Unreleased]` section at the top. Add entries as changes are merged, not at release time. At release, rename `[Unreleased]` to the new version and add a fresh `[Unreleased]` section.

## Project Setup

- Keep the changelog at `CHANGELOG.md` in the project root
- Link from the README: `See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.`
- Include compare links at the bottom for easy diffing between versions
- For GitHub Releases: the changelog entry for a version can be copied as the release body

## Anti-patterns

- **Changelog generated from git log** — commit messages are not changelog entries. Synthesize meaningful changes
- **Missing PR/issue links** — readers need to click through for context
- **Internal-only changes** — "Refactored utils" doesn't help users. Only include user-affecting changes
- **Batching at release time** — add entries as changes are merged. Trying to reconstruct the changelog at release time leads to missing entries
- **No compare links** — the links at the bottom let readers see the full diff between versions
