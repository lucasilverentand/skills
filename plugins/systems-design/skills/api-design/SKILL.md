---
name: api-design
description: Designs REST, GraphQL, or gRPC APIs from requirements — picks the right protocol for the use case, models resources and operations, defines schemas (Zod for internal, OpenAPI/GraphQL SDL/proto for specs), and nails down the boring-but-critical pieces: pagination, error format, auth, versioning, idempotency, and rate limits. Writes the spec to .context/architecture/api/ with plain-language explanations of every choice so a junior engineer or a weaker LLM can understand the design. Use when the user asks to design an API, sketch out endpoints, model a schema, plan a service's interface, or says things like "what should the API look like for X", "design endpoints for Y", or "how should clients talk to this service".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# API Design

Turns "we need an API for X" into a concrete spec that covers not just the happy path but the parts that actually bite in production: errors, pagination, auth, versioning, retries, rate limits.

## Current context

- Existing API specs: !`ls .context/architecture/api/ 2>/dev/null || echo "(none yet)"`

## Decision tree

- What kind of API does the user need?
  - **Public HTTP for external clients or humans** → **REST** (or REST+JSON). Simple, cacheable, works in every language and tool. Default choice.
  - **Rich graph queries with client-driven field selection** → **GraphQL**. Good when clients need flexible queries and would otherwise build N endpoints.
  - **Internal service-to-service with strong typing and streaming** → **gRPC**. Great for high-throughput internal RPC; bad for browsers and humans.
  - **Real-time bidirectional updates** → WebSocket (or SSE for one-way). Pair with a REST/GraphQL API for the non-realtime parts.
  - **Just a webhook endpoint** → REST POST with signature verification. Document the signature scheme, payload schema, and retry behavior.
  - **Not sure** → ask the user about clients, use cases, and whether humans will consume it. Default to REST when in doubt.

## Defaults

Unless there's a specific reason to deviate, apply these (from `../../references/stack-defaults.md`):

- **Error format:** RFC 7807 Problem Details. Error codes use `domain.action.reason` pattern.
- **JSON casing:** `camelCase` internal, `snake_case` in public APIs. Hono serializers handle the boundary.
- **Versioning:** URL path `/v1/`, integer bumps. Deprecation: 30–90 days internal, 6+ months public.
- **Pagination:** cursor-based. `{ data: [...], meta: { next_cursor, has_more } }`. Default limit 25, max 100.
- **Idempotency:** middleware-enforced `Idempotency-Key` header on all write endpoints (POST/PATCH). Reject if missing.
- **Rate limiting:** per-plan via DO counters (Free: 60/min, Paid: 600/min). `429` with `Retry-After` + `X-RateLimit-*` headers.
- **Auth:** Better Auth for users, scoped API keys (`sk_live_<32>`) for machines. ABAC enforcement at middleware + service + RLS.
- **IDs:** prefixed ULIDs (`ord_01HF...`). Strings, never integers.
- **API docs:** OpenAPI from Zod schemas via `hono-zod-openapi`, served with Scalar, committed to git.
- **CORS:** explicit allowlist per environment. Never `*` with credentials.
- **Middleware order:** Request ID → Logger → CORS → Auth → Rate limit → Idempotency → Validation.

## Design flow

### 1. Understand the shape of the problem

Before picking a protocol or drawing endpoints, ask (use `AskUserQuestion` for the non-obvious ones):

1. **Who calls this API?** Browsers, mobile apps, other services, third parties, oncall humans with curl?
2. **What are the core resources or operations?** Nouns for REST ("orders", "customers"), verbs for RPC-style.
3. **Read vs write ratio?** Shapes caching and consistency choices.
4. **Trust level of callers?** Public internet? Authenticated users? Trusted internal services?
5. **Latency and throughput targets?** Affects protocol, caching, and whether you need streaming.
6. **Is there an existing API style the client follows?** Consistency with a sibling service is worth a lot.
7. **Versioning expectations?** Rolling releases, multiple client versions in the wild, backwards-compat guarantees?

### 2. Pick the protocol — and say why in plain English

Write the protocol choice with a one-paragraph justification in plain language, not just "REST". A weak reader should be able to understand *why* without knowing the trade-offs in advance. Example:

> **REST over HTTPS with JSON payloads.** Chosen because the primary clients are the storefront web app (browser) and a third-party partner dashboard, both of which work best with standard HTTP tooling and caching. GraphQL was considered but would add a server-side schema layer for no current benefit — the clients don't need flexible field selection. gRPC was ruled out because browsers can't speak it natively.

