---
name: types
description: Creates and maintains a shared TypeScript types package in a bun workspace monorepo — Zod schemas, inferred types, branded domain identifiers, and circular dependency prevention. Use when defining shared types, adding Zod schemas that are reused across packages, introducing branded ID types, or checking for circular type dependencies between packages.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Types

## Decision Tree

- What are you working on?
  - **New types package** → follow "Bootstrap" workflow
  - **Adding a shared type or schema** → see "Adding types" section
  - **Branded ID type** → see "Branded types" section
  - **Circular dependency error** → run `tools/circular-check.ts`
  - **Finding where a type is used** → run `tools/type-usage.ts`

## Bootstrap

1. Create `packages/types/`
2. `package.json`:
   ```json
   {
     "name": "@<project>/types",
     "type": "module",
     "exports": { ".": "./src/index.ts" }
   }
   ```
3. Install: `bun add zod`
4. `src/index.ts` — barrel file, re-exports everything from sub-modules
5. Group types by domain: `src/user.ts`, `src/post.ts`, `src/common.ts`

## Adding types

### Zod-first approach

Define the Zod schema first, then infer the TypeScript type from it:

```ts
import { z } from "zod"

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})

export type CreateUser = z.infer<typeof CreateUserSchema>
```

- Never write a TypeScript `interface` that duplicates a Zod schema — infer instead
- Use `z.infer` for input types, `z.output` if transforms change the shape

### When to use a plain interface

Use `interface` or `type` (without Zod) for:
- Internal-only types not crossing API boundaries
- Complex generic utility types
- Types derived from database schema (`$inferSelect` from Drizzle)

## Branded types

Use branded types for domain identifiers to prevent mixing up IDs:

```ts
declare const __brand: unique symbol
type Brand<T, B> = T & { [__brand]: B }

export type UserId = Brand<string, "UserId">
export type PostId = Brand<string, "PostId">

export function asUserId(id: string): UserId {
  return id as UserId
}
```

- Define a brand for every entity ID (`UserId`, `PostId`, `OrgId`)
- Provide a constructor function (`asUserId`) for type-safe creation
- Use at API boundaries — don't brand everything internally

## Circular dependency prevention

- `@<project>/types` must not import from other project packages
- `@<project>/schema` may import types but not vice versa (schema depends on types, not the other way)
- If a type depends on a DB entity, keep it in `@<project>/schema`, not `@<project>/types`
- Run `tools/circular-check.ts` after adding any cross-package imports

## Common patterns

```ts
// Result type — use everywhere instead of throwing
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

// Pagination
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export type Pagination = z.infer<typeof PaginationSchema>
```

## Key references

| File | What it covers |
|---|---|
| `tools/type-index.ts` | List all exported types, interfaces, and Zod schemas |
| `tools/type-usage.ts` | Find all import sites for a given type across the monorepo |
| `tools/circular-check.ts` | Detect circular type dependencies between packages |
