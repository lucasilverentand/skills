---
name: hono-database
description: Integrates databases with Hono including Drizzle ORM, Prisma, Cloudflare D1, Turso/libSQL, PostgreSQL, and raw SQL queries. Use when connecting databases, configuring ORMs, writing queries, managing database connections in serverless environments, or setting up database middleware.
argument-hint: [database]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Hono Database Integration

Guide to integrating databases with Hono applications.

Based on `$ARGUMENTS`, provide guidance for the specified database or ORM.

## Drizzle ORM

### Drizzle Installation

```bash
npm install drizzle-orm
npm install -D drizzle-kit

# Database driver (choose one)
npm install postgres          # PostgreSQL
npm install better-sqlite3    # SQLite
npm install mysql2            # MySQL
npm install @libsql/client    # Turso/libSQL
```

### Drizzle Schema Definition

```typescript
// db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Database Connection

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### Drizzle with Hono

```typescript
// src/index.ts
import { Hono } from "hono";
import { db } from "./db";
import { users, posts } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// Get all users
app.get("/users", async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

// Get user by ID
app.get("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const user = await db.select().from(users).where(eq(users.id, id));

  if (user.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user[0]);
});

// Create user
app.post("/users", async (c) => {
  const body = await c.req.json();

  const newUser = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
    })
    .returning();

  return c.json(newUser[0], 201);
});

// Update user
app.put("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();

  const updated = await db
    .update(users)
    .set({ name: body.name })
    .where(eq(users.id, id))
    .returning();

  return c.json(updated[0]);
});

// Delete user
app.delete("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  await db.delete(users).where(eq(users.id, id));

  return c.body(null, 204);
});

export default app;
```

### Drizzle with Relations

```typescript
// Query with relations
app.get("/users/:id/posts", async (c) => {
  const id = parseInt(c.req.param("id"));

  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      posts: true,
    },
  });

  return c.json(result);
});
```

### Drizzle Kit Configuration

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

```bash
# Generate migrations
npx drizzle-kit generate:pg

# Push schema directly (development)
npx drizzle-kit push:pg

# Run migrations
npx drizzle-kit migrate
```

## Prisma

### Prisma Installation

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### Prisma Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
```

### Prisma Client

```typescript
// db/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Prisma with Hono

```typescript
// src/index.ts
import { Hono } from "hono";
import { prisma } from "./db/prisma";

const app = new Hono();

// Get all users
app.get("/users", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

// Get user with posts
app.get("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  const user = await prisma.user.findUnique({
    where: { id },
    include: { posts: true },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// Create user
app.post("/users", async (c) => {
  const body = await c.req.json();

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
    },
  });

  return c.json(user, 201);
});

// Update user
app.put("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();

  const user = await prisma.user.update({
    where: { id },
    data: { name: body.name },
  });

  return c.json(user);
});

// Delete user
app.delete("/users/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  await prisma.user.delete({ where: { id } });

  return c.body(null, 204);
});

export default app;
```

### Prisma with Edge Runtimes

For Cloudflare Workers, use Prisma Accelerate or Data Proxy:

```typescript
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());
```

## Cloudflare D1

### wrangler.toml Configuration

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-database-id"
```

### Create Database

```bash
# Create D1 database
wrangler d1 create my-database

# Create migration
wrangler d1 migrations create my-database init

# Apply migrations
wrangler d1 migrations apply my-database
```

### Migration SQL

```sql
-- migrations/0001_init.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  author_id INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### D1 with Hono

```typescript
// src/index.ts
import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Get all users
app.get("/users", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM users").all();
  return c.json(results);
});

// Get user by ID
app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// Create user
app.post("/users", async (c) => {
  const { name, email } = await c.req.json();

  const result = await c.env.DB.prepare(
    "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *",
  )
    .bind(name, email)
    .first();

  return c.json(result, 201);
});

// Batch operations
app.post("/users/batch", async (c) => {
  const users = await c.req.json();

  const statements = users.map((user: any) =>
    c.env.DB.prepare("INSERT INTO users (name, email) VALUES (?, ?)").bind(
      user.name,
      user.email,
    ),
  );

  const results = await c.env.DB.batch(statements);
  return c.json({ inserted: results.length });
});

export default app;
```

### D1 with Drizzle

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const createDb = (d1: D1Database) => drizzle(d1, { schema });

// Usage in Hono
app.get("/users", async (c) => {
  const db = createDb(c.env.DB);
  const users = await db.select().from(schema.users);
  return c.json(users);
});
```

## Turso / libSQL

### Turso Installation

```bash
npm install @libsql/client drizzle-orm
npm install -D drizzle-kit
```

### Connection

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

### Embedded Replicas (Edge)

```typescript
import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:local.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Sync from remote
await client.sync();
```

### Turso with Hono

```typescript
import { Hono } from "hono";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

app.get("/users", async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

app.post("/users", async (c) => {
  const body = await c.req.json();
  const newUser = await db.insert(users).values(body).returning();
  return c.json(newUser[0], 201);
});

export default app;
```

## PostgreSQL / MySQL Direct

### PostgreSQL with postgres.js

```typescript
// db/index.ts
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

// Raw queries
app.get("/users", async (c) => {
  const users = await sql`SELECT * FROM users`;
  return c.json(users);
});

app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
  return c.json(user);
});
```

### MySQL with mysql2

```typescript
// db/index.ts
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/users", async (c) => {
  const [rows] = await pool.execute("SELECT * FROM users");
  return c.json(rows);
});
```

## Connection Management

### Connection Pooling

```typescript
// Middleware for connection management
import { createMiddleware } from "hono/factory";

const dbMiddleware = createMiddleware(async (c, next) => {
  const connection = await pool.getConnection();
  c.set("db", connection);

  try {
    await next();
  } finally {
    connection.release();
  }
});

app.use("/api/*", dbMiddleware);
```

### Transaction Pattern

```typescript
app.post("/transfer", async (c) => {
  const { fromId, toId, amount } = await c.req.json();

  await db.transaction(async (tx) => {
    // Debit from source
    await tx
      .update(accounts)
      .set({ balance: sql`balance - ${amount}` })
      .where(eq(accounts.id, fromId));

    // Credit to destination
    await tx
      .update(accounts)
      .set({ balance: sql`balance + ${amount}` })
      .where(eq(accounts.id, toId));
  });

  return c.json({ success: true });
});
```

## Type-Safe Queries

### Zod Schema Integration

```typescript
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./db/schema";

const insertUserSchema = createInsertSchema(users);
const selectUserSchema = createSelectSchema(users);

app.post(
  "/users",
  zValidator("json", insertUserSchema.omit({ id: true, createdAt: true })),
  async (c) => {
    const data = c.req.valid("json");
    const user = await db.insert(users).values(data).returning();
    return c.json(user[0], 201);
  },
);
```

## Best Practices

1. **Use connection pooling** for better performance
2. **Handle transactions** for data integrity
3. **Use prepared statements** to prevent SQL injection
4. **Implement retry logic** for transient failures
5. **Close connections** properly (use middleware)
6. **Use migrations** for schema changes
7. **Index frequently queried columns**
8. **Monitor query performance**
9. **Use read replicas** for read-heavy workloads
10. **Implement soft deletes** where appropriate
