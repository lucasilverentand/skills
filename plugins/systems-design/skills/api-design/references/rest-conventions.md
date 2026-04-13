# REST Conventions — with explanations

A set of conventions to pick once and apply everywhere. Each rule has a "why" next to it so a reader can decide when to break it.

## URLs

- **Lowercase, plural nouns, kebab or snake case.** `/orders`, `/line-items`.
  _Why:_ plural means "collection"; consistent casing prevents "which style did we use again?" cycles.
- **Resources, not RPC verbs.** `/orders/:id/refund` is OK; `/refundOrder?id=...` is not.
  _Why:_ resource-shaped URLs let you use HTTP verbs to mean what they mean, and they're cacheable.
- **At most one level of nesting.** `/customers/:id/orders` is fine; `/customers/:id/orders/:oid/items/:iid` is not — flatten it to `/items/:iid`.
  _Why:_ deep paths are fragile (if a parent relationship changes, every URL breaks) and hard to cache.
- **No file extensions in URLs.** `/orders`, not `/orders.json`.
  _Why:_ the response shape is controlled by the `Accept` header and the `Content-Type` response header. Extensions are a relic.
- **Query params for filtering, sorting, pagination.** `/orders?status=paid&sort=-created_at&cursor=...&limit=50`.
  _Why:_ these aren't separate resources, just views of the same one.

## HTTP verbs (methods)

| Verb   | Use for                             | Safe? | Idempotent? |
| ------ | ----------------------------------- | ----- | ----------- |
| GET    | Reads                               | Yes   | Yes         |
| POST   | Creates, and non-idempotent actions | No    | No          |
| PUT    | Full resource replacement (rare)    | No    | Yes         |
| PATCH  | Partial updates                     | No    | No\*        |
| DELETE | Removal                             | No    | Yes         |

_PATCH can be made idempotent with an `Idempotency-Key` header. "Idempotent" means retrying produces the same outcome — critical because networks retry for you and you don't want duplicate charges._

- **POST for sub-actions.** `POST /orders/:id/refund`, `POST /users/:id/verify-email`.
  _Why:_ state-changing actions that aren't pure create/update belong in POST with a named sub-resource. Don't invent `REFUND` as an HTTP verb.

## Status codes

Use them correctly. Clients branch on status codes all the time.

- **2xx — success**
  - `200` — success with body (GET, most POST/PATCH)
  - `201` — created (POST that creates a resource; include `Location` header or the new resource in the body)
  - `202` — accepted, processing async (return a job ID)
  - `204` — success, no body (DELETE, sometimes PUT)
