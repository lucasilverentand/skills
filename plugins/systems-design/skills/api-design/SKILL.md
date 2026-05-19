---
name: api-design
description: Designs REST, GraphQL, or gRPC APIs from requirements — picks the right protocol for the use case, models resources and operations, defines schemas (Zod for internal, OpenAPI/GraphQL SDL/proto for specs), and writes the spec to .context/architecture/api/. Use when the user asks to design an API, sketch out endpoints, model a schema, plan a service's interface, or says things like "what should the API look like for X", "design endpoints for Y", or "how should clients talk to this service".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# API Design
Turns "we need an API for X" into a concrete spec — protocol, resources, schemas, and the cross-cutting concerns that actually bite in production.

## Current context
- Existing API specs: !`ls .context/architecture/api/ 2>/dev/null || echo "(none yet)"`

## Decision tree
- What kind of API does the user need?
  - **Public HTTP for external clients or humans** -> **REST** (or REST+JSON). Simple, cacheable, works in every language and tool. Default choice.
  - **Rich graph queries with client-driven field selection** -> **GraphQL**. Good when clients need flexible queries and would otherwise build N endpoints.
  - **Internal service-to-service with strong typing and streaming** -> **gRPC**. Great for high-throughput internal RPC; bad for browsers and humans.
  - **Real-time bidirectional updates** -> WebSocket (or SSE for one-way). Pair with a REST/GraphQL API for the non-realtime parts.
  - **Just a webhook endpoint** -> REST POST with signature verification. Document the signature scheme, payload schema, and retry behavior.
  - **Not sure** -> ask the user about clients, use cases, and whether humans will consume it. Default to REST when in doubt.

## Design flow

### 1. Understand the shape of the problem
Before picking a protocol or drawing endpoints, ask (use `AskUserQuestion` for the non-obvious ones):

1. **Who calls this API?** Browsers, mobile apps, other services, third parties, oncall humans with curl?
2. **What are the core resources or operations?** Nouns for REST ("orders", "customers"), verbs for RPC-style.
3. **Read vs write ratio?** Shapes caching and consistency choices.
4. **Trust level of callers?** Public internet? Authenticated users? Trusted internal services?
5. **Latency and throughput targets?** Affects protocol, caching, and whether you need streaming.
6. **Is there an existing API style the client follows?** Consistency with a sibling service is worth a lot.

### 2. Pick the protocol — and say why in plain English
Write the protocol choice with a one-paragraph justification. A weak reader should understand _why_ without knowing the trade-offs in advance. Example:

> **REST over HTTPS with JSON payloads.** Chosen because the primary clients are the storefront web app (browser) and a third-party partner dashboard, both of which work best with standard HTTP tooling and caching. GraphQL was considered but would add a server-side schema layer for no current benefit.

### 3. Model the resources (REST)
List resources and operations. Keep it simple:

|Resource|Operations|Notes|
|---|---|---|
|`orders`|`POST`, `GET /:id`, `GET ?customer_id=...`, `POST /:id/refund`|`POST /:id/refund` is a sub-action, not `PUT`|
|`customers`|`GET /:id`, `GET /:id/orders`|Read-only from this service|

Conventions to pick once and stick to:

- **URL style:** lowercase kebab or snake case, plural nouns (`/orders`, not `/order`)
- **Verbs:** POST for create, GET for read, PATCH for partial update, PUT for full replace (rare), DELETE. Sub-actions (like "refund") are POSTs on a sub-path.
- **IDs:** prefixed ULIDs (`ord_abc123`) as strings, never integers
- **Casing in JSON:** `snake_case` for public APIs, `camelCase` for internal
- **Nested resources:** at most one level deep (`/customers/:id/orders` — flatten beyond that)

See `references/http-conventions.md` for the full set of HTTP conventions with explanations.

### 4. Model the operations (GraphQL / gRPC)
**GraphQL:** define types, queries, mutations, subscriptions in SDL. Every type, field, and argument gets a description string — the schema _is_ the documentation.

**gRPC:** write the `.proto` file. Group related RPCs into services. Document each RPC with what it does and what errors it returns.

