---
name: errors
description: Codifies API error handling using result types instead of exceptions — defines the Result type, error code standards, HTTP status mapping, error propagation across layers, Zod validation error conversion, and migration from throw-based patterns. Use when setting up error handling in a new API, converting throws to result types, defining error codes, mapping errors to HTTP responses, or auditing error handling consistency.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Error Handling

## Current context

- Result type: !`find src -name "result.ts" -o -name "errors.ts" 2>/dev/null | head -3`
- Error patterns: !`grep -rl "{ ok:" src/ 2>/dev/null | wc -l | tr -d ' '` files using result types

## Decision Tree

- What error handling task?
  - **Setting up error handling in a new project** → see "Setup" below
  - **Converting throws to result types** → see "Migrating" below
  - **Defining error codes for a module** → see "Error codes" below
  - **Mapping errors to HTTP responses** → see "HTTP mapping" below
  - **Auditing consistency** → run `tools/error-audit.ts <path>`
  - **Generating result types for a module** → run `tools/result-type-gen.ts <module-name>`

## Core principle

Return `{ ok, error }` result types instead of throwing. Only throw at system boundaries where the framework expects exceptions.

## Result type

```ts
type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

interface AppError {
  code: string;
  message: string;
  details?: FieldError[];
}

function ok<T>(data: T): Result<T, never> { return { ok: true, data }; }
function err<E = AppError>(error: E): Result<never, E> { return { ok: false, error }; }
```

## When to return results vs throw

**Return results:**
- Service-layer methods, data access, validation logic
- Any function where the caller decides how to handle failure

**Throw only at system boundaries:**
- Unrecoverable errors (corrupt state, missing env vars at startup)
- Framework expectations (Hono `HTTPException`, React error boundaries)
- Process-level handlers

At the boundary, convert explicitly:

```ts
app.get("/users/:id", async (c) => {
  const result = await getUser(c.req.param("id"));
  if (!result.ok) {
    throw new HTTPException(mapCodeToStatus(result.error.code), { message: result.error.message });
  }
  return c.json({ ok: true, data: result.data });
});
```

## Error codes

- Format: `SCREAMING_SNAKE_CASE`
- Domain-prefixed: `AUTH_INVALID_TOKEN`, `PAYMENT_DECLINED`, `PROJECT_NOT_FOUND`
- Generic codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `INTERNAL_ERROR`

Define codes per module:

```ts
export const AuthErrors = {
  INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  EXPIRED_SESSION: "AUTH_EXPIRED_SESSION",
  INSUFFICIENT_SCOPE: "AUTH_INSUFFICIENT_SCOPE",
} as const;
```

## HTTP mapping

| Error code pattern | HTTP status |
|---|---|
| `VALIDATION_ERROR` | 422 |
| `NOT_FOUND`, `*_NOT_FOUND` | 404 |
| `UNAUTHORIZED`, `AUTH_*` | 401 |
| `FORBIDDEN`, `INSUFFICIENT_*` | 403 |
| `*_ALREADY_EXISTS`, `CONFLICT` | 409 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

## Error propagation

- Map at layer boundaries: DB error → domain error → API error
- Don't let DB errors reach the client
- Attach original error as `cause` for logging, strip from client response

```ts
async function createUser(input: NewUser): Promise<Result<User>> {
  try {
    const user = await db.insert(users).values(input).returning();
    return ok(user);
  } catch (e) {
    if (e instanceof DatabaseError && e.code === "23505") {
      return err({ code: "USER_ALREADY_EXISTS", message: "A user with this email already exists" });
    }
    logger.error("createUser failed", { cause: e });
    return err({ code: "INTERNAL_ERROR", message: "Failed to create user" });
  }
}
```

## Zod validation errors

Convert to structured field-level details:

```ts
function fromZodError(zodError: z.ZodError): AppError {
  return {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    details: zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      constraint: issue.code,
    })),
  };
}
```

## Setup

For a new project:

1. Create `src/lib/result.ts` — `Result<T, E>`, `ok()`, `err()` helpers
2. Create `src/lib/errors.ts` — `AppError`, `FieldError`, `fromZodError`
3. Add domain error code objects per module as the project grows
4. Add a global error handler at the API boundary

## Migrating

1. Identify functions that throw for expected cases
2. Change return type to `Promise<Result<T>>`
3. Replace `throw` with `return err(...)` for expected failures
4. Keep `throw` only for truly unexpected errors
5. Update callers to check `result.ok` instead of try/catch
6. Run `tools/error-audit.ts <path>` to verify

## Tool reference

| Tool | What it does |
|---|---|
| `tools/error-audit.ts` | Scan for inconsistent error handling patterns |
| `tools/result-type-gen.ts` | Generate Result type helpers and error enums for a module |
