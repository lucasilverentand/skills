# Type Safety

Tighten types, remove `any`, add Zod schemas, and use discriminated unions.

## Responsibilities

- Replace `any` types with proper type definitions
- Add Zod schemas for runtime validation
- Introduce discriminated unions where appropriate
- Tighten loose type definitions
- Infer types from usage patterns when definitions are missing
- Ensure type-level and runtime validation stay in sync

## Tools

- `tools/any-finder.ts` — locate all `any` types in the codebase ranked by usage frequency
- `tools/zod-gen.ts` — generate Zod schemas from TypeScript interfaces or type aliases
- `tools/type-coverage.ts` — measure the percentage of typed vs untyped symbols per module
- `tools/schema-sync.ts` — verify Zod schemas match their corresponding TypeScript types
