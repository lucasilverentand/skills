# Authentication & Authorization

## Auth Schemes by Caller Type
|Caller|Mechanism|Why|
|---|---|---|
|Users (web)|Better Auth. Session cookie: `HttpOnly; Secure; SameSite=Lax`.|Cookies are sent automatically, `HttpOnly` prevents XSS theft, `SameSite=Lax` blocks CSRF on mutations.|
|Users (mobile)|Better Auth with `@better-auth/expo`. Token stored in secure storage (Keychain/Keystore).|Secure storage is encrypted at rest and not accessible to other apps.|
|Machines (CLI, integrators)|Scoped API keys with `scopes[]`, `last_used_at`, `expires_at`. Hashed in DB.|API keys are simpler than OAuth for machine callers. Scopes enforce least privilege.|
|Same-process calls|No auth — pass `actor` parameter directly.|Auth inside a single process is overhead with no security benefit.|
|Cross-Worker (same CF account)|Service Bindings (no network hop, type-safe RPC) or Access Service Tokens.|Service Bindings bypass the public internet entirely — no TLS overhead, no auth tokens to manage.|

## API Key Format
Format: `sk_live_<32 random chars>` (secret key), `pk_live_<32 chars>` (publishable key).

- Prefix encodes type and environment: `sk_` = secret, `pk_` = publishable, `_live_` = production, `_test_` = staging.
- Only the **hash** is stored in the database. The raw key is shown once at creation and never again.
- Last 4 characters shown in the UI for identification (`sk_live_...x4f2`).

Because prefixes make keys instantly identifiable in logs without exposing them ("that's a live secret key, not a test publishable key"). Hashing prevents a leaked database dump from compromising every API integration. Showing last-4 lets users identify which key to revoke without exposing the full value.

## Authorization Model
ABAC (attribute-based access control): `user.id === resource.owner_id || user.role === 'admin'`.

Enforced in depth at three layers:

1. **Middleware** — coarse-grained gates: `requireAuthenticated`, `requireRole('admin')`. Rejects obviously unauthorized requests before they hit business logic.
2. **Service layer** — primary ABAC decision. Every mutating function takes an `actor` parameter and checks ownership/permissions inline. This is where the real authorization logic lives.
3. **Postgres RLS** — backstop policy. Not the primary enforcement layer, but protects against application bugs that bypass the service layer. Defense in depth.

Because relying on any single layer fails: middleware-only forgets checks in new endpoints, service-only can be bypassed by direct DB access, RLS-only makes authorization logic invisible to application code.

Never enforce auth only in HTTP handlers. Because handlers get copied, refactored, and new ones get added — and the auth check gets forgotten. The service layer is the single source of truth.

## Hono Middleware Order
```text
Request ID -> Logger -> CORS -> Auth -> Rate Limit -> Idempotency -> Validation -> Handler
```

|Position|Middleware|Rationale|
|---|---|---|
|1|Request ID|Everything downstream needs a correlation ID for logging and error responses.|
|2|Logger|Log the request immediately so even crashes have a trace. Needs request ID.|
|3|CORS|Reject disallowed origins before doing any work. Preflight must return fast.|
|4|Auth|Identify the caller before rate limiting or business logic.|
|5|Rate Limit|Rate limit by authenticated identity, not just IP. Needs auth to run first.|
|6|Idempotency|Check for replayed requests before running the handler. Needs auth for key scoping.|
|7|Validation|Validate request body/params against Zod schema. Only reached for authenticated, non-rate-limited, non-replayed requests.|

## Anti-patterns
- **Tokens in query parameters** — they end up in server logs, browser history, Referer headers, and proxy logs. Always use `Authorization` header or cookies.
- **Auth only in handlers** — forgotten in every third new endpoint. Enforce in middleware + service layer.
- **Trusting client-side role claims** — the JWT says `role: admin` but the client forged it. Always verify tokens server-side and derive roles from the database or a trusted identity provider.
- **Storing API keys unhashed** — a single SQL injection or DB backup leak exposes every integration. Hash with SHA-256 minimum; bcrypt/argon2 if keys are short enough to brute-force.
- **No key rotation plan** — keys should have `expires_at` and the UI should nag when expiry is approaching. "We'll rotate when we need to" means you never do.
