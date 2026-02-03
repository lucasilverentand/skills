---
name: hono-testing
description: Tests Hono applications with Vitest including route testing, middleware testing, mocking, authentication testing, and Cloudflare Workers testing with miniflare. Use when writing unit tests, integration tests, testing protected routes, mocking databases, or setting up test infrastructure for Hono apps.
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Hono Testing

Comprehensive guide to testing Hono applications.

## Testing Basics

Hono apps are easy to test because they use standard Web APIs. The key method is `app.request()` which simulates HTTP requests.

### Basic Test Structure

```typescript
import { describe, it, expect } from "vitest";
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hello!"));

describe("App", () => {
  it("should return Hello!", async () => {
    const res = await app.request("/");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello!");
  });
});
```

## Test Setup

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing HTTP Methods

### GET Requests

```typescript
import { describe, it, expect } from "vitest";
import app from "./app";

describe("GET requests", () => {
  it("should handle basic GET", async () => {
    const res = await app.request("/users");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");

    const data = await res.json();
    expect(data).toHaveProperty("users");
  });

  it("should handle GET with path params", async () => {
    const res = await app.request("/users/123");

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("123");
  });

  it("should handle GET with query params", async () => {
    const res = await app.request("/search?q=hello&page=2");

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.query).toBe("hello");
    expect(data.page).toBe(2);
  });
});
```

### POST Requests

```typescript
describe("POST requests", () => {
  it("should handle JSON body", async () => {
    const res = await app.request("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "John",
        email: "john@example.com",
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("John");
  });

  it("should handle form data", async () => {
    const formData = new FormData();
    formData.append("name", "John");
    formData.append("email", "john@example.com");

    const res = await app.request("/users", {
      method: "POST",
      body: formData,
    });

    expect(res.status).toBe(201);
  });
});
```

### PUT/PATCH/DELETE Requests

```typescript
describe("Other HTTP methods", () => {
  it("should handle PUT", async () => {
    const res = await app.request("/users/123", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    });

    expect(res.status).toBe(200);
  });

  it("should handle PATCH", async () => {
    const res = await app.request("/users/123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Patched" }),
    });

    expect(res.status).toBe(200);
  });

  it("should handle DELETE", async () => {
    const res = await app.request("/users/123", {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });
});
```

## Testing with Headers

```typescript
describe("Headers", () => {
  it("should handle custom headers", async () => {
    const res = await app.request("/api/data", {
      headers: {
        Authorization: "Bearer token123",
        "X-Custom-Header": "custom-value",
      },
    });

    expect(res.status).toBe(200);
  });

  it("should check response headers", async () => {
    const res = await app.request("/api/data");

    expect(res.headers.get("X-Response-Time")).toBeDefined();
    expect(res.headers.get("Cache-Control")).toBe("max-age=3600");
  });
});
```

## Testing with Environment Variables

Mock environment variables and bindings:

```typescript
describe("Environment", () => {
  const mockEnv = {
    API_KEY: "test-api-key",
    DATABASE_URL: "postgres://test",
    KV: {
      get: vi.fn().mockResolvedValue("cached-value"),
      put: vi.fn().mockResolvedValue(undefined),
    },
  };

  it("should use environment variables", async () => {
    const res = await app.request("/api/config", {}, mockEnv);

    expect(res.status).toBe(200);
  });

  it("should interact with KV", async () => {
    const res = await app.request("/api/cache/key", {}, mockEnv);

    expect(mockEnv.KV.get).toHaveBeenCalledWith("key");
  });
});
```

## Testing Middleware

### Testing Custom Middleware

```typescript
import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth";

describe("authMiddleware", () => {
  it("should reject requests without token", async () => {
    const app = new Hono();
    app.use("/api/*", authMiddleware);
    app.get("/api/protected", (c) => c.text("OK"));

    const res = await app.request("/api/protected");

    expect(res.status).toBe(401);
  });

  it("should accept requests with valid token", async () => {
    const app = new Hono();
    app.use("/api/*", authMiddleware);
    app.get("/api/protected", (c) => c.text("OK"));

    const res = await app.request("/api/protected", {
      headers: { Authorization: "Bearer valid-token" },
    });

    expect(res.status).toBe(200);
  });

  it("should set user in context", async () => {
    const app = new Hono();
    app.use("/api/*", authMiddleware);
    app.get("/api/profile", (c) => {
      const user = c.get("user");
      return c.json(user);
    });

    const res = await app.request("/api/profile", {
      headers: { Authorization: "Bearer valid-token" },
    });

    const data = await res.json();
    expect(data).toHaveProperty("id");
  });
});
```

### Testing Middleware Ordering

```typescript
describe("Middleware ordering", () => {
  it("should execute in correct order", async () => {
    const order: string[] = [];

    const app = new Hono();

    app.use(async (c, next) => {
      order.push("1-before");
      await next();
      order.push("1-after");
    });

    app.use(async (c, next) => {
      order.push("2-before");
      await next();
      order.push("2-after");
    });

    app.get("/", (c) => {
      order.push("handler");
      return c.text("OK");
    });

    await app.request("/");

    expect(order).toEqual([
      "1-before",
      "2-before",
      "handler",
      "2-after",
      "1-after",
    ]);
  });
});
```

