# Skills Marketplace

Validate marketplace.json integrity and manage skill versioning.

## Responsibilities

- Validate marketplace.json structure and integrity
- Manage skill versioning and metadata
- Enforce naming conventions and category taxonomy
- Track skill install counts and usage statistics

## Tools

- `tools/marketplace-lint.ts` — validate marketplace.json against the schema and report structural errors
- `tools/version-bump.ts` — bump a skill's version following semver and update marketplace.json accordingly
- `tools/catalog-gen.ts` — generate a browsable skill catalog page from marketplace.json metadata
