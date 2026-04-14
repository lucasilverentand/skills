---
name: data-modeling
description: Designs the data layer — schemas, entities, relationships, ID strategy, naming, tenancy, timestamps, indexes, audit logging, and migrations. Turns a set of domain concepts into a concrete Drizzle schema with all the small decisions that compound into either a clean data layer or a mess. Use when the user asks to design a schema, model the data, plan the database, add tables, review an existing schema, or says things like "what should the database look like", "design the schema for X", "add a table for Y", or "how should I store Z". Does NOT cover system decomposition (use architecture) or API design (use api-design).
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Data Modeling

Turns a set of entities and relationships into a concrete schema — IDs, naming, tenancy, timestamps, indexes, migrations, audit logging. These decisions seem small individually but they compound. Get them right once, apply them consistently, and the data layer stays clean as the system grows. Get them wrong and every query, every migration, every debugging session pays the tax.

## Current context

- Existing schemas: !`ls packages/db/schema/ 2>/dev/null || echo "(no schema directory)"`
- Architecture docs: !`ls .context/architecture/ 2>/dev/null || echo "(no architecture docs)"`

## Decision tree

- **Designing a new schema from scratch** → full process below, start with entity identification
- **Extending an existing schema** (new table, new columns) → read existing schema first, follow conventions already established, don't introduce a second style
- **Reviewing an existing schema for problems** → audit against the conventions below, flag deviations, suggest fixes
- **User wants to design the whole system** → hand off to `architecture`, come back here for the data layer
- **User wants to design the API over this data** → hand off to `api-design`

## Data store selection

Pick the database before modeling the schema — the choice shapes what's possible.

| Factor | D1 (SQLite on CF) | Neon (Postgres) |
|---|---|---|
| **Best for** | Small projects, prototypes, single-tenant tools, <100K rows | Multi-tenant SaaS, complex queries, compliance-sensitive data |
| **Queries** | Simple CRUD, basic JOINs, no CTEs in older versions | Full SQL: CTEs, window functions, JSON operators, full-text search |
| **Tenancy** | App-layer `WHERE tenant_id = ?` only — no RLS | Row-Level Security as defense-in-depth backstop |
| **Compliance** | Data in CF's nearest region (unpredictable) | EU-primary region, column encryption, GDPR-friendly |
| **Scale** | 10GB max per DB, limited concurrent writers | Autoscaling compute, read replicas, no hard row limits |
| **Cost** | Extremely cheap, included in Workers plan | Per-compute-second, ~$0.10/hr active, scales to zero |
| **Migration path** | D1 → Neon via Drizzle (same schema, different driver) | Already at the ceiling |
| **Ecosystem** | SQLite dialect quirks (no `ALTER COLUMN`, limited types) | Full Postgres ecosystem: extensions, pg_dump, observability tools |

**Decision rule:** Start with D1 when the project is small, single-purpose, and internal (e.g., a team tool with <500 users, simple CRUD, no multi-tenant isolation requirements). Graduate to Neon when you need RLS, complex queries, GDPR data residency, or the data will grow past what SQLite handles comfortably. The Drizzle schema is portable — switching is a driver change plus a migration, not a rewrite.

**When in doubt:** ask how many tenants, whether RLS matters, and whether EU data residency is required. If any answer is "yes", pick Neon.

## Entity identification

Use `AskUserQuestion` for the ones that aren't obvious from context:

1. **What are the core nouns?** Orders, users, products, invoices — the things the system stores and operates on.
2. **How do they relate?** One-to-many (user has many orders), many-to-many (orders have many products via line items), owns (cascade delete), references (soft reference, no cascade).
3. **What's the hot path?** Which entities are read most? Written most? This shapes indexes and denormalization choices.
4. **Which entities are tenant-scoped vs global?** Tenant-scoped tables get `tenant_id`; global tables (plans, feature flags, system config) don't.

## ID strategy

Prefixed ULIDs: `ord_01HF2M3N4P5QRSTVWXYZ123456`.

- **Time-sortable** — 128-bit, Crockford base32, 26 characters. Natural chronological ordering without a separate timestamp index.
- **Prefix per entity type** — `ord_`, `usr_`, `inv_`. Visible in logs, greppable, a human can tell what kind of thing they're looking at without context.
- **Never sequential integers** — they leak count ("you're customer #47"), enable enumeration attacks, and cause insert hotspots in distributed databases.
- **Never plain UUIDs** — not sortable, not human-distinguishable, and the prefix convention can't be applied cleanly.
- **Store as `text`**, not `uuid` type — because prefixed IDs aren't valid UUIDs and Postgres will reject them.

## Naming conventions

- **Tables:** plural snake_case (`orders`, `line_items`). Because SQL is a set language — a table is a collection.
- **Columns:** snake_case (`created_at`, `tenant_id`). Because Postgres folds unquoted identifiers to lowercase anyway.
- **Indexes:** `idx_<table>_<columns>` (`idx_orders_customer_id`). Because you'll read index names in `EXPLAIN` output and slow query logs.
- **Drizzle maps to camelCase in TypeScript** — snake_case stays in Postgres, camelCase in application code. Drizzle handles the boundary.

