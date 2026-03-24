---
name: auth
description: Sets up authentication for APIs using Better Auth — session-based auth for browsers, API keys for programmatic access, multi-API JWT architecture with Service Bindings, RBAC, and scope-based authorization. Use when adding auth to an API, setting up Better Auth, designing multi-API auth with JWTs, implementing API key management, adding role-based access control, or configuring auth middleware.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Authentication

## Current context

- Auth config: !`find src -name "auth.ts" -path "*lib*" -o -name "auth.ts" -path "*config*" 2>/dev/null | head -3`
- Auth middleware: !`grep -rl "sessionAuth\|apiKeyAuth\|authMiddleware" src/ 2>/dev/null | head -5`
- Better Auth: !`grep "better-auth" package.json 2>/dev/null | head -1`

## Decision Tree

- What auth task?
  - **Adding auth to a new API** → single API or multiple? See "Choosing a pattern" below
  - **Setting up Better Auth** → see "Better Auth setup" below
  - **Adding API key support** → see `references/api-keys.md`
  - **Adding role-based access control** → see "RBAC" below
  - **Multi-API JWT architecture** → see `references/auth.md`
  - **Adding auth middleware to routes** → see "Auth middleware" below
  - **Protecting routes with scopes** → see `references/api-keys.md` "Scope checking"

## Choosing a pattern

- **Single API** (one Worker or service) → session-based auth via cookies (Better Auth) + API keys for programmatic access. This is the default.
- **Multiple APIs** (separate deployments sharing users) → internal Auth API issues short-lived JWTs, public APIs verify locally. See `references/auth.md`.

Stick with single-API unless you have independently deployed APIs that need shared auth.

## Better Auth setup

1. Install: `bun add better-auth`
2. Create auth config:

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
});
```

3. Mount auth routes in your Hono app:

```ts
import { auth } from "./lib/auth";

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
```

4. Generate auth tables: `bunx @better-auth/cli generate`
5. Run migration to create the tables

## Auth middleware

Session auth middleware for Hono:

```ts
import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

type Variables = { session: { userId: string; user: User } };

export const sessionAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, 401);
  }
  c.set("session", { userId: session.user.id, user: session.user });
  await next();
});
```

Dual auth (session first, API key fallback):

```ts
export const requireAuth = createMiddleware(async (c, next) => {
  // Try session auth first
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (session) {
    c.set("session", { userId: session.user.id, user: session.user });
    return next();
  }

  // Fall back to API key
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // verify API key (see api-keys.md)
  }

  return c.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, 401);
});
```

## RBAC

Define roles and permissions per resource:

```ts
const roles = {
  admin: ["*"],
  member: ["projects:read", "projects:write", "tasks:read", "tasks:write"],
  viewer: ["projects:read", "tasks:read"],
} as const;

type Role = keyof typeof roles;
```

Permission checking middleware:

```ts
export function requirePermission(permission: string) {
  return createMiddleware(async (c, next) => {
    const { user } = c.get("session");
    const userPerms = roles[user.role as Role] ?? [];
    const hasAccess = userPerms.includes("*") || userPerms.includes(permission);
    if (!hasAccess) {
      return c.json({ ok: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, 403);
    }
    await next();
  });
}
```

Usage:

```ts
app.delete("/v1/projects/:id", sessionAuth, requirePermission("projects:write"), handler);
```

### Resource-level authorization

For per-resource ownership checks (user can only edit their own resources):

```ts
async function authorizeProjectAccess(userId: string, projectId: string): Promise<Result<Project>> {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), isNull(projects.deletedAt)),
  });
  if (!project) return err({ code: "NOT_FOUND", message: "Project not found" });
  if (project.ownerId !== userId) return err({ code: "FORBIDDEN", message: "Not your project" });
  return ok(project);
}
```

## Testing auth

- Test authenticated routes with real sessions — create a test user, call the login endpoint, use the returned session cookie
- Test API key routes by creating a key in the test setup
- Test unauthorized access returns 401
- Test forbidden access (wrong role/scope) returns 403
- Never mock auth in integration tests — test the real middleware chain