### 3. Model the resources (REST)

For REST, list the resources and the operations on each. Keep it simple:

| Resource | Operations | Notes |
|---|---|---|
| `orders` | `POST`, `GET /:id`, `GET ?customer_id=...`, `POST /:id/refund` | `POST /:id/refund` is a sub-action, not `PUT`, because it's a state transition with side effects |
| `customers` | `GET /:id`, `GET /:id/orders` | Read-only from this service; customer CRUD lives in the identity service |

Conventions to pick once and stick to:

- **URL style:** lowercase kebab or snake case, plural nouns (`/orders`, not `/order`)
- **Verbs:** POST for create, GET for read, PATCH for partial update, PUT for full replace (rare), DELETE for delete. Sub-actions (like "refund") are POSTs on a sub-path, not weird HTTP verbs.
- **IDs:** UUIDs or prefixed IDs (`ord_abc123`) — explain which and why. Prefixed IDs are great for logs and support — a human can tell at a glance what kind of thing they're looking at.
- **Casing in JSON:** `snake_case` or `camelCase`, pick one and document it
- **Nested resources:** at most one level (`/customers/:id/orders` is fine, `/customers/:id/orders/:oid/line-items/:lid` is probably too deep — flatten to `/line-items/:lid`)

### 4. Model the operations (GraphQL / gRPC)

**GraphQL:** define types, queries, mutations, and subscriptions. Use SDL (Schema Definition Language, the plain-text format for declaring GraphQL schemas). Every type, field, and argument should have a description string — the schema *is* the documentation.

**gRPC:** write the `.proto` file. Group related RPCs into services. Use well-defined message types; avoid overloading a single `Data` blob. Document each RPC with a comment that says what it does and what errors it can return.

### 5. Schemas: the source of truth

For each endpoint/operation, define:

- **Request schema** — path params, query params, body
- **Response schema** — success shape and all error shapes
- **Constraints** — lengths, ranges, allowed values

Use Zod for internal services (matches the TypeScript stack in CLAUDE.md), OpenAPI for external REST APIs, GraphQL SDL for GraphQL, and proto for gRPC. See `references/examples.md` for full examples in each.

### 6. Nail the boring-but-critical pieces

These are what separate "a sketch" from "a usable API". Address each one explicitly:

#### Authentication (who is the caller?)

- **Scheme:** bearer token, session cookie, API key, mTLS (mutual TLS, where both client and server present certificates — used for trusted service-to-service), signed requests?
- **Where it comes from:** `Authorization: Bearer <token>` header is the default. Don't invent new schemes without a reason.
- **How it's verified:** JWT with a public key, session lookup in DB, Better Auth? Say so.

#### Authorization (what is the caller allowed to do?)

- **Model:** RBAC (role-based — "admins can refund"), ABAC (attribute-based — "users can read their own orders"), or scope-based (OAuth scopes)?
- **Where it's enforced:** middleware, per-handler, or in the service layer? Pick one layer and be consistent.
- **Default:** deny. Endpoints that don't require auth should be explicitly marked.

#### Error format

Use **RFC 7807 Problem Details** everywhere:

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

