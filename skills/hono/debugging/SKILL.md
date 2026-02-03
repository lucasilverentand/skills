---
name: hono-debugging
description: Debugs Hono applications with logging, request inspection, error handling, stack traces, and performance profiling. Use when troubleshooting Hono apps, understanding errors, setting up structured logging, debugging middleware chains, or profiling request performance.
allowed-tools: [Read, Glob, Grep, Bash]
---

# Hono Debugging

Guide to debugging and troubleshooting Hono applications.

## Logger Middleware

### Basic Logging

```typescript
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Enable request/response logging
app.use(logger());

// Output:
// --> GET /users
// <-- GET /users 200 23ms
```

### Custom Logger

```typescript
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// Custom print function
app.use(
  logger((message, ...rest) => {
    console.log(new Date().toISOString(), message, ...rest);
  }),
);
```

### Structured Logging

```typescript
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

const structuredLogger = createMiddleware(async (c, next) => {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  c.set("requestId", requestId);

  console.log(
    JSON.stringify({
      type: "request",
      requestId,
      method: c.req.method,
      path: c.req.path,
      timestamp: new Date().toISOString(),
    }),
  );

  await next();

  console.log(
    JSON.stringify({
      type: "response",
      requestId,
      status: c.res.status,
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    }),
  );
});

const app = new Hono();
app.use(structuredLogger);
```

## Request Inspection

### Logging Request Details

```typescript
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

const requestInspector = createMiddleware(async (c, next) => {
  console.log("=== REQUEST ===");
  console.log("Method:", c.req.method);
  console.log("URL:", c.req.url);
  console.log("Path:", c.req.path);
  console.log("Query:", c.req.query());
  console.log("Headers:", Object.fromEntries(c.req.raw.headers));

  if (c.req.method !== "GET") {
    const contentType = c.req.header("content-type");
    if (contentType?.includes("application/json")) {
      const body = await c.req.json();
      console.log("Body:", JSON.stringify(body, null, 2));
    }
  }

  await next();
});

const app = new Hono();

// Only use in development
if (process.env.NODE_ENV === "development") {
  app.use(requestInspector);
}
```

### Conditional Debugging

```typescript
const debugMiddleware = createMiddleware(async (c, next) => {
  const debug =
    c.req.query("debug") === "true" || c.req.header("X-Debug") === "true";

  if (debug) {
    c.set("debug", true);
    console.log("[DEBUG] Request:", {
      method: c.req.method,
      path: c.req.path,
      query: c.req.query(),
    });
  }

  await next();

  if (debug) {
    console.log("[DEBUG] Response:", {
      status: c.res.status,
      headers: Object.fromEntries(c.res.headers),
    });
  }
});
```

## HTTPException Debugging

### Understanding HTTPException

```typescript
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  const user = await findUser(id);

  if (!user) {
    // Create HTTPException with detailed message
    throw new HTTPException(404, {
      message: `User with id '${id}' not found`,
      cause: { id, searchedAt: new Date().toISOString() },
    });
  }

  return c.json(user);
});

// Error handler with full details
app.onError((err, c) => {
  console.error("=== ERROR ===");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  if (err instanceof HTTPException) {
    console.error("Status:", err.status);
    console.error("Cause:", err.cause);
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status,
    );
  }

  return c.json({ error: "Internal Server Error" }, 500);
});
```

### Custom Error Classes

```typescript
class AppError extends HTTPException {
  code: string;

  constructor(status: number, message: string, code: string, cause?: unknown) {
    super(status, { message, cause });
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, `${resource} not found`, "NOT_FOUND", { resource, id });
  }
}

class ValidationError extends AppError {
  constructor(field: string, message: string) {
    super(400, message, "VALIDATION_ERROR", { field });
  }
}

// Usage
app.get("/users/:id", async (c) => {
  const user = await findUser(c.req.param("id"));
  if (!user) {
    throw new NotFoundError("User", c.req.param("id"));
  }
  return c.json(user);
});
```

## Stack Traces

### Preserving Stack Traces

```typescript
app.onError((err, c) => {
  // Log full stack trace in development
  if (process.env.NODE_ENV === "development") {
    console.error("Full error:", err);
    console.error("Stack trace:", err.stack);

    return c.json(
      {
        error: err.message,
        stack: err.stack?.split("\n"),
      },
      500,
    );
  }

  // Production: hide internal details
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  return c.json({ error: "Internal Server Error" }, 500);
});
```

### Error Context

```typescript
const errorContextMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (err) {
    // Add request context to error
    const context = {
      method: c.req.method,
      path: c.req.path,
      query: c.req.query(),
      headers: {
        "user-agent": c.req.header("user-agent"),
        "content-type": c.req.header("content-type"),
      },
      timestamp: new Date().toISOString(),
    };

    console.error("Error context:", JSON.stringify(context, null, 2));
    throw err;
  }
});
```

## Runtime-Specific Debugging

### Cloudflare Workers

```typescript
// Use wrangler tail for live logs
// wrangler tail --format pretty

const app = new Hono();

// Cloudflare console.log appears in wrangler tail
app.use(async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
});

// Access request metadata
app.get("/debug", (c) => {
  return c.json({
    cf: c.req.raw.cf, // Cloudflare-specific request data
    headers: Object.fromEntries(c.req.raw.headers),
  });
});
```

