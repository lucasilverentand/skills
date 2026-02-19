# Logger

Shared logging: structured logs, levels, and transports.

## Responsibilities

- Configure structured logging
- Define log levels and transports
- Provide context-aware child loggers with request tracing
- Redact sensitive fields from log output automatically
- Manage transport configuration for local development vs production

## Tools

- `tools/log-grep.ts` — search structured log output by level, message pattern, or trace ID
- `tools/transport-list.ts` — list configured log transports with their target and filter settings
- `tools/redact-check.ts` — scan logger calls for fields that should be redacted but are not
