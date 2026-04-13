# ID Strategy

## Format: Prefixed ULID

Every entity ID follows the pattern `<prefix>_<ulid>` — e.g., `ord_01HF2M3N4P5QRSTVWXYZ123456`.

- **ULID properties:** 128-bit, time-sortable (48-bit millisecond prefix), Crockford base32 encoded, 26 characters. Case-insensitive and unambiguous — no I/l/O/0 confusion.
- **Prefix per entity type:** `ord_`, `usr_`, `li_`, `pay_`, `evt_`, `aud_`, etc. The prefix makes IDs visible in logs, greppable across systems, and instantly distinguishable by humans.
- **Store as `text`**, not `uuid` type — because prefixed IDs aren't valid UUIDs and Postgres will reject them.
- **Generate at the application layer** using a ULID library. Prefix in code. Never let the database generate IDs — because the app needs the ID before the insert (for outbox events, cross-service references, optimistic UI).

## Why not alternatives

- **Sequential integers:** leak entity count ("you're customer #47"), enable enumeration attacks, cause insert hotspots in distributed databases because every insert contends for the same index leaf page.
- **Plain UUIDs (v4):** not sortable — index fragmentation grows over time. Not human-distinguishable — every ID looks the same in logs. Can't carry a type prefix without breaking the UUID format.
- **nanoid / cuid:** ULIDs give you time-ordering for free, which means your primary key index stays append-mostly. Crockford base32 is a well-specified encoding; nanoid's alphabet is configurable (read: inconsistent across services).

## Edge cases

- Composite IDs (e.g., `tenant_id + entity_id`): both columns are prefixed ULIDs. The composite is the logical key, not a concatenated string.
- External system IDs: store the external ID in a separate column (`stripe_customer_id`). Never reuse external IDs as your primary key — you don't control their format or uniqueness guarantees.