## Testing Validation

```typescript
import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.post("/users", zValidator("json", schema), (c) => {
  const data = c.req.valid("json");
  return c.json(data, 201);
});

describe("Validation", () => {
  it("should accept valid data", async () => {
    const res = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John",
        email: "john@example.com",
      }),
    });

    expect(res.status).toBe(201);
  });

  it("should reject invalid email", async () => {
    const res = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John",
        email: "invalid-email",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("should reject missing required fields", async () => {
    const res = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John",
      }),
    });

    expect(res.status).toBe(400);
  });
});
```

## Testing Error Handling

```typescript
import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/error", () => {
  throw new HTTPException(500, { message: "Something went wrong" });
});

app.get("/not-found", () => {
  throw new HTTPException(404, { message: "Resource not found" });
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  return c.json({ error: "Internal Server Error" }, 500);
});

describe("Error handling", () => {
  it("should handle HTTPException", async () => {
    const res = await app.request("/error");

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Something went wrong");
  });

  it("should handle 404", async () => {
    const res = await app.request("/not-found");

    expect(res.status).toBe(404);
  });

  it("should handle undefined routes", async () => {
    const res = await app.request("/does-not-exist");

    expect(res.status).toBe(404);
  });
});
```

## Mocking Dependencies

### Mocking Database

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "./app";
import * as userService from "./services/user";

vi.mock("./services/user");

describe("User routes with mocked service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return users from service", async () => {
    const mockUsers = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];

    vi.mocked(userService.getUsers).mockResolvedValue(mockUsers);

    const app = createApp();
    const res = await app.request("/users");

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.users).toEqual(mockUsers);
    expect(userService.getUsers).toHaveBeenCalled();
  });

  it("should handle service errors", async () => {
    vi.mocked(userService.getUsers).mockRejectedValue(new Error("DB Error"));

    const app = createApp();
    const res = await app.request("/users");

    expect(res.status).toBe(500);
  });
});
```

### Mocking External APIs

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("External API calls", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should handle external API success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "external" }),
    });

    const res = await app.request("/external-data");

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("should handle external API failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const res = await app.request("/external-data");

    expect(res.status).toBe(502); // Bad Gateway
  });
});
```

## Testing with Cloudflare Workers

Use `@cloudflare/vitest-pool-workers` for Cloudflare-specific testing:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineConfig(
  defineWorkersConfig({
    test: {
      poolOptions: {
        workers: {
          wrangler: { configPath: "./wrangler.toml" },
        },
      },
    },
  }),
);
```

```typescript
// test/index.spec.ts
import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("Cloudflare Worker", () => {
  it("should handle request", async () => {
    const request = new Request("http://localhost/");
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
  });
});
```

## Integration Testing

### Testing Full Request Flow

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "./app";
import { setupDatabase, teardownDatabase, seedDatabase } from "./test/helpers";

describe("Integration tests", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    await setupDatabase();
    await seedDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  it("should create and retrieve user", async () => {
    // Create user
    const createRes = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
      }),
    });

    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    // Retrieve user
    const getRes = await app.request(`/users/${created.id}`);

    expect(getRes.status).toBe(200);
    const retrieved = await getRes.json();
    expect(retrieved.name).toBe("Test User");
  });
});
```

## Test Helpers

### Reusable Test Utilities

```typescript
// test/helpers.ts
import type { Hono } from "hono";

export async function makeRequest(
  app: Hono,
  path: string,
  options?: RequestInit & { json?: unknown },
) {
  const { json, ...init } = options || {};

  if (json) {
    init.headers = {
      ...init.headers,
      "Content-Type": "application/json",
    };
    init.body = JSON.stringify(json);
  }

  return app.request(path, init);
}

export async function getJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

// Usage
it("should create user", async () => {
  const res = await makeRequest(app, "/users", {
    method: "POST",
    json: { name: "John", email: "john@example.com" },
  });

  const data = await getJson<{ id: string }>(res);
  expect(data.id).toBeDefined();
});
```

### Authentication Helpers

```typescript
// test/auth-helpers.ts
export function withAuth(headers: HeadersInit = {}, token = "test-token") {
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

// Usage
it("should access protected route", async () => {
  const res = await app.request("/api/protected", withAuth());
  expect(res.status).toBe(200);
});
```

## Best Practices

1. **Test each route independently** - Don't rely on state from previous tests
2. **Mock external dependencies** - Database, APIs, etc.
3. **Test error cases** - Not just happy paths
4. **Use meaningful assertions** - Check status, headers, and body
5. **Keep tests focused** - One behavior per test
6. **Use beforeAll/afterAll** for expensive setup
7. **Clear mocks between tests** with `vi.clearAllMocks()`
8. **Test middleware in isolation** - Create minimal apps for middleware tests
9. **Use type-safe test helpers** - Leverage TypeScript
10. **Run tests in CI** - Ensure they pass before merge
