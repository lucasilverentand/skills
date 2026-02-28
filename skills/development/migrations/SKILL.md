---
name: migrations
description: Generates and validates Drizzle ORM migrations — never edits migration files directly. Use when a schema change needs a migration, when verifying migrations are reversible, when detecting schema drift, or when migration ordering looks wrong. Always generates migrations via tooling, never hand-edits them.
allowed-tools: Read Glob Bash
---

# Migrations

## Decision Tree

- What is the migration task?
  - **Schema changed, need a migration** → see "Generating a migration" below
  - **Checking if existing migrations are safe** → run `tools/migration-check.ts` and review the report
  - **Database state doesn't match schema definitions** → see "Schema drift workflow" below
  - **Migration files may be out of order** → run `tools/migration-order.ts` and fix per report

## Generating a migration

1. Confirm the schema change is complete — do not generate a migration mid-edit
2. Read the current Drizzle schema files (usually `src/db/schema.ts` or `packages/db/schema/`)
3. Understand what changed: new table, new column, renamed column, dropped column, index change
4. Run `tools/migration-gen.ts` — generates the migration from current schema changes
5. Review the generated migration file:
   - **New table** → verify `CREATE TABLE` matches schema, including foreign keys and indexes
   - **New column** → check nullability; if NOT NULL, ensure a default is provided for existing rows
   - **Renamed column** → Drizzle generates drop + add by default; verify data is not lost, consider a custom migration if needed
   - **Dropped column** → confirm this is intentional — irreversible in production
6. Never hand-edit the generated migration file. If the output is wrong, fix the schema and regenerate.
7. Commit schema changes and the migration together in one commit

## Schema drift workflow

1. Run `tools/schema-drift.ts` — compares Drizzle schema definitions against the current database state
2. Review the drift report:
   - **Schema ahead of DB** → a migration has not been applied; run pending migrations
   - **DB ahead of schema** → manual changes were made to the DB outside of migrations; dangerous, capture them in a migration
   - **Conflicting state** → schema and DB diverged; resolve schema first, then regenerate
3. Never manually alter the database to resolve drift — always go through migrations

## Key references

| File | What it covers |
|---|---|
| `tools/migration-gen.ts` | Generate a Drizzle migration from current schema changes |
| `tools/migration-check.ts` | Verify all migrations are reversible and idempotent |
| `tools/schema-drift.ts` | Compare schema definitions against the current database state |
| `tools/migration-order.ts` | Validate migration file ordering and detect dependency conflicts |
