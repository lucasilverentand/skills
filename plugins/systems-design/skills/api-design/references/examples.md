# API Spec Examples

Full examples in each protocol so you can see what a usable spec looks like. Each one is structured so a junior engineer or a weaker LLM model can read it without external context.

---

## Example 1 — REST (OpenAPI + Zod)

An excerpt from `.context/architecture/api/orders.md` for the Orders service.

### Summary

The Orders API lets the storefront create, read, and refund customer orders, and accepts payment webhooks from Stripe. Protocol: **REST over HTTPS with JSON payloads**. Chosen because the callers are browsers (storefront web app) and partner dashboards — both work best with standard HTTP tooling. GraphQL was considered but would add a schema layer for no current benefit; the clients don't need flexible field selection.

### Base URL

- Production: `https://api.example.com/v1`
- Staging: `https://api.staging.example.com/v1`

### Authentication

`Authorization: Bearer <token>` on every request. Tokens are JWTs (JSON Web Tokens — signed, short-lived credentials) issued by Better Auth after login, with a 15-minute lifetime and a refresh token for renewal. Webhook endpoints (`/webhooks/*`) are authenticated by signature verification instead — see the Stripe webhook section.

### Conventions

- **JSON, snake_case.** Request and response bodies.
- **IDs are prefixed strings.** `ord_abc123` for orders, `cus_xyz789` for customers. Why prefixed: a human reading a log can tell at a glance what kind of thing an ID refers to.
- **Dates in ISO 8601, UTC.** `2026-04-10T12:34:56Z`. Never Unix timestamps.
- **Money as cents.** Integer `amount_cents` + string `currency` (`"USD"`). Never floating-point money — floats lose pennies.
- **Pagination is cursor-based.** `?limit=50&cursor=...`. Max limit 100; default 20. Cursors are opaque strings — never parse them on the client.
- **Errors use a single envelope** (see Errors section below).
- **Idempotency keys** on all `POST`s that create resources: `Idempotency-Key: <uuid>`. Server caches responses for 24h.
- **Rate limiting:** 100 req/min per user, 1000 req/min per IP. Response includes `X-RateLimit-Remaining` and `X-RateLimit-Reset`.

### Resources

#### `POST /orders` — create an order

Creates a new order in `pending` state and returns a Stripe `client_secret` the client can use to confirm payment directly.

**Request:**

```http
POST /v1/orders HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: 9f8a...

{
  "customer_id": "cus_xyz789",
  "items": [
    { "sku": "shirt-blue-m", "qty": 2 },
    { "sku": "hat-black", "qty": 1 }
  ],
  "currency": "USD"
}
```

**Zod schema (server-side validation):**

```ts
import { z } from "zod";

export const CreateOrderRequest = z.object({
  customer_id: z.string().startsWith("cus_"),
  items: z.array(
    z.object({
      sku: z.string().min(1).max(64),
      qty: z.number().int().min(1).max(100),
    })
  ).min(1).max(50),
  currency: z.enum(["USD", "EUR", "GBP"]),
});
```

**Response — 201 Created:**

```json
{
  "id": "ord_abc123",
  "status": "pending",
  "customer_id": "cus_xyz789",
  "total_cents": 4997,
  "currency": "USD",
  "client_secret": "pi_3Nx...secret_xyz",
  "created_at": "2026-04-10T12:34:56Z"
}
```

**Possible errors:**

| Status | Code | When |
|---|---|---|
| 400 | `order.create.invalid_request` | Request body fails schema validation |
| 404 | `order.create.customer_not_found` | `customer_id` doesn't exist or caller can't see it |
| 409 | `order.create.idempotency_conflict` | Same `Idempotency-Key` with a different request body |
| 422 | `order.create.sku_not_available` | One of the SKUs is out of stock or discontinued |

#### `GET /orders/:id` — retrieve an order

**Response — 200 OK:**

```json
{
  "id": "ord_abc123",
  "status": "paid",
  "customer_id": "cus_xyz789",
  "total_cents": 4997,
  "currency": "USD",
  "line_items": [
    { "id": "li_001", "sku": "shirt-blue-m", "qty": 2, "unit_price_cents": 1999 },
    { "id": "li_002", "sku": "hat-black", "qty": 1, "unit_price_cents": 999 }
  ],
  "created_at": "2026-04-10T12:34:56Z",
  "updated_at": "2026-04-10T12:36:10Z"
}
```

