---
name: auth
description: Configures and maintains the shared auth workspace package using Better Auth. Handles server setup, session types, middleware, OAuth providers, and role-based access control. Use when setting up authentication, adding OAuth providers, defining roles and permissions, or debugging session issues.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Auth

The `auth` part provides authentication for the entire project using Better Auth. All auth configuration lives here — consuming packages import session types and middleware from this package.

## Decision Tree

- What are you doing?
  - **Setting up auth from scratch** → see "Initial setup" below
  - **Adding an OAuth provider** → see "OAuth providers" below
  - **Defining roles and permissions** → see "RBAC" below
  - **Adding auth middleware** → see "Middleware" below
  - **Debugging a session** → run `tools/session-inspect.ts <token>`
  - **Auditing permissions** → run `tools/permission-audit.ts`
  - **Listing providers** → run `tools/provider-list.ts`

## Initial setup

1. Install: `bun add better-auth`
2. Create `src/auth.ts` — main Better Auth server instance:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@scope/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }), // or "pg"
  emailAndPassword: { enabled: true },
  // add plugins and providers here
});
```

3. Export session types from `src/index.ts`:

```ts
export type { Session, User } from "better-auth";
export { auth } from "./auth";
export { authMiddleware } from "./middleware";
```

4. Run `auth.$Infer` types through to consuming packages — never redefine session types.

## OAuth providers

Add to the `betterAuth()` config in `src/auth.ts`:

```ts
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
},
```

- Store client IDs and secrets in `@scope/config` via environment variables — never hardcode
- Run `tools/provider-list.ts` to verify callback URLs match what's registered with the provider
- Callback URL pattern: `https://<domain>/api/auth/callback/<provider>`

## RBAC

Use Better Auth's access plugin for role-based access control:

```ts
import { access } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    access({
      roles: {
        admin: { permissions: ["*"] },
        member: { permissions: ["read"] },
      },
    }),
  ],
});
```

- Define roles in one place — here in `src/auth.ts`
- Export permission types so consuming packages can typecheck against them
- Run `tools/permission-audit.ts` to see all roles and their permissions

## Middleware

Export reusable middleware from `src/middleware.ts`:

```ts
import { auth } from "./auth";

export async function authMiddleware(req: Request): Promise<Session | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session;
}
```

- Hono API imports this middleware — see `project/parts/hono-api`
- Never inline session logic in route handlers

## Session persistence across platforms

- **Web (Astro)**: cookies, handled by Better Auth automatically
- **Expo app**: use `@better-auth/expo` — it handles token storage and refresh
- Session tokens should never be stored in localStorage

## Key references

| File | What it covers |
|---|---|
| `tools/provider-list.ts` | OAuth providers, callback URLs, status |
| `tools/permission-audit.ts` | All roles and permissions |
| `tools/session-inspect.ts` | Decode and display session token claims |
