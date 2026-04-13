# Error Handling

## RFC 7807 Problem Details

Every error response uses RFC 7807 Problem Details format. No exceptions, no custom shapes.

```json
{
  "type": "https://api.example.com/errors/order.read.not_found",
  "title": "Order not found",
  "status": 404,
  "detail": "No order with ID ord_abc123 exists.",
  "instance": "/v1/orders/ord_abc123",
  "request_id": "req_f00b4r"
}
```

| Field        | Purpose                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`       | Stable URI that clients switch on. Machine-readable error identity.                                                                                    |
| `title`      | Short, stable, human-readable summary. Does not change per occurrence.                                                                                 |
| `status`     | HTTP status code repeated in the body. Because proxies can rewrite status codes, and clients parsing the body should not need to also inspect headers. |
| `detail`     | Developer-facing explanation of what went wrong. Never show this to end users — it may contain internal context.                                       |
| `instance`   | The specific request path that triggered the error.                                                                                                    |
| `request_id` | Extension field. Correlation ID for support debugging — "give me your request_id" solves half of support tickets.                                      |

## Error Code Taxonomy

Use `domain.action.reason` pattern for `type` URIs. Hierarchical so clients can match on prefix for broad handling or full path for specific handling.

Examples:

- `order.create.insufficient_stock` — specific: stock problem creating an order
- `order.create.*` — broad: any problem creating an order
- `auth.token.expired` — the auth token has expired
- `auth.token.invalid` — the auth token is malformed or revoked
- `payment.charge.declined` — payment processor declined the charge
- `system.internal.error` — unhandled server error (the only `system.*` code clients should see)

Because hierarchical codes let clients implement broad fallback handling (`auth.*` -> redirect to login) while still allowing specific UX for known cases.

## Validation Errors

Extend RFC 7807 with an `errors` array for field-level validation failures:

```json
{
  "type": "https://api.example.com/errors/order.create.validation_failed",
  "title": "Validation failed",
  "status": 422,
  "detail": "2 fields failed validation.",
  "errors": [
    {
      "field": "quantity",
      "code": "too_small",
      "message": "Must be at least 1"
    },
    {
      "field": "email",
      "code": "invalid_email",
      "message": "Not a valid email address"
    }
  ]
}
```

Return ALL validation errors at once — never fail on the first field and make the client guess about the rest. Because round-tripping one field at a time is a terrible user experience.

## Result Types

Use `{ ok, error }` result types everywhere in application code. Only genuine bugs (OOM, unreachable code paths) should throw.

```typescript
type Result<T, E = Error> = { ok: T; error?: never } | { ok?: never; error: E };
```

Because result types make error paths explicit in the type system. You cannot forget to handle them without the compiler warning you. Thrown exceptions are invisible in function signatures and cause unhandled rejections that crash processes.

Throw at system boundaries only: the HTTP handler catches result errors and maps them to RFC 7807 responses. Internal code never throws for expected failures.

## Zod Validation

Validate at every system boundary with Zod:

- **HTTP requests/responses:** `safeParse` — returns structured errors, maps to 422 responses
- **Environment variables:** `parse` — throws on startup if config is invalid (fail fast)
- **Queue messages:** `parse` — malformed messages should throw and go to DLQ
- **Database rows:** `parse` or `safeParse` depending on trust level of the data source

Because data crossing a boundary is untrusted by definition. "The database always returns valid data" is true until a migration bug proves otherwise.

## Anti-patterns

- **Custom error shapes** — inventing `{ success: false, errorCode: "...", errorMessage: "..." }` means you maintain a mini-standard forever. RFC 7807 is the standard; use it.
- **Swallowing errors silently** — `catch (e) {}` hides bugs until production. Log and propagate.
- **200 with error payload** — `{ status: 200, body: { error: "not found" } }` breaks every HTTP client, cache, and monitoring tool that relies on status codes.
- **Leaking internals** — `"detail": "SELECT * FROM orders WHERE... column 'x' not found"` hands attackers your schema. Keep `detail` descriptive but sanitized.
- **Inconsistent error shapes** — some endpoints return `{ error }`, others return `{ message }`, others return a string. Pick RFC 7807 and enforce it in middleware.
