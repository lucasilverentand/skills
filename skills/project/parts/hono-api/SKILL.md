---
name: hono-api
description: Sets up and maintains a Hono API service package in a bun workspace monorepo — routes, middleware, auth integration, CORS, rate limiting, Zod validation, and OpenAPI docs. Use when creating a new API service, adding routes, wiring up middleware, or generating OpenAPI documentation for a Hono-based backend.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Hono API

## Decision Tree

- What are you working on?
  - **New API service package** → follow "Bootstrap" workflow
  - **Adding a route** → follow "Add route" workflow
  - **Adding middleware** → follow "Add middleware" workflow
  - **Integrating auth** → see auth integration section
  - **Fixing a route issue** → run `tools/route-list.ts` to inspect registered routes, then `tools/middleware-audit.ts`

## Bootstrap

1. Create `packages/api/` (or `apps/api/`) in the workspace root
2. Add `package.json`:
   ```json
   {
     "name": "@<project>/api",
     "type": "module",
     "scripts": {
       "dev": "bun run --hot src/index.ts",
       "start": "bun src/index.ts"
     },
     "dependencies": {
       "hono": "latest",
       "@hono/zod-validator": "latest",
       "@hono/zod-openapi": "latest"
     }
   }
   ```
3. Create `src/index.ts` — app entry, mounts routers, starts server
4. Create `src/app.ts` — exports the Hono app instance (separate from server start for testing)
5. Add to workspace `bunfig.toml` or root `package.json` workspaces

## Directory structure

```
packages/api/
  src/
    index.ts          # server entry point
    app.ts            # Hono app factory
    routes/           # one file per resource
    middleware/       # custom middleware
    lib/              # shared helpers (db client, env, etc.)
  package.json
  tsconfig.json
```

## Add route

1. Create `src/routes/<resource>.ts`
2. Use `@hono/zod-validator` for request validation — validate body, query, and params
3. Return `{ ok: true, data }` on success, `{ ok: false, error }` on failure — never throw
4. Register on the app in `src/app.ts`

```ts
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

export const usersRoute = new Hono()
  .post("/", zValidator("json", CreateUserSchema), async (c) => {
    const body = c.req.valid("json")
    const result = await createUser(body)
    if (!result.ok) return c.json({ ok: false, error: result.error }, 400)
    return c.json({ ok: true, data: result.data }, 201)
  })
```

## Add middleware

- **CORS** — use `hono/cors`, configure `origin` from env, not hardcoded
- **Auth** — validate session/JWT in middleware, attach `user` to context via `c.set()`
- **Rate limiting** — use `@hono/rate-limiter` or a KV-backed implementation
- **Logger** — use the `@<project>/logger` package, pass request context
- Apply middleware at router level, not globally, unless it applies everywhere

## Auth integration

- Better Auth: call `auth.handler(c.req.raw)` in the auth route, use `auth.api.getSession()` in middleware
- Attach session to context: `c.set("user", session.user)`
- Protect routes with a middleware that checks `c.get("user")` and returns 401 if missing

## Request validation pattern

- Always use `zValidator` from `@hono/zod-validator` — never parse `c.req.json()` manually
- Validate at the route level, not inside handler logic
- Share Zod schemas from `@<project>/types` or `@<project>/schema` — don't redeclare

## OpenAPI docs

- Use `@hono/zod-openapi` to annotate routes with OpenAPI metadata
- Register all routes under `OpenAPIHono` instead of plain `Hono`
- Serve spec at `/openapi.json` and Swagger UI at `/docs`

## Key references

| File | What it covers |
|---|---|
| `tools/route-list.ts` | List all registered routes with methods and paths |
| `tools/middleware-audit.ts` | Show middleware stack for each route group |
| `tools/endpoint-scaffold.ts` | Generate a new route file with validation boilerplate |
