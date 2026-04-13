# Design Document Template

This is a filled-in example for a fictional `orders-service`. Copy the structure, not the content.

---

# Orders Service

## Summary

Accepts orders from the storefront, holds them through payment and fulfillment, and emits events for downstream systems (inventory, analytics, notifications). Replaces the current monolithic `/api/orders` endpoints in `apps/web/` which conflate cart, checkout, and order history.

## Requirements

### Functional

- Create an order from a cart
- Attach a payment intent and transition the order through `pending → paid → fulfilled → closed`
- Allow refunds against any paid order
- Expose an order history view per customer
- Emit domain events on every state transition

### Non-functional

| NFR | Target | Why |
|---|---|---|
| Throughput | 200 orders/sec peak | Black Friday 2x of last year |
| Latency | p99 < 300ms for create | Conversion drops sharply past 500ms |
| Availability | 99.95% | Direct revenue impact; checkout is business-critical |
| Consistency | Strong for order state, eventual for history views | A refund must never be lost; history can lag by a few seconds |
| Data retention | 7 years | Tax/audit |
| PII | GDPR-compliant delete flow | Legal requirement |

## High-level architecture

```mermaid
flowchart LR
  Web[Storefront (Astro)] -->|POST /orders| API[Orders API (Hono on CF Workers)]
  API --> DB[(Postgres / Neon)]
  API --> Queue[Cloudflare Queue: order-events]
  Queue --> Inv[Inventory Worker]
  Queue --> Notif[Notification Worker]
  Queue --> Analytics[Analytics sink]
  API --> Stripe[Stripe API]
```

Three pieces:
- **Orders API** — Hono on Cloudflare Workers. Stateless. Owns writes to the `orders` DB.
- **Postgres (Neon)** — source of truth for orders, line items, refunds
- **Cloudflare Queue** — `order-events` topic, consumed by inventory, notifications, and analytics workers independently

## Data model

```
customers (id: usr_<ulid>, tenant_id, email, created_at, updated_at, deleted_at)
orders (id: ord_<ulid>, tenant_id, customer_id FK, status, total_cents, currency, created_at, updated_at, deleted_at)
line_items (id: li_<ulid>, tenant_id, order_id FK, sku, qty, unit_price_cents, created_at, updated_at, deleted_at)
payments (id: pay_<ulid>, tenant_id, order_id FK, polar_payment_id, status, amount_cents, created_at, updated_at, deleted_at)
refunds (id: ref_<ulid>, tenant_id, payment_id FK, amount_cents, reason, created_at, updated_at, deleted_at)
order_events (id: evt_<ulid>, tenant_id, order_id FK, type, payload_jsonb, created_at)  -- outbox
```

