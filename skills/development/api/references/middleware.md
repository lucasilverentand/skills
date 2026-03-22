# Middleware

## Standard middleware chain

Apply middleware in this order:

1. **Request ID** — generate a nanoid, attach to request context and the `X-Request-Id` response header
2. **Logger** — structured request logger (see `logging.md`)
3. **Auth** — resolve current user from session or API key, attach to request context — return 401 if neither is present on protected routes
4. **Rate limiter** (sensitive routes only) — apply to auth/password-reset route groups

In Hono, use `c.set('requestId', id)`, `c.set('user', user)`, `c.set('apiKey', key)` to pass data through the chain.

## Implementations

### Request ID middleware

```ts
import { nanoid } from "nanoid"
import type { MiddlewareHandler } from "hono"

export const requestId = (): MiddlewareHandler => async (c, next) => {
  const id = nanoid(12)
  c.set("requestId", id)
  await next()
  c.header("X-Request-Id", id)
}
```

### Logger middleware

Log after the response is sent. Capture start time before `next()`, compute latency after:

```ts
import { getLogger } from "@logtape/logtape"
import type { MiddlewareHandler } from "hono"

export const requestLogger = (): MiddlewareHandler => async (c, next) => {
  const start = Date.now()
  await next()
  const logger = getLogger(["api", "request"])
  logger.info("request", {
    requestId: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    latencyMs: Date.now() - start,
    userId: c.get("user")?.id ?? null,
  })
}
```

### Auth middleware

Checks session cookie first, then falls back to Bearer token (API key). Returns 401 if neither resolves to a valid user:

```ts
import { auth } from "@scope/auth"
import { db } from "@scope/schema"
import { apiKeys } from "@scope/schema/api-keys"
import { eq, isNull } from "drizzle-orm"
import { createHash } from "node:crypto"
import { HTTPException } from "hono/http-exception"
import type { MiddlewareHandler } from "hono"

export const authMiddleware = (): MiddlewareHandler => async (c, next) => {
  // Session-based auth (browser clients)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (session?.user) {
    c.set("user", session.user)
    return next()
  }

  // API key auth (programmatic clients)
  const authHeader = c.req.header("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const rawKey = authHeader.slice(7)
    const hash = createHash("sha256").update(rawKey).digest("hex")

    const keyRecord = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.hash, hash),
    })

    if (keyRecord && !keyRecord.revokedAt) {
      c.set("user", { id: keyRecord.userId })
      c.set("apiKey", keyRecord)
      return next()
    }
  }

  throw new HTTPException(401, { message: "Unauthorized" })
}
```

For routes that allow anonymous access, skip `authMiddleware` — don't apply it globally.

### Scope-checking middleware

For routes requiring specific API key permissions:

```ts
import { HTTPException } from "hono/http-exception"
import type { MiddlewareHandler } from "hono"

export const requireScope = (scope: string): MiddlewareHandler => async (c, next) => {
  const apiKey = c.get("apiKey")
  if (!apiKey) return next() // session auth — skip scope check
  const hasScope = apiKey.scopes.includes("*") || apiKey.scopes.includes(scope)
  if (!hasScope) {
    throw new HTTPException(403, { message: `Missing required scope: ${scope}` })
  }
  return next()
}
```

### Rate limiter (sensitive routes only)

Apply only to auth routes and other high-risk endpoints — not globally:

```ts
import { rateLimiter } from "@hono/rate-limiter"

// In the auth router — not the root app
authApp.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: true,
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "unknown",
  })
)
```

## Wiring the middleware chain in app.ts

```ts
import { OpenAPIHono } from "@hono/zod-openapi"
import { requestId } from "./middleware/request-id"
import { requestLogger } from "./middleware/logger"
import { authMiddleware } from "./middleware/auth"
import users from "./routes/users"
import auth from "./routes/auth"

export function createApp() {
  const app = new OpenAPIHono()

  // Global middleware
  app.use(requestId())
  app.use(requestLogger())

  // Unprotected routes
  app.route("/api/auth", auth) // Better Auth handler + login/signup

  // Protected routes
  app.use("/api/*", authMiddleware())
  app.route("/api/v1/users", users)

  return app
}
```

## Global error handler

Register a catch-all error handler that converts unexpected throws into the standard error shape:

```ts
import { HTTPException } from "hono/http-exception"
import { getLogger } from "@logtape/logtape"

app.onError((err, c) => {
  const logger = getLogger(["api", "error"])

  if (err instanceof HTTPException) {
    return c.json(
      { ok: false, error: { code: "HTTP_ERROR", message: err.message } },
      err.status
    )
  }

  logger.error("unhandled error", {
    requestId: c.get("requestId"),
    error: err.message,
    stack: err.stack,
  })

  return c.json(
    { ok: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    500
  )
})
```

Rules:
- Never leak stack traces or internal details in production responses
- Log the full error with the request ID for debugging
- `HTTPException` is the only throw that should escape route handlers — everything else is unexpected

## Health and readiness endpoints

Every API exposes two unprotected endpoints:

```ts
app.get("/health", (c) => c.json({ ok: true }))

app.get("/ready", async (c) => {
  try {
    // Verify DB is reachable
    await db.run(sql`SELECT 1`)
    return c.json({ ok: true })
  } catch {
    return c.json({ ok: false, error: { code: "NOT_READY", message: "Database unavailable" } }, 503)
  }
})
```

- `GET /health` — liveness probe. No auth, no DB call. Returns 200 immediately.
- `GET /ready` — readiness probe. DB reachable, migrations applied. Returns 503 if not ready.