## Standard columns

Every table gets these unless there's a specific reason not to:

- `created_at timestamptz not null default now()` — when the row was inserted. Immutable.
- `updated_at timestamptz not null default now()` — last modification. Application or trigger updates this on every write.
- `deleted_at timestamptz` — soft delete. `null` means active. Drizzle query filters exclude deleted rows by default; `.withDeleted()` to opt in. Because hard deletes break foreign keys, audit trails, and "undo".

## Multi-tenancy

- `tenant_id text not null` on every tenant-scoped table. Because tenant isolation is the single most important invariant in a multi-tenant system.
- **Primary filter:** application query layer adds `WHERE tenant_id = ?` to every query. Drizzle middleware or a helper function — never rely on remembering to add it per query.
- **Backstop:** Postgres RLS (Row-Level Security) policy as a defense-in-depth layer. RLS errors are cryptic but they catch app-layer bugs before they become data breaches.
- **Index `tenant_id` first** in composite indexes for tenant-scoped queries. `idx_orders_tenant_customer(tenant_id, customer_id)` not `idx_orders_customer_tenant(customer_id, tenant_id)`. Because the planner uses leftmost prefix matching.

## JSONB rules

When to use JSONB and when not to:

- **YES:** user-extensible fields (`metadata jsonb`, Zod-validated at write time). Because the schema for these fields is defined by the user, not the developer.
- **YES:** denormalized read models when a join is on the hot path and the data changes infrequently. Because one read is cheaper than five joins when you're serving p99 latency targets.
- **NO:** anything you need to query, filter, or index on — use real columns. Because JSONB queries are slower, harder to optimize, and invisible to the type system.
- **NO:** opaque blobs (webhook payloads, event envelopes) — parse at the boundary, store structured columns. Because "we'll parse it later" means "we'll never parse it".

## Audit logging

Three patterns — pick the right one for the entity:

1. **`audit_log` table (append-only):** default for all mutations. Middleware inserts `{ entity, entity_id, action, actor_id, changes, timestamp }` automatically. Because you always want to know who changed what and when.
2. **Per-entity `_history` tables:** only for high-value entities (money, legal, compliance). A trigger snapshots the old row before update/delete. Because regulatory requirements demand a complete before/after record, not just a diff.
3. **Event sourcing:** only when the domain is genuinely event-shaped — ledgers, IoT streams, collaborative editing. The event log _is_ the source of truth and state is derived. Default: don't use event sourcing. Because it adds significant complexity and most domains aren't event-shaped.

## Schema organization

- Single `packages/db/` workspace with `schema/<domain>.ts` files and a barrel `index.ts`. Because one package owns the schema, and every app/service imports from `@repo/db`.
- Group related tables into domain files: `schema/orders.ts`, `schema/customers.ts`, `schema/auth.ts`.
- Migrations live in `packages/db/migrations/`. Because migration files are SQL artifacts that belong next to the schema that generates them.

## Migrations

- `drizzle-kit generate` → commit SQL files → `drizzle migrate` in CI before deploy. Because migrations are code — they go through review and version control like everything else.
- **Expand-contract for breaking changes:** (1) add new column with default, (2) deploy code that writes both old and new columns and reads from new, (3) backfill, (4) drop old column. Because renaming or changing column types in a single migration breaks every running instance that hasn't deployed yet.
- **Never rename or change column types in a single migration.** Always expand-contract.

## Transactions

- **Multi-table writes:** always in a transaction. Because partial writes across tables leave the database in an inconsistent state.
- **Read-then-write (check-and-update):** transaction with appropriate isolation. Because the check and the write must see the same snapshot.
- **Single inserts/updates:** no transaction needed. Because a single statement is already atomic in Postgres.

## Output

Write schema definitions to:

- `.context/architecture/` as design documentation
- `packages/db/schema/` as Drizzle schema code (when the project has a db package)

## Cross-references

| When                               | Use                |
| ---------------------------------- | ------------------ |
| Need the system architecture first | `architecture`     |
| Data store choice deserves an ADR  | `write-adr`        |
| Designing the API over this data   | `api-design`       |
| Documenting the whole design       | `write-design-doc` |

## Key references

| File                                | Covers                                           |
| ----------------------------------- | ------------------------------------------------ |
| `references/ids.md`                 | Prefixed ULID strategy                           |
| `references/naming.md`              | Table, column, index naming conventions          |
| `references/soft-delete.md`         | Timestamps and soft delete pattern               |
| `references/tenancy.md`             | Multi-tenancy with tenant_id + RLS               |
| `references/jsonb.md`               | When to use JSONB and when not to                |
| `references/audit.md`               | Three audit logging patterns                     |
| `references/schema-organization.md` | packages/db layout and domain files              |
| `references/migrations.md`          | Migration workflow and expand-contract           |
| `references/schema-examples.md`     | Full example schemas showing conventions applied |
