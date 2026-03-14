# Skills Marketplace

Manage the skills marketplace — validate marketplace.json, publish and update skills, enforce naming conventions, and generate the catalog.

## Responsibilities

- Validate marketplace.json structure and integrity against the schema
- Publish new skills to the marketplace by adding entries and validating
- Remove skills from the marketplace and clean up empty plugin entries
- Update published skills with proper semver version bumps
- Enforce naming conventions (kebab-case) and category taxonomy
- Generate marketplace.json from SKILL.md files on disk
- Fix validation errors in marketplace.json
- Manage plugin entries and skill path references (including category moves)

## Tools

- `tools/marketplace-lint.ts` — validate marketplace.json (structure, naming, paths, bundles, cross-references, orphan detection). Flags: `--json` for machine output, `--fix` to auto-sort plugins and skills alphabetically
