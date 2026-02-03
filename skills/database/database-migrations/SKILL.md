---
name: database-migrations
description: Plans and manages database migrations. Use when changing schemas, planning rollback strategies, or coordinating database changes with deployments.
argument-hint: [migration-name]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Database Migrations

Plans and manages database schema changes safely.

## Your Task

1. **Assess change**: Understand the schema change needed
2. **Plan migration**: Consider backwards compatibility
3. **Write migration**: Create up and down migrations
4. **Test locally**: Apply and rollback migration
5. **Document**: Note any deployment considerations

## Migration Strategies

### Additive Changes (Safe)

```sql
-- Adding a column with default
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Adding an index
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);

-- Adding a table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  theme TEXT DEFAULT 'light'
);
```

### Breaking Changes (Careful!)

```sql
-- Renaming: Use multi-step approach
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Step 2: Backfill data
UPDATE users SET full_name = name;

-- Step 3: (After code deploys) Drop old column
ALTER TABLE users DROP COLUMN name;
```

### Rollback Example

```typescript
// migrations/001_add_user_role.ts
export async function up(db: Database) {
  await db.execute(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
}

export async function down(db: Database) {
  await db.execute(`ALTER TABLE users DROP COLUMN role`);
}
```

## Zero-Downtime Checklist

| Change Type | Zero-Downtime Safe? | Strategy |
|-------------|---------------------|----------|
| Add column (nullable/default) | Yes | Direct |
| Add table | Yes | Direct |
| Add index | Yes | CONCURRENTLY |
| Rename column | No | Multi-step |
| Drop column | No | Remove code first |
| Change type | No | Multi-step |

## Tips

- Always write rollback migrations
- Use transactions where supported
- Test migrations on production-like data
- Add indexes CONCURRENTLY in PostgreSQL
- Deploy code that handles both schemas during transition
