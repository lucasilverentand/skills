---
name: cloudflare
description: Deploys and manages Cloudflare Workers, Pages, D1, KV, and R2 resources using wrangler. Use when deploying a Worker or Pages project, creating or migrating D1 databases, managing KV namespaces, setting environment secrets, configuring routes or custom domains, or debugging Worker errors and performance issues.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Cloudflare

## Decision Tree

- What is the task?
  - **Deploy a Worker or Pages project** → see "Deploying" below
  - **Manage D1, KV, or R2 resources** → see "Resource Management" below
  - **Configure routes, domains, or DNS** → see "Routing and Domains" below
  - **Set or rotate environment secrets** → see "Secrets and Variables" below
  - **Diagnose errors or performance issues** → see "Observability" below
  - **Audit bundle size or routes** → run the relevant tool under "Key references"

## Deploying

### Workers

1. Confirm `wrangler.toml` has the correct `name`, `main`, `compatibility_date`, and `account_id`
2. Run `tools/worker-size.ts` — if the bundle exceeds 1 MB (uncompressed) or 25 MB (compressed), reduce imports before deploying
3. Deploy: `bunx wrangler deploy` (add `--env <env>` for staging/production environments)
4. Verify with `bunx wrangler tail` to confirm requests are being handled

### Pages

1. Confirm `wrangler.toml` `[site]` bucket or use `bunx wrangler pages deploy <dist-dir>`
2. For Pages Functions, verify `functions/` directory structure matches routes
3. Deploy: `bunx wrangler pages deploy <dist-dir> --project-name <project>`

### Environment targets

- Always deploy to a named environment (`--env staging`, `--env production`)
- Never use the default environment for production; it has no safeguards

## Resource Management

### D1

1. Run `tools/d1-schema-diff.ts` before any migration — confirm local schema matches remote
2. Apply migrations: `bunx wrangler d1 migrations apply <db-name> --env <env>`
3. For new databases: `bunx wrangler d1 create <db-name>` then add binding to `wrangler.toml`
4. Verify migration applied: `bunx wrangler d1 execute <db-name> --command "SELECT name FROM sqlite_master WHERE type='table'"`

### KV

1. Run `tools/kv-usage.ts` to check namespace sizes before writes
2. Create namespace: `bunx wrangler kv:namespace create <name>`
3. Add the namespace ID to `wrangler.toml` under `[[kv_namespaces]]`
4. Bulk write/delete via `bunx wrangler kv:bulk put` or `delete`

### R2

1. Create bucket: `bunx wrangler r2 bucket create <name>`
2. Add binding to `wrangler.toml` under `[[r2_buckets]]`
3. For public access, configure custom domain on the bucket via the dashboard or `wrangler r2 bucket domain add`

## Routing and Domains

1. Run `tools/route-audit.ts` to list all configured routes and surface conflicts before making changes
2. Add routes in `wrangler.toml` under `[[routes]]` with `pattern` and `zone_name`
3. Custom domains: `bunx wrangler domains add <domain>` (requires DNS proxied through Cloudflare)
4. DNS records: manage via Cloudflare dashboard or Terraform — do not hardcode zone IDs in source

## Secrets and Variables

- **Environment variables** (non-secret): set under `[vars]` in `wrangler.toml` per environment
- **Secrets**: never put in `wrangler.toml`; use `bunx wrangler secret put <KEY> --env <env>` and input value interactively
- List existing secrets: `bunx wrangler secret list --env <env>`
- Rotate a secret: `bunx wrangler secret put <KEY> --env <env>` (overwrites silently)

## Observability

1. Stream live logs: `bunx wrangler tail --env <env>` — filter by status or sampling rate if noisy
2. For errors: read the exception message and Worker line number, then trace back to source
3. CPU limit exceeded: profile by adding `console.time` around suspect sections; optimize or split into Durable Objects
4. Cold start latency: check bundle size with `tools/worker-size.ts` — large bundles slow cold starts

## Key references

| File | What it covers |
|---|---|
| `tools/worker-size.ts` | Analyze Worker bundle size and flag oversized scripts |
| `tools/d1-schema-diff.ts` | Compare local D1 schema against remote database |
| `tools/route-audit.ts` | List all configured routes and detect conflicts |
| `tools/kv-usage.ts` | Report KV namespace sizes and key counts per binding |
