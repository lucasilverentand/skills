---
name: hono-api-design
description: API design patterns with Hono including REST, RPC, and OpenAPI. Use when designing APIs or setting up Hono RPC.
---

# Hono API Design

Guide to designing well-structured APIs with Hono, including REST patterns, type-safe RPC, and OpenAPI integration.

## Route Organization

### Grouping Routes

```typescript
import { Hono } from "hono";

// users.ts
export const users = new Hono()
  .get("/", (c) => c.json({ users: [] }))
  .get("/:id", (c) => c.json({ id: c.req.param("id") }))
  .post("/", (c) => c.json({ created: true }))
  .put("/:id", (c) => c.json({ updated: true }))
  .delete("/:id", (c) => c.json({ deleted: true }));

// posts.ts
export const posts = new Hono()
  .get("/", (c) => c.json({ posts: [] }))
  .post("/", (c) => c.json({ created: true }));

// index.ts
const app = new Hono().route("/users", users).route("/posts", posts);

export default app;
```

### API Versioning

```typescript
import { Hono } from "hono";

// Version 1
const v1 = new Hono()
  .basePath("/api/v1")
  .get("/users", (c) => c.json({ version: 1, users: [] }));

// Version 2 with breaking changes
const v2 = new Hono()
  .basePath("/api/v2")
  .get("/users", (c) => c.json({ version: 2, data: { users: [] } }));

const app = new Hono().route("/", v1).route("/", v2);

// Routes:
// GET /api/v1/users
// GET /api/v2/users
```

### Resource-Based Structure

```typescript
// Recommended file structure
// src/
// ├── routes/
// │   ├── index.ts
// │   ├── users/
// │   │   ├── index.ts
// │   │   ├── handlers.ts
// │   │   └── schemas.ts
// │   └── posts/
// │       ├── index.ts
// │       ├── handlers.ts
// │       └── schemas.ts

// routes/users/schemas.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const updateUserSchema = createUserSchema.partial();

export const userParamsSchema = z.object({
  id: z.string().uuid(),
});

// routes/users/handlers.ts
import type { Context } from "hono";

export const getUsers = async (c: Context) => {
  const users = await db.query.users.findMany();
  return c.json({ data: users });
};

export const getUser = async (c: Context) => {
  const { id } = c.req.valid("param");
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json({ data: user });
};

// routes/users/index.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
} from "./schemas";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./handlers";

export const users = new Hono()
  .get("/", getUsers)
  .get("/:id", zValidator("param", userParamsSchema), getUser)
  .post("/", zValidator("json", createUserSchema), createUser)
  .put(
    "/:id",
    zValidator("param", userParamsSchema),
    zValidator("json", updateUserSchema),
    updateUser,
  )
  .delete("/:id", zValidator("param", userParamsSchema), deleteUser);
```

## Hono RPC

Type-safe client-server communication with full TypeScript inference.

### Server Setup

```typescript
// server.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

// Define routes with validators for type inference
const routes = app
  .get("/users", async (c) => {
    const users = await getUsers();
    return c.json({ users }, 200);
  })
  .get(
    "/users/:id",
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const user = await getUser(id);
      if (!user) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ user }, 200);
    },
  )
  .post(
    "/users",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    ),
    async (c) => {
      const data = c.req.valid("json");
      const user = await createUser(data);
      return c.json({ user }, 201);
    },
  );

// Export type for client
export type AppType = typeof routes;

export default app;
```

### Client Setup

```typescript
// client.ts
import { hc } from "hono/client";
import type { AppType } from "./server";

const client = hc<AppType>("http://localhost:3000");

// Type-safe API calls
async function main() {
  // GET /users
  const usersRes = await client.users.$get();
  if (usersRes.ok) {
    const data = await usersRes.json();
    console.log(data.users); // Typed!
  }

  // GET /users/:id
  const userRes = await client.users[":id"].$get({
    param: { id: "123" },
  });
  if (userRes.ok) {
    const data = await userRes.json();
    console.log(data.user); // Typed!
  }

  // POST /users
  const createRes = await client.users.$post({
    json: {
      name: "John",
      email: "john@example.com",
    },
  });
  if (createRes.ok) {
    const data = await createRes.json();
    console.log(data.user); // Typed!
  }
}
```

### RPC with Query Parameters

```typescript
// Server
const routes = app.get(
  "/search",
  zValidator(
    "query",
    z.object({
      q: z.string(),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(20),
    }),
  ),
  async (c) => {
    const { q, page, limit } = c.req.valid("query");
    const results = await search(q, page, limit);
    return c.json({ results, page, limit }, 200);
  },
);

// Client
const res = await client.search.$get({
  query: {
    q: "hello",
    page: "1",
    limit: "20",
  },
});
```

### RPC with Path Parameters

```typescript
// Server
const routes = app.get(
  "/posts/:postId/comments/:commentId",
  zValidator(
    "param",
    z.object({
      postId: z.string(),
      commentId: z.string(),
    }),
  ),
  async (c) => {
    const { postId, commentId } = c.req.valid("param");
    return c.json({ postId, commentId });
  },
);

// Client
const res = await client.posts[":postId"].comments[":commentId"].$get({
  param: {
    postId: "123",
    commentId: "456",
  },
});
```

### RPC with Form Data and File Upload

