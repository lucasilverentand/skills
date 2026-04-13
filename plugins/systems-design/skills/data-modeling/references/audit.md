# Audit Logging

Three patterns — pick the right one for each entity based on compliance needs and query patterns.

## Pattern 1: `audit_log` table (default)

Append-only table with columns: `id`, `tenant_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `occurred_at`, `context jsonb`.

- Middleware inserts a row automatically on every mutation. No manual audit calls.
- `context` is JSONB because request metadata (IP, user-agent, request_id) varies per action type.
- No `updated_at`, no `deleted_at` — audit logs are immutable. Never update or delete them. Because an audit log you can edit isn't an audit log.
- Use for: general "who changed what and when" — the baseline for every multi-tenant system.

## Pattern 2: Per-entity `_history` tables

A trigger snapshots the entire old row before UPDATE or DELETE. Stored in `<entity>_history` with same columns plus `history_id`, `changed_at`, `changed_by`.

- Use for: high-value entities (money, legal, compliance) where regulators need the complete before/after record, not just "user X changed order Y."
- More expensive than audit_log — full row copy on every change. Use selectively on entities where the cost is justified.
- The history table has the same schema as the source table, so schema changes require migrating both. Factor this into your migration planning.

## Pattern 3: Event sourcing

The event log IS the source of truth. Current state is derived by replaying events.

- Use ONLY when the domain is genuinely event-shaped: financial ledgers, IoT event streams, collaborative editing.
- Default: **don't use event sourcing.** It adds significant read complexity — every consumer must replay events or maintain a projection. For domains that aren't inherently event-shaped, this complexity buys nothing.

## Decision rule

Start with Pattern 1 for everything. Upgrade to Pattern 2 for entities where regulators or legal teams need full row history. Only reach for Pattern 3 when the domain model is fundamentally a sequence of events.
