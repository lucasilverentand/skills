# Payments

The `payments` part provides payment processing using Stripe.

## Setup

1. Install: `bun add stripe`
2. Create `packages/payments/src/stripe.ts`:

```ts
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});
```

3. Required env vars: `STRIPE_SECRET_KEY` (server), `STRIPE_PUBLISHABLE_KEY` (client), `STRIPE_WEBHOOK_SECRET` (server)

## Checkout sessions

```ts
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

## Subscriptions

- Store `stripeCustomerId` on the user record
- Use `cancel_at_period_end: true` instead of immediate cancellation
- Use the customer billing portal for self-service management

## Webhooks

```ts
export async function handleWebhook(request: Request): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  switch (event.type) {
    case "checkout.session.completed": { /* provision access */ break; }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": { /* update status */ break; }
    case "invoice.payment_failed": { /* notify user */ break; }
  }
  return new Response("ok", { status: 200 });
}
```

- Always verify webhook signatures
- Use `request.text()` not `request.json()` — Stripe needs raw body
- Handle events idempotently — webhooks can be delivered more than once
- Local dev: `stripe listen --forward-to localhost:3000/api/webhook`
- Do not apply JSON body parsing middleware to webhook routes

## Tools

| Tool | Purpose |
|---|---|
| `tools/webhook-check.ts` | Webhook endpoints, events, and status |
| `tools/stripe-products.ts` | List products and prices from connected Stripe account |
