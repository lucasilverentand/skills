# Hono Implementation

Hono-specific patterns for implementing the API design conventions. This is the default framework — use these patterns unless the project uses something else.

## Project setup

1. `@hono/zod-openapi` for route definitions with automatic OpenAPI spec generation
2. Scalar UI for API docs in dev (`@scalar/hono-api-reference`)
3. CORS at the Cloudflare level, not in app code
4. Rate limiting: Cloudflare infra-level globally, Hono middleware for sensitive routes only
5. File uploads: presigned R2 URLs — client uploads directly, never through the API
6. Async operations: synchronous by default; long-running tasks return a job ID, process via Cloudflare Queues
7. Middleware: see `middleware.md`
8. Logging: see `logging.md`

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
