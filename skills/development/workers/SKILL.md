---
name: workers
description: Guides local Cloudflare Workers development — generating .dev.vars from Doppler or env files, running D1 local migrations, orchestrating multiple workers with process-compose, and diagnosing startup failures. Use when setting up a Workers project locally for the first time, generating .dev.vars for Wrangler, configuring Doppler for local secrets, running migrations against local D1, starting multiple workers with process-compose, debugging why a worker won't start locally, seeding or resetting local D1 databases, or checking whether .dev.vars are complete.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Local Workers Development

## Decision Tree

- What are you doing?
  - **First time setup** → see "Bootstrap" below
  - **Generating `.dev.vars` for workers** → see ".dev.vars setup" below
  - **Running local D1 migrations** → see "D1 migrations" below
  - **Starting dev services** → see "Service orchestration" below
  - **A worker isn't starting** → see "Diagnosing failures" below
  - **Seeding or resetting databases** → see "Database operations" below
  - **Checking which workers have missing secrets** → run `tools/devvars-check.ts`

## Bootstrap

First-time setup sequence:

1. Check `mise.toml` or `package.json` for a setup script (usually `bun run dev:setup` or `bun scripts/setup.ts`)
2. If it exists, run it — it typically generates `.dev.vars` and can auto-migrate on first run
3. Run migrations manually if not auto-applied: `bun scripts/migrate.ts` or `bun run dev:migrate`
4. Seed: `bun scripts/seed.ts` or `bun run dev:seed`
5. Start services: `bun scripts/dev.ts` or `mise run dev`

If there's no setup script, follow ".dev.vars setup" and "D1 migrations" manually.

## .dev.vars setup

Wrangler reads secrets from `.dev.vars` (not `.env`) when running Workers locally. This file is gitignored and must be created for each Worker.

**Source priority:**
1. **Doppler** — if `doppler.yaml` exists at the project root, Doppler injects secrets into `process.env` automatically when using `mise` (via `_.source` in `mise.toml`) or `doppler run --`
2. **`.env.secrets`** — fallback for devs who haven't configured Doppler
3. **`.env`** — non-secret config (URLs, ports, feature flags); always present

**Manual `.dev.vars` creation:**
```bash
# Minimal .dev.vars for a single Worker
cat apis/auth/.dev.vars.example  # see what vars are expected
cp apis/auth/.dev.vars.example apis/auth/.dev.vars
# Fill in real values
```

**If the project has `scripts/setup.ts`**, run it instead — it handles Doppler loading, env interpolation (e.g. `${CLOUDFLARE_D1_TOKEN}`), and writes `.dev.vars` for all workers in one pass.

**Checking coverage:** run `tools/devvars-check.ts` to see which workers are missing their `.dev.vars`.

## D1 migrations

```bash
# Apply migrations locally (single database)
bunx wrangler d1 migrations apply <database-name> --local

# With a specific config file
bunx wrangler d1 migrations apply <db-name> --local --config wrangler.jsonc

# For multi-database projects, check wrangler.toml for [[d1_databases]] to find all names
# Run for each database
```

If the project has `scripts/migrate.ts`, prefer it — it handles ordering across multiple databases and tracks state so it's safe to re-run.

Never hand-edit migration files. If a migration needs a fix, generate a new one.

## Service orchestration

Projects use **process-compose** to run multiple Workers and services simultaneously:

```bash
# Start everything (TUI mode)
process-compose up
# or via project scripts:
bun scripts/dev.ts
mise run dev

# Start specific services
bun scripts/dev.ts --only=auth,user
bun scripts/dev.ts --only=apis    # all API workers
bun scripts/dev.ts --only=app     # Expo only

# Point Expo at deployed APIs (skip local workers)
bun scripts/dev.ts --remote
```

Read `process-compose.yml` to find service names, ports, and readiness probes. Each Worker runs on its own port (e.g., auth=4804, user=4801, content=4802).

## Diagnosing failures

When a worker fails to start:

1. Verify `.dev.vars` exists: `ls apis/<name>/.dev.vars`
2. Compare with `.dev.vars.example` to find missing vars
3. Run the worker directly to see the raw error:
   ```bash
   cd apis/<name> && bunx wrangler dev
   ```
4. Check for port conflicts: `lsof -i :<port>` — kill conflicting process or change port in config
5. Verify D1 migrations have been applied locally

| Error | Cause | Fix |
|---|---|---|
| `Missing required env var` | `.dev.vars` incomplete | Run `bun scripts/setup.ts` or add missing var |
| `D1_ERROR: no such table` | Migrations not applied | Run `bun scripts/migrate.ts` or `wrangler d1 migrations apply --local` |
| `EADDRINUSE` | Port already in use | `lsof -i :<port>` and kill the process |
| `Cannot find module` | Missing deps | Run `bun install` |

## Database operations

```bash
# Seed local databases
bun scripts/seed.ts  # or: bun run dev:seed

# Wipe and re-seed (reset)
bun scripts/reset.ts  # or: bun run dev:reset

# Run a SQL query against local D1
bunx wrangler d1 execute <database-name> --local --command "SELECT * FROM users LIMIT 10"

# Open Drizzle Studio for local D1
bunx drizzle-kit studio
```

## Key references

| File | What it covers |
|---|---|
| `tools/devvars-check.ts` | Scan for wrangler configs and report which workers are missing `.dev.vars` |
