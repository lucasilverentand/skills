# Deploy & Operations
Monorepo layout, deployment, secrets, config, health checks, and local dev.

## Monorepo layout
```text
apps/       # user-facing (web, api, mobile)
packages/   # shared libs (@repo/db, @repo/auth, @repo/config)
services/   # non-user-facing Workers (queue consumers, cron)
```

Bun workspaces. Flat within each directory — no nesting, because nesting creates import path hell and circular dependency traps. Package scope: `@repo/<name>`.

Cron workers and queue consumers are separate Workers in `services/`, not handlers bolted onto the API Worker — because isolated deploys give you independent scaling and failure isolation. A bug in a queue consumer shouldn't take down the API.

## Deployment
**Workers with Static Assets, not Pages.** Even for static-heavy sites (Astro landing pages, marketing sites), use a single Worker with the `assets` binding. This keeps server routes, D1, KV, R2, and Queues in one runtime. Pages is legacy for new projects — it fragments the deploy surface and limits binding access.

CF Workers versioning with gradual rollout (percentage-based traffic split). Roll back instantly if metrics degrade. No blue-green ceremony — CF handles this natively.

## Secrets
Wrangler secrets for prod (encrypted at rest), `.dev.vars` for local (gitignored). Native to CF, no extra tooling. Secrets never touch source control — not in env files, not in config, not in comments.

## Environment config
Non-secret config in `wrangler.toml [vars]` per environment. Parsed and validated with Zod at Worker startup. Runtime config errors should fail fast at boot, not silently at request time — a missing config value discovered mid-request is a production incident.

## Health checks
`/healthz` (liveness), `/readyz` (readiness: DB + critical deps). Include version/commit hash in the response. Workers skip dedicated health check endpoints — CF handles Worker availability and routing automatically.

## Local dev
`wrangler dev --local` (Miniflare). All bindings (D1, KV, R2, Queues, Durable Objects) work locally. Use `--remote` only for testing against real CF infrastructure (e.g., verifying a D1 migration on a staging database).

## Feature flags
PostHog feature flags (via `posthog-node` or the REST API). No separate feature flag service — PostHog already handles analytics, errors, and experiments, so flags come free.

**Flag types:**

- **Release flags** — gate a feature during rollout. Short-lived. Remove after 100% rollout.
- **Ops flags** — kill switch for a dependency or feature under load. Long-lived. Always keep.
- **Experiment flags** — A/B tests. PostHog manages assignment and analysis. Remove after experiment concludes.

**Naming:** `kebab-case`, prefixed by type: `release-new-checkout`, `ops-disable-email`, `exp-pricing-page-v2`.

**Lifecycle:** Every release flag gets a cleanup ticket at creation time. If the flag is still on after 30 days at 100%, delete it — stale flags are dead code with runtime overhead. Ops flags stay forever but get reviewed quarterly.

**Evaluation:** Server-side evaluation in middleware (`posthog.isFeatureEnabled()`). Never expose flag internals to the client — the client sees the feature or doesn't, not the flag name or rollout percentage.

## Secrets management
**Storage:** Wrangler secrets for prod (`wrangler secret put`), `.dev.vars` for local (gitignored). Both are encrypted at rest. No extra tooling (Vault, Doppler) unless the project has >20 secrets or requires audit logging on secret access.

**Rotation:** API keys and webhook secrets should be rotatable without downtime. Pattern: accept both old and new secret during a rotation window, then drop the old one. For database credentials, Neon handles rotation natively via the console.

**Access scope:** Each Worker gets only the secrets it needs. The notification worker doesn't need the Stripe secret. If a Worker is compromised, blast radius is limited to its own secrets.

**Never:** secrets in `wrangler.toml`, environment variables committed to git, secrets passed as URL query parameters (they appear in access logs), or secrets logged even at debug level.

## Anti-patterns
- Nesting packages inside packages — creates import resolution nightmares.
- Putting queue consumers in the API Worker — couples deploy schedules and blast radius.
- Secrets in `wrangler.toml` or checked-in `.env` files — one git push away from a breach.
- No config validation at startup — silent failures at request time are harder to debug.
- Stale feature flags — release flags still in code 6 months after 100% rollout are dead code with runtime cost.
