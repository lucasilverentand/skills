# Types

The `types` part holds shared TypeScript types and Zod schemas used across packages. It must not import from other project packages — it is a leaf dependency.

## Setup

1. Create `packages/types/`
2. Install: `bun add zod`
3. Group types by domain: `src/user.ts`, `src/post.ts`, `src/common.ts`
4. `src/index.ts` — barrel file re-exporting everything

## Zod-first approach

Define the Zod schema first, then infer the TypeScript type:

```ts
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
```

- Never write an `interface` that duplicates a Zod schema — infer instead
- Use plain `interface` or `type` for internal-only types, complex generics, or types derived from Drizzle (`$inferSelect`)

## Branded types

Use branded types for domain identifiers to prevent mixing up IDs:

```ts
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

export type UserId = Brand<string, "UserId">;
export type PostId = Brand<string, "PostId">;

export function asUserId(id: string): UserId {
  return id as UserId;
}
```

## Common patterns

```ts
// Result type — use everywhere instead of throwing
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// Pagination
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

## Circular dependency prevention

- `@scope/types` must not import from other project packages
- `@scope/schema` may import types but not vice versa
- Run `tools/circular-check.ts` after adding cross-package imports

## Tools

| Tool | Purpose |
|---|---|
| `tools/circular-check.ts` | Detect circular type dependencies between packages |
| `tools/type-usage.ts` | Find all import sites for a given type across the monorepo |