```typescript
// Server
const routes = app.post(
  "/upload",
  zValidator(
    "form",
    z.object({
      title: z.string(),
      file: z.instanceof(File),
    }),
  ),
  async (c) => {
    const { title, file } = c.req.valid("form");
    // Process file
    return c.json({ success: true });
  },
);

// Client
const res = await client.upload.$post({
  form: {
    title: "My Upload",
    file: new File([data], "file.png", { type: "image/png" }),
  },
});
```

### RPC Type Utilities

```typescript
import { hc, InferRequestType, InferResponseType } from "hono/client";
import type { AppType } from "./server";

const client = hc<AppType>("http://localhost:3000");

// Infer request type
type CreateUserRequest = InferRequestType<typeof client.users.$post>["json"];
// { name: string; email: string }

// Infer response type
type CreateUserResponse = InferResponseType<typeof client.users.$post, 201>;
// { user: { id: string; name: string; email: string } }
```

### URL Generation

```typescript
const client = hc<AppType>("http://localhost:3000");

// Get URL without making request
const url = client.users[":id"].$url({
  param: { id: "123" },
});
console.log(url.pathname); // /users/123
console.log(url.href); // http://localhost:3000/users/123
```

## OpenAPI Integration

### Using @hono/zod-openapi

```bash
npm install @hono/zod-openapi
```

```typescript
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

// Define schemas with OpenAPI metadata
const UserSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
  })
  .openapi("User");

const CreateUserSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
  })
  .openapi("CreateUser");

const ErrorSchema = z
  .object({
    error: z.string(),
    message: z.string().optional(),
  })
  .openapi("Error");

// Define route with full OpenAPI spec
const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Create a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Implement route
app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid("json");
  const user = await createUser(data);
  return c.json(user, 201);
});

// Serve OpenAPI spec
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "API documentation",
  },
});

// Serve Swagger UI
app.get("/docs", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' })
        </script>
      </body>
    </html>
  `);
});
```

## Response Patterns

### Consistent Response Format

```typescript
import { Hono } from "hono";

// Response helper
const jsonResponse = <T>(
  data: T,
  meta?: { page?: number; total?: number },
) => ({
  success: true,
  data,
  meta,
  timestamp: new Date().toISOString(),
});

const errorResponse = (message: string, code: string, details?: unknown) => ({
  success: false,
  error: { message, code, details },
  timestamp: new Date().toISOString(),
});

const app = new Hono();

app.get("/users", async (c) => {
  const users = await getUsers();
  return c.json(jsonResponse(users, { total: users.length }));
});

app.get("/users/:id", async (c) => {
  const user = await getUser(c.req.param("id"));
  if (!user) {
    return c.json(errorResponse("User not found", "NOT_FOUND"), 404);
  }
  return c.json(jsonResponse(user));
});
```

### Pagination

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.string().default("createdAt"),
});

const app = new Hono();

app.get("/posts", zValidator("query", paginationSchema), async (c) => {
  const { page, limit, sort, sortBy } = c.req.valid("query");

  const offset = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    getPosts({ offset, limit, sort, sortBy }),
    countPosts(),
  ]);

  return c.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
});
```

### Cursor-Based Pagination

```typescript
import { z } from "zod";

const cursorSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

app.get("/feed", zValidator("query", cursorSchema), async (c) => {
  const { cursor, limit } = c.req.valid("query");

  const items = await getItems({ cursor, limit: limit + 1 });
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return c.json({
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  });
});
```

## Error Handling

### HTTPException

```typescript
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/users/:id", async (c) => {
  const user = await getUser(c.req.param("id"));

  if (!user) {
    throw new HTTPException(404, {
      message: "User not found",
    });
  }

  return c.json(user);
});

// Custom error types
class NotFoundError extends HTTPException {
  constructor(resource: string) {
    super(404, { message: `${resource} not found` });
  }
}

class ValidationError extends HTTPException {
  constructor(details: unknown) {
    super(400, { message: "Validation failed" });
    this.details = details;
  }
  details: unknown;
}

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status,
    );
  }

  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});
```

## Rate Limiting

```typescript
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const rateLimit = ({ limit, windowMs }: RateLimitConfig) => {
  const store = new Map<string, { count: number; resetAt: number }>();

  return createMiddleware(async (c, next) => {
    const key =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For") ||
      "unknown";
    const now = Date.now();

    let record = store.get(key);
    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      store.set(key, record);
    }

    record.count++;

    c.header("X-RateLimit-Limit", limit.toString());
    c.header(
      "X-RateLimit-Remaining",
      Math.max(0, limit - record.count).toString(),
    );
    c.header("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000).toString());

    if (record.count > limit) {
      return c.json(
        {
          error: "Too Many Requests",
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        },
        429,
      );
    }

    await next();
  });
};

const app = new Hono();
app.use("/api/*", rateLimit({ limit: 100, windowMs: 60 * 1000 }));
```

## Best Practices

1. **Use validators** for all input (params, query, body, headers)
2. **Return explicit status codes** for proper RPC type inference
3. **Version your API** from the start
4. **Use consistent response formats**
5. **Document with OpenAPI** for public APIs
6. **Implement pagination** for list endpoints
7. **Add rate limiting** to prevent abuse
8. **Use meaningful error codes** and messages
9. **Keep routes thin** - move logic to services
10. **Export types** for client consumption