- **IDs** are prefixed ULIDs (e.g. `ord_01HF2M3N4P5QRSTVWXYZ123456`) — time-sortable, greppable by type, 128-bit. See stack defaults for rationale.
- **`tenant_id`** on every table. Postgres RLS policy filters by `tenant_id` as a backstop; the primary filter is in the application query layer.
- **Timestamps:** `created_at` + `updated_at` + `deleted_at` on every table (soft delete default). Soft-deleted rows excluded by default via Drizzle filter.
- `order_events` is an **outbox table** (a DB table used as a staging area for events before they're published to a queue). The service writes the state change and the event row in the same DB transaction; a background worker reads new rows and publishes them to the Cloudflare Queue. Why this helps: if the queue is down or slow, we don't lose events — they pile up in the DB and drain when the queue recovers. Avoids the "dual-write problem" where a commit succeeds but the queue publish fails.
- `orders.status` uses a string enum with a CHECK constraint (a Postgres constraint that rejects rows whose `status` value isn't in a fixed list) rather than a separate `order_statuses` table. Why: status transitions are rare and queries filter on status constantly — a join would be wasted work on every read.

## Key flows

### Create order (happy path)

1. Client POSTs `/orders` with `{customer_id, items, payment_method}`
2. API validates with Zod, looks up customer, prices line items
3. In a single transaction: insert `orders` row (`pending`), `line_items`, `payments` (`requires_confirmation`), and `order_events` row (`order.created`)
4. API returns `{order_id, client_secret}` for Stripe confirmation
5. Outbox worker picks up `order.created`, publishes to `order-events` queue
6. Client confirms payment via Stripe directly; Stripe webhook transitions the order to `paid`

### Payment fails

1. Stripe webhook reports `payment_failed`
2. API transitions the order to `payment_failed` (terminal), inserts `order_events: order.payment_failed`
3. Notification worker emails the customer
4. Inventory reservation (if any) is released by the inventory worker consuming the event

## API surface

See `.context/architecture/api/orders.md` for the full spec. Summary:

- `POST /v1/orders` — create (requires `Idempotency-Key` header)
- `GET /v1/orders/:id` — retrieve (ABAC: customer can only see their own; admin sees all)
- `POST /v1/orders/:id/refund` — issue refund (requires `Idempotency-Key` header)
- `GET /v1/customers/:id/orders` — paginated history (cursor-based, default limit 25)
- `POST /webhooks/polar` — Polar.sh signature-verified webhook

All errors use RFC 7807 Problem Details. Error codes follow `domain.action.reason` (e.g. `order.create.insufficient_stock`). Public API uses `snake_case` JSON.

## Non-functional story

- **Throughput (200/s)**: Workers scale horizontally by default. Postgres write capacity is the bottleneck — Neon autoscales, and we precompute line-item pricing to avoid long transactions. Tested: 400/s sustained in a load test on staging.
- **Latency (p99 < 300ms)**: Transactional insert is the slow path. Keeping it to one round-trip (single INSERT ... RETURNING with CTEs for line items) puts p99 around 180ms in staging.
- **Availability (99.95%)**: No single point of failure at the app layer. Neon is the weakest link at 99.95% SLA — matches target but no headroom. Accepted for now; revisit if we need 99.99%.
- **Consistency**: Strong within a single order via Postgres transactions. Cross-service consistency via the outbox pattern → at-least-once delivery with idempotent consumers.
- **PII / GDPR**: `customers.email` is PII, encrypted at rest with a per-user key. Delete flow: soft-delete the customer row, scheduled scrub job removes PII after 30-day retention window, audit log entries anonymized. Data stored in Neon EU region.

## Trade-offs

| Decision | Chose | Rejected | Why |
|---|---|---|---|
| Data store | Postgres (Neon, EU region) | DynamoDB | Relational queries for order history, transactional writes across multiple tables. EU region for data residency. |
| Event publishing | Outbox → Queue | Direct queue write from API | Avoids dual-write inconsistency if the queue is down mid-transaction |
| Service boundary | Separate service | Keep in web monolith | Checkout load profile is spiky and different from the rest of the site; isolating it lets us scale and fail independently |
| Runtime | Cloudflare Workers | Railway container | Already on Workers for the storefront; matches stack defaults; cold starts not a concern at this traffic |
| Payments | Polar.sh | Stripe Billing | Simpler billing model, aligns with stack defaults |
| Status representation | String enum + CHECK | Separate `order_statuses` table | Status transitions are rare, queries on status are frequent; join would be wasted work |

## Open questions

- **Refund rules**: can we partially refund a single line item, or only whole orders? Need product input.
- **Inventory reservation timing**: reserve on order create or only on payment success? Trade-off between abandoned-cart waste and race conditions with low-stock items.
- **Retention**: 7-year requirement is for financial records — do we need order events that long, or can we tier them to cold storage after 90 days?

## Next steps

1. Validate the data model against the 3 most complex existing order queries in the monolith
2. Spike the outbox worker to measure drain latency under load
3. Write ADRs for: outbox pattern, Neon vs DynamoDB, status enum representation
4. Draft the OpenAPI spec in `.context/architecture/api/orders.md`

## Glossary

Plain-language definitions for the terms used above. Skim this if any feel unfamiliar.

- **p50 / p99** — latency percentiles. p99 = 99% of requests are faster than this number. p99 matters more than average because the slow 1% is where users rage-quit.
- **NFR (non-functional requirement)** — things the system must *be*, not things it must *do*. Examples: "fast", "available", "secure". Opposed to functional requirements like "lets users reset their password".
- **Outbox pattern** — writing outgoing events to a DB table in the same transaction as the state change, then having a separate worker publish them to the queue. Prevents losing events when the queue is unreachable.
- **Dual-write problem** — committing to DB and publishing to a queue as two separate steps. If the second step fails, you have a committed change with no event; if the first fails after the second succeeds, you have an event for a change that never happened. Outbox, CDC, and 2PC are common fixes.
- **2PC (two-phase commit)** — a distributed transaction protocol. Reliable but slow and fragile; most modern systems avoid it in favor of outbox or sagas.
- **Idempotent** — a request that can be retried without changing the outcome. Critical for at-least-once delivery — consumers will see duplicates and need to handle them safely.
- **At-least-once delivery** — events may be delivered more than once, never zero times. Pairs with idempotent consumers. (Contrast: at-most-once, which may drop events.)
- **Horizontally scaled** — adding more instances of the same service rather than making one instance bigger (vertical scaling). Stateless services scale horizontally; stateful services usually can't.
- **Cloudflare Queue** — a managed message queue that runs on Cloudflare Workers. Publish from one worker, consume from another.
- **Neon** — a serverless Postgres provider. Autoscales, branches per git branch, good for spiky workloads.
- **RTO / RPO** — Recovery Time Objective (how long until we're back up after an incident) and Recovery Point Objective (how much data we can lose, measured in time).
