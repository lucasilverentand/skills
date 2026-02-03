---
name: drizzle-orm
description: Sets up Drizzle ORM with schema and queries. Use when configuring Drizzle, creating database schemas, or writing type-safe queries.
argument-hint: [database-type]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Drizzle ORM

Sets up Drizzle ORM with schema definitions and queries.

## Your Task

1. **Install Drizzle**: Add dependencies for your database
2. **Create schema**: Define tables in TypeScript
3. **Configure**: Set up drizzle.config.ts
4. **Generate migrations**: Create migration files
5. **Test queries**: Verify database operations

## Quick Start

```bash
# PostgreSQL
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

## Schema Definition

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

## Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Query Examples

```typescript
import { db } from './db';
import { users, posts } from './schema';
import { eq } from 'drizzle-orm';

// Select with relation
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
});

// Insert
await db.insert(users).values({ email: 'user@example.com' });

// Update
await db.update(users).set({ name: 'New Name' }).where(eq(users.id, userId));
```

## Tips

- Use `drizzle-kit generate` for migrations
- Use `drizzle-kit push` for development iteration
- Define relations for type-safe joins
- Use `$inferSelect` and `$inferInsert` for types
