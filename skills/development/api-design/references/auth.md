# Authentication

## Single API

When the project has one API (or one Worker handling all routes):

- **Browser clients**: session-based auth via cookies. In TypeScript, use Better Auth.
- **Programmatic clients**: API keys with `Bearer` token in `Authorization` header. See `api-keys.md` for key management.
- Auth middleware checks for a session cookie first, then falls back to API key.
- User state and sessions live in the same database as the rest of the app.

This is the default. Use this unless you have multiple independently deployed APIs that need shared auth.

## Multiple APIs

When the project has multiple outward-facing APIs (e.g. a user API and an admin API) that share the same user base:

### Architecture

```
┌──────────┐     ┌──────────┐
│ User API │     │ Admin API│    ← public-facing, each its own service
└────┬─────┘     └────┬─────┘
     │                │
     │  Service       │  Service
     │  Binding       │  Binding
     │                │
     └──────┬─────────┘
            │
     ┌──────▼──────┐
     │  Auth API   │    ← internal only, not publicly accessible
     └─────────────┘
```

- **Auth API**: internal service that owns user accounts, sessions, and token issuance. Not exposed to the public internet. In TypeScript, this runs Better Auth.
- **Public APIs**: each has its own Worker/service. They delegate login, signup, and token refresh to the auth API. They verify tokens locally for all other requests.

### Token flow

1. **Login/signup**: public API receives credentials, forwards to auth API via Service Binding (Cloudflare) or internal HTTP call. Auth API validates and returns a short-lived JWT (15 min) + a refresh token.
2. **Authenticated requests**: public API verifies the JWT signature locally — no call to the auth API. Extract user claims from the token and attach to request context.
3. **Token refresh**: when the JWT expires, the public API calls the auth API via Service Binding to exchange the refresh token for a new JWT.
4. **API keys**: handled directly by each public API (no auth API involved). Keys are stored and verified per-service. See `api-keys.md`.

### JWT conventions

- **Short-lived**: 15 minute expiry
- **Signed**: use RS256 or ES256. The auth API holds the private key, public APIs hold the public key for verification.
- **Claims**: include `sub` (user ID), `exp`, `iat`, and any role/permission claims the public APIs need. Keep claims minimal — don't embed entire user profiles.
- **No revocation list**: short expiry makes revocation unnecessary for most cases. For immediate revocation (e.g. user banned), check against the auth API on sensitive operations.

### Cloudflare Service Bindings

On Cloudflare, use Service Bindings for internal API calls:

- Zero network overhead — calls stay within the same Cloudflare colo
- No public URL needed for the auth API
- Type-safe with `hono/client` if both sides are Hono

Declare in `wrangler.toml`:

```toml
[[services]]
binding = "AUTH_API"
service = "auth-api"
```

Access in the Worker:

```ts
const response = await c.env.AUTH_API.fetch(request)
```

### When you don't need multi-API auth

Stick with the single-API pattern when:

- The project has one backend service (even if it serves multiple frontends)
- All routes run in the same Worker/process
- The only separation is route groups (e.g. `/v1/admin/*` vs `/v1/user/*`), not separate deployments
