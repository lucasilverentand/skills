# Webhooks

Conventions for outbound webhooks that notify external consumers of events.

## Payload shape

```ts
{
  id: "evt_abc123",                    // unique event ID (prefixed nanoid)
  type: "user.created",                // dot-notation event type
  timestamp: "2026-02-24T12:00:00Z",   // ISO 8601
  data: { ... }                        // the resource that triggered the event
}
```

## Signing

Sign every webhook payload with HMAC-SHA256:

- Each webhook subscription has a unique signing secret
- Compute: `HMAC-SHA256(secret, raw_body)`
- Send the signature in the `X-Signature-256` header
- Document verification steps for consumers (same pattern as GitHub/Stripe webhooks)

## Delivery

- Deliver asynchronously via a job queue (Cloudflare Queues, BullMQ, etc.) — never block the request that triggered the event
- Retry with exponential backoff: 3 attempts at 1min, 5min, 30min intervals
- Log delivery status (success, failed, retrying) with the event ID
- Provide a webhook event log endpoint so consumers can replay missed events
