# Cloudflare

Deploy Workers and Pages, manage D1/KV/R2 resources, and configure DNS and routing.

## Responsibilities

- Deploy Workers and Pages applications
- Manage D1, KV, and R2 resources
- Configure DNS records and routing rules
- Monitor Worker performance and error rates
- Manage environment variables and secrets per environment
- Set up custom domains and SSL certificates

## Tools

- `tools/worker-size.ts` — analyze Worker bundle size and flag oversized scripts
- `tools/d1-schema-diff.ts` — compare local D1 schema against remote database
- `tools/route-audit.ts` — list all configured routes and detect conflicts
- `tools/kv-usage.ts` — report KV namespace sizes and key counts per binding
