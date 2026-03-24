# Logging and Observability

Use [LogTape](https://github.com/dahlia/logtape) for structured logging. Install: `bun add @logtape/logtape`.

## Cloudflare Workers initialization

Workers run in isolates that persist across requests — configure LogTape once per isolate, not per request. Use a module-level flag to guard against reconfiguration:

```ts
// src/lib/logger.ts
import { configure, getConsoleSink, getLogger } from "@logtape/logtape"

let configured = false

export async function configureLogger(logLevel: string = "info"): Promise<void> {
  if (configured) return
  await configure({
    sinks: {
      console: getConsoleSink(),
    },
    loggers: [
      { category: [], level: logLevel as "debug" | "info" | "warning" | "error" | "fatal", sinks: ["console"] },
    ],
    reset: true,
  })
  configured = true
}

export { getLogger }
```

Call it in the app factory, passing `LOG_LEVEL` from the Worker's env bindings:

```ts
// src/app.ts
import { configureLogger } from "./lib/logger"

export function createApp(env: Env) {
  configureLogger(env.LOG_LEVEL ?? "info")

  const app = new OpenAPIHono()
  // ... middleware and routes
  return app
}
```

Add to `wrangler.toml`:

```toml
[vars]
LOG_LEVEL = "info"
```

Override `LOG_LEVEL` per environment via the Cloudflare dashboard (Secrets) — never commit production values.

## Node/Bun initialization (local dev, Railway)

```ts
import { configure, getConsoleSink, type LogRecord } from "@logtape/logtape"

await configure({
  sinks: {
    console:
      process.env.NODE_ENV === "development"
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
    { category: [], level: process.env.LOG_LEVEL ?? "info", sinks: ["console"] },
  ],
  reset: true,
})
```

## Testing

Suppress logs in tests by configuring no sinks:

```ts
import { configure } from "@logtape/logtape"
import { beforeAll } from "bun:test"

beforeAll(async () => {
  await configure({ sinks: {}, loggers: [], reset: true })
})
```

## Using the logger

Get a logger scoped to the module or resource:

```ts
import { getLogger } from "./lib/logger"

const logger = getLogger(["api", "users"])

logger.info("user created", { userId, email })
logger.warn("rate limit approaching", { userId, count, limit })
logger.error("db write failed", { userId, error: e.message })
```

Category naming convention: `["api", "<resource>"]` — mirrors the route hierarchy.

## Log levels

| Level | When to use |
|---|---|
| `debug` | Fine-grained detail useful only in development — query internals, validation steps |
| `info` | Normal operations: resource created/updated/deleted, job completed |
| `warning` | Recoverable issues: retrying, degraded mode, rate limit approaching |
| `error` | Unexpected failures: DB unavailable, third-party API down, unhandled exception |

Log on success as well as failure — a trail of successful operations makes production debugging much easier. Exclude high-volume noise (health checks) from request logging.

## Standard log fields

Every request log entry should include:

| Field | Source |
|---|---|
| `requestId` | Generated in request ID middleware |
| `method` | Request method |
| `path` | Request path |
| `status` | Response status code |
| `latencyMs` | Time between request start and response |
| `userId` | From auth middleware (if authenticated) |
| `apiKeyId` | From auth middleware (if API key — never log the raw key) |

See `middleware.md` for the logger middleware implementation that emits these fields.

## Production log shipping

The Workers runtime captures all `console.*` output automatically:

- **Development**: `wrangler tail` streams live logs to the terminal
- **Production**: enable Cloudflare Logpush in the dashboard → Workers → your Worker → Logs → Logpush. Ship to R2 (cheap retention), Axiom, or Datadog. No code changes needed — Logpush captures Worker console output at the platform level.
