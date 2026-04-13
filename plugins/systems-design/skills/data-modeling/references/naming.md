# Naming Conventions

## Tables

**Plural snake_case:** `orders`, `line_items`, `audit_logs`.

Plural because SQL operates on sets — a table is a collection, not a single row. snake_case because Postgres folds unquoted identifiers to lowercase anyway — fighting this with quoted `"lineItems"` creates pain in every raw query and migration.

## Columns

**snake_case:** `created_at`, `tenant_id`, `shipping_address_id`. Same rationale as tables.

## Indexes

**`idx_<table>_<columns>`:** `idx_orders_customer_id`, `idx_line_items_order_id_product_id`.

Because you read index names in EXPLAIN output and slow query logs. A descriptive name saves debugging time. A name like `idx_1` tells you nothing when you're diagnosing a slow query at 2am.

## Foreign keys

**`fk_<table>_<column>`:** `fk_orders_customer_id`. Same rationale — constraint names appear in error messages.

## Check constraints

**`chk_<table>_<description>`:** `chk_orders_total_positive`, `chk_users_email_format`.

## Drizzle mapping

snake_case stays in Postgres, camelCase in TypeScript. Drizzle handles the boundary automatically via its column-name mapping. Never use quoted identifiers to force camelCase in the database.

## Anti-patterns

- **Singular table names** (`order`) — reads unnaturally in queries: `SELECT * FROM order` (also a reserved word).
- **camelCase in SQL** (`lineItems`) — requires quoting everywhere, breaks tooling assumptions.
- **Meaningless index names** (`idx_1`, `idx_2`) — useless in diagnostics.
- **Over-abbreviated columns** (`cst_id`, `addr`) — saving 3 characters costs readability. `qty` is fine because it's universally understood; `cst_id` is not.
