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

> **Security:** Secrets never exist as files in the project directory. `.dev.vars` contains only non-secret config (ports, URLs, feature flags). Secrets are injected at runtime via Doppler. See `security/agent-safety` for full rules. These rules apply in all permission modes including `bypassPermissions`.

## Bootstrap

### Prerequisites

Verify these are installed before first-time setup:

```bash
bun --version          # runtime and package manager
doppler --version      # secret injection — brew install dopplerhq/cli/doppler
process-compose version  # service orchestration — brew install process-compose
mise --version         # task runner (optional) — brew install mise
```

### First-time setup sequence

1. Check `mise.toml` or `package.json` for a setup script (usually `bun run dev:setup` or `bun scripts/setup.ts`)
2. If it exists, run it — it typically generates `.dev.vars` and can auto-migrate on first run
3. Run migrations manually if not auto-applied: `bun scripts/migrate.ts` or `bun run dev:migrate`
4. Seed: `bun scripts/seed.ts` or `bun run dev:seed`
5. Start services: `bun scripts/dev.ts` or `mise run dev`

If there's no setup script, follow ".dev.vars setup" and "D1 migrations" manually.

## .dev.vars setup

Wrangler reads local config from `.dev.vars`. This file contains **non-secret config only** — ports, URLs, feature flags, environment names. Secrets are injected at runtime via Doppler.

**What goes in `.dev.vars`:**
- `ENVIRONMENT=development`
- `WORKER_PORT=8787`
- Local service URLs, feature flags

**What does NOT go in `.dev.vars`:**
- Database passwords, API keys, JWT secrets, OAuth secrets, encryption keys — these come from Doppler

**Setup:**
```bash
# See what variables are expected
cat apis/auth/.dev.vars.example

# Create .dev.vars with non-secret config
cp apis/auth/.dev.vars.example apis/auth/.dev.vars
# Fill in non-secret values (URLs, ports, flags)
```

**If the project has `scripts/setup.ts`**, run it — it handles Doppler configuration, non-secret env setup, and `.dev.vars` generation for all workers in one pass.

**Checking coverage:** Run `tools/devvars-check.ts` to see which workers are missing their `.dev.vars`.

### Secret injection

Secrets reach workers at runtime through Doppler, never through files:

```bash
# Start a worker with Doppler injecting secrets
doppler run -- bunx wrangler dev

# Start with a specific Doppler config
doppler run --config dev_auth -- bunx wrangler dev --port 4804

# List expected secret names (no values)
doppler secrets --only-names
```

For multi-worker projects, `process-compose.yml` wraps each worker with Doppler:

```yaml
processes:
  auth-api:
    command: doppler run --config dev_auth -- bunx wrangler dev --port 4804
  user-api:
    command: doppler run --config dev_user -- bunx wrangler dev --port 4801
```

**How secrets reach workers locally:**
1. **Doppler** — primary method. `doppler run --` injects secrets as env vars at process start
2. **User's shell environment** — fallback. Secrets exported in `.zshrc`/`.bashrc`

File-based secret storage (`.env.secrets`, `.env` with secret values) is not used. See `security/agent-safety/references/secret-architecture.md` for the full architecture.

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

1. Verify non-secret config exists: `ls apis/<name>/.dev.vars`
2. Check Doppler has required secrets: `doppler secrets --only-names`
3. Run the worker directly to see the raw error:
   ```bash
   cd apis/<name> && bunx wrangler dev
   ```
4. Check for port conflicts: `lsof -i :<port>` — kill conflicting process or change port in config
5. Verify D1 migrations have been applied locally

| Error | Cause | Fix |
|---|---|---|
| `Missing required env var` | `.dev.vars` incomplete | Check Doppler: `doppler secrets --only-names`. If the secret is missing, add it: `doppler secrets set KEY` |
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
