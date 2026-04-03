# Hono on Cloudflare Workers

Patterns specific to running a Hono API as a Cloudflare Worker. See `hono.md` for general Hono patterns — this file covers what changes when deploying to Workers instead of a Node/Bun server.

## Key differences from a Bun server

| | Bun server | Cloudflare Worker |
|---|---|---|
| Entry point | `app.listen(port)` | `export default app` |
| Dev command | `bun run --hot src/index.ts` | `bunx wrangler dev` |
| Secrets | `.env` | `.dev.vars` (local), `wrangler secret put` (prod) |
| Bindings | N/A | D1, KV, R2, Queues, Service Bindings |
| Environment | `process.env` | `c.env` (typed) |
| Config | `package.json` scripts | `wrangler.toml` / `wrangler.jsonc` |

## Entry point

The Worker entry point exports the Hono app as the default export. Wrangler treats `export default` as the fetch handler:

```ts
// src/index.ts
import { app } from "./app"

export default app

// Optional: export the app type for hono/client consumers
export type AppType = typeof app
```

Do not call `app.listen()` — Workers have no port to bind to.

## wrangler.toml

Minimal config for a Hono Worker with D1 and KV:

```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

# Non-secret vars (safe to commit)
[vars]
NODE_ENV = "development"
APP_URL = "http://localhost:8787"

# D1 database binding
[[d1_databases]]
binding = "DB"
database_name = "my-api-db"
database_id = "<your-database-id>"
migrations_dir = "drizzle"

# KV namespace binding
[[kv_namespaces]]
binding = "CACHE"
id = "<your-kv-id>"

# R2 bucket binding
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "my-api-uploads"

# Service Binding (internal worker-to-worker call)
[[services]]
binding = "AUTH_API"
service = "my-auth-api"

# Per-environment overrides
[env.production]
[env.production.vars]
NODE_ENV = "production"
APP_URL = "https://api.example.com"

[[env.production.d1_databases]]
binding = "DB"
database_name = "my-api-db-prod"
database_id = "<prod-database-id>"

# Dev server port
[dev]
port = 8787
```

Rules:
- Secrets (API keys, auth secrets) never go in `wrangler.toml` — use `wrangler secret put <KEY> --env <env>`
- Add a comment near the `[vars]` section listing which secrets are expected
- Always set `compatibility_flags = ["nodejs_compat"]` — needed for Bun/Node dependencies
- Use `migrations_dir` on D1 bindings so `wrangler d1 migrations apply` finds your migration files

## TypeScript Env interface

Define a typed `Env` interface matching your `wrangler.toml` bindings. This gives full type safety on `c.env` in route handlers:

```ts
// src/env.ts
export interface Env {
  // D1 databases
  DB: D1Database

  // KV namespaces
  CACHE: KVNamespace

  // R2 buckets
  UPLOADS: R2Bucket

  // Service Bindings
  AUTH_API: Fetcher

  // Queue producers
  JOB_QUEUE: Queue

  // Environment variables
  NODE_ENV: string
  APP_URL: string

  // Secrets (set via wrangler secret put)
  BETTER_AUTH_SECRET: string
  STRIPE_SECRET_KEY: string
}
```

Wire the `Env` type into your Hono app:

```ts
// src/app.ts
import { Hono } from "hono"
import type { Env } from "./env"

export const app = new Hono<{ Bindings: Env }>()
```

Now `c.env` is fully typed in every route handler.

## Accessing bindings in handlers

```ts
app.get("/users", async (c) => {
  // D1 database
  const db = drizzle(c.env.DB, { schema })

  // KV
  const cached = await c.env.CACHE.get("some-key")

  // R2
  const object = await c.env.UPLOADS.get("file.png")

  // Service Binding (internal HTTP call to another Worker)
  const res = await c.env.AUTH_API.fetch(new Request("https://auth/session"))

  // Environment variable
  const appUrl = c.env.APP_URL
})
```

## D1 client

Create the Drizzle client inside the handler using the `c.env.DB` binding. Do not create a module-level singleton — Workers share code between requests but each request gets fresh bindings:

```ts
// src/lib/db.ts
import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"
import type { Env } from "../env"

export function createDb(env: Env) {
  return drizzle(env.DB, { schema })
}

export type Database = ReturnType<typeof createDb>
```

```ts
// In a route handler
app.get("/users", async (c) => {
  const db = createDb(c.env)
  const users = await db.query.users.findMany()
  return c.json({ ok: true, data: users })
})
```

Or use middleware to attach `db` to context once per request:

```ts
// src/middleware/database.ts
import { createMiddleware } from "hono/factory"
import { createDb } from "../lib/db"

export const databaseMiddleware = createMiddleware<{ Bindings: Env; Variables: { db: Database } }>(
  async (c, next) => {
    c.set("db", createDb(c.env))
    await next()
  }
)
```

```ts
// In app.ts
app.use("*", databaseMiddleware)

// In a route handler — access via c.get("db")
app.get("/users", async (c) => {
  const db = c.get("db")
  const users = await db.query.users.findMany()
  return c.json({ ok: true, data: users })
})
```

## Local development

1. Create `.dev.vars` in the Worker directory — Wrangler reads this instead of `.env`:

```
BETTER_AUTH_SECRET=dev-secret-32-chars-minimum-here
STRIPE_SECRET_KEY=sk_test_...
```

2. Run the dev server: `bunx wrangler dev`
3. Wrangler automatically connects to your local D1 database (stored in `.wrangler/state/`)

`.dev.vars` is gitignored. See `development/typescript/workers` for generating it from Doppler.

## Service Binding typed client

For type-safe calls between Hono Workers, use `hono/client`:

```ts
import { hc } from "hono/client"
import type { AppType } from "../auth-api/src/index"

// Wrap the Service Binding fetcher in a typed hono client
export function createAuthClient(fetcher: Fetcher) {
  return hc<AppType>("https://auth-api", { fetch: fetcher.fetch.bind(fetcher) })
}
```

```ts
// In a route handler
app.get("/profile", async (c) => {
  const authClient = createAuthClient(c.env.AUTH_API)
  const res = await authClient.session.$get()
  const session = await res.json()
})
```

## drizzle.config.ts for D1

```ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
})
```

For local introspection/push: `bunx drizzle-kit studio` (Wrangler must be running).

## package.json scripts

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy --env production",
    "deploy:staging": "wrangler deploy --env staging",
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply my-api-db --local",
    "db:migrate:remote": "wrangler d1 migrations apply my-api-db --remote --env production",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Worker size limits

Cloudflare Workers have a 1 MB compressed bundle limit. If you hit it:
1. Run `tools/worker-size.ts` to see the bundle breakdown
2. Move large dependencies behind dynamic imports
3. Remove unused imports — tree-shaking is aggressive but unused re-exports can bloat the bundle
4. For very large codebases, split into multiple Workers communicating via Service Bindings
