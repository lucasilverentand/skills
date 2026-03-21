---
name: cloudflare
description: Deploys and manages Cloudflare Workers, Pages, D1, KV, R2, Service Bindings, Queues, and Cron Triggers using wrangler. Use when deploying a Worker or Pages project, creating or migrating D1 databases, managing KV namespaces, setting environment secrets, configuring routes or custom domains, wiring up inter-worker Service Bindings, setting up async job queues, processing background work with Queues consumers, scheduling recurring tasks with Cron Triggers, or debugging Worker errors and performance issues.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Cloudflare

## Decision Tree

- What is the task?
  - **Deploy a Worker or Pages project** → see "Deploying" below
  - **Manage D1, KV, or R2 resources** → see "Resource Management" below
  - **Configure routes, domains, or DNS** → see "Routing and Domains" below
  - **Set or rotate environment secrets** → see "Secrets and Variables" below
  - **Connect two Workers so one can call the other** → see "Service Bindings" below
  - **Process work asynchronously / offload from request path** → see "Queues" below
  - **Run code on a schedule (cron jobs)** → see "Cron Triggers" below
  - **Diagnose errors or performance issues** → see "Observability" below
  - **Audit bundle size or routes** → run the relevant tool under "Key references"

## Deploying

### Workers

1. Confirm `wrangler.toml` has the correct `name`, `main`, `compatibility_date`, and `account_id`
2. Run `tools/worker-size.ts` — if the bundle exceeds 1 MB (uncompressed) or 25 MB (compressed), reduce imports before deploying
3. Deploy: `bunx wrangler deploy` (add `--env <env>` for staging/production environments)
4. Verify with `bunx wrangler tail` to confirm requests are being handled

### Pages

1. Confirm `wrangler.toml` `[site]` bucket or use `bunx wrangler pages deploy <dist-dir>`
2. For Pages Functions, verify `functions/` directory structure matches routes
3. Deploy: `bunx wrangler pages deploy <dist-dir> --project-name <project>`

### Environment targets

- Always deploy to a named environment (`--env staging`, `--env production`)
- Never use the default environment for production; it has no safeguards

## Resource Management

### D1

1. Run `tools/d1-schema-diff.ts` before any migration — confirm local schema matches remote
2. Apply migrations: `bunx wrangler d1 migrations apply <db-name> --env <env>`
3. For new databases: `bunx wrangler d1 create <db-name>` then add binding to `wrangler.toml`
4. Verify migration applied: `bunx wrangler d1 execute <db-name> --command "SELECT name FROM sqlite_master WHERE type='table'"`

### KV

1. Run `tools/kv-usage.ts` to check namespace sizes before writes
2. Create namespace: `bunx wrangler kv:namespace create <name>`
3. Add the namespace ID to `wrangler.toml` under `[[kv_namespaces]]`
4. Bulk write/delete via `bunx wrangler kv:bulk put` or `delete`

### R2

1. Create bucket: `bunx wrangler r2 bucket create <name>`
2. Add binding to `wrangler.toml` under `[[r2_buckets]]`
3. For public access, configure custom domain on the bucket via the dashboard or `wrangler r2 bucket domain add`

## Routing and Domains

1. Run `tools/route-audit.ts` to list all configured routes and surface conflicts before making changes
2. Add routes in `wrangler.toml` under `[[routes]]` with `pattern` and `zone_name`
3. Custom domains: `bunx wrangler domains add <domain>` (requires DNS proxied through Cloudflare)
4. DNS records: manage via Cloudflare dashboard or Terraform — do not hardcode zone IDs in source

## Secrets and Variables

- **Environment variables** (non-secret): set under `[vars]` in `wrangler.toml` per environment
- **Secrets**: never put in `wrangler.toml`; use `bunx wrangler secret put <KEY> --env <env>` and input value interactively
- List existing secrets: `bunx wrangler secret list --env <env>`
- Rotate a secret: `bunx wrangler secret put <KEY> --env <env>` (overwrites silently)

## Service Bindings

Service Bindings let one Worker call another directly — no public URL, no HTTP round-trip, zero network overhead.

### When to use

- Internal services that should not be exposed to the public internet (auth, billing, internal APIs)
- Worker-to-Worker calls within the same account where latency matters
- Splitting a large Worker into smaller cooperating services

### Configuration

Declare the binding in the **calling** Worker's `wrangler.toml`:

```toml
[[services]]
binding = "AUTH_API"
service = "auth-api"       # must match the target Worker's `name` field
```

For per-environment targets (e.g. staging auth vs. production auth):

```toml
[env.staging]
[[env.staging.services]]
binding = "AUTH_API"
service = "auth-api-staging"

[env.production]
[[env.production.services]]
binding = "AUTH_API"
service = "auth-api"
```

### Calling a bound Worker

The binding is available on `env` and behaves like a `fetch` client:

```ts
// Pass a Request through to the bound Worker
const response = await env.AUTH_API.fetch(request)

// Or construct a new request
const response = await env.AUTH_API.fetch(
  new Request("https://internal/verify-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
)
```

The URL host doesn't matter for internal routing — use a placeholder like `https://internal/` to keep it readable.

### Local development

When using `wrangler dev`, Wrangler resolves Service Bindings to locally running Workers. The target Worker must be running on its own port. In `wrangler.toml`, declare the local port for each bound service:

```toml
[[services]]
binding = "AUTH_API"
service = "auth-api"
```

