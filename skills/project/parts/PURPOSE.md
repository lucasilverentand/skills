# Parts

Container for monorepo part-specific skills — each sub-skill targets a specific workspace package type.

## Responsibilities

- Organize skills by monorepo package type
- Provide part-specific guidance and conventions
- Enforce consistent package structure across workspace parts
- Validate that each part exposes correct entry points and exports

## Tools

- `tools/part-list.ts` — list all workspace parts with their type and dependencies
- `tools/part-validate.ts` — check each part for required files, exports, and package.json fields
- `tools/part-deps.ts` — show the internal dependency graph between workspace parts
