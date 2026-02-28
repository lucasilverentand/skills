---
name: config
description: Manages the shared config workspace package — environment variables, feature flags, and typed constants validated with Zod. Use when adding or changing environment variables, defining feature flags, or ensuring config is validated and typed across packages.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Config

The `config` part is the single source of truth for environment variables, feature flags, and shared constants. All other packages import from here — never read `process.env` directly outside of this package.

## Decision Tree

- What are you doing?
  - **Adding a new environment variable** → see "Environment variables" below
  - **Adding or changing a feature flag** → see "Feature flags" below
  - **Checking all required env vars are set** → run `tools/env-check.ts`
  - **Reviewing feature flags** → run `tools/flag-list.ts`
  - **Comparing configs across environments** → run `tools/config-diff.ts`

## Environment variables

All env vars are defined and validated in `src/env.ts` using Zod:

```ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);
```

- Use `z.string()` for required, `.optional()` for optional
- Throw at startup if required vars are missing — never silently fall back
- All other packages import `env` from `@scope/config`, not from `process.env`
- Document each var in `.env.example` with a comment explaining what it's for

## Feature flags

Define flags in `src/flags.ts` as typed constants derived from env vars:

```ts
import { env } from "./env";

export const flags = {
  enableBeta: env.NODE_ENV !== "production",
  enableAnalytics: Boolean(env.ANALYTICS_KEY),
} as const;
```

- Flags are derived values — they depend on env vars, not raw strings
- Run `tools/flag-list.ts` to see all flags and their current defaults
- Never gate production features behind flags that are always-on in dev without a real toggle

## Environment differences

Three environments: `development`, `staging`, `production`

- Use `.env`, `.env.staging`, `.env.production` files (never commit secrets)
- Run `tools/config-diff.ts` to highlight mismatches between environments
- Required vars in production that are optional in development must be explicitly noted

## Package structure

```
packages/config/
  src/
    env.ts         # Zod-validated env vars
    flags.ts       # Feature flags derived from env
    constants.ts   # Static shared constants (not env-dependent)
    index.ts       # Re-export all
  .env.example     # All required/optional vars documented
  package.json
  tsconfig.json
```

## Key references

| File | What it covers |
|---|---|
| `tools/env-check.ts` | Validates required env vars for a given target |
| `tools/flag-list.ts` | All feature flags with defaults and descriptions |
| `tools/config-diff.ts` | Compares environments, highlights mismatches |
