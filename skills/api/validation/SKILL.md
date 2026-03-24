---
name: validation
description: Zod schemas for API request/response validation — schema-first design, type inference from schemas, runtime validation at system boundaries, removing `any`, discriminated unions, and keeping schemas in sync with TypeScript types. Use when adding Zod validation to routes, hardening TypeScript types, removing `any`, syncing schemas with types, or auditing type coverage.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Validation & Type Safety

## Current context

- Zod schemas: !`grep -rl "z\.\|zod" src/ 2>/dev/null | wc -l | tr -d ' '` files
- Any count: !`grep -r ":\s*any\b\|<any>" src/ --include="*.ts" 2>/dev/null | wc -l | tr -d ' '` occurrences

## Decision Tree

- What validation task?
  - **Adding Zod validation to API routes** → see "Route validation" below
  - **Generating Zod schemas from interfaces** → run `tools/zod-gen.ts <interface-name>`
  - **Removing `any` from code** → run `tools/any-finder.ts`, then see "Removing any" below
  - **Keeping schemas and types in sync** → run `tools/schema-sync.ts`
  - **Measuring type coverage** → run `tools/type-coverage.ts <path>`
  - **Introducing discriminated unions** → see "Discriminated unions" below

## Route validation

Schema-first: define request and response schemas before writing the handler.

```ts
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

app.post("/v1/users", sessionAuth, zValidator("json", createUserSchema), async (c) => {
  const input = c.req.valid("json"); // fully typed as CreateUserInput
  const result = await createUser(input);
  if (!result.ok) return c.json({ ok: false, error: result.error }, mapCodeToStatus(result.error.code));
  return c.json({ ok: true, data: result.data }, 201);
});
```

### Validation targets

| Target | Validator | Example |
|---|---|---|
| JSON body | `zValidator("json", schema)` | `{ email, name }` |
| Query params | `zValidator("query", schema)` | `?cursor=abc&limit=20` |
| URL params | `zValidator("param", schema)` | `/:id` |
| Headers | `zValidator("header", schema)` | Custom headers |

### Pagination schema

Reusable across list endpoints:

```ts
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

## Schema placement

- Co-locate schemas with the module that owns the data shape
- Export both the schema and inferred type from the same file
- Delete standalone interfaces once a Zod schema exists — the schema is the source of truth
- Use `.safeParse()` at boundaries, not `.parse()` — return `{ ok: false, error }` instead of throwing

## Removing any

1. Run `tools/any-finder.ts` for a ranked list
2. For each occurrence:
   - **External library return** → check library types; write a declaration file if missing
   - **Unknown function param** → use `unknown`, narrow with type guards or Zod
   - **Untyped JSON** → define interface or `tools/zod-gen.ts`
   - **Cast to silence error** → find the real type mismatch
3. Enable `noImplicitAny` in tsconfig once done
4. Enable `strict` only after addressing `noImplicitAny`

Rules:
- Replace `any` with the narrowest correct type
- `unknown` is always safer than `any`
- Never use `as` casts to fix type errors

## Discriminated unions

Use when a value can be one of several distinct shapes:

```ts
// Before
type Result = { status: string; data?: any; error?: string }

// After
type Result =
  | { status: "ok"; data: Data }
  | { status: "error"; error: string }
```

Introduce when: multiple optional fields valid only together, switch chains on a string field, functions returning different shapes.

## Tightening types

| Loose | Better | When |
|---|---|---|
| `string` for enums | `"asc" \| "desc"` | Known finite set |
| `number` for IDs | Branded type | IDs that shouldn't mix |
| `object` / `{}` | Named interface | Always |
| `Function` | `(arg: T) => R` | Always |

## Tool reference

| Tool | What it does |
|---|---|
| `tools/any-finder.ts` | Locate all `any` types ranked by frequency |
| `tools/zod-gen.ts` | Generate Zod schemas from TypeScript interfaces |
| `tools/type-coverage.ts` | Measure typed vs. untyped symbols per module |
| `tools/schema-sync.ts` | Verify Zod schemas match TypeScript types |
