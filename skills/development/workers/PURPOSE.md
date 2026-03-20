# workers

Local development workflow for Cloudflare Workers projects — generating secrets, running migrations, and orchestrating services.

## Responsibilities

- Generate `.dev.vars` files for Wrangler Workers from Doppler or env sources
- Run D1 local migrations across single and multi-database projects
- Orchestrate multiple Workers and services using process-compose
- Diagnose and fix Worker startup failures in local dev
- Seed, reset, and inspect local D1 databases

## Tools

- `tools/devvars-check.ts` — scan for wrangler configs and report which workers are missing `.dev.vars`