### Node.js

```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

// Enable Node.js debugging
// Run with: node --inspect dist/index.js

// Access Node.js internals
app.get("/debug", (c) => {
  return c.json({
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

serve(app);
```

### Bun

```typescript
// Run with: bun --inspect src/index.ts

import { Hono } from "hono";

const app = new Hono();

// Bun-specific debugging
app.get("/debug", (c) => {
  return c.json({
    bunVersion: Bun.version,
    // Bun provides built-in performance APIs
  });
});

export default app;
```

### Deno

```typescript
// Run with: deno run --inspect-brk --allow-net main.ts

import { Hono } from "npm:hono";

const app = new Hono();

app.get("/debug", (c) => {
  return c.json({
    denoVersion: Deno.version,
  });
});

Deno.serve(app.fetch);
```

## Common Errors and Solutions

### 1. "Cannot read properties of undefined"

**Cause:** Accessing context variables that weren't set.

```typescript
// Problem
app.get("/user", (c) => {
  const user = c.get("user"); // undefined if auth middleware didn't run
  return c.json({ name: user.name }); // Error!
});

// Solution
app.get("/user", (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Not authenticated" }, 401);
  }
  return c.json({ name: user.name });
});
```

### 2. Empty Request Body

**Cause:** Missing or incorrect Content-Type header.

```typescript
// Problem: Client not sending Content-Type
// fetch('/api', { method: 'POST', body: JSON.stringify(data) })

// Solution: Always set Content-Type
// fetch('/api', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(data)
// })

// Debug middleware
app.use(async (c, next) => {
  if (c.req.method !== "GET") {
    const contentType = c.req.header("content-type");
    if (!contentType) {
      console.warn("Warning: No Content-Type header");
    }
  }
  await next();
});
```

### 3. Validator Returns Empty Object

**Cause:** Content-Type mismatch with validator target.

```typescript
// Problem: Using 'json' validator with form data
app.post("/api", zValidator("json", schema), handler);
// Client sends: Content-Type: application/x-www-form-urlencoded

// Solution: Match validator to content type
app.post("/api", zValidator("form", schema), handler);
// OR client sends: Content-Type: application/json
```

### 4. Middleware Not Executing

**Cause:** Middleware registered after routes or path mismatch.

```typescript
// Problem: Middleware after route
app.get("/api/users", handler);
app.use("/api/*", middleware); // Never runs for /api/users

// Solution: Register middleware before routes
app.use("/api/*", middleware);
app.get("/api/users", handler);
```

### 5. CORS Errors

**Cause:** Missing or misconfigured CORS middleware.

```typescript
import { cors } from "hono/cors";

// Problem: No CORS
app.get("/api/data", handler);

// Solution: Add CORS middleware
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### 6. "Headers already sent"

**Cause:** Trying to modify response after it's been sent.

```typescript
// Problem: Middleware modifies after handler returns
app.use(async (c, next) => {
  await next();
  c.header("X-Custom", "value"); // May fail if response already sent
});

// Solution: Modify before next() or use proper response handling
```

### 7. Memory Leaks

**Cause:** Storing data in module-level variables.

```typescript
// Problem: Global state accumulates
const cache = new Map(); // Grows forever

app.get("/data/:id", (c) => {
  const id = c.req.param("id");
  if (!cache.has(id)) {
    cache.set(id, fetchData(id));
  }
  return c.json(cache.get(id));
});

// Solution: Use bounded cache or external storage
import { LRUCache } from "lru-cache";
const cache = new LRUCache({ max: 1000 });
```

## Performance Profiling

### Timing Middleware

```typescript
const timingMiddleware = createMiddleware(async (c, next) => {
  const start = performance.now();

  await next();

  const duration = performance.now() - start;
  c.header("Server-Timing", `total;dur=${duration.toFixed(2)}`);

  if (duration > 1000) {
    console.warn(
      `Slow request: ${c.req.method} ${c.req.path} took ${duration.toFixed(2)}ms`,
    );
  }
});
```

### Detailed Timing

```typescript
app.get("/users", async (c) => {
  const timings: Record<string, number> = {};

  const start = performance.now();
  const users = await db.query("SELECT * FROM users");
  timings.db = performance.now() - start;

  const serializeStart = performance.now();
  const result = JSON.stringify({ users });
  timings.serialize = performance.now() - serializeStart;

  c.header(
    "Server-Timing",
    Object.entries(timings)
      .map(([name, dur]) => `${name};dur=${dur.toFixed(2)}`)
      .join(", "),
  );

  return c.json({ users });
});
```

## Debug Routes

### Health Check with Debug Info

```typescript
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  });
});

// Protected debug endpoint
app.get("/debug", adminAuth, (c) => {
  return c.json({
    env: process.env,
    memory: process.memoryUsage?.(),
    uptime: process.uptime?.(),
  });
});
```

## Best Practices

1. **Use structured logging** in production
2. **Include request IDs** for tracing
3. **Log at appropriate levels** (debug, info, warn, error)
4. **Hide sensitive data** in logs (passwords, tokens)
5. **Set up error monitoring** (Sentry, LogRocket, etc.)
6. **Use environment-specific logging**
7. **Add timing headers** for performance monitoring
8. **Create debug endpoints** (protected in production)
9. **Test error handling** explicitly
10. **Document common errors** for your team
