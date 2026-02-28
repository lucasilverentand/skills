---
name: database
description: Drizzle ORM patterns and database operations — schema design, queries, relations, seeding, indexing, and performance tuning for D1/SQLite and Postgres.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Database

## Decision Tree

- What database task?
  - **Designing a schema** → see "Schema design" below
  - **Writing queries** → see "Query patterns" below
  - **Setting up relations** → see "Relations" below
  - **Seeding data** → run `tools/seed-gen.ts <schema-path>` to generate seed scripts
  - **Optimizing query performance** → run `tools/query-explain.ts` and see "Performance" below
  - **Choosing between D1 and Postgres** → see "D1 vs Postgres" below
  - **Adding indexes** → see "Indexing" below
  - **Linting schema files** → run `tools/schema-lint.ts <path>` and fix reported issues
  - **Running migrations** → see "Migrations" below

## Conventions

### File organization

One schema file per table, colocated with the related business logic module:

```
src/
  modules/
    users/
      schema.ts       # users table + relations
      routes.ts
    projects/
      schema.ts       # projects table + relations
      routes.ts
  db/
    index.ts           # drizzle client setup
    schema.ts          # re-exports all schemas
    seed.ts            # seed script
    migrations/        # generated migration files
```

The central `db/schema.ts` re-exports every module schema so Drizzle Kit can discover all tables:

```ts
export * from "../modules/users/schema";
export * from "../modules/projects/schema";
```

### Column naming

camelCase in TypeScript, snake_case in the database. Drizzle maps between them automatically when you define columns with camelCase names — no manual mapping needed:

```ts
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

### IDs

Prefixed nanoids per resource type: `{prefix}_{nanoid}` (e.g., `usr_V1StGXR8Z`, `prj_7mXAn9d3`). Define an ID helper:

```ts
import { nanoid } from "nanoid";

const prefixes = {
  user: "usr",
  project: "prj",
  task: "tsk",
  comment: "cmt",
} as const;

type Prefix = keyof typeof prefixes;

export function newId(type: Prefix): string {
  return `${prefixes[type]}_${nanoid(12)}`;
}
```

Use `$defaultFn` so IDs are generated at insert time:

```ts
id: text("id").primaryKey().$defaultFn(() => newId("user")),
```

### Timestamps

Every table gets `createdAt` and `updatedAt`. Use `$defaultFn(() => new Date())` for both at creation. Update `updatedAt` explicitly in update queries:

```ts
// SQLite — store as unix timestamps
createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),

// Postgres — use native timestamp
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow(),
```

### Soft delete

Add `deletedAt` timestamp column to any table that needs soft delete. Filter out deleted rows by default in all queries:

```ts
deletedAt: integer("deleted_at", { mode: "timestamp" }),
```

When querying, always exclude deleted rows unless explicitly requested:

```ts
const active = await db.query.users.findMany({
  where: isNull(users.deletedAt),
});
```

When deleting, set the timestamp — never remove the row:

```ts
await db.update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId));
```

### Enums

For SQLite, use `text` columns with a TypeScript union. For Postgres, use `pgEnum`:

```ts
// SQLite
const roleValues = ["admin", "member", "viewer"] as const;
role: text("role", { enum: roleValues }).notNull().default("member"),

// Postgres
export const roleEnum = pgEnum("role", ["admin", "member", "viewer"]);
role: roleEnum("role").notNull().default("member"),
```

## Schema design

1. Define the table with all columns, constraints, and defaults
2. Add `id`, `createdAt`, `updatedAt` to every table
3. Add `deletedAt` for resources that need soft delete
4. Define relations separately (see "Relations" below)
5. Export both the table and its relations from the module schema file
6. Re-export from `db/schema.ts`
7. Run `bunx drizzle-kit generate` to create the migration
8. Run `tools/schema-lint.ts` to check for convention violations

## Relations

Define relations using Drizzle's `relations()` function, colocated with the table schema:

```ts
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));
```

Use `with` for eager loading in queries:

```ts
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    projects: {
      with: { tasks: true },
    },
  },
});
```

Only eager-load what you need — avoid loading deep nested relations by default.

## Query patterns

### Simple reads — use the query API

```ts
// Find one
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// Find many with filter
const active = await db.query.users.findMany({
  where: and(eq(users.role, "admin"), isNull(users.deletedAt)),
  orderBy: desc(users.createdAt),
  limit: 20,
});
```

### Complex reads — use the select API

For joins, subqueries, aggregations, or anything the query API cannot express:

```ts
const results = await db
  .select({
    id: projects.id,
    name: projects.name,
    taskCount: sql<number>`count(${tasks.id})`.as("task_count"),
  })
  .from(projects)
  .leftJoin(tasks, eq(tasks.projectId, projects.id))
  .where(isNull(projects.deletedAt))
  .groupBy(projects.id)
  .orderBy(desc(sql`task_count`));
