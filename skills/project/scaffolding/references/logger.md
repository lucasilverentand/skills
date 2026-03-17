# Logger

The `logger` part provides structured logging using pino.

## Setup

1. Create `packages/logger/`
2. Install: `bun add pino && bun add -d pino-pretty`

```ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["password", "token", "secret", "authorization", "*.password", "*.token"],
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined,
});

export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
```

## Usage

```ts
const log = createLogger({ service: "users", requestId: c.get("requestId") });
log.info({ userId }, "user created");
log.error({ err, userId }, "failed to send welcome email");
```

### Log levels

- `trace` — low-level internals, disabled in production
- `debug` — per-request detail useful in development
- `info` — normal operations (service started, job completed)
- `warn` — recoverable issues (retrying, degraded mode)
- `error` — unexpected failures, always include `err` field

## Request tracing

Generate `requestId` per request with `crypto.randomUUID()`, attach in middleware, pass to every `createLogger()` call.

## Transport configuration

- **Development** — `pino-pretty` for human-readable output
- **Production** — raw JSON to stdout, let the platform aggregate
- **Testing** — `level: "silent"` to suppress noise

## Redaction

Always redact: `password`, `token`, `secret`, `authorization`, `cookie`. Use dot-path patterns for nested fields. Run `tools/redact-check.ts` before shipping.

## Tools

| Tool | Purpose |
|---|---|
| `tools/redact-check.ts` | Scan logger calls for fields that should be redacted |
