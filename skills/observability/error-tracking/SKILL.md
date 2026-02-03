---
name: error-tracking
description: Sets up error monitoring and tracking. Use when configuring Sentry, implementing error boundaries, or improving error visibility.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Error Tracking

Sets up error monitoring with Sentry or alternatives.

## Your Task

1. **Choose tool**: Sentry, Bugsnag, or similar
2. **Install SDK**: Add to application
3. **Configure**: Set up project and DSN
4. **Add context**: Include user and request data
5. **Test**: Verify errors are captured

## Sentry Setup

```bash
npm install @sentry/node @sentry/profiling-node
# For React/Next.js
npm install @sentry/react @sentry/nextjs
```

## Node.js Configuration

```typescript
// sentry.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

export { Sentry };
```

## Express Integration

```typescript
import * as Sentry from '@sentry/node';
import express from 'express';

const app = express();

// Request handler - must be first
Sentry.setupExpressErrorHandler(app);

// Routes
app.get('/api/users', async (req, res) => {
  // Your code
});

// Error handler - must be after routes
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal error' });
});
```

## React Error Boundary

```tsx
import * as Sentry from '@sentry/react';

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, componentStack) => {
        console.error('Error caught:', error);
      }}
    >
      <MainApp />
    </Sentry.ErrorBoundary>
  );
}
```

## Adding Context

```typescript
// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
});

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});

// Custom context
Sentry.setContext('order', {
  orderId: order.id,
  amount: order.total,
});

// Manual capture
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { orderId },
  });
}
```

## Tips

- Filter sensitive data (passwords, tokens)
- Use source maps for readable stack traces
- Set up alerts for new issues
- Track deployment versions
