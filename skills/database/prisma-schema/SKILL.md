---
name: prisma-schema
description: Designs Prisma schemas and manages migrations. Use when creating database models, setting up Prisma, or managing database schema changes.
argument-hint: [model-name]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Prisma Schema

Designs Prisma schemas and manages database migrations.

## Your Task

1. **Check setup**: Verify Prisma is installed
2. **Design schema**: Create or update schema.prisma
3. **Create migration**: Generate migration files
4. **Apply migration**: Run migration on database
5. **Generate client**: Regenerate Prisma Client

## Quick Start

```bash
npm install prisma @prisma/client
npx prisma init
```

## Schema Example

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}
```

## Common Commands

```bash
npx prisma migrate dev --name init    # Create and apply migration
npx prisma migrate deploy             # Apply migrations in production
npx prisma generate                   # Regenerate client
npx prisma studio                     # Open database browser
npx prisma db push                    # Push schema without migration
```

## Tips

- Use `@default(cuid())` or `@default(uuid())` for IDs
- Add `@@index` for frequently queried fields
- Use `@updatedAt` for automatic timestamp updates
- Keep schema.prisma as the source of truth
