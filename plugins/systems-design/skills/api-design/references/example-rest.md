# Example: REST API Spec (Orders)

Excerpt from `.context/architecture/api/orders.md`. Shows the expected output format.

## Summary

Orders API lets the storefront create, read, and refund orders. **REST over HTTPS with JSON.** Chosen because callers are browsers and partner dashboards.

## Conventions

snake_case JSON. Prefixed IDs (`ord_abc123`). ISO 8601 dates. Money as cents. Cursor pagination (max 100, default 20). `Idempotency-Key` on all POSTs. Bearer JWT auth (15-min lifetime).

## `POST /v1/orders` -- create

```http
POST /v1/orders HTTP/1.1
Authorization: Bearer <token>
Idempotency-Key: 9f8a...
Content-Type: application/json

{ "customer_id": "cus_xyz789", "items": [{ "sku": "shirt-blue-m", "qty": 2 }], "currency": "USD" }
```

**Zod schema:**

```ts
const CreateOrderRequest = z.object({
  customer_id: z.string().startsWith("cus_"),
  items: z.array(z.object({ sku: z.string().min(1).max(64), qty: z.number().int().min(1).max(100) })).min(1).max(50),
  currency: z.enum(["USD", "EUR", "GBP"]),
});
```

**201 Created:**

```json
{ "id": "ord_abc123", "status": "pending", "customer_id": "cus_xyz789", "total_cents": 4997, "currency": "USD", "client_secret": "pi_3Nx...secret_xyz", "created_at": "2026-04-10T12:34:56Z" }
```

**Errors:**

| Status | Code | When |
|---|---|---|
| 400 | `order.create.invalid_request` | Schema validation failed |
| 404 | `order.create.customer_not_found` | Customer doesn't exist |
| 409 | `order.create.idempotency_conflict` | Same key, different body |
| 422 | `order.create.sku_not_available` | SKU out of stock |

## `GET /v1/orders/:id` -- retrieve

Returns the order. Non-owners get `404` (not `403`) to avoid leaking existence.

## `GET /v1/customers/:id/orders` -- list

Paginated. `?limit=50&cursor=...&status=paid`. Response: `{ data: [...], meta: { next_cursor, has_more } }`.

## `POST /v1/orders/:id/refund` -- sub-action

Not DELETE (order still exists) or PATCH (has side effects). Request: `{ amount_cents, reason }`. Response: `{ id: "ref_qwe456", status: "processing" }`.

## Error codes (all endpoints)

| Code | Status | Meaning |
|---|---|---|
| `order.request.invalid` | 400 | Bad request body |
| `auth.token.invalid` | 401 | Missing/invalid bearer token |
| `auth.access.denied` | 403 | Authenticated but not allowed |
| `order.read.not_found` | 404 | Not found or can't see it |
| `order.request.rate_limited` | 429 | Too many requests |
| `system.internal.error` | 500 | Server error |
