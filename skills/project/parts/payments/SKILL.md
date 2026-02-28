---
name: payments
description: Integrates Stripe for payments in a monorepo. Handles checkout sessions, webhooks, subscriptions, pricing tables, and customer portal. Use when adding payments, configuring Stripe webhooks, implementing subscription billing, or debugging payment flows.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Payments

The `payments` part provides payment processing using Stripe. All Stripe configuration lives in a shared workspace package — consuming packages import helpers and types from it.

## Decision Tree

- What are you doing?
  - **Setting up Stripe from scratch** → see "Initial setup" below
  - **Adding checkout** → see "Checkout sessions" below
  - **Adding subscriptions** → see "Subscriptions" below
  - **Setting up webhooks** → see "Webhooks" below
  - **Adding a pricing table** → see "Pricing table" below
  - **Checking webhook config** → run `tools/webhook-check.ts`
  - **Listing products and prices** → run `tools/product-list.ts`

## Initial setup

1. Install: `bun add stripe`
2. Create the payments workspace package: `packages/payments/`
3. Create `src/stripe.ts` — the shared Stripe client:

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
```

4. Export from `src/index.ts`:

```ts
export { stripe } from "./stripe";
export { handleWebhook } from "./webhook";
export type { CheckoutParams, SubscriptionStatus } from "./types";
```

5. Required environment variables:

| Variable | Where |
|---|---|
| `STRIPE_SECRET_KEY` | Server only — never expose to client |
| `STRIPE_PUBLISHABLE_KEY` | Client-safe, used in checkout redirect |
| `STRIPE_WEBHOOK_SECRET` | Server only — from `stripe listen` or dashboard |

## Checkout sessions

```ts
import { stripe } from "@scope/payments";

export async function createCheckout(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment", // or "subscription"
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: { userId },
  });
  return session;
}
```

- Always include `client_reference_id` and `metadata.userId` for webhook reconciliation
- Use `mode: "subscription"` for recurring billing
- Redirect the user to `session.url` — do not embed checkout inline

## Subscriptions

```ts
// Check subscription status
export async function getSubscriptionStatus(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  return subscriptions.data[0] ?? null;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
```

- Store `stripeCustomerId` on the user record — create customers explicitly
- Use `cancel_at_period_end: true` instead of immediate cancellation
- Access the customer portal for self-service management:

```ts
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${process.env.APP_URL}/settings`,
});
```

## Webhooks

Create `src/webhook.ts`:

```ts
import type Stripe from "stripe";
import { stripe } from "./stripe";

export async function handleWebhook(request: Request): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Provision access using session.client_reference_id
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Update subscription status in database
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // Notify user of failed payment
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
```

- Always verify the webhook signature — never skip in production
- Use `request.text()` not `request.json()` — Stripe needs the raw body
- Handle events idempotently — webhooks can be delivered more than once
- For local dev, run `stripe listen --forward-to localhost:3000/api/webhook`

### Hono webhook route

```ts
import { handleWebhook } from "@scope/payments";

app.post("/api/webhook", async (c) => {
  return handleWebhook(c.req.raw);
});
```

- Do not apply JSON body parsing middleware to the webhook route

## Pricing table

Define products and prices in Stripe Dashboard, then fetch them:

```ts
export async function getPrices() {
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
    type: "recurring",
  });
  return prices.data.map((price) => ({
    id: price.id,
    product: (price.product as Stripe.Product).name,
    amount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
  }));
}
```

- Fetch prices server-side and pass to the client — avoid client-side Stripe API calls
- Cache prices aggressively — they rarely change
- Use `tools/product-list.ts` to verify your Stripe product configuration

## Key references

| File | What it covers |
|---|---|
| `tools/webhook-check.ts` | Webhook endpoints, events, and status |
| `tools/product-list.ts` | All products, prices, and subscription status |
