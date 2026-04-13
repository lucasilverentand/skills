# ADR Examples

Two filled-in ADRs to show the shape — not the substance — of a good decision record.

---

## Example 1: Outbox pattern for event publishing

```markdown
# 0002. Use the outbox pattern for publishing order events

- Status: accepted
- Date: 2026-04-10
- Deciders: Luca, platform team
- Tags: data, events, reliability

## Context and problem statement

The orders service writes to Postgres and then publishes a domain event to Cloudflare Queues for downstream consumers (inventory, notifications, analytics). Writing to two systems in sequence risks inconsistency: if the DB commits and the queue publish fails, consumers never learn about the event. We need publishing to be reliable without introducing distributed transactions.

## Decision drivers

- At-least-once delivery to downstream consumers is a hard requirement
- No downstream consumer can run 2PC; Cloudflare Queues doesn't support it anyway
- Publish latency isn't critical — consumers are async
- Team is comfortable with Postgres but not with Kafka/Debezium

## Considered options

- **Option A:** Direct publish from the API after the DB commit
- **Option B:** Transactional outbox table drained by a worker
- **Option C:** Change data capture via logical replication

## Decision outcome

Chosen option: **Option B (transactional outbox)**, because it gives at-least-once delivery with no dual-write risk, uses only Postgres (which the team already runs), and the drain worker is a few hundred lines of code with no new infrastructure.

### Positive consequences

- Event publishing is transactionally consistent with the state change that produced it
- If the queue is down, events accumulate in the outbox table and drain when it recovers
- Easy to replay events by resetting the drain cursor

### Negative consequences

- Publish latency is bounded below by the drain worker's poll interval (~1s)
- The outbox table grows until drained; needs a retention job
- Requires a separate worker process — more to deploy and monitor than direct publish

## Pros and cons of the options

### Option A: Direct publish after DB commit

API writes to Postgres, commits, then calls the queue. Simple but fragile.

- Good: lowest latency, no extra infrastructure
- Good: trivial to implement
- Bad: dual-write risk — if the queue call fails, the event is lost with no retry path
- Bad: retries risk double-publishing because the DB write is already committed

### Option B: Transactional outbox table

API writes the state change and the event row in the same DB transaction. A worker polls the outbox table and publishes to the queue, marking rows as sent.

- Good: exactly-once relative to the DB; the state change and the event are atomic
- Good: survives queue outages by buffering in the DB
- Good: uses only tech the team already operates
- Bad: adds drain latency (poll interval)
- Bad: outbox table needs maintenance (retention, vacuum pressure)

### Option C: CDC via logical replication

Use Postgres logical replication to stream changes to a consumer that publishes to the queue.

- Good: no application changes; works for any write
- Bad: ops burden — replication slots, publication management, catchup after restart
- Bad: no one on the team has run logical replication in production before
- Bad: harder to reason about what triggers what

## Links

- [0001-postgres-for-orders.md](0001-postgres-for-orders.md)
- Design doc: .context/architecture/orders-service.md
- Reference: https://microservices.io/patterns/data/transactional-outbox.html
```

---

## Example 2: Superseding an earlier ADR

```markdown
# 0007. Move session storage from Redis to Postgres

- Status: accepted, supersedes [0003](0003-redis-sessions.md)
- Date: 2026-05-22
- Deciders: Luca
- Tags: auth, data

## Context and problem statement

ADR-0003 chose Redis for session storage when we expected high read volume and short sessions. Nine months in: session volume is far lower than projected, Redis is the only stateful service in an otherwise stateless stack, and a Redis outage last month took down auth for 12 minutes despite sessions being short-lived.

## Decision drivers

- Reduce operational surface: fewer stateful services to monitor and back up
- Availability: Postgres (Neon) has a better realized uptime than our Redis instance
- Observed session read volume is ~150/s, well within Postgres capacity

## Considered options

- **Option A:** Keep Redis, improve its availability (replica, failover)
- **Option B:** Move sessions to Postgres
- **Option C:** Use Cloudflare KV for sessions

## Decision outcome

Chosen option: **Option B (Postgres)**, because the expected benefit of Redis (latency) turned out not to matter at actual traffic, and consolidating on Postgres removes a stateful service we don't need.

### Positive consequences

- One less service to operate
- Better Auth already has a Postgres adapter
- Session reads can join with user data in one query

### Negative consequences

- Adds ~5ms to session lookups vs Redis
- Slight write pressure on Postgres (negligible at current volume)

## Pros and cons of the options

### Option A: Keep Redis, add replica + failover

- Good: keeps the latency advantage
- Bad: doubles the Redis cost for a service we barely use
- Bad: replica setup adds operational complexity we don't need

### Option B: Move sessions to Postgres

- Good: consolidates state in one DB
- Good: Better Auth supports this natively
- Bad: ~5ms extra latency per auth check

### Option C: Cloudflare KV

- Good: globally distributed, no ops
- Bad: eventually consistent — bad fit for session revocation
- Bad: KV writes are slow; login would feel sluggish

## Links

- Supersedes [0003-redis-sessions.md](0003-redis-sessions.md)
```