Wrangler discovers the port from the target Worker's `wrangler dev --port` setting or from `process-compose`. If the target is not running, calls to the binding will fail immediately with a connection error.

### Rules

- Never expose the target Worker via a public route — the whole point is that it stays internal
- The `service` name must exactly match the target Worker's `name` in its own `wrangler.toml`
- Service Bindings do not support streaming request bodies — buffer the body before forwarding if needed
- For typed calls between Hono Workers, use `hono/client` to generate a typed client from the bound Worker's app type

## Queues

Cloudflare Queues decouple async work from the HTTP request path — ideal for webhooks, email, background processing, or any task that should not block a response.

### When to use

- Long-running or unreliable work (calling an external API, sending email, processing an upload)
- Fan-out patterns where one event triggers multiple downstream tasks
- Outbound webhooks that need retry with backoff
- Any work that is acceptable to complete seconds or minutes after the request returns

### Setup

1. Create the queue: `bunx wrangler queues create <queue-name>`
2. Add a **producer binding** to the Worker that enqueues messages:
   ```toml
   [[queues.producers]]
   binding = "MY_QUEUE"
   queue = "my-queue"
   ```
3. Add a **consumer** to the Worker that processes messages:
   ```toml
   [[queues.consumers]]
   queue = "my-queue"
   max_batch_size = 10
   max_batch_timeout = 5      # seconds to wait before flushing a partial batch
   max_retries = 3
   dead_letter_queue = "my-queue-dlq"   # optional, catches exhausted messages
   ```
   The same Worker can be both producer and consumer, or you can split them.

### Sending messages (producer)

```ts
// In a route handler — fire and forget
await env.MY_QUEUE.send({ type: "welcome_email", userId: user.id })

// Send multiple at once
await env.MY_QUEUE.sendBatch([
  { body: { type: "sync_user", userId: "usr_1" } },
  { body: { type: "sync_user", userId: "usr_2" } },
])
```

`send()` is fast — it returns as soon as the message is enqueued, not when it is processed.

### Processing messages (consumer)

Export a `queue` handler alongside `fetch`:

```ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // normal HTTP handler
  },

  async queue(batch: MessageBatch<JobPayload>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const job = message.body
      try {
        await processJob(job, env)
        message.ack()           // mark as successfully processed
      } catch (err) {
        message.retry()         // return to queue for retry
      }
    }
  },
}
```

Rules:
- Always call `message.ack()` on success or `message.retry()` on failure — unacknowledged messages retry automatically when the batch timeout expires, but being explicit is clearer
- Keep consumer logic idempotent — a message may be delivered more than once (at-least-once delivery)
- For batch-acknowledgement: `batch.ackAll()` / `batch.retryAll()` to process all at once

### Dead-letter queues

When a message exhausts its retries, it goes to the dead-letter queue (DLQ). Set up a separate consumer for the DLQ to alert, log, or manually inspect failed jobs:

```toml
[[queues.consumers]]
queue = "my-queue-dlq"
max_batch_size = 5
max_retries = 0       # don't retry DLQ messages
```

### Local development

Queues work locally with `wrangler dev`. Messages are processed in-process — no separate consumer Worker needed. The queue is in-memory only; messages do not persist across `wrangler dev` restarts.

---

## Cron Triggers

Cron Triggers run a Worker on a schedule without an incoming HTTP request. Use for periodic batch jobs, cache warming, data sync, or report generation.

### Configuration

Add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 * * * *"]      # every hour at :00
# Multiple schedules:
# crons = ["0 6 * * *", "0 18 * * *"]   # 6am and 6pm UTC daily
```

Cron expressions follow standard Unix cron syntax (5 fields: minute, hour, day-of-month, month, day-of-week). Times are always UTC.

### Handler

Export a `scheduled` handler alongside `fetch`:

```ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response("ok")
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // ctx.waitUntil() to extend execution beyond the scheduled deadline
    ctx.waitUntil(runDailySync(env))
  },
}
```

`event.scheduledTime` is the Unix timestamp (ms) when the trigger fired. `event.cron` is the cron expression that matched.

### Rules

- Cron triggers run at most once per minute — the finest granularity is `* * * * *`
- Execution time limit is the same as a regular Worker request (CPU time, not wall time)
- For work that takes longer than the CPU limit, enqueue tasks via a Queue and return immediately
- Use `ctx.waitUntil()` for async work that must complete before the Worker instance is recycled

### Local testing

Trigger a cron manually during local development:

```bash
# Call the scheduled handler via the wrangler dev HTTP interface
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

---

## Observability

1. Stream live logs: `bunx wrangler tail --env <env>` — filter by status or sampling rate if noisy
2. For errors: read the exception message and Worker line number, then trace back to source
3. CPU limit exceeded: profile by adding `console.time` around suspect sections; optimize or split into Durable Objects
4. Cold start latency: check bundle size with `tools/worker-size.ts` — large bundles slow cold starts

## Key references

| File | What it covers |
|---|---|
| `tools/worker-size.ts` | Analyze Worker bundle size and flag oversized scripts |
| `tools/d1-schema-diff.ts` | Compare local D1 schema against remote database |
| `tools/route-audit.ts` | List all configured routes and detect conflicts |
| `tools/kv-usage.ts` | Report KV namespace sizes and key counts per binding |
| `tools/queue-audit.ts` | List queues, bindings, consumer config, and DLQ status |
