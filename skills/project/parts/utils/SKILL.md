---
name: utils
description: Creates and maintains a shared utility functions package in a bun workspace monorepo — formatters, validators, pure helper functions, tree-shaking, and duplication prevention. Use when adding shared utility functions, refactoring duplicated logic into a shared package, checking for utility duplication across packages, or scaffolding new utility modules.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Utils

## Decision Tree

- What are you working on?
  - **New utils package** → follow "Bootstrap" workflow
  - **Adding a utility function** → see "Adding utilities" section
  - **Checking for duplication** → run `tools/util-usage.ts` and search for similar logic
  - **Listing what exists** → run `tools/util-index.ts`
  - **New utility module** → run `tools/util-scaffold.ts`

## Bootstrap

1. Create `packages/utils/`
2. `package.json`:
   ```json
   {
     "name": "@<project>/utils",
     "type": "module",
     "exports": {
       ".": "./src/index.ts",
       "./format": "./src/format.ts",
       "./validate": "./src/validate.ts"
     }
   }
   ```
3. Organize by category: `src/format.ts`, `src/validate.ts`, `src/string.ts`, etc.
4. `src/index.ts` — barrel re-exporting all categories

## Directory structure

```
packages/utils/
  src/
    format.ts      # date, number, currency formatters
    validate.ts    # pure validation helpers
    string.ts      # string manipulation
    array.ts       # array/collection helpers
    object.ts      # object transformation helpers
    index.ts       # barrel exports
  package.json
```

## Adding utilities

Rules for all utility functions:

- **Pure** — no side effects, no I/O, deterministic output
- **Named exports only** — no default exports, enables tree-shaking
- **Well-typed** — use generics where applicable, no `any`
- **Single responsibility** — one thing per function, easy to name

```ts
// Good — pure, named, typed
export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

// Good — generic, pure
export function groupBy<T, K extends string | number>(
  items: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {} as Record<K, T[]>)
}
```

## Duplication prevention

- Before adding a utility, run `tools/util-usage.ts` to find similar existing logic
- Check if the standard library already covers it — don't wrap built-ins unnecessarily
- If a utility appears in 2+ apps, move it to `@<project>/utils`
- If it only exists in one place and is likely to stay there, leave it local

## What belongs here vs elsewhere

| Put in utils | Put elsewhere |
|---|---|
| Pure formatters and transformers | Validation with Zod schemas → `@<project>/types` |
| Generic array/object helpers | DB query helpers → `@<project>/schema` |
| String manipulation | API client functions → `@<project>/api` or service layer |
| Date/time formatters | React hooks and UI helpers → `@<project>/ui` |
| Math and numeric utilities | Business logic — keep in the app, not shared |

## Testing utilities

- Every exported utility must have a test
- Tests live in `src/<module>.test.ts` alongside the source
- Use `bun test` — no jest config needed
- Test edge cases: empty inputs, boundary values, type coercions

```ts
import { expect, test } from "bun:test"
import { groupBy } from "./array"

test("groupBy groups items by key", () => {
  const result = groupBy([{ type: "a" }, { type: "b" }, { type: "a" }], (x) => x.type)
  expect(result).toEqual({ a: [{ type: "a" }, { type: "a" }], b: [{ type: "b" }] })
})
```

## Key references

| File | What it covers |
|---|---|
| `tools/util-index.ts` | List all exported utility functions grouped by category |
| `tools/util-usage.ts` | Find all import sites for a given utility across the monorepo |
| `tools/util-scaffold.ts` | Generate utility file with function stub, types, and test file |
