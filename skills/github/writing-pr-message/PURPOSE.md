# Writing PR Message

Author structured pull request titles and descriptions that communicate context, changes, and dependencies.

## Responsibilities

- Write conventional commit-style PR titles
- Generate structured PR descriptions (context, changes, dependencies, test plan, notes)
- Detect and format dependency changes into a bill of materials table
- Respect repo-specific PR templates when they exist, filling gaps with conventions
- Categorize changes as new, updated, removed, or migration

## Tools

- `tools/dep-diff.ts` — generate a dependency diff table comparing branch to base
