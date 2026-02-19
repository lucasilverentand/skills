# Utils

Shared utility functions: formatters, validators, and helpers.

## Responsibilities

- Maintain shared formatter utilities
- Maintain shared validator utilities
- Maintain shared helper functions
- Ensure utilities are tree-shakeable with named exports
- Keep utility functions pure and well-typed with generics
- Prevent duplication of utility logic across packages

## Tools

- `tools/util-index.ts` — list all exported utility functions grouped by category
- `tools/util-usage.ts` — find all import sites for a given utility across the monorepo
- `tools/util-scaffold.ts` — generate a new utility file with function stub, types, and test file
