# Payments

The `payments` part provides payment processing using Stripe.

## Setup

1. Install: `bun add stripe`
2. Create `packages/payments/src/stripe.ts`:

```ts
import Stripe from "stripe";
import { env } from "@scope/config";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
```

3. Required env vars: `STRIPE_SECRET_KEY` (server), `STRIPE_PUBLISHABLE_KEY` (client), `STRIPE_WEBHOOK_SECRET` (server)

## Database schema

Add subscription columns to the users table (adapt to your schema library):

```ts
// Drizzle — add to users table
stripeCustomerId: text("stripe_customer_id"),
subscriptionId: text("subscription_id"),
subscriptionStatus: text("subscription_status"),  // "active" | "trialing" | "past_due" | "canceled" | null
planId: text("plan_id"),                           // price ID from Stripe
currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
```

These columns are the source of truth for access control. Keep them in sync via webhooks.

## Checkout sessions

```ts
export async function createCheckout(priceId: string, userId: string, userEmail: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", // or "payment" for one-time
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: userEmail,
    success_url: `${env.APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: {
      trial_period_days: 14,  // remove if not offering trials
      metadata: { userId },
    },
  });
  return session;
}
```

- Always include `client_reference_id` and `metadata.userId` for webhook reconciliation
- Retrieve the customer ID from `checkout.session.completed` and store it on the user

## Customer portal

The Stripe billing portal lets users manage their subscription (upgrade, downgrade, cancel, update payment method) without you building that UI.

```ts
export async function createPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.APP_URL}/settings/billing`,
  });
  return session;
}
```

Route handler:

```ts
app.post("/billing/portal", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user.stripeCustomerId) {
    return c.json({ ok: false, error: { code: "NO_SUBSCRIPTION", message: "No billing account found" } }, 400);
  }
  const { url } = await createPortalSession(user.stripeCustomerId);
  return c.json({ ok: true, data: { url } });
});
```

## Plan gating

Check subscription status before granting access to paid features:

```ts
export function hasActiveSubscription(user: { subscriptionStatus: string | null }): boolean {
  return user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
}
```

Middleware for protected routes:

```ts
export async function requireSubscription(c: Context, next: Next) {
  const user = c.get("user");
  if (!user || !hasActiveSubscription(user)) {
    return c.json({ ok: false, error: { code: "SUBSCRIPTION_REQUIRED", message: "An active subscription is required" } }, 403);
  }
  await next();
}
```

Apply to route groups:

```ts
app.use("/v1/premium/*", requireSubscription);
```

## Webhooks

Webhooks keep your database in sync with Stripe. Handle the full subscription lifecycle:

```ts
export async function handleWebhook(request: Request): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id!;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      await db.update(users)
        .set({ stripeCustomerId: customerId, subscriptionId })
        .where(eq(users.id, userId));
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(sub);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db.update(users)
        .set({ subscriptionStatus: "canceled", subscriptionId: null, planId: null, currentPeriodEnd: null })
        .where(eq(users.subscriptionId, sub.id));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // subscriptionStatus will be set to "past_due" by subscription.updated — just notify the user here
      break;
    }
  }

  return new Response("ok", { status: 200 });
}

async function syncSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  await db.update(users)
    .set({
      subscriptionId: sub.id,
      subscriptionStatus: sub.status,
      planId: item?.price.id ?? null,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    })
    .where(eq(users.subscriptionId, sub.id));
}
```

**Webhook rules:**
- Always verify webhook signatures before processing
- Use `request.text()` not `request.json()` — Stripe needs raw body
- Handle events idempotently — webhooks can be delivered more than once
- Do not apply JSON body parsing middleware to webhook routes
- Use `checkout.session.completed` to capture the customer ID; use `subscription.*` events for status changes

## Idempotency

For webhook idempotency, store processed event IDs to avoid double-applying the same event:

```ts
// Idempotency check at the top of handleWebhook, before the switch
const existing = await db.query.processedWebhookEvents.findFirst({
  where: eq(processedWebhookEvents.eventId, event.id),
});
if (existing) return new Response("ok", { status: 200 });

await db.insert(processedWebhookEvents).values({ eventId: event.id, processedAt: new Date() });
```

Schema for the tracking table:

```ts
export const processedWebhookEvents = sqliteTable("processed_webhook_events", {
  eventId: text("event_id").primaryKey(),
  processedAt: integer("processed_at", { mode: "timestamp" }).notNull(),
});
```

## Local development

```bash
# Forward Stripe webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhook

# Trigger test events manually
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

Add `STRIPE_WEBHOOK_SECRET` from the `stripe listen` output to your `.env` or `.dev.vars`.

## Tools

| Tool | Purpose |
|---|---|
| `tools/webhook-check.ts` | Webhook endpoints, events, and status |
| `tools/stripe-products.ts` | List products and prices from connected Stripe account |
