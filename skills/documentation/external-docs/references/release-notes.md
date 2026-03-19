# Release Notes

## When to use

Communicating what changed in a release to users, customers, or stakeholders. Release notes accompany version bumps, deploys, or product updates.

## Template

```markdown
# Release Notes: v<version>

**Date:** <date>
**Highlights:** <1-sentence summary of the most important change>

## Highlights

### <Feature name>

<1-2 sentences describing what it does and why it matters to the user. Screenshot or GIF if visual.>

## What's New

- **<Feature>** — <what it does, from the user's perspective> (#PR)
- **<Feature>** — <description> (#PR)

## Improvements

- **<Area>** — <what got better and how it affects users> (#PR)
- **<Area>** — <description> (#PR)

## Bug Fixes

- **<Bug>** — <what was broken, now fixed> (#PR)
- **<Bug>** — <description> (#PR)

## Breaking Changes

- **<Change>** — <what changed, what users need to do>
  - **Before:** `<old behavior or code>`
  - **After:** `<new behavior or code>`
  - **Migration:** <steps to update>

## Deprecations

- **<Feature>** — deprecated in favor of `<replacement>`. Will be removed in v<version>.

## Known Issues

- <Issue description> — workaround: <how to work around it>
```

## Writing Guidance

### Audience perspective
Write from the user's perspective, not the developer's. "You can now filter dashboard widgets by date range" beats "Implemented DateRangeFilter component with Redux integration."

### Categorization
- **What's New** — genuinely new functionality
- **Improvements** — enhancements to existing features (better performance, UX improvements)
- **Bug Fixes** — things that were broken and are now fixed
- **Breaking Changes** — anything that requires user action to update
- **Deprecations** — features being phased out (with timeline and replacement)

### Breaking changes
Always include:
1. What changed
2. Before/after examples
3. Migration steps
4. Which version removes the deprecated path (if applicable)

### Highlights
For significant releases, pull out 1-3 highlights with more detail. These are the changes worth calling attention to — the ones you'd mention in a tweet or announcement.

## Anti-patterns

- **Developer-centric language** — "Refactored auth middleware" means nothing to users. "Login is now 2x faster" does
- **Missing migration path** — breaking changes without migration steps create angry users
- **No categorization** — a flat list of changes is hard to scan. Group by type
- **Including internal changes** — refactors, dependency bumps, and CI fixes don't belong in user-facing release notes unless they affect users
- **No PR/issue links** — link to the PR or issue for users who want details
