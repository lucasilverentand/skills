# Logging and Observability

## LogTape setup

Use [LogTape](https://github.com/dahlia/logtape) for structured logging.

### Cloudflare Workers

Configure a console sink — the Workers runtime captures `console.log` output automatically.

- **Development**: use `wrangler tail` for real-time log streaming
- **Production**: enable Cloudflare Logpush to ship logs to an R2 bucket or an external service (Axiom, Datadog)
- No code changes needed beyond LogTape's console sink — Logpush captures Worker output at the platform level

### Node/Bun (local dev, Railway)

Configure a console sink with pretty formatting for dev, JSON formatting for production.

## Standard log fields

Every request log entry should include:

| Field | Source |
|-------|--------|
| `requestId` | Generated in request ID middleware |
| `method` | Request method |
| `path` | Request path |
| `status` | Response status code |
| `latencyMs` | Time between request start and response |
| `userId` | From auth middleware (if authenticated) |
| `apiKeyId` | From auth middleware (if API key used — never log the raw key) |

## Logger middleware

Log after the response is sent. Capture start time before `next()`, compute latency after. Place after the request ID middleware and before the auth middleware in the chain.
