# ADR Examples

Two examples showing the shape of a good ADR.

## Example 1: Outbox pattern

```markdown
# 0002. Use the outbox pattern for publishing order events

- Status: accepted
- Date: 2026-04-10
- Deciders: Luca, platform team
- Tags: data, events, reliability

## Context and problem statement

The orders service writes to Postgres then publishes to Cloudflare Queues. Two-step writes risk inconsistency: if the DB commits and the queue fails, consumers never see the event.

## Decision drivers

- At-least-once delivery is a hard requirement
- CF Queues doesn't support 2PC
- Publish latency isn't critical (consumers are async)
- Team knows Postgres, not Kafka/Debezium

## Considered options

- **A:** Direct publish after DB commit
- **B:** Transactional outbox table drained by worker
- **C:** CDC via logical replication

## Decision outcome

**Option B**, because it gives at-least-once delivery with no dual-write risk using only Postgres.

### Consequences

- Good: publishing is transactionally consistent with state change
- Good: events accumulate in DB if queue is down, drain on recovery
- Bad: drain latency bounded by poll interval (~1s)
- Bad: outbox table needs retention cleanup

## Pros and cons

### A: Direct publish
- Good: lowest latency, trivial code
- Bad: dual-write risk -- queue failure = lost event with no retry path

### B: Transactional outbox
- Good: state change + event are atomic
- Good: survives queue outages
- Bad: adds worker process + poll latency

### C: CDC via logical replication
- Good: no application changes needed
- Bad: replication slots are ops-heavy; nobody on team has run it in prod
```

## Example 2: Superseding an ADR

```markdown
# 0007. Move session storage from Redis to Postgres

- Status: accepted, supersedes [0003](0003-redis-sessions.md)
- Date: 2026-05-22
- Deciders: Luca
- Tags: auth, data

## Context and problem statement

ADR-0003 chose Redis for sessions expecting high read volume. Nine months in: volume is 150/s (well within Postgres), Redis is the only stateful service, and a Redis outage took down auth for 12 minutes.

## Decision drivers

- Reduce operational surface (fewer stateful services)
- Postgres has better realized uptime than our Redis instance
- Actual session volume is far below Redis's sweet spot

## Decision outcome

**Postgres**, because Redis's latency advantage doesn't matter at actual traffic, and consolidating removes a service we don't need.

### Consequences

- Good: one less service to operate; Better Auth has Postgres adapter
- Bad: ~5ms extra per session lookup (negligible at this volume)
```
