# Timestamps & Soft Delete

## Standard timestamp columns
Every table gets these three columns:

```sql
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
deleted_at timestamptz
```

- **`created_at`** is immutable — never update it after insert. It records when the row was born.
- **`updated_at`** is set on every write — either via application code or a database trigger. It answers "when was this last touched?"
- **`deleted_at`** is the soft delete marker. `NULL` = active. Non-null = deleted, with the timestamp recording when.

## Soft delete by default
Hard deletes break foreign key references, destroy audit trails, and make "undo" impossible. Soft delete is the safe default because data recovery is always more valuable than the marginal storage cost.

- **Drizzle query filters** should exclude deleted rows by default. Use `.withDeleted()` to opt in to seeing deleted rows. Because accidental data leaks from forgotten `WHERE deleted_at IS NULL` filters are worse than the mild query overhead.
- **Partial indexes:** add `WHERE deleted_at IS NULL` to frequently-queried indexes so they skip deleted rows entirely. This keeps index size small and queries fast even as soft-deleted rows accumulate.

## When to hard delete
After the retention window (e.g., 30 days) via a scheduled scrub job. This is where GDPR right-to-erasure actually removes data. The soft delete buys you a grace period; the scrub job enforces the legal requirement.

## Anti-patterns
- **`is_deleted boolean`** instead of `deleted_at` — you lose the timestamp, which means you can't answer "when was this deleted?" or implement time-based retention.
- **Forgetting to exclude deleted rows** in new queries — this is why the Drizzle default filter matters. Every new query is a potential leak.
- **No scrub job** — soft-deleted rows accumulate forever, bloating tables and indexes. Schedule the cleanup.
