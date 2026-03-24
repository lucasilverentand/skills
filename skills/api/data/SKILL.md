---
name: data
description: Drizzle ORM patterns for API data layers — schema design, queries, relations, cursor pagination, seeding, indexing, performance tuning, and migrations for D1/SQLite and Postgres. Use when designing database schemas, writing queries, setting up relations, running or generating migrations, seeding data, optimizing query performance, or choosing between D1 and Postgres.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Data Layer

## Current context

- Schema files: !`find src -name "schema.ts" -o -name "schema/*.ts" 2>/dev/null | head -10`
- Migrations: !`find . -path "*/migrations/*.sql" 2>/dev/null | wc -l | tr -d ' '` migration files
- DB config: !`grep -l "drizzle" package.json 2>/dev/null | head -1`

## Decision Tree

- What database task?
  - **Designing a schema** → see "Schema design" below
  - **Writing queries** → see "Query patterns" below
  - **Setting up relations** → see "Relations" below
  - **Seeding data** → run `tools/seed-gen.ts <schema-path>`
  - **Optimizing performance** → run `tools/query-explain.ts` and see "Performance" below
  - **Choosing between D1 and Postgres** → see "D1 vs Postgres" below
  - **Adding indexes** → see "Indexing" below
  - **Linting schema** → run `tools/schema-lint.ts <path>`
  - **Generating a migration** → see "Migrations" below
  - **Checking migration safety** → run `tools/migration-check.ts`
  - **Schema drift** → run `tools/schema-drift.ts` and see "Schema drift" below
  - **Migration ordering issues** → run `tools/migration-order.ts`

## Conventions

### File organization

One schema file per table, colocated with the module:

```
src/modules/users/schema.ts     # users table + relations
src/modules/projects/schema.ts  # projects table + relations
src/db/index.ts                 # drizzle client setup
src/db/schema.ts                # re-exports all schemas
src/db/migrations/              # generated migration files
```

### Column naming

camelCase in TypeScript, snake_case in the database. Drizzle maps automatically.

### Every table gets

- `id` — prefixed nanoid: `text("id").primaryKey().$defaultFn(() => newId("user"))`
- `createdAt` — timestamp with `$defaultFn(() => new Date())`
- `updatedAt` — timestamp, updated explicitly in update queries
- `deletedAt` — optional, for resources that need soft delete

### Enums

SQLite: `text` with TypeScript union. Postgres: `pgEnum`.

## Schema design

1. Define table with all columns, constraints, and defaults
2. Add `id`, `createdAt`, `updatedAt`
3. Add `deletedAt` if soft delete is needed
4. Define relations separately with `relations()`
5. Export both table and relations from the module schema
6. Re-export from `db/schema.ts`
7. Run `bunx drizzle-kit generate`
8. Run `tools/schema-lint.ts`

## Relations

```ts
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  tasks: many(tasks),
}));
```

Use `with` for eager loading — only load what you need.

## Query patterns

- **Simple reads** → query API: `db.query.users.findFirst({ where, with })`
- **Complex reads** (joins, aggregations) → select API: `db.select().from().leftJoin()`
- **Inserts** → `db.insert(table).values({}).returning()`
- **Updates** → always set `updatedAt`: `db.update(table).set({ ..., updatedAt: new Date() })`
- **Transactions** → `db.transaction(async (tx) => { ... })`
- **Pagination** → cursor-based, fetch `limit + 1` to detect `hasMore`

## Indexing

- Always index foreign key columns
- Unique indexes for natural keys (email, slug)
- Composite indexes: most selective column first
- Avoid indexing low-cardinality columns alone
- Verify with `tools/query-explain.ts`

## Performance

- `select()` for specific columns, not `*`
- Avoid N+1: use `with` or explicit joins
- Always `limit` list queries
- Use `sql<number>\`count(*)\`` for count-only
- `prepare()` for hot queries
- D1: `db.batch()` to reduce round-trips

## D1 vs Postgres

| | D1 (SQLite) | Postgres (Neon) |
|---|---|---|
| Best for | Small, single-region | Complex, multi-region |
| Joins | Simple | Complex queries, full-text search |
| Writes | Single writer | High concurrency |
| Deploy with | Cloudflare Workers | Railway, Fly, Kubernetes |
| Migrations | `wrangler d1 migrations apply` | `drizzle-kit migrate` |

Default to D1 unless you need Postgres advantages.

## Migrations

```bash
bunx drizzle-kit generate            # generate from schema changes
bunx drizzle-kit migrate             # apply (Postgres)
wrangler d1 migrations apply <db> --local   # apply (D1 local)
wrangler d1 migrations apply <db> --remote  # apply (D1 prod)
```

Never edit generated migration files. Commit schema + migration together.

### Schema drift

1. Run `tools/schema-drift.ts`
2. Schema ahead of DB → apply pending migrations
3. DB ahead of schema → capture manual changes in a migration
4. Never manually alter the database — always go through migrations

## Tool reference

| Tool | What it does |
|---|---|
| `tools/schema-lint.ts` | Check schemas for missing timestamps, IDs, naming violations |
| `tools/query-explain.ts` | Run EXPLAIN on queries, flag missing indexes |
| `tools/seed-gen.ts` | Generate realistic seed data from schema |
| `tools/migration-gen.ts` | Generate migration from schema changes |
| `tools/migration-check.ts` | Verify migrations are reversible and safe |
| `tools/schema-drift.ts` | Compare schema definitions against database state |
| `tools/migration-order.ts` | Validate migration ordering and dependencies |
