# Auth

The `auth` part provides authentication using Better Auth. All auth configuration lives here — consuming packages import session types and middleware.

## Setup

1. Install: `bun add better-auth`
2. Create `src/auth.ts`:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@scope/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }), // or "pg"
  emailAndPassword: { enabled: true },
});
```

3. Export from `src/index.ts`:

```ts
export type { Session, User } from "better-auth";
export { auth } from "./auth";
export { authMiddleware } from "./middleware";
```

4. Use `auth.$Infer` types in consuming packages — never redefine session types.

## OAuth providers

Add to `betterAuth()` config:

```ts
import { env } from "@scope/config";

socialProviders: {
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
},
```

- Always import `env` from `@scope/config` — never read `process.env` directly
- Callback URL pattern: `https://<domain>/api/auth/callback/<provider>`

## RBAC

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

## Middleware

```ts
export async function authMiddleware(req: Request): Promise<Session | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session;
}
```

- Hono API imports this middleware — see `development/typescript/api`
- Never inline session logic in route handlers

## Session persistence

- **Web (Astro)**: cookies, handled by Better Auth automatically
- **Expo app**: use `@better-auth/expo` for token storage and refresh
- Session tokens should never be stored in localStorage

## Tools

| Tool | Purpose |
|---|---|
| `tools/permission-audit.ts` | All roles and permissions |
| `tools/provider-list.ts` | OAuth providers, callback URLs, status |
| `tools/session-inspect.ts` | Decode and display session token claims |
