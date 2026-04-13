# Third-Party Defaults

Default vendor choices and the rationale for each. Deviate when there's a genuine reason, not because something is trendier.

| Concern | Default | Why not the obvious alternative |
|---|---|---|
| Email | Resend (React Email) | Modern API, great DX, JSX templates; SendGrid/SES have worse DX and more config overhead |
| Payments (web) | Polar.sh | Simpler billing model than Stripe for most SaaS; Stripe when you need complex invoicing or marketplace payouts |
| Payments (mobile IAP) | RevenueCat | Handles App Store / Play Store receipt validation, subscription management, and analytics; rolling your own is months of work |
| Analytics + errors + flags | PostHog | Self-hostable, all-in-one (analytics, session replay, feature flags, experiments); avoids stitching 3 separate vendors together |
| Search | Postgres FTS first | No extra infra; graduate to Meilisearch or Typesense only when FTS limits hit (faceting, typo tolerance, relevance tuning) |
| Uptime monitoring | Better Stack | Uptime checks + status pages + incident management in one tool; fewer integrations to maintain |
| Status page | Custom static page | On separate domain/infra, updated via CI or Worker; no vendor lock-in, survives the primary infra going down |

## Principles behind these choices

- **Fewer vendors is better.** Each vendor is a billing relationship, an API to learn, a status page to watch, and a potential point of failure. PostHog replacing three separate tools (analytics, errors, feature flags) is a concrete win.
- **DX matters.** Developer experience directly affects velocity. Resend's JSX templates vs SendGrid's template builder is hours saved per email.
- **Self-hostable is a tiebreaker.** When two options are close, prefer the one you can self-host — it gives you a fallback if the vendor changes pricing, terms, or disappears.
- **Start simple, graduate when needed.** Postgres FTS before Meilisearch. Polar before Stripe. The simpler tool is faster to integrate and has fewer failure modes. Move to the complex tool when you hit a real limitation, not a hypothetical one.

## Anti-patterns

- Adding a vendor for a problem your stack already solves (Redis for caching on CF, Algolia when you have 1000 rows).
- Choosing based on popularity instead of fit — the right tool depends on YOUR constraints, not Hacker News sentiment.
- No vendor evaluation criteria — pick based on: API quality, pricing model, data residency, self-host option, bus factor.
