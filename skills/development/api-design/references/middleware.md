# Middleware

## Standard middleware chain

Apply middleware in this order:

1. **Request ID** — generate a nanoid, attach to request context and the `X-Request-Id` response header
2. **Logger** — structured request logger (see `logging.md`)
3. **Auth** — resolve current user from session or API key, attach to request context — return 401 if neither is present on protected routes
4. **Rate limiter** (sensitive routes only) — apply to auth/password-reset route groups

In Hono, use `c.set('requestId', id)`, `c.set('user', user)`, `c.set('apiKey', key)` to pass data through the chain.

## Global error handler

Register a catch-all error handler that converts unexpected throws into the standard error shape:

- Never leak stack traces or internal details in production responses
- Log the full error with the request ID for debugging
- Return 500 with `{ ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }`

In Hono, register via `app.onError()`.

## Health and readiness endpoints

Every API exposes two unprotected endpoints:

- `GET /health` — returns `{ ok: true }` with 200. Checks the process is alive. No auth, no DB call.
- `GET /ready` — returns `{ ok: true }` with 200 if the service can handle requests (DB reachable, migrations applied). Returns 503 if not ready.

Use `/health` for liveness probes and `/ready` for readiness probes in deployment configs.
