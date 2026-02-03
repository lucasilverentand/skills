---
name: tracing
description: Sets up distributed tracing for applications. Use when debugging request flows, understanding service dependencies, or troubleshooting latency.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Distributed Tracing

Sets up distributed tracing with OpenTelemetry.

## Your Task

1. **Install SDK**: Add OpenTelemetry packages
2. **Configure**: Set up tracing provider
3. **Instrument**: Add auto and manual spans
4. **Export**: Send traces to backend
5. **Analyze**: Use tracing UI

## OpenTelemetry Setup

```bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http
```

## Configuration

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION,
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
```

## Manual Instrumentation

```typescript
import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

async function processOrder(order: Order) {
  return tracer.startActiveSpan('processOrder', async (span) => {
    try {
      span.setAttribute('order.id', order.id);
      span.setAttribute('order.amount', order.total);

      // Child span for payment
      await tracer.startActiveSpan('chargePayment', async (paymentSpan) => {
        await paymentService.charge(order);
        paymentSpan.end();
      });

      // Child span for fulfillment
      await tracer.startActiveSpan('createFulfillment', async (fulfillSpan) => {
        await fulfillmentService.create(order);
        fulfillSpan.end();
      });

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## Context Propagation

```typescript
import { context, propagation } from '@opentelemetry/api';

// Extract context from incoming request
app.use((req, res, next) => {
  const ctx = propagation.extract(context.active(), req.headers);
  context.with(ctx, next);
});

// Inject context into outgoing request
const headers = {};
propagation.inject(context.active(), headers);
fetch(url, { headers });
```

## Tracing Backends

- **Jaeger** - Open source, self-hosted
- **Zipkin** - Open source, simple
- **Honeycomb** - SaaS, great querying
- **Datadog** - Full APM suite
- **AWS X-Ray** - AWS native

## Tips

- Start with auto-instrumentation
- Add custom spans for business logic
- Include relevant attributes
- Sample in production (10-100%)
