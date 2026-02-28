# Skills Marketplace

Manage the skills marketplace — validate marketplace.json, publish and update skills, enforce naming conventions, and generate the catalog.

## Responsibilities

- Validate marketplace.json structure and integrity against the schema
- Publish new skills to the marketplace by adding entries and validating
- Update published skills with proper semver version bumps
- Enforce naming conventions (kebab-case) and category taxonomy
- Generate marketplace.json from SKILL.md files on disk
- Fix validation errors in marketplace.json
- Manage plugin entries and skill path references

## Tools

- `tools/marketplace-lint.ts` — validate marketplace.json against the schema and report errors
