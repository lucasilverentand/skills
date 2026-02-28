# Payments

Stripe integration module: checkout, subscriptions, webhooks, and pricing.

## Responsibilities

- Scaffold a Stripe payments package in a bun workspace monorepo
- Configure the Stripe SDK client and API versioning
- Create checkout and customer portal session flows
- Handle subscription lifecycle management
- Process webhook events with signature verification
- Fetch and format pricing data for display

## Tools

- `tools/webhook-check.ts` — verify webhook endpoint configuration, signing secret presence, and registered event types
- `tools/stripe-products.ts` — list all products and prices from the connected Stripe account with mode detection