- **3xx — redirection** — rarely needed in APIs
- **4xx — caller's fault**
  - `400` — malformed request (bad JSON, missing required field) — retrying won't help
  - `401` — not authenticated (no or invalid credentials)
  - `403` — authenticated but not authorized for this action
  - `404` — resource not found (or caller isn't allowed to see it; hiding existence is often a privacy requirement)
  - `409` — conflict (version mismatch on optimistic lock, idempotency key collision)
  - `410` — gone (used to exist, intentionally removed)
  - `422` — validation failed (request is well-formed but violates rules, e.g., "email already taken")
  - `429` — rate limited; must include `Retry-After` header
- **5xx — server's fault**
  - `500` — unexpected server error; clients may retry with backoff
  - `502` / `503` / `504` — upstream or availability issues; clients should retry

The most common mistakes:

- Returning `200` with `{"error": ...}` instead of a 4xx. Clients can't tell success from failure without parsing the body.
- Returning `500` for user errors. Noise in monitoring and scares oncall.
- Returning `404` when you should return `403`. The attacker learns less with `404`, but legitimate users get confusing errors. Pick a policy per endpoint.

## Request and response shapes

- **JSON, always, for public APIs.** `Content-Type: application/json`.
- **snake_case** or **camelCase** — pick one per API and never mix. snake_case plays nicer with Python clients and SQL backends; camelCase matches JavaScript.
- **Envelope or bare?** Prefer **bare** responses (`{ "id": ..., "status": ... }`) for single resources and **`{ data: [...], next_cursor: ... }`** envelopes for lists. Don't wrap single resources in `{ "data": { ... } }` — it's noise.
- **Dates** as ISO 8601 strings in UTC: `2026-04-10T12:34:56Z`. Never Unix timestamps in public APIs — they're ambiguous about units and timezone.
- **Money** as an integer in the smallest currency unit (`amount_cents: 1999`, `currency: "USD"`). Never floats. Floats lose pennies.
- **IDs** as strings, not numbers. JSON numbers lose precision above 2^53, and prefixed IDs (`ord_abc123`) are human-friendlier.

## Pagination

Pick one style per API.

### Cursor pagination (recommended for most cases)

```
GET /orders?limit=50&cursor=eyJpZCI6Im9yZF9hYmMifQ
```

Response:

```json
{
  "data": [ ... 50 orders ... ],
  "next_cursor": "eyJpZCI6Im9yZF94eXoifQ",
  "has_more": true
}
```

- `cursor` is **opaque** — the client treats it as a black box. Don't let clients construct or inspect it, because that lets them depend on its shape.
- **Why this beats offset:** when items are added or removed between requests, offset pagination drops or duplicates rows. Cursor pagination stays stable because it's anchored to a specific row's position in the sort order.

### Offset pagination (fine for small, stable data)

```
GET /posts?page=2&per_page=50
```

- Simple and familiar.
- Breaks under concurrent writes — if item 0 is deleted between page 1 and page 2, one item is silently skipped.
- Fine for admin UIs on small tables; don't use for feeds or high-churn data.

## Error format

One shape, everywhere. Use **RFC 7807 Problem Details** — a standard with broad tooling support:

```json
{
  "type": "https://api.example.com/errors/order.read.not_found",
  "title": "Order not found",
  "status": 404,
  "detail": "No order with that ID exists.",
  "instance": "/v1/orders/ord_abc123",
  "request_id": "req_f00b4r"
}
```

- **`type`** — URI identifying the error type. Clients switch on this. Use `domain.action.reason` pattern in the path (e.g. `order.create.insufficient_stock`).
- **`title`** — short human-readable summary. Stable across instances of the same error.
- **`status`** — HTTP status code repeated in the body for convenience.
- **`detail`** — human-readable explanation specific to this occurrence. Developer-facing — don't put PII or internal paths here.
- **`instance`** — URI identifying the specific request that caused the error.
- **`request_id`** (extension) — server-generated ID the client can cite in a support ticket. Makes debugging 10x easier.

For validation errors, extend with `errors: [{ field, code, message }]`.

Always document every error type in one table. That table is as important as the endpoint list.

## Idempotency keys

For `POST` requests that create things (orders, payments, messages), accept an `Idempotency-Key: <uuid>` header.

- Server stores `(idempotency_key → response)` for a window (e.g., 24 hours)
- On a replay with the same key, return the cached response instead of processing again
- Conflict: same key, _different_ request body → return `409 Conflict` with a clear message

**Why:** any resilient client will retry failed writes (mobile apps on flaky networks especially). Without idempotency keys, you'll charge the card twice when one request succeeds but the response is lost in transit.

## Rate limiting

Include these headers on every response (even success):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1712345678
```

When rate-limited, return `429` with `Retry-After: <seconds>`.

Document the limits in the spec, not just in code — clients need to know before they hit the wall.

## Versioning

- **URL versioning** — `/v1/orders`, `/v2/orders`. Default choice for public APIs. Easy to deploy side-by-side.
- **Add a version when you make a breaking change.** Breaking changes include: removing a field, changing a field's type, making an optional field required, tightening validation, changing an enum value's meaning.
- **Non-breaking changes don't need a new version.** Adding an endpoint, adding an optional field, adding a new enum value that clients can ignore, loosening validation.
- **Deprecate before removing.** When a version is going away, add a `Deprecation: true` header and a `Sunset: <date>` header on responses.

## Authentication

- **`Authorization: Bearer <token>`** for most APIs. Token is opaque or a JWT; document which.
- **`X-API-Key: <key>`** for server-to-server when tokens are overkill. Document rotation.
- **Session cookies** for browser-only APIs that set the cookie from a same-origin login endpoint. Set `HttpOnly; Secure; SameSite=Lax` (or `Strict` if you can).
- **Never** put tokens in query parameters — they end up in server logs and browser history.

## CORS (Cross-Origin Resource Sharing)

If browsers will call the API from a different origin than where it's served:

- Send `Access-Control-Allow-Origin` with a specific origin (not `*` if credentials are involved)
- Send `Access-Control-Allow-Credentials: true` only if using cookies
- Respond to `OPTIONS` preflight requests with the allowed methods and headers
- Document which origins are allowed

**What this is:** a browser security mechanism that blocks JavaScript on one site from calling an API on another site unless the API explicitly opts in. Doesn't apply to non-browser clients.

## Don't do these

- **Don't expose database IDs in URLs if they're sequential integers.** `/users/1234` leaks your user count and enables enumeration attacks. Use UUIDs or prefixed IDs.
- **Don't return `null` instead of omitting missing fields** — unless you have a convention that `null` means "explicitly cleared" (which is a valid choice, just document it).
- **Don't return inconsistent shapes.** `GET /orders/:id` and `GET /orders` should return objects with the same fields (possibly a subset for the list view, but never different field _names_).
- **Don't put secrets in URLs.** They end up in logs, analytics, browser history.
- **Don't trust any client input.** Validate everything at the boundary. Use Zod, OpenAPI request validation, or equivalent.
