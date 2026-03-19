# Database

Drizzle ORM patterns, schema design, queries, relations, seeding, performance tuning, and migrations for D1/SQLite and Postgres.

## Responsibilities

- Design and organize database schemas with Drizzle ORM
- Write type-safe queries using Drizzle query builder and select API
- Define relations and eager loading with `relations()` and `with`
- Manage transactions for multi-table writes
- Generate realistic seed data for development
- Choose between D1/SQLite and Postgres for new projects
- Add indexes and optimize query performance
- Enforce conventions: prefixed IDs, timestamps, soft delete, column naming
- Generate ORM migration files
- Ensure migrations are safe and reversible
- Detect schema drift between code and database
- Validate migration ordering and dependency chains

## Tools

- `tools/schema-lint.ts` — check schema files for convention violations
- `tools/query-explain.ts` — run EXPLAIN on queries and flag slow patterns
- `tools/seed-gen.ts` — generate seed data for a given schema
- `tools/migration-gen.ts` — generate a Drizzle migration from current schema changes
- `tools/migration-check.ts` — verify all migrations are reversible and idempotent
- `tools/schema-drift.ts` — compare the Drizzle schema definitions against the current database state
- `tools/migration-order.ts` — validate migration file ordering and detect dependency conflicts
