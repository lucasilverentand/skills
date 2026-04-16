# Pagination
Always paginate list endpoints. Returning unbounded lists is never acceptable — even "small" tables grow, and one slow query under load cascades into an outage.

## Cursor-based (recommended)
Response format:

```json
{
  "data": [{ "id": "ord_abc", "...": "..." }, "..."],
  "meta": {
    "next_cursor": "eyJpZCI6Im9yZF94eXoifQ",
    "has_more": true
  }
}
```

- Default limit: 25. Maximum: 100. Reject requests above max with 422.
- Cursor is **opaque base64** — clients must not parse, construct, or depend on its internal shape. Because the moment clients parse cursors, you cannot change the encoding without breaking them.
- Implementation: encode the last row's sort key (usually the ID or a composite of `created_at` + ID for stable ordering) as base64. On the server, decode it and use it as a `WHERE id > :cursor ORDER BY id LIMIT :limit` clause.

**Why cursor-based is the default:** stable under concurrent writes. When items are inserted or deleted between page requests, cursor pagination stays anchored to a specific row's position in the sort order. It always picks up exactly where it left off.

With offset pagination, if item 0 is deleted between fetching page 1 and page 2, every subsequent item shifts down by one — one item is silently skipped and the client never knows. For feeds, activity logs, or any high-churn data, this is a data integrity bug.

Cursor pagination also performs better on large tables. `OFFSET 10000` forces the database to scan and discard 10,000 rows. `WHERE id > 'last_seen'` seeks directly to the right position using an index.

## Offset-based (acceptable for small, stable data)
Request format: `?page=2&per_page=50`

Response format:

```json
{
  "data": ["..."],
  "meta": {
    "page": 2,
    "per_page": 50,
    "total_count": 142,
    "total_pages": 3
  }
}
```

- Simple and familiar. Every developer understands page numbers.
- `total_count` requires a `COUNT(*)` query — expensive on large tables. Consider omitting it or caching it.
- **Breaks under concurrent writes** — insertions and deletions between pages cause skipped or duplicated items.
- Fine for: admin UIs on small tables, settings pages, reference data that rarely changes.
- Do not use for: feeds, activity streams, search results, or any data where rows are frequently created or deleted.

## Anti-patterns
- **Unbounded lists** — `GET /orders` returning 50,000 rows. Always paginate, even if today the table has 12 rows. Because tables grow and the endpoint will be called by automation that does not paginate voluntarily.
- **Exposing cursor internals** — documenting that the cursor is `base64(JSON({ id, created_at }))`. Clients will parse it, construct fake cursors, and break when you change the format.
- **Offset for high-churn data** — using `?page=3` on a feed where items are posted every second. Pages will skip and duplicate items unpredictably.
- **No max limit** — allowing `?per_page=10000`. Set a hard max (100) and reject anything above it. Because one client requesting 10,000 rows can saturate your database connection pool.
- **Cursor + total_count** — cursor pagination is fundamentally incompatible with total counts. If you need "page 3 of 7", use offset. If you need stability, use cursors. Don't try to have both.
