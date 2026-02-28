# Database

Drizzle ORM patterns, schema design, queries, relations, seeding, and performance tuning for D1/SQLite and Postgres.

## Responsibilities

- Design and organize database schemas with Drizzle ORM
- Write type-safe queries using Drizzle query builder and select API
- Define relations and eager loading with `relations()` and `with`
- Manage transactions for multi-table writes
- Generate realistic seed data for development
- Choose between D1/SQLite and Postgres for new projects
- Add indexes and optimize query performance
- Enforce conventions: prefixed IDs, timestamps, soft delete, column naming

## Tools

- `tools/schema-lint.ts` — check schema files for convention violations
- `tools/query-explain.ts` — run EXPLAIN on queries and flag slow patterns
- `tools/seed-gen.ts` — generate seed data for a given schema
