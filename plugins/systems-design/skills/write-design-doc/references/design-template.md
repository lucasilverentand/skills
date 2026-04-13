# Design Doc Template

Filled-in example for a fictional orders service. Copy the structure.

---

# Orders Service

## Summary

Accepts orders from the storefront, holds them through payment and fulfillment, emits events for downstream systems. Replaces the monolithic `/api/orders` endpoints.

## Requirements

**Functional:** create order from cart, payment state machine (`pending -> paid -> fulfilled -> closed`), refunds, order history, domain events on transitions.

**Non-functional:**

| NFR | Target | Why |
|---|---|---|
| Throughput | 200/s peak | Black Friday 2x last year |
| Latency | p99 < 300ms create | Conversion drops past 500ms |
| Availability | 99.95% | Direct revenue impact |
| Consistency | Strong for orders, eventual for history | Refunds must never be lost |
| Retention | 7 years | Tax/audit |

## High-level architecture

```mermaid
flowchart LR
  Web[Storefront] -->|POST /orders| API[Orders API (Hono/Workers)]
  API --> DB[(Postgres/Neon)]
  API --> Queue[CF Queue: order-events]
  Queue --> Inv[Inventory Worker]
  Queue --> Notif[Notification Worker]
  API --> Stripe[Stripe API]
```

## Data model

```
orders    (id: ord_<ulid>, tenant_id, customer_id FK, status, total_cents, currency, timestamps)
line_items(id: li_<ulid>,  tenant_id, order_id FK, sku, qty, unit_price_cents, timestamps)
payments  (id: pay_<ulid>, tenant_id, order_id FK, polar_payment_id, status, amount_cents, timestamps)
order_events (id: evt_<ulid>, tenant_id, order_id FK, type, payload jsonb, created_at) -- outbox
```

Prefixed ULIDs. `tenant_id` + RLS on every table. Soft delete. Outbox for reliable event publishing.

## Key flows

**Create order (happy path):**
1. Client POSTs `/orders` with cart
2. API validates, prices items
3. Single transaction: insert order + line_items + payment + outbox event
4. Return `{order_id, client_secret}`
5. Outbox worker publishes to queue
6. Client confirms payment via Stripe; webhook transitions to `paid`

**Payment fails:**
1. Stripe webhook: `payment_failed`
2. Order -> `payment_failed` (terminal) + outbox event
3. Notification worker emails customer
4. Inventory worker releases reservation

## API surface

- `POST /v1/orders` -- create (Idempotency-Key required)
- `GET /v1/orders/:id` -- retrieve (ABAC)
- `POST /v1/orders/:id/refund` -- refund (Idempotency-Key required)
- `GET /v1/customers/:id/orders` -- paginated history

RFC 7807 errors. `domain.action.reason` codes. snake_case JSON.

## Non-functional story

- **Throughput:** Workers auto-scale. Neon autoscales writes. Tested 400/s on staging.
- **Latency:** Single INSERT RETURNING with CTEs. p99 ~180ms staging.
- **Availability:** No app-layer SPOF. Neon 99.95% SLA = matches target, no headroom.
- **PII:** email encrypted at rest, scrub after 30-day soft delete, Neon EU region.

## Trade-offs

| Decision | Chose | Rejected | Why |
|---|---|---|---|
| Data store | Neon (EU) | DynamoDB | Relational queries, transactions, data residency |
| Events | Outbox -> Queue | Direct publish | Avoids dual-write if queue is down |
| Boundary | Separate service | Keep in monolith | Spiky load profile, independent scaling |

## Open questions

- Partial line-item refunds? Need product input.
- Reserve inventory on create or on payment success?
- Tier old events to cold storage after 90 days?

## Next steps

1. Validate data model against existing complex queries
2. Spike outbox worker drain latency
3. Write ADRs: outbox pattern, Neon vs DynamoDB
