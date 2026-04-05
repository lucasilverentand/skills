# Background Jobs

Pattern for offloading long-running or non-critical work from HTTP request handlers to background queues on Cloudflare Workers.

## When to use a queue

Offload work to a queue when:
- The operation takes longer than ~500ms (email sending, image processing, PDF generation)
- The result is not needed to complete the HTTP response
- The work should be retried automatically on failure (external API calls, webhooks)
- The work is triggered by an event and should not block the caller (post-signup tasks, notifications)

Keep work synchronous when:
- The caller needs the result in the response (data reads, form submissions)
- The operation is fast enough not to impact response latency
- Failure must prevent the response from succeeding (database writes, auth checks)

## Setup

Add a Queue binding to `wrangler.toml`:

```toml
[[queues.producers]]
binding = "JOB_QUEUE"
queue = "my-job-queue"
```

Create the queue: `bunx wrangler queues create my-job-queue`

Add the binding to the `Env` interface:

```ts
// src/env.ts
export interface Env {
  DB: D1Database
  CACHE: KVNamespace
  JOB_QUEUE: Queue<JobMessage>  // typed with the job message union
  // ...
}
```

## Job message schema

Define a discriminated union for all job types. Use Zod schemas for runtime validation in the consumer:

```ts
// src/jobs/types.ts
import { z } from "zod"

export const sendWelcomeEmailJob = z.object({
  type: z.literal("send_welcome_email"),
  userId: z.string(),
  email: z.string().email(),
})

export const generateReportJob = z.object({
  type: z.literal("generate_report"),
  reportId: z.string(),
  filters: z.record(z.unknown()),
})

// Union of all job types
export const jobSchema = z.discriminatedUnion("type", [
  sendWelcomeEmailJob,
  generateReportJob,
])

export type JobMessage = z.infer<typeof jobSchema>
```

## Enqueuing from a route handler

The standard pattern: accept the request, enqueue the job, return `202 Accepted` with a job ID so the caller can poll for status.

```ts
// src/routes/reports.ts
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { nanoid } from "nanoid"
import type { Env } from "../env"

const app = new Hono<{ Bindings: Env }>()

const createReportSchema = z.object({
  filters: z.record(z.unknown()),
})

app.post("/", zValidator("json", createReportSchema), async (c) => {
  const { filters } = c.req.valid("json")
  const reportId = `rpt_${nanoid(12)}`

  // Persist the job record before enqueuing — consumer may run before the response is sent
  const db = createDb(c.env)
  await db.insert(jobs).values({
    id: reportId,
    type: "generate_report",
    status: "pending",
  })

  await c.env.JOB_QUEUE.send({
    type: "generate_report",
    reportId,
    filters,
  })

  return c.json({ ok: true, data: { jobId: reportId } }, 202)
})

export default app
```

Rules:
- Persist the job record **before** enqueuing — the consumer can run before the caller receives the response
- Return `202 Accepted` (not `200`) to signal the work is async
- Include a `jobId` in the response so the caller can poll for status

## Job status endpoint

Expose a status endpoint so callers can poll for results:

```ts
app.get("/:jobId", async (c) => {
  const jobId = c.req.param("jobId")
  const db = createDb(c.env)

  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  })

  if (!job) return c.json({ ok: false, error: { code: "JOB_NOT_FOUND", message: "Job not found" } }, 404)

  // Pending or running
  if (job.status === "pending" || job.status === "running") {
    return c.json({ ok: true, data: { jobId, status: job.status } })
  }

  // Completed — return the result
  if (job.status === "completed") {
    return c.json({ ok: true, data: { jobId, status: "completed", result: job.result } })
  }

  // Failed
  return c.json({ ok: true, data: { jobId, status: "failed", error: job.errorMessage } })
})
```

## Jobs table schema

```ts
// src/lib/schema/jobs.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] })
    .notNull()
    .default("pending"),
  result: text("result", { mode: "json" }),     // store JSON result
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
```

## Consumer Worker

The consumer is typically a separate Worker (or the same Worker with a `queue` export). See the cloudflare deployment skill for consumer setup, DLQ, and retry configuration.

Consumer responsibilities:
1. Parse and validate the message with the Zod job schema
2. Update job status to `running` before processing
3. Execute the work
4. Update job status to `completed` (with result) or `failed` (with error message)
5. Acknowledge (`message.ack()`) on success, retry (`message.retry()`) on transient failure

```ts
// src/index.ts (or a separate consumer Worker)
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return app.fetch(request, env)
  },

  async queue(batch: MessageBatch<JobMessage>, env: Env): Promise<void> {
    const db = createDb(env)

    for (const message of batch.messages) {
      const parsed = jobSchema.safeParse(message.body)
      if (!parsed.success) {
        // Bad message shape — don't retry, ack to discard
        message.ack()
        continue
      }

      const job = parsed.data
      try {
        await db.update(jobs).set({ status: "running", updatedAt: new Date() }).where(eq(jobs.id, getJobId(job)))

        const result = await processJob(job, env)

        await db.update(jobs)
          .set({ status: "completed", result, updatedAt: new Date() })
          .where(eq(jobs.id, getJobId(job)))

        message.ack()
      } catch (err) {
        await db.update(jobs)
          .set({ status: "failed", errorMessage: String(err), updatedAt: new Date() })
          .where(eq(jobs.id, getJobId(job)))

        message.retry()
      }
    }
  },
}

function getJobId(job: JobMessage): string {
  // Each job type carries its own ID field
  if (job.type === "generate_report") return job.reportId
  if (job.type === "send_welcome_email") return job.userId
  throw new Error(`Unknown job type: ${(job as { type: string }).type}`)
}

async function processJob(job: JobMessage, env: Env): Promise<unknown> {
  switch (job.type) {
    case "generate_report":
      return await generateReport(job, env)
    case "send_welcome_email":
      return await sendWelcomeEmail(job, env)
  }
}
```

## Idempotency

The queue provides at-least-once delivery — a message can be processed more than once. Design consumers to be idempotent:

- Check job status at the start of processing: if `completed`, skip and ack immediately
- Use `INSERT OR IGNORE` (SQLite) or `ON CONFLICT DO NOTHING` (Postgres) for inserts
- For external API calls, use the job ID as an idempotency key in the request header if the API supports it

```ts
// Skip already-completed jobs
const existing = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) })
if (existing?.status === "completed") {
  message.ack()
  return
}
```

## Fire-and-forget (no status tracking)

When the caller doesn't need to track results (e.g., sending a notification), skip the jobs table entirely:

```ts
app.post("/users", zValidator("json", createUserSchema), async (c) => {
  const body = c.req.valid("json")
  const [user] = await db.insert(users).values({ ...body }).returning()

  // Fire and forget — no job record needed
  await c.env.JOB_QUEUE.send({
    type: "send_welcome_email",
    userId: user.id,
    email: user.email,
  })

  return c.json({ ok: true, data: user }, 201)
})
```

Use this when:
- Failure is acceptable (notification may not send)
- Retries are handled at the queue level and you don't need to surface failures to the user
- The caller has no reason to poll for a result
