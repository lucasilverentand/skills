# Schema

The `schema` part provides the data layer using Drizzle ORM. Schema definitions live in a shared workspace package — consuming packages import the `db` client and typed schema from it.

> **Cross-reference:** For migration generation, drift detection, and ordering validation, see `development/typescript/database`.

## Setup

1. Create `packages/schema/`
2. Install: `bun add drizzle-orm && bun add -d drizzle-kit`
3. Create `drizzle.config.ts`, `src/db.ts`, `src/index.ts`
4. Add scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`

### D1/SQLite config

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
```

### Postgres (Neon) config

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! }, // drizzle-kit reads process.env directly (config file, not app code)
});
```

## Defining tables

One file per table in `src/schema/`:

```ts
// src/schema/users.ts (Postgres)
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Naming conventions

- Tables: `snake_case` plural (`users`, `post_reactions`)
- Columns: `snake_case` (`created_at`, `user_id`)
- Indexes: `idx_<table>_<column(s)>`
- Foreign keys: declare cascade/restrict behavior explicitly

### Relations

```ts
import { relations } from "drizzle-orm";
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));
```

## DB client

```ts
// D1/SQLite
import { drizzle } from "drizzle-orm/d1";
export function createDb(d1: D1Database) { return drizzle(d1, { schema }); }

// Postgres (Neon)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@scope/config";
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

## Migrations

- **Development**: `drizzle-kit push` for rapid iteration
- **Production**: `drizzle-kit generate` then `drizzle-kit migrate`
- Never edit generated migration SQL files manually
- D1 on Cloudflare: `wrangler d1 migrations apply <name> --local|--remote`

## Seed scripts

Create `src/seed.ts` — keep seed data minimal, use `onConflictDoNothing()` for idempotency.

## Tools

| Tool | Purpose |
|---|---|
| `tools/schema-diff.ts` | Compare schema definitions against latest migration snapshot |
| `tools/schema-diagram.ts` | Text-based ER diagram of all tables |
| `tools/migration-status.ts` | Pending and applied migrations with timestamps |
| `tools/schema-check.ts` | Validate schema conventions and structure |
