# Database

Shared database package: Drizzle ORM setup, schema definitions, migrations, and client factory.

## Responsibilities

- Scaffold a database package in a bun workspace monorepo
- Configure Drizzle ORM with D1 (SQLite) or Postgres (Neon)
- Define and organize table schemas
- Manage migration generation and application
- Provide the database client factory for consuming packages
- Create seed scripts for development data

## Tools

- `tools/schema-check.ts` — validate schema files, list tables, and check for missing barrel exports
- `tools/migration-gen.ts` — generate a Drizzle migration and report what changed
