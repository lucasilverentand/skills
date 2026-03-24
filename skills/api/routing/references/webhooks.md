# Webhooks

## Outbound webhooks

Conventions for outbound webhooks that notify external consumers of events.

### Payload shape

```ts
{
  id: "evt_abc123",                    // unique event ID (prefixed nanoid)
  type: "user.created",                // dot-notation event type
  timestamp: "2026-02-24T12:00:00Z",   // ISO 8601
  data: { ... }                        // the resource that triggered the event
}
```

### Signing

Sign every payload with HMAC-SHA256 using a per-subscription secret:

```ts
import { createHmac } from "node:crypto"

export function signPayload(secret: string, rawBody: string): string {
  return `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`
}
// Send in X-Signature-256 header
```

### Delivery

Deliver asynchronously via a job queue — never block the request that triggered the event:

```ts
// Producer: enqueue when an event occurs
async function dispatchWebhook(subscriptionId: string, type: string, data: unknown) {
  const event = {
    id: `evt_${nanoid(12)}`,
    type,
    timestamp: new Date().toISOString(),
    data,
  }
  await queue.send({ subscriptionId, event })  // Cloudflare Queues, BullMQ, etc.
}

// Consumer: deliver from the queue
async function processDelivery({ subscriptionId, event }: WebhookQueueMessage) {
  const sub = await db.query.webhookSubscriptions.findFirst({
    where: eq(webhookSubscriptions.id, subscriptionId),
  })
  if (!sub) return

  const body = JSON.stringify(event)
  const res = await fetch(sub.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature-256": signPayload(sub.secret, body),
    },
    body,
  })

  await db.insert(webhookDeliveries).values({
    subscriptionId,
    eventId: event.id,
    status: res.ok ? "success" : "failed",
    statusCode: res.status,
    attempts: 1,
  })
}
```

### Retry strategy

Retry with exponential backoff: 3 attempts at 1 min, 5 min, 30 min. After all retries fail, mark delivery as permanently failed. Log every attempt with the event ID.

### Schema

```ts
export const webhookSubscriptions = sqliteTable("webhook_subscriptions", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),   // generated at creation; shown to user once
  events: text("events", { mode: "json" }).$type<string[]>().notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
})

export const webhookDeliveries = sqliteTable("webhook_deliveries", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => webhookSubscriptions.id),
  eventId: text("event_id").notNull(),
  status: text("status", { enum: ["pending", "success", "failed"] }).notNull(),
  statusCode: integer("status_code"),
  attempts: integer("attempts").notNull().default(0),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
})
```

### Event log endpoint

Expose a delivery log so consumers can audit and replay missed events:

```ts
webhooksRouter.get("/events", requireAuth(), async (c) => {
  const { cursor, limit = "20" } = c.req.query()
  const rows = await db.query.webhookDeliveries.findMany({
    where: cursor ? lt(webhookDeliveries.id, cursor) : undefined,
    orderBy: desc(webhookDeliveries.deliveredAt),
    limit: Number(limit) + 1,
  })
  const hasMore = rows.length > Number(limit)
  return c.json({
    ok: true,
    data: hasMore ? rows.slice(0, -1) : rows,
    cursor: hasMore ? rows.at(-2)?.id ?? null : null,
  })
})
```

---

## Inbound webhooks

When your API receives webhooks from third-party services (Stripe, GitHub, etc.),
always verify the signature before processing the payload.

### Why raw body matters

Signature verification hashes the **raw request body bytes**, not parsed JSON.
You must read the raw body before any framework parsing happens.
In Hono on Cloudflare Workers, clone the request to avoid consuming the body:

```ts
const rawBody = await c.req.raw.clone().text()
```

### Signature verification

Use `timingSafeEqual` to prevent timing attacks — never compare with `===`:

```ts
import { createHmac, timingSafeEqual } from "node:crypto"

export function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  receivedSignature: string  // expected format: "sha256=<hex>"
): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`
  try {
    return timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expected))
  } catch {
    return false  // buffers differ in length — reject
  }
}
```

### Hono middleware

Create a route-level middleware for each provider. Apply it to the webhook route group, not globally:

```ts
import { createHmac, timingSafeEqual } from "node:crypto"
import { HTTPException } from "hono/http-exception"
import type { MiddlewareHandler } from "hono"

export const verifyWebhook = (secretEnvKey: string, headerName: string): MiddlewareHandler =>
  async (c, next) => {
    const secret = c.env[secretEnvKey] as string | undefined
    const signature = c.req.header(headerName)

    if (!secret || !signature) {
      throw new HTTPException(401, { message: "Missing webhook signature" })
    }

    const rawBody = await c.req.raw.clone().text()
    const isValid = verifyWebhookSignature(secret, rawBody, signature)

    if (!isValid) {
      throw new HTTPException(401, { message: "Invalid webhook signature" })
    }

    c.set("rawBody", rawBody)  // pass to handler without re-reading
    await next()
  }

// Route setup
const inboundRouter = new Hono()

inboundRouter.use("*", verifyWebhook("STRIPE_WEBHOOK_SECRET", "stripe-signature"))

inboundRouter.post("/stripe", async (c) => {
  const event = JSON.parse(c.get("rawBody")) as StripeEvent

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckout(event.data.object)
      break
    case "customer.subscription.deleted":
      await handleCancellation(event.data.object)
      break
  }

  return c.json({ ok: true })  // respond immediately; process async if slow
})
```

### Provider conventions

| Provider | Signature header | Verification |
|---|---|---|
| Custom / Svix | `X-Signature-256` | `sha256=<hex>`, `timingSafeEqual` |
| GitHub | `X-Hub-Signature-256` | `sha256=<hex>`, `timingSafeEqual` |
| Stripe | `Stripe-Signature` | Use `stripe.webhooks.constructEvent()` — includes timestamp tolerance |
| Svix (hosted) | `svix-signature` | Use the Svix SDK — `wh.verify(rawBody, headers)` |

For Stripe, always use their official SDK — it validates timestamp tolerance to guard against replay attacks.

### Idempotency

Webhook providers retry on failure. Make handlers idempotent:

```ts
// Store processed event IDs; skip duplicates
const existing = await db.query.processedEvents.findFirst({
  where: eq(processedEvents.externalId, event.id),
})
if (existing) return c.json({ ok: true })  // already handled

await db.insert(processedEvents).values({ externalId: event.id, processedAt: new Date() })
// ... rest of handler
```
