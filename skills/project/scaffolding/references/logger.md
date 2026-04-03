# Logger

The `logger` part provides structured logging using LogTape.

## Setup

1. Create `packages/logger/`
2. Install: `bun add @logtape/logtape`

```ts
import { configure, getConsoleSink, getLogger, type LogRecord } from "@logtape/logtape"

export async function setupLogger(opts: { isDev: boolean; level?: string }) {
  await configure({
    sinks: {
      console: opts.isDev
        ? getConsoleSink()
        : {
            handle(record: LogRecord) {
              process.stdout.write(
                JSON.stringify({
                  level: record.level,
                  category: record.category.join("."),
                  message: record.message,
                  ...record.properties,
                  timestamp: new Date(record.timestamp).toISOString(),
                }) + "\n"
              )
            },
          },
    },
    loggers: [
      { category: [], level: opts.level ?? "info", sinks: ["console"] },
    ],
    reset: true,
  })
}

export { getLogger }
```

Call `setupLogger()` once at app startup before serving requests. Pass config values from the `config` package — never read `process.env` directly in the logger.

## Usage

```ts
const logger = getLogger(["users"])

logger.info("user created", { userId })
logger.error("failed to send welcome email", { userId, error })
```

For request-scoped context, pass shared fields on each call or wrap in a helper:

```ts
export function createLogger(category: string[], context: Record<string, unknown>) {
  const base = getLogger(category)
  return {
    debug: (message: string, extra?: Record<string, unknown>) =>
      base.debug(message, { ...context, ...extra }),
    info: (message: string, extra?: Record<string, unknown>) =>
      base.info(message, { ...context, ...extra }),
    warn: (message: string, extra?: Record<string, unknown>) =>
      base.warn(message, { ...context, ...extra }),
    error: (message: string, extra?: Record<string, unknown>) =>
      base.error(message, { ...context, ...extra }),
  }
}
```

```ts
const log = createLogger(["api", "users"], { requestId: c.get("requestId") })
log.info("user created", { userId })
log.error("db write failed", { error })
```

### Log levels

- `debug` — per-request detail useful in development
- `info` — normal operations (service started, job completed)
- `warning` — recoverable issues (retrying, degraded mode)
- `error` — unexpected failures, always include the `error` field
- `fatal` — process-crashing failures

## Request tracing

Generate a `requestId` per request with `nanoid(12)`, attach it in middleware, and pass it to every logger call. See the `api` skill's `middleware.md` for the full request ID middleware.

## Sink configuration

- **Development** — `getConsoleSink()` for human-readable, colored output
- **Production (Cloudflare Workers)** — `getConsoleSink()` only; Workers captures `console.*` automatically. Enable Cloudflare Logpush to ship logs to R2 or an external service (Axiom, Datadog)
- **Production (Bun on Railway)** — custom JSON sink writing to stdout
- **Testing** — configure no sinks, or set `level: "fatal"` to suppress noise

## Redaction

Never log raw secrets. Keep a deny-list of fields to omit or mask:

```ts
const REDACTED_FIELDS = new Set(["password", "token", "secret", "authorization", "cookie"])

export function redact(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      REDACTED_FIELDS.has(k.toLowerCase()) ? "[REDACTED]" : v,
    ])
  )
}
```

Always pass user-supplied data through `redact()` before logging. Run `tools/redact-check.ts` before shipping.

## Tools

| Tool | Purpose |
|---|---|
| `tools/redact-check.ts` | Scan logger calls for fields that should be redacted |
