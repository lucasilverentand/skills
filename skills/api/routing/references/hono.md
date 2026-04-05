# Hono Implementation

Hono-specific patterns for implementing the API design conventions. This is the default framework — use these patterns unless the project uses something else.

## Bootstrap

When creating a new Hono API service package:

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

## Project setup

1. `@hono/zod-openapi` for route definitions with automatic OpenAPI spec generation
2. Scalar UI for API docs in dev (`@scalar/hono-api-reference`)
3. CORS at the Cloudflare level, not in app code
4. Rate limiting: Cloudflare infra-level globally, Hono middleware for sensitive routes only
5. File uploads: presigned R2 URLs — client uploads directly, never through the API
6. Async operations: synchronous by default; long-running tasks return a job ID, process via Cloudflare Queues
7. Middleware: see `middleware.md`
8. Logging: see `logging.md`

## Adding a route

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

## Adding middleware

- **CORS** — use `hono/cors`, configure `origin` from env, not hardcoded
- **Auth** — validate session/JWT in middleware, attach `user` to context via `c.set()`
- **Rate limiting** — use `@hono/rate-limiter` or a KV-backed implementation
- **Logger** — use the `@<project>/logger` package, pass request context
- Apply middleware at router level, not globally, unless it applies everywhere

## Auth integration

- Better Auth: call `auth.handler(c.req.raw)` in the auth route, use `auth.api.getSession()` in middleware
- Attach session to context: `c.set("user", session.user)`
- Protect routes with a middleware that checks `c.get("user")` and returns 401 if missing
- See `references/auth.md` for full single-API vs multi-API patterns

## Request validation pattern

- Always use `zValidator` from `@hono/zod-validator` — never parse `c.req.json()` manually
- Validate at the route level, not inside handler logic
- Share Zod schemas from `@<project>/types` or `@<project>/schema` — don't redeclare

## Route structure

One router file per resource. Each file exports a Hono `OpenAPIHono` app that gets mounted in the main app:

```ts
// routes/users.ts
const app = new OpenAPIHono()

app.openapi(createUserRoute, async (c) => {
  // handler
})

export default app
```

```ts
// app.ts
app.route('/v1/users', users)
app.route('/v1/projects', projects)
```

## Route definitions with zod-openapi

Use `createRoute()` from `@hono/zod-openapi` to define each route. This generates the OpenAPI spec from the same Zod schemas used for validation:

```ts
const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['users'],
  request: { body: { content: { 'application/json': { schema: createUserSchema } } } },
  responses: {
    201: { content: { 'application/json': { schema: userResponseSchema } }, description: 'User created' },
    422: { content: { 'application/json': { schema: errorSchema } }, description: 'Validation error' },
  },
})
```

## OpenAPI generation

1. Routes defined with `createRoute()` auto-generate the spec — no separate generation step
2. Review: all routes present, schemas correct, tags and operation IDs match resources, no `any` types
3. Add request/response examples in spec descriptions for Scalar docs
4. Commit the generated spec — treat it as a contract artifact

## Client consumption

Use `hono/client` (hc) for end-to-end type safety with TypeScript frontends:

```ts
import { hc } from 'hono/client'
import type { AppType } from '../server/app'

const client = hc<AppType>('http://localhost:8787')
const res = await client.v1.users.$post({ json: { name: 'Alice' } })
```

Pair with TanStack Query for caching and state management on the frontend.

## Testing

Use hono `testClient` for testing routes against a real local database:

```ts
import { testClient } from 'hono/testing'

const client = testClient(app)
const res = await client.v1.users.$post({ json: { name: 'Alice' } })
const body = await res.json()
expect(body.ok).toBe(true)
```

Test the full request/response cycle including validation, auth, and response shape. No mocked DB — use D1/SQLite or Postgres.
