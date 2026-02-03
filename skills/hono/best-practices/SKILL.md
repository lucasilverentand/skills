---
name: hono-best-practices
description: Guides Hono application architecture, code organization, error handling, type safety, security, and performance patterns. Use when designing Hono apps, organizing routes and middleware, implementing error handling, optimizing performance, or following Hono conventions and best practices.
allowed-tools: [Read, Glob, Grep]
---

# Hono Best Practices

Guide for building well-architected, maintainable, and performant Hono applications.

## Application Architecture

### App Factory Pattern

Create app instances with proper typing for reusability:

```typescript
import { Hono } from "hono";

type Env = {
  Bindings: {
    DATABASE_URL: string;
    API_KEY: string;
  };
  Variables: {
    user: { id: string; name: string };
  };
};

export function createApp() {
  return new Hono<Env>();
}

// Usage
const app = createApp();
```

### Route Organization

**Group related routes:**

```typescript
import { Hono } from "hono";

// routes/users.ts
const users = new Hono()
  .get("/", (c) => c.json([]))
  .get("/:id", (c) => c.json({ id: c.req.param("id") }))
  .post("/", (c) => c.json({ created: true }));

// routes/posts.ts
const posts = new Hono()
  .get("/", (c) => c.json([]))
  .post("/", (c) => c.json({ created: true }));

// index.ts
const app = new Hono().route("/users", users).route("/posts", posts);

export default app;
```

**Use basePath for API versioning:**

```typescript
const v1 = new Hono()
  .basePath("/api/v1")
  .route("/users", usersV1)
  .route("/posts", postsV1);

const v2 = new Hono().basePath("/api/v2").route("/users", usersV2);

const app = new Hono().route("/", v1).route("/", v2);
```

### Middleware Organization

**Apply middleware in layers:**

```typescript
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";

const app = new Hono();

// Global middleware (all routes)
app.use(logger());
app.use(secureHeaders());
app.use(
  cors({
    origin: ["https://example.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Route-specific middleware
app.use("/api/*", csrf());
app.use("/admin/*", authMiddleware);

// Routes
app.route("/api", apiRoutes);
app.route("/admin", adminRoutes);
```

## Error Handling

### HTTPException

Use `HTTPException` for consistent error responses:

```typescript
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/user/:id", async (c) => {
  const user = await findUser(c.req.param("id"));

  if (!user) {
    throw new HTTPException(404, {
      message: "User not found",
    });
  }

  return c.json(user);
});

// Custom error with response
app.get("/protected", async (c) => {
  const authorized = await checkAuth(c);

  if (!authorized) {
    throw new HTTPException(401, {
      message: "Unauthorized",
      res: new Response("Custom unauthorized response", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="api"',
        },
      }),
    });
  }

  return c.json({ data: "secret" });
});
```

### Global Error Handler

```typescript
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.onError((err, c) => {
  // Log error for debugging
  console.error(`Error: ${err.message}`, err.stack);

  // Handle HTTPException
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // Handle other errors
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500,
  );
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found", path: c.req.path }, 404);
});
```

## Type Safety

### Context Variables

Type context variables for safe access:

```typescript
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

type Variables = {
  user: { id: string; email: string; role: string };
  requestId: string;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware sets typed variables
const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const user = await validateToken(c.req.header("Authorization"));
    c.set("user", user);
    await next();
  },
);

// Handler accesses typed variables
app.get("/profile", authMiddleware, (c) => {
  const user = c.get("user"); // Fully typed
  return c.json({ email: user.email });
});
```

### Environment Bindings

Type environment variables and bindings:

```typescript
type Bindings = {
  // Cloudflare bindings
  KV: KVNamespace;
  DB: D1Database;
  BUCKET: R2Bucket;

  // Environment variables
  API_KEY: string;
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/data", async (c) => {
  const data = await c.env.KV.get("key");
  const apiKey = c.env.API_KEY; // Typed
  return c.json({ data });
});
```

### Validation Type Inference

Let validators infer types:

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).optional(),
});

const app = new Hono();

app.post("/users", zValidator("json", createUserSchema), (c) => {
  const data = c.req.valid("json");
  // data is typed as { name: string; email: string; age?: number }
  return c.json({ id: "123", ...data });
});
```

## Performance Optimization

### Response Streaming

Stream large responses:

```typescript
import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";

const app = new Hono();

// Stream text
app.get("/stream", (c) => {
  return streamText(c, async (stream) => {
    for (let i = 0; i < 100; i++) {
      await stream.writeln(`Line ${i}`);
      await stream.sleep(100);
    }
  });
});

