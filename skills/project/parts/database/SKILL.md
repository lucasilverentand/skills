---
name: database
description: Sets up and maintains the database layer using Drizzle ORM. Handles D1/SQLite and Postgres (Neon) configuration, schema package scaffolding, migrations, and seed scripts. Use when adding a database to a monorepo, creating tables, running migrations, or switching database providers.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Database

The `database` part provides the data layer for the entire project using Drizzle ORM. Schema definitions live in a shared workspace package — consuming packages import the `db` client and typed schema from it.

## Decision Tree

- What are you doing?
  - **Setting up a database from scratch** → see "Initial setup" below
  - **Adding a new table** → see "Adding tables" below
  - **Running migrations** → see "Migrations" below
  - **Switching from D1 to Postgres** → see "Provider switch" below
  - **Seeding the database** → see "Seed scripts" below
  - **Checking migration status** → run `tools/migration-check.ts`
  - **Visualizing the schema** → run `tools/schema-overview.ts`

## Initial setup

1. Create the schema workspace package: `packages/schema/`
2. Install: `bun add drizzle-orm && bun add -d drizzle-kit`
3. Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

// D1/SQLite
export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "sqlite",
});

// Postgres (Neon)
export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

4. Create `src/db.ts` — the shared database client:

```ts
// D1/SQLite (Cloudflare Workers)
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
export type Database = ReturnType<typeof createDb>;

// Postgres (Neon)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
export type Database = typeof db;
```

5. Export everything from `src/index.ts`:

```ts
export * from "./schema";
export { createDb, type Database } from "./db";
```

6. Add scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run src/seed.ts"
  }
}
```

## Adding tables

Create one file per table in `src/schema/`:

```ts
// src/schema/users.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// or: import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

- One table per file, named after the table
- Re-export all tables from `src/schema/index.ts`
- Use `text("id").primaryKey().$defaultFn(() => crypto.randomUUID())` for IDs in SQLite
- Use `serial("id").primaryKey()` for auto-increment IDs in Postgres
- Define relations in a separate `src/schema/relations.ts` file

## Relations

```ts
import { relations } from "drizzle-orm";
import { users } from "./users";
import { posts } from "./posts";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

## Migrations

- **Development**: use `drizzle-kit push` for rapid iteration (applies schema changes directly)
- **Production**: use `drizzle-kit generate` then `drizzle-kit migrate` for versioned migrations
- Never edit generated migration SQL files manually
- Run `tools/migration-check.ts` to verify pending migrations before deploying

### D1 migrations on Cloudflare

```sh
wrangler d1 migrations apply <database-name> --local   # local dev
wrangler d1 migrations apply <database-name> --remote   # production
```

## Provider switch

Switching from D1/SQLite to Postgres:

1. Update `drizzle.config.ts` — change dialect to `"postgresql"`
2. Replace `drizzle-orm/d1` with `drizzle-orm/neon-http` in `src/db.ts`
3. Replace `sqliteTable` with `pgTable` in all schema files
4. Replace `integer("...", { mode: "timestamp" })` with `timestamp("...")`
5. Replace text IDs with `serial` or `uuid` where appropriate
6. Regenerate migrations: `bun run db:generate`

## Seed scripts

Create `src/seed.ts` for development data:

```ts
import { db } from "./db";
import { users } from "./schema";

async function seed() {
  await db.insert(users).values([
    { id: "1", email: "admin@example.com", name: "Admin" },
    { id: "2", email: "user@example.com", name: "User" },
  ]);
  console.log("Seeded database");
}

seed().catch(console.error);
```

- Seed scripts are idempotent — use `onConflictDoNothing()` or truncate first
- Keep seed data minimal and realistic

## Key references

| File | What it covers |
|---|---|
| `tools/migration-check.ts` | Pending migrations, schema drift detection |
| `tools/schema-overview.ts` | All tables, columns, relations, and indexes |
