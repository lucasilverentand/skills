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

Two approaches depending on project complexity:

### Option A: zod-openapi (schema-first)

1. Routes defined with `createRoute()` auto-generate the spec — no separate generation step
2. Review: all routes present, schemas correct, tags and operation IDs match resources, no `any` types
3. Add request/response examples in spec descriptions for Scalar docs
4. Commit the generated spec — treat it as a contract artifact

### Option B: Static spec + Scalar (simpler projects)

For projects that use plain Hono routes (not `OpenAPIHono`), write the OpenAPI spec as a static TypeScript object and serve it alongside Scalar docs. This is simpler, has no runtime overhead, and works well when routes don't use `zod-openapi`.

#### Setup

1. Install: `bun add @scalar/hono-api-reference`
2. Create `src/openapi.ts` — exports the spec as a typed object
3. Wire into the Hono app dev-only, before route registrations

#### `src/openapi.ts`

Scan the app's route files and build the spec from actual endpoints:

```ts
export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "My API",          // from package.json name
    version: "0.1.0",         // from package.json version
    description: "...",
  },
  servers: [{ url: "http://localhost:3000", description: "Local dev" }],
  paths: {
    "/v1/resources": {
      get: {
        operationId: "listResources",
        summary: "List resources",
        tags: ["Resources"],
        responses: {
          "200": {
            description: "List of resources",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Resource" } },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    // ... one entry per route
  },
  components: {
    schemas: { /* shared object types */ },
    parameters: { /* reusable path/query params */ },
    responses: {
      Unauthorized: {
        description: "Not authenticated",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { error: { type: "string", example: "Unauthorized" } },
            },
          },
        },
      },
    },
    securitySchemes: { /* cookie, bearer, api key — whatever the app uses */ },
  },
} as const;
```

#### Wiring into the app

Add before route registrations in the main app file:

```ts
if (process.env.NODE_ENV !== "production") {
  const { Scalar } = await import("@scalar/hono-api-reference");
  const { openApiSpec } = await import("./openapi");
  app.get("/doc", (c) => c.json(openApiSpec));
  app.get("/docs", Scalar({ url: "/doc", pageTitle: "My API" }));
}
```

- `/doc` serves the raw JSON spec
- `/docs` serves the Scalar UI
- Both are tree-shaken out of production builds via the dynamic import

#### Spec conventions

- Every operation needs `operationId`, `summary`, `tags`, and `responses`
- Group endpoints with `tags` — short nouns matching the resource or domain ("Users", "Sessions", "Billing")
- Use `$ref` for shared schemas and responses to reduce duplication
- Every path parameter gets a `components.parameters` entry
- Derive `info.title` and `info.version` from `package.json`
- Set `servers[0].url` to the local dev URL

#### Merging external OpenAPI specs

If the API proxies another service that exposes its own OpenAPI spec, merge it into a single doc so all endpoints appear in one Scalar UI.

Add a merge helper to `openapi.ts`:

```ts
export function mergeExternalSpec(
  base: Record<string, unknown>,
  external: Record<string, unknown>,
  options?: { pathPrefix?: string },
): Record<string, unknown> {
  const basePaths = (base.paths ?? {}) as Record<string, unknown>;
  const extPaths = (external.paths ?? {}) as Record<string, Record<string, Record<string, unknown>>>;
  const prefix = options?.pathPrefix ?? "";

  const mergedPaths: Record<string, unknown> = {};
  for (const [path, methods] of Object.entries(extPaths)) {
    const retagged: Record<string, unknown> = {};
    for (const [method, spec] of Object.entries(methods)) {
      retagged[method] = { ...spec, tags: [tagForPath(path)] };
    }
    mergedPaths[`${prefix}${path}`] = retagged;
  }

  const baseSchemas = ((base.components as any)?.schemas ?? {}) as Record<string, unknown>;
  const extSchemas = ((external.components as any)?.schemas ?? {}) as Record<string, unknown>;

  return {
    ...base,
    paths: { ...basePaths, ...mergedPaths },
    components: {
      ...((base.components as Record<string, unknown>) ?? {}),
      schemas: { ...baseSchemas, ...extSchemas },
    },
  };
}
```

Key points:
- **Fetch lazily** — fetch on first `/doc` request and cache, not at startup. Avoids race conditions when services start concurrently
- **Prefix paths** — if the external service is proxied at `/api/auth/*`, prefix all its paths with `/api/auth` so docs show the real URL
- **Re-tag endpoints** — external specs often dump everything under "Default". Write a `tagForPath(path)` function that maps path prefixes to meaningful tag names based on the external service's domain

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