```

### Inserts

```ts
const [user] = await db.insert(users).values({
  displayName: "Alice",
  email: "alice@example.com",
}).returning();
```

### Updates

Always set `updatedAt` explicitly:

```ts
const [updated] = await db.update(users)
  .set({ displayName: "Bob", updatedAt: new Date() })
  .where(eq(users.id, userId))
  .returning();
```

### Transactions

Wrap multi-table writes in `db.transaction()`:

```ts
const result = await db.transaction(async (tx) => {
  const [project] = await tx.insert(projects).values({
    name: "New Project",
    ownerId: userId,
  }).returning();

  await tx.insert(members).values({
    projectId: project.id,
    userId: userId,
    role: "admin",
  });

  return project;
});
```

If any statement inside the transaction throws, the entire transaction rolls back.

### Cursor-based pagination

```ts
async function paginate(cursor?: string, limit = 20) {
  const rows = await db.query.users.findMany({
    where: cursor
      ? and(isNull(users.deletedAt), lt(users.id, cursor))
      : isNull(users.deletedAt),
    orderBy: desc(users.id),
    limit: limit + 1,
  });

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, cursor: nextCursor };
}
```

## Indexing

Add indexes for columns used in `WHERE`, `ORDER BY`, and `JOIN` conditions:

```ts
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  teamId: text("team_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
  index("users_team_id_idx").on(table.teamId),
  index("users_created_at_idx").on(table.createdAt),
]);
```

Guidelines:
- Always index foreign key columns
- Add unique indexes for natural keys (email, slug)
- Composite indexes for multi-column filters — put the most selective column first
- Avoid indexing low-cardinality columns (booleans, enums with few values) on their own
- Run `tools/query-explain.ts` to verify your indexes are being used

## Performance

- Use `select()` to pick only needed columns instead of selecting everything
- Avoid N+1 queries: use `with` for eager loading or write explicit joins
- Use `limit` on all list queries — never return unbounded result sets
- For count-only queries, use `sql<number>\`count(*)\`` instead of fetching all rows
- Add indexes for slow queries — run `tools/query-explain.ts` to identify them
- Use `prepare()` for queries that run frequently — Drizzle compiles them once
- For D1, batch reads with `db.batch()` to reduce round-trips

## D1 vs Postgres

| Criteria | D1 (SQLite) | Postgres (Neon) |
|---|---|---|
| Project size | Small, single-region | Complex, multi-region |
| Data model | Simple relations, few joins | Many relations, complex queries |
| Full-text search | Limited (FTS5) | Built-in `tsvector` |
| JSON queries | Basic `json_extract` | Rich `jsonb` operators |
| Concurrent writes | Single writer | High concurrency |
| Deployment | Cloudflare Workers | Railway, Fly, Kubernetes |
| Cost | Free tier generous | Neon free tier, then usage-based |
| Migrations | `drizzle-kit generate` + `wrangler d1 migrations apply` | `drizzle-kit generate` + `drizzle-kit migrate` |

**Default to D1** unless you need one of the Postgres advantages listed above. D1 is simpler to operate and deploy with Cloudflare Workers.

## Migrations

Run migrations with Drizzle Kit:

```bash
# Generate migration from schema changes
bunx drizzle-kit generate

# Apply migrations (Postgres)
bunx drizzle-kit migrate

# Apply migrations (D1)
wrangler d1 migrations apply <database-name> --local   # local dev
wrangler d1 migrations apply <database-name> --remote  # production
```

Never edit generated migration files. If a migration is wrong, generate a new one that fixes it.

## Seeding

Seed scripts live in `db/seed.ts` and use Bun to run:

```bash
bun run db/seed.ts
```

Seed with realistic data, not lorem ipsum. Use the `tools/seed-gen.ts` script to auto-generate seed data from your schema. Seed scripts should be idempotent — safe to run multiple times without duplicating data.

## Key references

| File | What it covers |
|---|---|
| `tools/schema-lint.ts` | Check schema files for missing timestamps, IDs, naming violations |
| `tools/query-explain.ts` | Run EXPLAIN on queries and flag sequential scans, missing indexes |
| `tools/seed-gen.ts` | Generate realistic seed data from a Drizzle schema file |