- **`type`** — URI identifying the error type. Use `domain.action.reason` codes (e.g. `order.create.insufficient_stock`). Clients branch on this.
- **`title`** — short human-readable summary. Stable across instances.
- **`detail`** — human-readable, safe to show to a developer. *Not* safe to show to end users (don't leak internal details).
- For validation errors, extend with `errors: [{ field, code, message }]`.

Document every error type. A table of error codes is as important as the endpoint list.

#### HTTP status codes (for REST)

Use them correctly; clients rely on them:

- `200` — success with body
- `201` — created (return the new resource or at least its location)
- `204` — success, no body
- `400` — request is malformed or fails validation (user error, retrying won't help)
- `401` — not authenticated
- `403` — authenticated but not allowed
- `404` — resource doesn't exist (or caller can't see it — leaking existence is a privacy issue)
- `409` — conflict (idempotency key collision, concurrent update)
- `422` — semantically invalid request (validation rules can't be expressed in `400`)
- `429` — rate limited (include `Retry-After`)
- `500` — server bug (caller can retry with backoff, but probably shouldn't spam)
- `503` — temporarily unavailable (caller should retry)

#### Pagination

Don't return unbounded lists. Ever. Pick one style per API:

- **Cursor-based** (recommended for large or mutable data): client passes `?cursor=...&limit=50`, server returns items plus `next_cursor`. Cursors are opaque strings — never parse them on the client. Why: cursor pagination is stable under concurrent writes; offset pagination drops or duplicates rows when new items are inserted.
- **Offset-based** (simpler, fine for small stable data): `?page=2&per_page=50`. Don't use for feeds or anything high-churn.

Document the max `limit` and the default.

#### Idempotency

For any write that might be retried (network flakes, mobile clients), accept an `Idempotency-Key` header. The server records the key + response for a window (e.g., 24 hours) and returns the cached response on replay instead of processing twice. This matters because at-least-once retry semantics (the default for any resilient client) will *absolutely* retry writes, and without an idempotency key you'll charge the card twice.

#### Rate limiting

Per-user and per-IP limits on every public endpoint. Respond with `429 Too Many Requests` and a `Retry-After` header. Document the limits in the spec, not just in code.

#### Versioning

Pick one strategy and stick to it:

- **URL versioning** (`/v1/orders`) — most common, easy to understand, easy to deploy new versions alongside old. Recommended default.
- **Header versioning** (`Accept: application/vnd.example.v1+json`) — cleaner URLs but harder to debug in curl and easier to mess up.
- **No versioning, backwards-compat forever** — works for internal APIs with lockstep clients; do not try this for public APIs.

Document which breaking-change types require a new version (new required field, removed field, changed type) vs which don't (new optional field, new endpoint, new enum value with a client-safe default).

#### Nullable vs missing vs empty

Pick a convention. Mixing them is a classic source of client bugs. Recommended: **missing means "not provided"; `null` means "explicitly no value"; empty array means "zero items".** Document it.

### 7. Write the spec

Output to `.context/architecture/api/<service>.md`. Structure:

1. **Summary** — one paragraph: what the API does, who calls it, protocol choice + why
2. **Base URL and environments** — prod, staging, local
3. **Authentication** — scheme, how to get a token, token lifetime, refresh
4. **Conventions** — casing, ID format, pagination style, error format, idempotency key header, rate limit headers
5. **Resources / operations** — each endpoint with request/response schemas and examples
6. **Error codes** — table of `code` → meaning → when it fires
7. **Versioning policy** — what's breaking, what isn't
8. **Glossary** — plain-language definitions of every term a junior wouldn't know

### 8. Link it up

- Add a link from any related design doc in `.context/architecture/`
- If the API is for a new service, suggest writing ADRs (`write-adr`) for the non-obvious choices: protocol, pagination style, auth scheme
- If there's a diagram of the service, make sure it matches (`c4-diagrams`)

## Writing principles

**Write specs for juniors and weaker LLM models.** A spec that only a senior can read is a spec that will be misimplemented. Apply these:

- **Explain every choice in plain language next to the choice.** Not just "cursor pagination" — "cursor pagination (clients pass an opaque `cursor` string and get back the next one; unlike page numbers, cursors stay stable when new rows are inserted or deleted between requests)".
- **Expand jargon on first use.** mTLS, JWT, CORS, CSRF, IDOR, HATEOAS — all get a one-line plain-language gloss the first time they appear.
- **Show examples for every endpoint.** A curl example + a JSON sample beats a schema table for anyone learning the API. Keep both.
- **Add a Glossary section.** Even a short one. Anything that required you to think twice goes in there for the reader's sake.
- **Say *why* every constraint exists.** "Max page size 100" is a number; "Max page size 100 because responses over ~1 MB cause mobile clients to time out on poor connections" is a constraint a reader can reason about.
- **Don't assume the reader knows REST/GraphQL/gRPC idioms.** One line per idiom the first time it's used. This is cheap and makes the spec useful to twice as many readers.

## Cross-references

| When | Use |
|---|---|
| The API is part of a larger design | `design-system` for the parent doc; link both ways |
| A choice deserves a permanent record | `write-adr` |
| A diagram would make the flow clearer | `c4-diagrams` |
| Review an existing API design | `design-review` |

## Key references

| File | Covers |
|---|---|
| `../../references/stack-defaults.md` | All default API conventions with rationale |
| `references/rest-conventions.md` | Canonical REST conventions: URLs, verbs, statuses, pagination, errors, with explanations for each |
| `references/examples.md` | Full examples in REST (OpenAPI + Zod), GraphQL (SDL), and gRPC (proto), each with a walkthrough |
