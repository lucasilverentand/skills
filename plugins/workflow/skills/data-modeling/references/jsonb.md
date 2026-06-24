# JSONB Rules
JSONB is powerful but dangerous. The rule is simple: use it for genuinely variable-shaped data, never as a substitute for proper relational modeling.

## When YES
- **User-extensible fields:** a `metadata jsonb` column for per-tenant custom attributes (e.g., custom fields on a contact record). The schema is defined by the user, not the developer. Validate with Zod at write time.
- **Denormalized read models:** when a join is on the hot path and the data changes infrequently. One read is cheaper than five joins when serving p99 targets. But keep the normalized source of truth and rebuild the JSONB on write — the JSONB is a cache, not the record.
- **Event payloads in outbox tables:** the outbox is a staging area, not a query target. JSONB is fine because you never filter or index into the payload — you just publish it and move on.

## When NO
- **Anything you query, filter, or index on:** use real columns. JSONB queries are slower, harder to optimize, invisible to the type system, and can't have proper foreign keys. `WHERE metadata->>'status' = 'active'` is a code smell.
- **Webhook payloads or API responses stored raw:** parse at the boundary, extract into structured columns. "We'll parse it later" means "we'll never parse it" — and when you need to query it, you'll be writing fragile JSON path expressions against unvalidated blobs.
- **Replacing relational modeling:** if the data has a consistent shape across rows, it belongs in columns. JSONB is for data whose shape varies per row or per tenant.

## Validation rule
Always validate JSONB with Zod at write time. The schema lives in code, not in the database. Postgres doesn't validate JSONB structure — if you don't validate at the app layer, anything can end up in that column.

## Anti-patterns
- Querying deep into JSONB in hot paths — slow, unindexable, untypeable.
- Storing structured data as JSONB because "the schema might change" — schemas always change; that's what migrations are for.
- JSONB columns without Zod validation — guarantees schema drift and garbage data.
