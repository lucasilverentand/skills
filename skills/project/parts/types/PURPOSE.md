# Types

Shared TypeScript types, interfaces, and Zod schemas.

## Responsibilities

- Define shared TypeScript types and interfaces
- Maintain shared Zod schemas
- Keep Zod schemas and TypeScript types in sync via inference
- Prevent circular type dependencies between packages
- Provide branded types for domain identifiers like user IDs and entity slugs

## Tools

- `tools/type-index.ts` — list all exported types, interfaces, and Zod schemas with their source files
- `tools/type-usage.ts` — find all import sites for a given type or schema across the monorepo
- `tools/circular-check.ts` — detect circular type dependencies between shared packages