Authorization: callers can only see their own orders. If the caller isn't the owner (or an admin), we return `404 order_not_found` rather than `403` — this avoids leaking whether a given order exists. Explicit choice, tradeoff: slightly more confusing error for the legitimate-but-wrong-session case.

#### `GET /customers/:id/orders` — list a customer's orders

Paginated. Sorted by `created_at` descending.

**Query params:**

| Name | Type | Default | Notes |
|---|---|---|---|
| `limit` | int | 20 | Max 100 |
| `cursor` | string | — | Opaque cursor from a previous response |
| `status` | enum | — | Filter by status: `pending`, `paid`, `fulfilled`, `refunded` |

**Response — 200 OK:**

```json
{
  "data": [
    { "id": "ord_abc123", "status": "paid", "total_cents": 4997, "currency": "USD", "created_at": "2026-04-10T12:34:56Z" }
  ],
  "meta": {
    "next_cursor": "eyJpZCI6Im9yZF94eXoifQ",
    "has_more": true
  }
}
```

#### `POST /orders/:id/refund` — issue a refund

Sub-action. Not `DELETE` (the order still exists), not `PATCH` (it has side effects — calls Stripe). Accepts a full or partial refund amount.

**Request:**

```json
{ "amount_cents": 1999, "reason": "customer_request" }
```

**Response — 200 OK:**

```json
{ "id": "ref_qwe456", "order_id": "ord_abc123", "amount_cents": 1999, "status": "processing" }
```

### Error codes

All error responses use this shape:

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

| Code | Status | Meaning |
|---|---|---|
| `order.request.invalid` | 400 | Body fails schema validation (bad type, missing required field, out of range) |
| `auth.token.invalid` | 401 | Missing or invalid bearer token |
| `auth.access.denied` | 403 | Authenticated but not allowed (e.g., non-admin trying to refund) |
| `order.read.not_found` | 404 | No order with that ID, or caller can't see it |
| `order.create.customer_not_found` | 404 | Customer in request doesn't exist or caller can't see it |
| `order.create.idempotency_conflict` | 409 | Same `Idempotency-Key` reused with a different body |
| `order.create.sku_not_available` | 422 | SKU out of stock, discontinued, or region-restricted |
| `order.request.rate_limited` | 429 | Too many requests; see `Retry-After` |
| `system.internal.error` | 500 | Unhandled server error. Include `request_id` when filing a bug |

### Versioning policy

- URL versioning (`/v1/`, `/v2/`).
- New required fields, removed fields, and changed field types are breaking — they require a new version.
- New optional fields, new endpoints, and new enum values are non-breaking. Clients should ignore unknown fields and treat unknown enum values as a safe default.
- When a version is deprecated, responses include `Deprecation: true` and `Sunset: <date>` headers. Deprecation window: minimum 6 months.

### Glossary

- **JWT (JSON Web Token)** — a signed, short-lived credential that carries a user identity. The server verifies the signature instead of looking up a session in a DB, which makes auth cheap.
- **Idempotency key** — a unique string a client sends with a write. The server caches the response for a window; replays with the same key return the cached response instead of processing twice. Prevents double-charging when a retry collides with a successful-but-lost response.
- **Cursor pagination** — pagination where the client passes an opaque `cursor` string (not a page number) to get the next chunk. Stays stable when items are inserted or deleted between requests. Compare: offset pagination, which can drop or duplicate rows.
- **Bearer token** — the standard HTTP pattern for authenticating requests by putting a token in the `Authorization: Bearer <token>` header. "Bearer" means whoever holds the token can use it — so protect it.
- **Webhook** — an HTTP endpoint the API *exposes* for an external system to POST into, not one the API calls. Stripe sends us payment events via our webhook.

---

## Example 2 — GraphQL (SDL excerpt)