See `references/examples.md` for full examples in all three protocols.

### 5. Define schemas
For each endpoint/operation:

- **Request schema** — path params, query params, body
- **Response schema** — success shape and all error shapes
- **Constraints** — lengths, ranges, allowed values

Use Zod for internal services, OpenAPI for external REST, GraphQL SDL for GraphQL, proto for gRPC.

### 6. Address cross-cutting concerns
For each of these, apply conventions from the reference files and document any deviation in the spec:

- **Authentication** — who is the caller? Bearer token, session cookie, API key, mTLS?
- **Authorization** — what is the caller allowed to do? ABAC enforced at middleware + service layer + RLS.
- **Error format** — RFC 7807 Problem Details everywhere:

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

- **Pagination** — cursor-based default. `{ data, meta: { next_cursor, has_more } }`. Max 100, default 25.
- **Idempotency** — `Idempotency-Key` header on all write endpoints.
- **Rate limiting** — per-plan via DO counters. `429` with `Retry-After`.
- **Versioning** — URL path `/v1/`. Deprecation headers.
- **Nullable vs missing** — missing = "not provided", `null` = "explicitly no value".
- **CORS** — explicit allowlist per environment. Never `*` with credentials.

For details and rationale on each, see the reference files below.

### 7. Write the spec
Output to `.context/architecture/api/<service>.md`. Structure:

1. **Summary** — one paragraph: what the API does, who calls it, protocol choice + why
2. **Base URL and environments** — prod, staging, local
3. **Authentication** — scheme, how to get a token, token lifetime, refresh
4. **Conventions** — casing, ID format, pagination style, error format, idempotency key header, rate limit headers
5. **Resources / operations** — each endpoint with request/response schemas and examples
6. **Error codes** — table of `code` -> meaning -> when it fires
7. **Versioning policy** — what's breaking, what isn't
8. **Glossary** — plain-language definitions of every term a junior wouldn't know

### 8. Link it up
- Add a link from any related design doc in `.context/architecture/`
- If the API is for a new service, suggest writing ADRs (`documentation:write-adr`) for non-obvious choices when available
- If there's a diagram, make sure it matches (`documentation:c4-diagrams`) when available

## Writing principles
**Write specs for juniors and weaker LLM models.** A spec that only a senior can read is a spec that will be misimplemented:

- **Explain every choice in plain language next to the choice.** Not just "cursor pagination" — "cursor pagination (clients pass an opaque string and get back the next one; stays stable when items are inserted between requests)".
- **Expand jargon on first use.** mTLS, JWT, CORS, CSRF — all get a one-line gloss the first time.
- **Show examples for every endpoint.** A curl example + JSON sample beats a schema table.
- **Say _why_ every constraint exists.** "Max page size 100 because responses over ~1 MB cause mobile clients to time out."

## Cross-references
|When|Use|
|---|---|
|Need the system architecture first|`architecture`|
|Need the data model|`data-modeling`|
|The API is part of a larger design|`documentation:write-design-doc` for the parent doc if installed|
|A choice deserves a permanent record|`documentation:write-adr` if installed|
|A diagram would make the flow clearer|`documentation:c4-diagrams` if installed|
|Review an existing API design|`design-review`|

## Key references
|File|Covers|
|---|---|
|`references/http-conventions.md`|URLs, HTTP verbs, status codes, request/response shapes, CORS|
|`references/error-handling.md`|RFC 7807 Problem Details, error code taxonomy, validation errors, result types, Zod validation|
|`references/auth.md`|Auth schemes by caller type, API key format, ABAC authorization, Hono middleware order|
|`references/pagination.md`|Cursor-based (recommended) and offset-based pagination with trade-offs|
|`references/api-patterns.md`|Idempotency, rate limiting, versioning, webhooks, file uploads, API documentation|
|`references/example-rest.md`|REST example: Orders API with Zod schemas, endpoints, error codes|
|`references/example-graphql.md`|GraphQL example: Orders SDL with types, queries, mutations|
|`references/example-grpc.md`|gRPC example: Orders proto with services, messages, streaming|
