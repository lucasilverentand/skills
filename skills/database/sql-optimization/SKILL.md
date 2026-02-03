---
name: sql-optimization
description: Analyzes and optimizes SQL queries. Use when debugging slow queries, adding indexes, or improving database performance.
argument-hint: [query-or-table]
allowed-tools: [Read, Bash, Glob, Grep]
---

# SQL Optimization

Analyzes and optimizes SQL queries for better performance.

## Your Task

1. **Identify slow queries**: Find problematic queries
2. **Analyze execution**: Use EXPLAIN to understand query plans
3. **Optimize queries**: Rewrite or add indexes
4. **Test improvements**: Measure before and after
5. **Document changes**: Note optimization strategies

## EXPLAIN Analysis

```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- MySQL
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';
```

## Common Optimizations

### Add Indexes

```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
```

### Query Rewrites

```sql
-- Bad: SELECT *
SELECT * FROM users WHERE id = 1;

-- Better: Select only needed columns
SELECT id, name, email FROM users WHERE id = 1;

-- Bad: N+1 queries
SELECT * FROM posts WHERE author_id = 1;
SELECT * FROM posts WHERE author_id = 2;

-- Better: Single query with IN
SELECT * FROM posts WHERE author_id IN (1, 2);

-- Bad: LIKE with leading wildcard
SELECT * FROM users WHERE name LIKE '%john%';

-- Better: Full-text search
SELECT * FROM users WHERE to_tsvector(name) @@ to_tsquery('john');
```

## Index Selection Guide

| Query Pattern | Index Type |
|--------------|------------|
| `WHERE col = value` | B-tree (default) |
| `WHERE col IN (...)` | B-tree |
| `WHERE col BETWEEN` | B-tree |
| `ORDER BY col` | B-tree |
| `WHERE col LIKE 'prefix%'` | B-tree |
| Full-text search | GIN |
| JSON containment | GIN |
| Geospatial | GiST |

## Tips

- Index columns used in WHERE, JOIN, ORDER BY
- Avoid over-indexing (slows writes)
- Use composite indexes for multi-column queries
- Monitor slow query logs regularly
