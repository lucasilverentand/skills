# Config

The `config` part is the single source of truth for environment variables, feature flags, and shared constants. All other packages import from here — never read `process.env` directly outside this package.

## Setup

1. Create `packages/config/`
2. Install: `bun add zod`

### Package structure

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

## Feature flags

Define flags in `src/flags.ts` as typed constants derived from env vars:

```ts
import { env } from "./env";

export const flags = {
  enableBeta: env.NODE_ENV !== "production",
  enableAnalytics: Boolean(env.ANALYTICS_KEY),
} as const;
```

## Environment differences

Three environments: `development`, `staging`, `production`

- Use `.env`, `.env.staging`, `.env.production` files (never commit secrets)
- Run `tools/env-check.ts` to validate required env vars are set

## Tools

| Tool | Purpose |
|---|---|
| `tools/env-check.ts` | Validate required env vars for a given target |
