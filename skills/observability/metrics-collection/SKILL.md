---
name: metrics-collection
description: Implements application metrics collection. Use when adding custom metrics, setting up dashboards, or monitoring application health.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Metrics Collection

Implements application metrics for monitoring.

## Your Task

1. **Identify metrics**: Determine what to measure
2. **Choose tool**: Prometheus, StatsD, or cloud provider
3. **Instrument**: Add metrics to code
4. **Export**: Expose metrics endpoint
5. **Visualize**: Create dashboards

## Prometheus with prom-client

```bash
npm install prom-client
```

```typescript
// metrics.ts
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register: registry });

// Custom metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [registry],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [registry],
});
```

## Middleware

```typescript
import { httpRequestsTotal, httpRequestDuration } from './metrics';

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const labels = {
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    end(labels);
  });

  next();
});
```

## Metrics Endpoint

```typescript
import { registry } from './metrics';

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.send(await registry.metrics());
});
```

## Common Metrics

| Metric Type | Use Case | Example |
|-------------|----------|---------|
| Counter | Totals that only increase | Requests, errors, orders |
| Gauge | Values that go up/down | Active users, queue size |
| Histogram | Distribution of values | Response times, sizes |
| Summary | Percentiles (client-side) | Latency percentiles |

## Business Metrics

```typescript
// Track business events
export const ordersTotal = new Counter({
  name: 'orders_total',
  help: 'Total orders placed',
  labelNames: ['status', 'payment_method'],
});

export const orderValue = new Histogram({
  name: 'order_value_dollars',
  help: 'Order value in dollars',
  buckets: [10, 50, 100, 500, 1000],
});
```

## Tips

- Use labels for dimensions
- Keep cardinality low
- Name metrics clearly
- Document what metrics mean
