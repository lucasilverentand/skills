---
name: logging-setup
description: Configures structured logging for applications. Use when setting up logging, configuring log levels, or implementing log aggregation.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Logging Setup

Configures structured logging for applications.

## Your Task

1. **Choose library**: Pino, Winston, or built-in
2. **Configure**: Set up log levels and format
3. **Add context**: Include useful metadata
4. **Integrate**: Add to application
5. **Test**: Verify logs are captured

## Pino (Recommended for Node.js)

```typescript
// logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  base: {
    service: 'my-app',
    version: process.env.APP_VERSION,
  },
});

// Child logger with context
export function createLogger(context: object) {
  return logger.child(context);
}
```

## Usage

```typescript
import { logger, createLogger } from './logger';

// Basic logging
logger.info('Server started');
logger.error({ err }, 'Database connection failed');

// With context
const reqLogger = createLogger({ requestId: req.id });
reqLogger.info({ userId }, 'User logged in');

// Structured data
logger.info({
  event: 'order_created',
  orderId: order.id,
  amount: order.total,
  userId: user.id,
}, 'Order created successfully');
```

## Express/Hono Middleware

```typescript
import { pinoHttp } from 'pino-http';

app.use(pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
}));
```

## Log Levels

| Level | When to Use |
|-------|-------------|
| `fatal` | App cannot continue |
| `error` | Error that needs attention |
| `warn` | Unexpected but handled |
| `info` | Normal operation events |
| `debug` | Development debugging |
| `trace` | Detailed debugging |

## Tips

- Use structured JSON in production
- Include request IDs for tracing
- Don't log sensitive data (passwords, tokens)
- Use appropriate log levels
- Aggregate logs centrally
