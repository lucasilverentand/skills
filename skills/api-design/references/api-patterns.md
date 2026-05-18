# API Patterns
Cross-cutting concerns that every production API needs. Skip any of these and you will build it later under pressure.

## Idempotency
`Idempotency-Key` header required on all POST and PATCH write endpoints. Reject requests without it — because at-least-once retry semantics (mobile networks, webhook retries, any client with retry logic) will replay writes, and without an idempotency key you will charge the card twice, send the email twice, or create duplicate records.

How it works:

1. Client sends `Idempotency-Key: <unique string>` with the request.
2. Middleware checks if `(key, user_id)` has a cached response (KV or Durable Object, TTL 24 hours).
3. If cached: return the stored response immediately. The client sees the same result as the original request.
4. If not cached: process the request, store `(key -> response)`, return the response.
5. Same key + different request body = `409 Conflict`. Because reusing a key with different input is a client bug, not a retry.

Critical for: payment processing, order creation, any mutation where duplicates cause real-world harm. Mobile apps on flaky cellular connections will retry aggressively.

## Rate Limiting
Two layers:

1. **Cloudflare platform** — DDoS protection, bot management. Handles volumetric attacks before they reach your code.
2. **Durable Object per-key counters** — business-rule rate limits per authenticated identity.

Default tiers:

|Tier|Limit|Burst|
|---|---|---|
|Free|60 req/min|120 req/min|
|Paid|600 req/min|1200 req/min|
|Enterprise|Custom|Custom|

Response headers on **every** response, not just 429s:

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 594
X-RateLimit-Reset: 1710500400
```

When limited: `429 Too Many Requests` with `Retry-After: <seconds>` header. Because clients need to know how long to wait, and polling without backoff makes the problem worse.

Document rate limits in the API spec, not just in code. Because developers discover limits by hitting them in production, which is the worst possible time to learn.

## Versioning
URL path versioning: `/v1/orders`, `/v2/orders`. Integer bumps only. Because URL versioning is the simplest to understand, the easiest to deploy side-by-side, and the most visible in access logs and monitoring.

**Breaking changes** (require new version):

- Removing a field from a response
- Changing a field's type (string -> number)
- Making an optional request field required
- Tightening validation (accepting fewer values than before)
- Changing the meaning of an enum value

**Non-breaking changes** (no new version needed):

- Adding a new endpoint
- Adding a new optional field to request or response
- Adding a new enum value
- Loosening validation (accepting more values than before)

**Deprecation policy:**

- Add `Deprecation: true` and `Sunset: <ISO 8601 date>` response headers.
- Internal APIs: 30-90 day sunset period.
- Public APIs: 6+ month sunset period.
- Internal APIs get the same versioning discipline as public APIs. Because "we'll just update all clients at once" is a lie once you have more than two services.

## Webhooks (Incoming)
When receiving webhooks from external services (Stripe, GitHub, etc.):

1. **Verify signature** — check HMAC or asymmetric signature before processing. Reject invalid signatures with 401.
2. **Return 200 immediately** — do not process inline. Because slow responses cause the sender to time out and retry, creating duplicate deliveries.
3. **Enqueue to CF Queue** — process asynchronously. The queue handles retries if processing fails.

Because fast webhook responses prevent sender timeouts, and the queue gives you reliable retry semantics without blocking the HTTP response.

## Webhooks (Outgoing)
When sending webhooks to customer endpoints:

- **HMAC-SHA256 signing** with a per-endpoint shared secret. Include a timestamp in the signature payload to prevent replay attacks.
- **5 retries** with exponential backoff over ~1 hour (1s, 30s, 5m, 30m, 30m).
- **Dead letter queue** for exhausted retries. Surface failed deliveries in the dashboard so customers can debug.
- **Timeout:** 10 seconds per delivery attempt. Because slow customer endpoints should not block your delivery pipeline.

## File Uploads
Never proxy file bytes through the API. Use presigned URLs:

1. Client requests an upload URL: `POST /uploads` with filename and content type.
2. API generates a presigned PUT URL to R2 with conditions: allowed MIME types, max size (50 MB default), 15-minute expiry.
3. Client uploads directly to R2. The API never touches file bytes.
4. R2 event notification triggers post-processing (virus scan, image resize, metadata extraction).
5. **Re-validate after upload** — the presigned URL conditions are advisory. Verify the actual uploaded file's type and size before accepting it.

Because streaming large files through your API doubles bandwidth costs, ties up Worker CPU time, and introduces a single point of failure.

## API Documentation
- Generate OpenAPI spec from Zod schemas using `hono-zod-openapi`. The spec is derived from the same schemas that validate requests at runtime — they cannot drift.
- Serve interactive docs with Scalar (or Swagger UI) at `/docs`.
- Commit the generated OpenAPI spec to git. CI verifies the committed spec matches the code — if they diverge, the build fails.
- Because documentation that drifts from the implementation is worse than no documentation. It actively misleads.
