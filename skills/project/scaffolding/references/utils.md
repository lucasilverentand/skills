# Utils

The `utils` part holds pure helper functions shared across packages — formatters, validators, transformers.

## Setup

1. Create `packages/utils/`
2. Organize by category: `src/format.ts`, `src/validate.ts`, `src/string.ts`, `src/array.ts`
3. Use sub-path exports: `"./format": "./src/format.ts"`
4. `src/index.ts` — barrel re-exporting all categories

## Rules for utility functions

- **Pure** — no side effects, no I/O, deterministic output
- **Named exports only** — no default exports, enables tree-shaking
- **Well-typed** — use generics where applicable, no `any`
- **Single responsibility** — one thing per function

```ts
export function formatCurrency(amount: number, currency: string, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
```

## What belongs here vs elsewhere

| Put in utils | Put elsewhere |
|---|---|
| Pure formatters and transformers | Zod validation schemas -> `types` |
| Generic array/object helpers | DB query helpers -> `schema` |
| String manipulation | API client functions -> service layer |
| Date/time formatters | React hooks/UI helpers -> `ui` |
| Math/numeric utilities | Business logic -> keep in the app |

## Testing

Every exported utility must have a test in `src/<module>.test.ts`. Use `bun test`.

## Tools

| Tool | Purpose |
|---|---|
| `tools/util-scaffold.ts` | Generate utility file with function stub and test file |
