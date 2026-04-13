# Observability

Logging, tracing, metrics, alerting, and access logs.

## Logging

Pino structured JSON logs. Child loggers per request carrying `request_id`. Every log line includes the request ID — it's the fastest way to debug a support ticket across services.

Strict blocklist auto-redaction: passwords, tokens, secrets, cookies, emails, IPs, names, phones, user-agent -> `[REDACTED]`. Because we're privacy-first and a single leaked PII field in logs creates a compliance incident.

## Request IDs

The first Worker generates a ULID (or uses CF-Ray). Propagated via `X-Request-Id` header to all downstream calls. Every log line includes it. Returned to the client in responses.

## Metrics

Workers Analytics Engine — native CF, queryable with SQL, no external dependency. Track RED metrics (rate, errors, duration) per endpoint. RED tells you the health of every endpoint at a glance.

## Tracing

OTel SDK wired from day 1. Spans propagate via headers; traces correlate with logs via `trace_id`. Don't wait until you have problems to add tracing — retrofitting distributed tracing is painful because you have to touch every service and every call site.

## Alerting

Symptom-based SLO alerts (error rate, p99 latency, availability) + a few cause alerts for known bad signals (DB connection pool exhausted, queue backed up, disk full).

Symptoms page for user impact; cause alerts speed up triage. Anti-pattern: alerting on every metric (alert fatigue — people stop reading alerts) or only on causes (miss novel failure modes that don't match any cause alert).

## Access logs

CF Logpush to R2 (EU bucket). Retained 90 days. Because compliance, debugging, and abuse detection all need raw access data, and R2 is cheap, durable, and in-region.

## Anti-patterns

- No structured logging (grep-based debugging in production).
- Logging PII in plaintext.
- Adding tracing "later" — later never comes, and when it does, the retrofit touches every service.
- Alert on every metric — alert fatigue makes real alerts invisible.
