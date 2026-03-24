---
name: background-jobs
description: Designs background job systems using Cloudflare Queues — job message schemas with Zod discriminated unions, producer patterns in route handlers, consumer Workers with status tracking, idempotent processing, retry strategies, cron triggers for scheduled work, and fire-and-forget patterns. Use when offloading long-running work to a queue, setting up Cloudflare Queues, designing job schemas, implementing consumers, adding cron-triggered tasks, or diagnosing failed jobs.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Background Jobs

## Current context

- Queue config: !`grep -A2 "queues" wrangler.toml wrangler.jsonc 2>/dev/null | head -10`
- Job types: !`find src -name "types.ts" -path "*jobs*" -o -name "jobs.ts" 2>/dev/null | head -3`
- Cron triggers: !`grep -A2 "triggers" wrangler.toml wrangler.jsonc 2>/dev/null | head -5`

## Decision Tree

- What do you need?
  - **Offload work from a request handler** → see `references/background-jobs.md` for the full producer/consumer pattern
  - **Design job message types** → see "Job message schema" below
  - **Set up Cloudflare Queues** → see "Queue setup" below
  - **Build a consumer Worker** → see `references/background-jobs.md` "Consumer Worker"
  - **Add a status polling endpoint** → see `references/background-jobs.md` "Job status endpoint"
  - **Schedule recurring work** → see "Cron triggers" below
  - **Fire-and-forget (no tracking)** → see `references/background-jobs.md` "Fire-and-forget"
  - **Ensure idempotent processing** → see `references/background-jobs.md` "Idempotency"

## When to use a queue

**Offload when:**
- Operation takes >500ms (email, image processing, PDF generation)
- Result not needed for the HTTP response
- Work should auto-retry on failure (external APIs, webhooks)
- Event-triggered work that shouldn't block the caller

**Keep synchronous when:**
- Caller needs the result in the response
- Operation is fast
- Failure must prevent the response from succeeding

## Queue setup

1. Create the queue: `bunx wrangler queues create my-job-queue`
2. Add binding to `wrangler.toml`:

```toml
[[queues.producers]]
binding = "JOB_QUEUE"
queue = "my-job-queue"

[[queues.consumers]]
queue = "my-job-queue"
max_batch_size = 10
max_retries = 3
dead_letter_queue = "my-job-dlq"
```

3. Add to Env type: `JOB_QUEUE: Queue<JobMessage>`

## Job message schema

Define a Zod discriminated union for all job types:

```ts
import { z } from "zod";

export const sendEmailJob = z.object({
  type: z.literal("send_email"),
  userId: z.string(),
  email: z.string().email(),
});

export const generateReportJob = z.object({
  type: z.literal("generate_report"),
  reportId: z.string(),
  filters: z.record(z.unknown()),
});

export const jobSchema = z.discriminatedUnion("type", [
  sendEmailJob,
  generateReportJob,
]);

export type JobMessage = z.infer<typeof jobSchema>;
```

## Producer pattern

```ts
// Persist job record BEFORE enqueuing — consumer may run before response is sent
await db.insert(jobs).values({ id: reportId, type: "generate_report", status: "pending" });
await c.env.JOB_QUEUE.send({ type: "generate_report", reportId, filters });
return c.json({ ok: true, data: { jobId: reportId } }, 202);
```

Rules:
- Return `202 Accepted` (not 200)
- Include `jobId` for status polling
- Persist before enqueue

## Cron triggers

For recurring work (cleanup, reports, sync):

```toml
# wrangler.toml
[triggers]
crons = ["0 */6 * * *", "0 0 * * 1"]
```

Handle in the Worker's `scheduled` export:

```ts
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    switch (event.cron) {
      case "0 */6 * * *":
        ctx.waitUntil(cleanupExpiredSessions(env));
        break;
      case "0 0 * * 1":
        ctx.waitUntil(generateWeeklyReport(env));
        break;
    }
  },
};
```

Cron handlers should be idempotent — safe to run if triggered twice. Use `ctx.waitUntil()` to extend execution beyond the initial response.

## Retry and DLQ

- `max_retries`: number of retry attempts before sending to DLQ
- `dead_letter_queue`: queue for permanently failed messages
- In the consumer: `message.ack()` on success, `message.retry()` on transient failure
- Check job status before processing — skip already-completed jobs for idempotency
- Monitor DLQ for unresolvable failures
