# Migrations

Generate ORM migrations — never touch migration files directly.

## Responsibilities

- Generate ORM migration files
- Ensure migrations are safe and reversible
- Detect schema drift between code and database
- Validate migration ordering and dependency chains

## Tools

- `tools/migration-gen.ts` — generate a Drizzle migration from current schema changes
- `tools/migration-check.ts` — verify all migrations are reversible and idempotent
- `tools/schema-drift.ts` — compare the Drizzle schema definitions against the current database state
- `tools/migration-order.ts` — validate migration file ordering and detect dependency conflicts
