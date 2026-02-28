---
name: logger
description: Creates and maintains a shared structured logging package in a bun workspace monorepo — log levels, transports, context-aware child loggers, request tracing, and automatic field redaction. Use when setting up logging infrastructure, adding log statements, configuring transports for different environments, or auditing logs for sensitive data exposure.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Logger

## Decision Tree

- What are you working on?
  - **New logger package** → follow "Bootstrap" workflow
  - **Adding log calls to a service** → see "Using the logger" section
  - **Configuring transports** → see "Transport configuration" section
  - **Auditing for sensitive fields** → run `tools/redact-check.ts`
  - **Searching logs** → run `tools/log-grep.ts`

## Bootstrap

1. Create `packages/logger/`
2. `package.json`:
   ```json
   {
     "name": "@<project>/logger",
     "type": "module",
     "exports": { ".": "./src/index.ts" }
   }
   ```
3. Pick a structured logging library — prefer `pino` for Bun (fast, JSON output, child logger support)
4. Export a root logger instance and a `createLogger(context)` factory

## Core logger setup

```ts
import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["password", "token", "secret", "authorization", "*.password", "*.token"],
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined,
})

export function createLogger(context: Record<string, unknown>) {
  return logger.child(context)
}
```

## Using the logger

- Import `createLogger` in each service/route, pass a `{ service, requestId }` context
- Use child loggers to carry trace context across async calls
- Log levels:
  - `trace` — low-level internals, disabled in production
  - `debug` — per-request detail useful in development
  - `info` — normal operations (service started, job completed)
  - `warn` — recoverable issues (retrying, degraded mode)
  - `error` — unexpected failures — always include `err` field with the Error object

```ts
const log = createLogger({ service: "users", requestId: c.get("requestId") })
log.info({ userId }, "user created")
log.error({ err, userId }, "failed to send welcome email")
```

## Request tracing

- Generate a `requestId` per request (use `crypto.randomUUID()`)
- Attach to context early in middleware: `c.set("requestId", id)`
- Pass `requestId` to every `createLogger()` call so all logs for a request share the same ID

## Transport configuration

- **Development** — `pino-pretty` transport for human-readable output
- **Production** — raw JSON to stdout, let the platform (Cloudflare, Railway) aggregate
- **Testing** — silent transport (`level: "silent"`) to suppress noise in test output
- Never write log files in containers — stdout only

## Redaction rules

- Always redact: `password`, `token`, `secret`, `authorization`, `cookie`
- Use dot-path patterns to redact nested fields: `"user.password"`, `"*.secret"`
- Run `tools/redact-check.ts` before shipping to catch fields that bypass redaction

## Key references

| File | What it covers |
|---|---|
| `tools/log-grep.ts` | Search structured log output by level, message pattern, or trace ID |
| `tools/transport-list.ts` | List configured transports with target and filter settings |
| `tools/redact-check.ts` | Scan logger calls for fields that should be redacted but are not |
