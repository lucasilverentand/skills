# Async Patterns

When to inline vs when to queue — and how to handle background work, cron, and realtime.

## Decision table

| Pattern | When | Tool |
|---|---|---|
| Inline in-request | Short work (<50ms) that the user needs the result of | Just do it |
| Cloudflare Queues | Everything else — email, webhooks, analytics, indexing | Queue message |
| Cron Triggers -> Queue | Scheduled/periodic work | Cron enqueues, never runs logic inline |
| Durable Objects | Per-key state, realtime, coordination | Rate limits, WebSocket rooms, counters |

## Job retries

Exponential backoff + jitter, 8 attempts, then dead-letter queue (DLQ). The DLQ is for human triage, not silent burial — monitor it, alert on it, process it.

## Background job duration

Break at 30 seconds. Workers have CPU time limits. If a job takes longer, split into steps chained via Queue messages — per-step splitting gives you retry granularity and visibility for free. Each step is independently retryable and observable.

## Cron

Cron Triggers that enqueue onto Queues, never run logic inline — because that gives you retry/DLQ for free and keeps cron handlers tiny. A cron handler should be 5 lines: validate, build message, enqueue.

## Outbox pattern

When you need reliable event publishing alongside a DB write: write the state change + event row in the same transaction. A worker drains the outbox and publishes to the Queue. This avoids dual-write inconsistency — without the outbox, a crash between the DB write and the Queue publish loses the event silently.

## Realtime

- **One-way push** (notifications, status updates, progress): SSE. Simpler than WebSocket, works through more proxies, no Durable Object needed.
- **Bidirectional** (chat, collaboration, presence): Durable Objects + WebSocket. DO gives you per-room state and coordination.

## Anti-patterns

- Fire-and-forget HTTP calls for important side effects — if the call fails, the side effect is silently lost.
- Synchronous fan-out when async works — one slow downstream blocks the entire request.
- Cron handlers with complex logic instead of enqueueing — no retry, no DLQ, no visibility.
- DLQs that nobody monitors — equivalent to silently dropping messages.