// Stream binary data
app.get("/download", (c) => {
  return stream(c, async (stream) => {
    const data = await fetchLargeData();
    await stream.write(data);
  });
});
```

### Lazy Loading Routes

Load routes only when needed:

```typescript
import { Hono } from "hono";

const app = new Hono();

// Lazy load admin routes
app.route("/admin", async () => {
  const { adminRoutes } = await import("./routes/admin");
  return adminRoutes;
});
```

### Caching

Use cache middleware:

```typescript
import { Hono } from "hono";
import { cache } from "hono/cache";

const app = new Hono();

app.get(
  "/static/*",
  cache({
    cacheName: "my-app-cache",
    cacheControl: "max-age=3600",
  }),
);
```

## Security Best Practices

### Secure Headers

Apply security headers:

```typescript
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono();

app.use(
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
  }),
);
```

### CORS Configuration

Configure CORS properly:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Development
app.use("/api/*", cors());

// Production
app.use(
  "/api/*",
  cors({
    origin: ["https://myapp.com", "https://admin.myapp.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Request-Id"],
    maxAge: 86400,
    credentials: true,
  }),
);
```

### CSRF Protection

Enable CSRF for state-changing requests:

```typescript
import { Hono } from "hono";
import { csrf } from "hono/csrf";

const app = new Hono();

app.use(
  csrf({
    origin: ["https://myapp.com"],
  }),
);
```

### Input Validation

Always validate inputs:

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

// Validate all input sources
app.post(
  "/api/items/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().uuid(),
    }),
  ),
  zValidator(
    "query",
    z.object({
      include: z.enum(["details", "metadata"]).optional(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(100),
      value: z.number().positive(),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { include } = c.req.valid("query");
    const body = c.req.valid("json");

    // All inputs are validated and typed
    return c.json({ success: true });
  },
);
```

### Rate Limiting

Implement rate limiting:

```typescript
import { Hono } from "hono";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = (limit: number, windowMs: number) => {
  return async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") || "unknown";
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= limit) {
      return c.json({ error: "Too many requests" }, 429);
    } else {
      record.count++;
    }

    await next();
  };
};

const app = new Hono();
app.use("/api/*", rateLimit(100, 60000)); // 100 requests per minute
```

## Environment Variables

### Access Pattern

```typescript
import { Hono } from "hono";

type Bindings = {
  DATABASE_URL: string;
  API_KEY: string;
  NODE_ENV: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Access in handlers
app.get("/config", (c) => {
  const isDev = c.env.NODE_ENV === "development";
  return c.json({ isDev });
});

// Access in middleware (Cloudflare pattern)
app.use("/api/*", async (c, next) => {
  const auth = basicAuth({
    username: "admin",
    password: c.env.API_KEY,
  });
  return auth(c, next);
});
```

### Local Development

**Cloudflare (.dev.vars):**

```text
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=dev-secret-key
```

**Node.js (.env):**

```text
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=dev-secret-key
```

## File Organization Example

```text
src/
├── index.ts              # App entry point
├── app.ts                # App factory
├── routes/
│   ├── index.ts          # Route aggregation
│   ├── users.ts          # User routes
│   ├── posts.ts          # Post routes
│   └── auth.ts           # Auth routes
├── middleware/
│   ├── index.ts          # Middleware exports
│   ├── auth.ts           # Auth middleware
│   ├── logging.ts        # Logging middleware
│   └── validation.ts     # Shared validators
├── services/
│   ├── user.service.ts   # User business logic
│   └── post.service.ts   # Post business logic
├── validators/
│   ├── user.ts           # User schemas
│   └── post.ts           # Post schemas
├── types/
│   ├── index.ts          # Shared types
│   └── env.d.ts          # Environment types
└── utils/
    ├── errors.ts         # Error utilities
    └── responses.ts      # Response helpers
```

## Testing Considerations

Structure code for testability:

```typescript
// services/user.service.ts
export const createUserService = (db: Database) => ({
  async findById(id: string) {
    return db.query("SELECT * FROM users WHERE id = ?", [id]);
  },
  async create(data: CreateUserData) {
    return db.insert("users", data);
  },
});

// routes/users.ts
export const createUserRoutes = (
  userService: ReturnType<typeof createUserService>,
) => {
  return new Hono().get("/:id", async (c) => {
    const user = await userService.findById(c.req.param("id"));
    return c.json(user);
  });
};

// Easy to test with mocked service
```
