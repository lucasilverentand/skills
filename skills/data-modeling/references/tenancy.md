# Multi-Tenancy

## The core invariant
`tenant_id text not null` on every tenant-scoped table. This is the single most important invariant in a multi-tenant system. If a row belongs to a tenant, it has a `tenant_id`. No exceptions, no "we'll add it later."

## Application-layer filtering (primary)
The application query layer adds `WHERE tenant_id = ?` to every query. In Drizzle, use middleware or a helper function that wraps all queries — never rely on remembering to add the filter per query. Because one forgotten filter is a data breach.

## Postgres RLS (defense-in-depth)
Enable Row-Level Security on tenant-scoped tables. Create a policy using `current_setting('app.tenant_id')`. Set the session variable at connection time from the authenticated request context.

RLS is a backstop, not the primary filter. RLS errors are cryptic and hard to debug — but they catch app-layer bugs before they become cross-tenant data leaks. Defense in depth: the app filter handles 100% of normal operation, RLS catches the bugs.

## Indexing strategy
Index `tenant_id` first in composite indexes: `idx_orders_tenant_customer(tenant_id, customer_id)`, not the reverse. Because Postgres uses leftmost prefix matching — a query filtering on `tenant_id` alone can still use this composite index. The reverse order can't.

## Global tables
Tables like `plans`, `feature_flags`, `system_config` don't get `tenant_id` — they're shared across all tenants. Document explicitly which tables are global and why. If you're unsure whether a table should be global or tenant-scoped, make it tenant-scoped. It's easier to remove `tenant_id` than to add it later with a backfill migration.

## Anti-patterns
- **Per-tenant schemas:** operational nightmare at scale. Every migration runs N times. Monitoring, backups, and connection pooling all multiply by tenant count.
- **Per-tenant databases:** even worse. Same problems as per-tenant schemas, plus cross-tenant queries become impossible and connection management explodes.
- **RLS as the primary filter:** too cryptic for debugging, too slow for high-throughput paths. Use it as a safety net.
- **Shared tables without `tenant_id` that later need it:** painful backfill migration, potential downtime, and every query must be audited.
