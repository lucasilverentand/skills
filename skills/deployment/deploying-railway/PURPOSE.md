# Railway

Deploy services, provision databases, and manage multi-environment setups.

## Responsibilities

- Deploy services to Railway
- Provision and manage databases
- Configure multi-environment setups
- Manage environment variables and service networking
- Monitor deploy logs and health checks
- Set up cron jobs and background workers

## Tools

- `tools/env-sync.ts` — compare environment variables across Railway environments and flag drift
- `tools/deploy-log.ts` — fetch and format the latest deploy logs for a service
- `tools/db-connection-check.ts` — verify database connectivity and report connection pool usage
- `tools/service-graph.ts` — map internal service dependencies and exposed ports
