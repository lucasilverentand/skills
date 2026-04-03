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

Apply only to auth routes and other high-risk endpoints — not globally.

**Do not use `@hono/rate-limiter` with its default in-memory store in Cloudflare Workers.** Worker instances share no memory across requests or isolates, so an in-memory counter resets on every cold start and is not shared between instances running in parallel. Use a KV-backed implementation instead.

**The abstraction** — define a `RateLimiter` interface so the same code works with a real KV store in production and an in-memory store in tests:

```ts
// src/middleware/rate-limit.ts
type RateLimitRule = {
  limit: number
  windowMs: number
}

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }

export type RateLimiter = {
  check: (
    key: string,
    rule: RateLimitRule,
    nowMs?: number
  ) => RateLimitResult | Promise<RateLimitResult>
}

/** In-memory implementation — only for tests and local dev. Not distributed. */
export function createInMemoryRateLimiter(): RateLimiter {
  const buckets = new Map<string, number[]>()
  return {
    check(key, rule, nowMs = Date.now()): RateLimitResult {
      const cutoff = nowMs - rule.windowMs
      const existing = buckets.get(key) ?? []
      const recent = existing.filter((ts) => ts > cutoff)
      recent.push(nowMs)
      buckets.set(key, recent)
      if (recent.length <= rule.limit) return { allowed: true }
      const retryAfterMs = Math.max(0, recent[0]! + rule.windowMs - nowMs)
      return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) }
    },
  }
}

/**
 * KV-backed sliding window rate limiter.
 * Uses Cloudflare KV with TTL-based key expiration.
 * Requires a [[kv_namespaces]] binding named RATE_LIMIT_KV in wrangler.toml.
 */
export function createKvRateLimiter(kv: KVNamespace): RateLimiter {
  return {
    async check(key, rule, nowMs = Date.now()): Promise<RateLimitResult> {
      const windowSeconds = Math.ceil(rule.windowMs / 1000)
      const stored = await kv.get<number[]>(`rate:${key}`, "json")
      const timestamps: number[] = Array.isArray(stored) ? stored : []
      const cutoff = nowMs - rule.windowMs
      const recent = timestamps.filter((ts) => ts > cutoff)
      recent.push(nowMs)
      await kv.put(`rate:${key}`, JSON.stringify(recent), {
        expirationTtl: windowSeconds + 60,
      })
      if (recent.length <= rule.limit) return { allowed: true }
      const retryAfterMs = Math.max(0, recent[0]! + rule.windowMs - nowMs)
      return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) }
    },
  }
}
```

**Wiring** — pick the right implementation based on the KV binding being present:

```ts
// src/app.ts
const inMemoryRateLimiter = createInMemoryRateLimiter() // fallback for local dev
let kvRateLimiter: RateLimiter | null = null

function getRateLimiter(env: Env): RateLimiter {
  if (env.RATE_LIMIT_KV) {
    kvRateLimiter ??= createKvRateLimiter(env.RATE_LIMIT_KV)
    return kvRateLimiter
  }
  return inMemoryRateLimiter
}
```

**Calling it** — apply rate limiting inline where you need it, using per-IP and/or per-identity keys:

```ts
app.post("/auth/login", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown"
  const rateLimiter = getRateLimiter(c.env)
  const result = await rateLimiter.check(
    `login:ip:${ip}`,
    { limit: 10, windowMs: 60_000 } // 10 attempts per minute per IP
  )
  if (!result.allowed) {
    return c.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
      429,
      { "Retry-After": String(result.retryAfterSeconds) }
    )
  }
  // ... handle login
})
```

**wrangler.toml** — add the KV binding:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<namespace-id>"
```

Create the namespace: `bunx wrangler kv:namespace create rate-limit`

Rules:
- Key format: `<action>:<dimension>:<identifier>` — e.g. `login:ip:1.2.3.4`, `signup:email:alice@example.com`
- Use a short TTL (`windowSeconds + 60`) so KV keys expire automatically and you don't pay for stale data
- Skip rate limiting in `NODE_ENV=development` or when running tests to avoid flakiness
- Only rate limit high-risk routes (login, signup, password reset, magic link) — not general API routes

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
