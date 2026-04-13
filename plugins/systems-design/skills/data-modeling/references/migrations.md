# Migration Strategy

## Workflow

`drizzle-kit generate` -> review the SQL -> commit -> `drizzle migrate` in CI before deploy.

Migrations are code. They go through review and version control like everything else. Because an unreviewed migration is a production outage waiting to happen.

## Neon branching

Create a database branch per PR for safe migration testing against real Postgres. The branch is a copy-on-write fork — cheap to create, safe to destroy. Catch migration bugs before they hit staging.

## Expand-contract for breaking changes

Never rename or change column types in a single migration. Always expand-contract:

1. **Expand:** add new column with a default value. Deploy.
2. **Dual-write:** deploy code that writes to both old and new columns, reads from new.
3. **Backfill:** migrate existing data from old column to new.
4. **Contract:** drop old column.

Why: during gradual rollout, old and new code coexist. A single-step rename breaks every running instance that hasn't deployed yet.

## Safe changes (no expand-contract needed)

- Adding a new table
- Adding a nullable column
- Adding an index
- Widening a column type (e.g., `varchar(50)` -> `varchar(100)`)

## Dangerous changes (always expand-contract)

- Renaming a column or table
- Changing a column type
- Making a nullable column `NOT NULL`
- Dropping a column (unless confirmed unused via query logs)

## Transactions in migrations

- **Multi-table writes:** always in a transaction.
- **Read-then-write (check-and-update):** transaction with appropriate isolation level.
- **Single inserts/updates:** no transaction needed — a single statement is already atomic in Postgres.
- **Anti-pattern:** wrapping every single-row INSERT in a transaction — adds contention for no safety benefit.

## Anti-patterns

- **Running migrations at app startup** — if two instances start simultaneously, they race. Run migrations in CI, once, before deploy.
- **Hand-editing generated SQL** — if the generated migration is wrong, fix the schema definition and regenerate.
- **Skipping review** — "it's just adding a column" is how you end up with a `NOT NULL` column without a default on a table with 10M rows.
