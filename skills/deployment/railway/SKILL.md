---
name: railway
description: Deploys services to Railway, provisions databases, manages multi-environment configurations, and monitors deploy health. Use when deploying a new service, provisioning a Postgres or Redis database, syncing environment variables across environments, setting up cron jobs or background workers, or diagnosing a failing deploy.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Railway

## Decision Tree

- What is the task?
  - **Deploy a new or existing service** → see "Deploying Services" below
  - **Provision or connect a database** → see "Databases" below
  - **Manage environment variables** → see "Environment Variables" below
  - **Set up a cron job or background worker** → see "Workers and Crons" below
  - **Diagnose a failing or unhealthy deploy** → see "Debugging Deploys" below
  - **Map service dependencies** → run `tools/service-graph.ts`

## Deploying Services

### First deploy

1. Install Railway CLI if needed: `bun add -g @railway/cli` then `railway login`
2. Link the project: `railway link` (select org and project)
3. Confirm a `railway.json` or `Dockerfile` is present at the repo root — Railway uses these for build detection
4. Deploy: `railway up` (or push to the linked branch for auto-deploy)
5. Check logs immediately: `railway logs` or run `tools/deploy-log.ts`

### Subsequent deploys

- Pushes to the linked branch trigger automatic deploys if the Railway GitHub integration is enabled
- Force a manual deploy: `railway up --detach`
- If the build fails, check `tools/deploy-log.ts` first — it formats raw logs for readability

### Health checks

- Railway restarts services that fail health checks — set `healthcheckPath` in `railway.json` for HTTP services
- Verify health check is reachable before deploying to production

## Databases

### Provisioning

1. Create via dashboard (Postgres, MySQL, Redis, MongoDB) or CLI: `railway add`
2. Railway injects a `DATABASE_URL` (or equivalent) automatically — do not hardcode connection strings

### Connecting

1. Run `tools/db-connection-check.ts` to verify connectivity and report connection pool metrics
2. Use the `DATABASE_URL` environment variable in application code
3. For Postgres: set `max` pool size appropriate to the plan — Railway's shared Postgres has connection limits

### Migrations

1. Run migrations as a deploy step, not a separate service
2. In `railway.json`, set `startCommand` to run migrations then start the server: `bunx drizzle-kit migrate && bun run start`
3. Verify migrations applied: connect with `railway run psql $DATABASE_URL` and inspect schema

## Environment Variables

> **Agent rule (applies in all permission modes including `bypassPermissions`):** Never use `railway variables set KEY=<secret-value>` with the actual secret value — it appears in shell history and process lists. Use the interactive prompt or ask the user to set it via the Railway dashboard.

1. Run `tools/env-sync.ts` to compare variables across environments and surface drift
2. Set non-secret variables: `railway variables set KEY=value --environment <env>`
3. Set secrets: `railway variables set KEY --environment <env>` (interactive prompt for value), or via the Railway dashboard
4. Copy variables between environments via the Railway dashboard (Variables → Copy from Environment)
5. Never commit `.env` files — Railway injects all variables at runtime
6. For secrets (API keys, tokens): set them directly via CLI interactive prompt or dashboard, never in source or as CLI arguments
7. Local development uses Doppler for secret injection, not `.env` files — see `security/agent-safety`

### Environment strategy

- **development**: secrets injected via Doppler, non-secret config in `.dev.vars` (gitignored)
- **staging**: mirrors production variables with staging-specific endpoints
- **production**: production values only — set and rotated via CLI

## Workers and Crons

### Background workers

1. Add a new Railway service pointing to the same repo
2. Set `startCommand` in `railway.json` to the worker entry point (e.g., `bun run worker.ts`)
3. The worker shares environment variables from the same environment

### Cron jobs

1. In the Railway dashboard, create a new Cron service
2. Set the schedule (cron syntax) and the command to run
3. Run `tools/service-graph.ts` after adding a cron to verify it can reach its dependencies

## Debugging Deploys

1. Run `tools/deploy-log.ts` to fetch and format the latest deploy logs
2. Common failures:
   - **Build fails** → check `Dockerfile` or buildpack detection; ensure all dependencies are in `package.json`
   - **Start fails** → check the `startCommand`; run it locally to confirm it works
   - **Exits immediately** → look for uncaught exceptions at startup; check DB connectivity with `tools/db-connection-check.ts`
   - **Health check fails** → confirm the server binds to `0.0.0.0` and uses the `PORT` env variable Railway injects
3. Restart a service: `railway restart` or via dashboard
4. Roll back: redeploy the previous commit via the Railway dashboard → Deployments tab

## Key references

| File | What it covers |
|---|---|
| `tools/env-sync.ts` | Compare environment variables across Railway environments and flag drift |
| `tools/deploy-log.ts` | Fetch and format the latest deploy logs for a service |
| `tools/db-connection-check.ts` | Verify database connectivity and report connection pool usage |
| `tools/service-graph.ts` | Map internal service dependencies and exposed ports |
