# Offline-First Sync
Use this when the user asks how data should work offline, how sync should be implemented, or whether a proposed sync model is correct.

## Required Concepts
A proper offline-first app needs:

```txt
local source of truth
durable writes
outbox table
idempotency keys
sync cursor
server versions or equivalent conflict detection
tombstones for deletes
retry and failure state
```

## Syncable Entity Metadata
For every syncable entity, include sync metadata.

```txt
tasks
  id                    client-generated UUID
  server_id             nullable until synced
  title
  description
  status
  updated_at
  deleted_at            tombstone for deletes
  sync_state            pending | synced | conflict | deleted
  server_version        version from backend
  base_server_version   version when local edit began
```

Use client-generated IDs so records can exist before the server sees them. Use tombstones for deletes so deletion can sync later. Track server versions so conflicts are explicit rather than accidental.

## Outbox Pattern
Offline mutations need a durable outbox. Do not rely only on optimistic UI.

```txt
outbox
  id
  entity_type
  entity_id
  operation             create | update | delete
  payload_json
  idempotency_key
  created_at
  attempts
  last_error
  status                pending | processing | sent | failed | conflict
```

Write domain changes and outbox rows in the same local transaction.

## Local Write Contract
Every offline-capable mutation should:

```txt
1. validate input
2. open local transaction
3. update domain table
4. insert outbox row
5. commit transaction
6. let UI update from local DB
```

Never update UI optimistically without persisting the pending write.

## Push Contract
When pushing outbox rows:

```txt
send stable idempotency_key
send client entity id
send operation payload
send base_server_version when available
mark row sent only after server accepts it
persist last_error and attempts on failure
```

## Pull Contract
When pulling remote changes:

```txt
use a cursor, timestamp, or server change sequence
apply changes transactionally
respect tombstones
update local server_version
advance cursor only after successful local apply
```

## Sync Engine Contract
A reasonable custom sync loop:

```txt
sync():
  1. acquire sync lock
  2. pull remote changes since sync cursor
  3. apply remote changes in a local transaction
  4. read pending outbox operations in stable order
  5. push operations with idempotency keys and base versions
  6. handle accepted, rejected, conflict, or retryable responses
  7. pull again to receive server-normalized state
  8. update sync cursor
  9. release sync lock
```

Trigger sync on app start, app foreground, network regained, manual refresh, and background task when available.

Background sync is opportunistic. Never design the app as though background tasks run on an exact schedule.

## Conflict Policy
Always state the conflict policy.

```txt
single-user, low-risk fields:
  last-write-wins may be acceptable

multi-device personal data:
  field-level merge or server-version checks are better

shared team data:
  explicit conflict states and user-visible resolution are safer

collaborative documents or realtime editing:
  use a sync product or CRDT/local-first framework instead of hand-rolled REST sync
```

Use explicit outcomes:

```txt
accepted
rejected_validation
conflict
retryable_failure
permanent_failure
```

Do not collapse all failures into "try again later."
