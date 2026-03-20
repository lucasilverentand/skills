---
name: type-safety
description: Tightens TypeScript types, removes `any`, adds Zod schemas for runtime validation, and introduces discriminated unions. Use when hardening a module's types, syncing runtime validation with compile-time types, replacing implicit `any` with proper definitions, or auditing type coverage across a codebase.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Type Safety

## Decision Tree

- What is the type safety task?
  - **Remove `any` from specific files or the whole codebase** → run `tools/any-finder.ts`, then see "Removing Any" below
  - **Add Zod schemas for validation** → see "Adding Zod Schemas" below
  - **Keep Zod schemas and TypeScript types in sync** → run `tools/schema-sync.ts`, then see "Schema Sync" below
  - **Measure type coverage for a module** → run `tools/type-coverage.ts <path>`
  - **Introduce discriminated unions** → see "Discriminated Unions" below
  - **Tighten loose types (broad strings, number instead of literal)** → see "Tightening Types" below

## Removing Any

1. Run `tools/any-finder.ts` to get a ranked list of `any` usages by frequency
2. For each occurrence, determine the actual type:
   - **Return value from external library** → check the library's types; if missing, write a minimal declaration file
   - **Function parameter with unknown shape** → use `unknown` as the safe default, then narrow with type guards or Zod
   - **Untyped JSON** → define an interface or generate a Zod schema with `tools/zod-gen.ts`
   - **Cast to silence an error** → find the real type mismatch and fix it; don't replace `any` with `as unknown as T`
3. Enable `"noImplicitAny": true` in tsconfig once all explicit `any` are removed
4. Enable `"strict": true` only after addressing `noImplicitAny` — don't do both at once

Rules:
- Replace `any` with the narrowest type that is still correct
- `unknown` is always safer than `any` when the type is genuinely unknown
- Never use `as` casts to fix a type error; find the root cause

## Adding Zod Schemas

Use Zod at system boundaries: HTTP request bodies, external API responses, env vars, user-provided config.

1. Run `tools/zod-gen.ts <interface-name>` to generate a schema from an existing TypeScript interface
2. Review the generated schema — Zod can't infer refinements (min length, valid URL, etc.); add them manually
3. Derive the TypeScript type from the schema: `type MyType = z.infer<typeof MySchema>`
4. Delete the original standalone interface — the schema is the single source of truth
5. Use `.safeParse()` at boundaries, not `.parse()` — return `{ ok: false, error }` instead of throwing

Schema placement:
- Co-locate schemas with the module that owns the data shape (not in a global `schemas.ts`)
- Export both the schema and the inferred type from the same file

## Schema Sync

When `tools/schema-sync.ts` reports mismatches:
1. Check each mismatch: is the TypeScript type or the Zod schema correct?
2. If the type was written first: update the schema to match
3. If the schema was written first: delete the standalone type and derive it from the schema
4. For optional fields: confirm whether `z.optional()` or `z.nullable()` is right — they mean different things

## Discriminated Unions

Use discriminated unions when a value can be one of several distinct shapes with different fields.

Before:
```ts
type Result = { status: string; data?: any; error?: string }
```

After:
```ts
type Result =
  | { status: "ok"; data: Data }
  | { status: "error"; error: string }
```

When to introduce:
- Multiple optional fields that are only valid together
- Switch/if chains on a string field that determine which other fields exist
- Functions that return different shapes based on success/failure

Pattern: use a `kind` or `type` or `status` discriminant field with literal string values.

## Tightening Types

| Loose type | Better type | When |
|---|---|---|
| `string` for enum-like values | `"asc" \| "desc"` literal union | When the set of valid values is known and finite |
| `number` for IDs | `type UserId = string & { __brand: "UserId" }` | When IDs should not be mixed up |
| `object` or `{}` | A named interface | Always — never use `object` |
| `Function` | `(arg: T) => R` | Always — never use `Function` |
| `Array<any>` | `Array<T>` | Always |

Branded types prevent mixing structurally identical types (e.g., `UserId` vs `PostId`). Use them for IDs that flow through many layers.

## Key references

| File | What it covers |
|---|---|
| `tools/any-finder.ts` | Locate all `any` types ranked by usage frequency |
| `tools/zod-gen.ts` | Generate Zod schemas from TypeScript interfaces |
| `tools/type-coverage.ts` | Measure typed vs. untyped symbols per module |
| `tools/schema-sync.ts` | Verify Zod schemas match their TypeScript types |
