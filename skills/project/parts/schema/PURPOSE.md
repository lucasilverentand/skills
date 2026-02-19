# Schema

Shared database schema: Drizzle tables, types, and migrations.

## Responsibilities

- Define Drizzle table schemas
- Maintain shared database types
- Coordinate schema migrations
- Enforce naming conventions for tables, columns, and indexes
- Generate type-safe query helpers from schema definitions
- Validate foreign key relationships and constraints

## Tools

- `tools/schema-diagram.ts` — output a text-based entity-relationship diagram of all tables
- `tools/migration-status.ts` — show pending and applied migrations with timestamps
- `tools/schema-diff.ts` — compare current schema definitions against the latest migration snapshot
