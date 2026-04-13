# Deploy & Operations

Monorepo layout, deployment, secrets, config, health checks, and local dev.

## Monorepo layout

```
apps/       # user-facing (web, api, mobile)
packages/   # shared libs (@repo/db, @repo/auth, @repo/config)
services/   # non-user-facing Workers (queue consumers, cron)
```

Bun workspaces. Flat within each directory — no nesting, because nesting creates import path hell and circular dependency traps. Package scope: `@repo/<name>`.

Cron workers and queue consumers are separate Workers in `services/`, not handlers bolted onto the API Worker — because isolated deploys give you independent scaling and failure isolation. A bug in a queue consumer shouldn't take down the API.

## Deployment

CF Workers versioning with gradual rollout (percentage-based traffic split). Roll back instantly if metrics degrade. No blue-green ceremony — CF handles this natively.

## Secrets

Wrangler secrets for prod (encrypted at rest), `.dev.vars` for local (gitignored). Native to CF, no extra tooling. Secrets never touch source control — not in env files, not in config, not in comments.

## Environment config

Non-secret config in `wrangler.toml [vars]` per environment. Parsed and validated with Zod at Worker startup. Runtime config errors should fail fast at boot, not silently at request time — a missing config value discovered mid-request is a production incident.

## Health checks

`/healthz` (liveness), `/readyz` (readiness: DB + critical deps). Include version/commit hash in the response. Workers skip dedicated health check endpoints — CF handles Worker availability and routing automatically.

## Local dev

`wrangler dev --local` (Miniflare). All bindings (D1, KV, R2, Queues, Durable Objects) work locally. Use `--remote` only for testing against real CF infrastructure (e.g., verifying a D1 migration on a staging database).

## Anti-patterns

- Nesting packages inside packages — creates import resolution nightmares.
- Putting queue consumers in the API Worker — couples deploy schedules and blast radius.
- Secrets in `wrangler.toml` or checked-in `.env` files — one git push away from a breach.
- No config validation at startup — silent failures at request time are harder to debug.
