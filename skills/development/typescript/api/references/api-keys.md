# API Key Management

## Key format

- Prefix: `sk_live_` for production, `sk_test_` for development/staging
- Key body: nanoid (32 characters)
- Full example: `sk_test_example00000000000000000000`

## Database schema

```ts
// modules/api-keys/schema.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { newId } from "../db/id";

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => newId("key")),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyHint: text("key_hint").notNull(), // last 4 chars: "...7kP2"
  scopes: text("scopes", { mode: "json" }).$type<string[]>().notNull(),
  ownerId: text("owner_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  index("api_keys_key_hash_idx").on(t.keyHash),
  index("api_keys_owner_id_idx").on(t.ownerId),
]);
```

## Generating and storing keys

```ts
// modules/api-keys/generate.ts
import { nanoid } from "nanoid";

export function generateApiKey(isProduction: boolean): { raw: string; hash: string; hint: string } {
  const prefix = isProduction ? "sk_live_" : "sk_test_";
  const body = nanoid(32);
  const raw = `${prefix}${body}`;

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  const hash = Buffer.from(hashBuffer).toString("hex");

  const hint = `...${raw.slice(-4)}`;
  return { raw, hash, hint };
}
```

- Display the raw key **once** at creation — it cannot be retrieved again
- Store only `hash` and `hint` in the database, never the raw key

## Key verification middleware

```ts
// modules/api-keys/middleware.ts
import { createMiddleware } from "hono/factory";
import { eq, isNull, or, gt } from "drizzle-orm";
import { db } from "../db";
import { apiKeys } from "./schema";

type Variables = { apiKey: typeof apiKeys.$inferSelect };

export const apiKeyAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing API key" } }, 401);
  }

  const raw = authHeader.slice(7);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  const hash = Buffer.from(hashBuffer).toString("hex");

  const key = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, hash),
  });

  if (!key) {
    return c.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid API key" } }, 401);
  }
  if (key.revokedAt) {
    return c.json({ ok: false, error: { code: "UNAUTHORIZED", message: "API key revoked" } }, 401);
  }
  if (key.expiresAt && key.expiresAt < new Date()) {
    return c.json({ ok: false, error: { code: "UNAUTHORIZED", message: "API key expired" } }, 401);
  }

  // Update last used timestamp asynchronously — don't block the request
  c.executionCtx?.waitUntil(
    db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id))
  );

  c.set("apiKey", key);
  await next();
});
```

## Scope checking

```ts
// modules/api-keys/scopes.ts
import { createMiddleware } from "hono/factory";

export function requireScope(scope: string) {
  return createMiddleware(async (c, next) => {
    const key = c.get("apiKey");
    const granted: string[] = key.scopes ?? [];
    const hasAccess = granted.includes("*") || granted.includes(scope);
    if (!hasAccess) {
      return c.json(
        { ok: false, error: { code: "FORBIDDEN", message: `Missing scope: ${scope}` } },
        403,
      );
    }
    await next();
  });
}
```

Usage on a route:

```ts
app.get("/v1/users", apiKeyAuth, requireScope("users:read"), async (c) => { ... });
app.post("/v1/users", apiKeyAuth, requireScope("users:write"), async (c) => { ... });
```

Common scope conventions:
- `{resource}:read` / `{resource}:write` per resource type
- `*` grants full access — use sparingly, for admin keys only

## Key creation endpoint

```ts
app.post("/v1/api-keys", sessionAuth, zValidator("json", createKeySchema), async (c) => {
  const { name, scopes } = c.req.valid("json");
  const { userId } = c.get("session");

  const { raw, hash, hint } = await generateApiKey();

  const [key] = await db.insert(apiKeys).values({
    name,
    keyHash: hash,
    keyHint: hint,
    scopes,
    ownerId: userId,
  }).returning();

  // Return the raw key only once — it cannot be retrieved again
  return c.json({ ok: true, data: { ...key, key: raw } }, 201);
});
```

## Rotation

1. Create a new key (new hash, new hint)
2. Set `expiresAt` on the old key to `now + 7 days` (grace period)
3. After grace period elapses, set `revokedAt` on the old key
4. Revoked keys return 401 immediately

```ts
app.post("/v1/api-keys/:id/rotate", sessionAuth, async (c) => {
  const oldKey = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.id, c.req.param("id")),
  });
  if (!oldKey || oldKey.ownerId !== c.get("session").userId) {
    return c.json({ ok: false, error: { code: "NOT_FOUND", message: "Key not found" } }, 404);
  }

  const { raw, hash, hint } = await generateApiKey();
  const gracePeriod = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [newKey] = await db.transaction(async (tx) => {
    await tx.update(apiKeys)
      .set({ expiresAt: gracePeriod })
      .where(eq(apiKeys.id, oldKey.id));

    return tx.insert(apiKeys).values({
      name: oldKey.name,
      keyHash: hash,
      keyHint: hint,
      scopes: oldKey.scopes,
      ownerId: oldKey.ownerId,
    }).returning();
  });

  return c.json({ ok: true, data: { ...newKey, key: raw } }, 201);
});
```

Log all key creation, rotation, and revocation events for audit purposes.

## Tools

| Tool | Purpose |
|---|---|
| `tools/api-key-audit.ts` | List all active keys, scopes, last-used timestamps, and expiry status |