```graphql
"""
The Orders API lets the storefront create, query, and refund orders.
Authentication is handled by a Bearer JWT in the Authorization header.
"""
schema {
  query: Query
  mutation: Mutation
}

"""
A customer order. Orders are owned by exactly one customer and have a
state machine: pending -> paid -> fulfilled -> closed, with refunded as
an alternative terminal state.
"""
type Order {
  id: ID!
  status: OrderStatus!
  customer: Customer!
  lineItems: [LineItem!]!
  "Total in the smallest currency unit (e.g., cents for USD)."
  totalCents: Int!
  currency: Currency!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum OrderStatus {
  PENDING
  PAID
  FULFILLED
  REFUNDED
  CLOSED
}

type Query {
  "Fetch a single order. Returns null if it doesn't exist or the caller can't see it."
  order(id: ID!): Order

  """
  List a customer's orders, newest first. Uses cursor pagination.
  Pass `after: null` for the first page.
  """
  customerOrders(
    customerId: ID!
    first: Int = 20
    after: String
    status: OrderStatus
  ): OrderConnection!
}

type Mutation {
  """
  Create a new order in PENDING state. Returns the order and a Stripe
  client_secret the caller uses to confirm payment.
  """
  createOrder(input: CreateOrderInput!): CreateOrderResult!

  "Issue a refund against a paid order. Amount is in the order's currency."
  refundOrder(orderId: ID!, amountCents: Int!, reason: RefundReason!): Refund!
}

input CreateOrderInput {
  customerId: ID!
  items: [OrderItemInput!]!
  currency: Currency!
  "Optional idempotency key. Reusing a key returns the cached result."
  idempotencyKey: String
}
```

**Why GraphQL here vs REST?** In this example we'd only pick GraphQL if the clients had genuinely diverse query shapes (admin dashboards needing deep nested fetches + mobile needing tiny projections) and we wanted to avoid building N ad-hoc REST endpoints. For a single storefront client, REST is simpler and we'd not use GraphQL.

**Glossary:**
- **SDL (Schema Definition Language)** — the plain-text format for declaring GraphQL types, queries, and mutations. The schema *is* the API contract.
- **Connection / Cursor pagination (Relay-style)** — a GraphQL convention where paginated fields return a `Connection` type with `edges`, `nodes`, and a `pageInfo`. Standardized so tools can work with any GraphQL API.

---

## Example 3 — gRPC (proto excerpt)

```proto
syntax = "proto3";

package orders.v1;

// OrdersService is the internal RPC surface for the orders domain.
// Called from other backend services (web BFF, admin tools, worker jobs).
// Not exposed to browsers — they talk to the REST gateway instead.
service OrdersService {
  // Create a new order. Accepts an idempotency_key in the metadata
  // header "idempotency-key" to make retries safe.
  rpc CreateOrder(CreateOrderRequest) returns (Order);

  // Retrieve an order by ID. Returns NOT_FOUND if the order doesn't
  // exist or the caller can't see it (we don't distinguish, to avoid
  // leaking existence).
  rpc GetOrder(GetOrderRequest) returns (Order);

  // Stream all state changes for an order in real time. Used by the
  // admin dashboard's live-view panel.
  rpc WatchOrder(GetOrderRequest) returns (stream OrderEvent);
}

message Order {
  string id = 1;
  OrderStatus status = 2;
  string customer_id = 3;
  int64 total_cents = 4;
  string currency = 5;  // ISO 4217 code
  google.protobuf.Timestamp created_at = 6;
  google.protobuf.Timestamp updated_at = 7;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;  // required first value
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_PAID = 2;
  ORDER_STATUS_FULFILLED = 3;
  ORDER_STATUS_REFUNDED = 4;
  ORDER_STATUS_CLOSED = 5;
}
```

**Why gRPC here vs REST?** Internal service-to-service calls benefit from strong typing (`.proto` files generate client and server code in every major language) and lower per-call overhead than JSON over HTTP. We'd use gRPC *only* for internal traffic; browsers can't speak it natively and debugging with curl is painful.

**Glossary:**
- **proto (Protocol Buffers)** — Google's binary serialization format. The `.proto` file is the source of truth for message types and RPC services; code is generated from it.
- **`_UNSPECIFIED = 0`** — proto3 enums require a zero value that means "not set". Explicitly naming it `UNSPECIFIED` prevents "oh, this is just PENDING" confusion.
- **Streaming RPC** — gRPC lets a single RPC return a stream of messages instead of one response. Good for change feeds and pub-sub-style APIs.
