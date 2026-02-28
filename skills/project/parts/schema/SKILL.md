---
name: schema
description: Creates and maintains a shared Drizzle ORM schema package in a bun workspace monorepo — table definitions, column types, indexes, foreign keys, migrations, and type-safe query helpers. Use when defining database tables, running migrations, checking migration status, or generating inferred TypeScript types from Drizzle schema definitions.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Schema

## Decision Tree

- What are you working on?
  - **New schema package** → follow "Bootstrap" workflow
  - **Adding a table** → see "Define a table" section
  - **Running migrations** → see "Migrations" section
  - **Schema drifted from migrations** → run `tools/schema-diff.ts`
  - **Visualising relationships** → run `tools/schema-diagram.ts`

## Bootstrap

1. Create `packages/schema/`
2. `package.json`:
   ```json
   {
     "name": "@<project>/schema",
     "type": "module",
     "exports": { ".": "./src/index.ts" }
   }
   ```
3. Install: `bun add drizzle-orm drizzle-kit`
4. Create `src/index.ts` — re-exports all tables and inferred types
5. Create `drizzle.config.ts` at the workspace root (or package root for isolated schemas)

## Define a table

```ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

- Use `uuid` PKs with `.defaultRandom()` — not auto-increment integers
- Use `timestamp` with `{ withTimezone: true }` for all date/time columns
- Always export `$inferSelect` and `$inferInsert` types alongside the table

## Naming conventions

- Tables: `snake_case` plural (`users`, `post_reactions`)
- Columns: `snake_case` (`created_at`, `user_id`)
- TypeScript variables: `camelCase` matching the table name (`users`, `postReactions`)
- Indexes: `idx_<table>_<column(s)>` (e.g., `idx_users_email`)
- Foreign keys: `<table>_<column>_fk`

## Foreign keys

```ts
import { users } from "./users"

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
})
```

- Always declare cascade/restrict behavior explicitly — never rely on defaults

## Migrations

1. Edit schema definitions in `src/`
2. Generate migration: `bunx drizzle-kit generate`
3. Review the generated SQL in `drizzle/` before applying
4. Apply: `bunx drizzle-kit migrate` (or via a migration script in CI)
5. Check `tools/migration-status.ts` to confirm applied migrations

- Never edit a migration file after it has been applied to any environment
- If a migration was wrong, write a new corrective migration

## D1 (SQLite) vs Postgres

- D1/SQLite: use `integer`, `text`, `blob` — no `uuid` type, use `text` for IDs
- Postgres (Neon): use `pgTable`, `uuid`, `timestamp`, `jsonb`
- Keep the schema package consistent — pick one dialect per project

## Key references

| File | What it covers |
|---|---|
| `tools/schema-diagram.ts` | Text-based ER diagram of all tables |
| `tools/migration-status.ts` | Pending and applied migrations with timestamps |
| `tools/schema-diff.ts` | Compare schema definitions against latest migration snapshot |
