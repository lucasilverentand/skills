---
name: error-handling
description: Codifies error handling conventions using result types instead of exceptions, defines error code standards, guides migration from throw-based patterns, and audits codebase consistency. Use when setting up error handling in a new project, converting throws to result types, defining error codes for a module, adding error boundaries in UI code, or auditing error handling consistency.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Error Handling

## Decision Tree

- What error handling task?
  - **Setting up error handling in a new project** → see "Result type setup" and "Conventions" below
  - **Converting throws to result types** → see "Migrating from throw-based code" below
  - **Defining error codes for a module** → see "Error codes" below
  - **Adding error boundaries (React/UI)** → see "Error boundaries" below
  - **Handling errors at system boundaries** → see "System boundaries" below
  - **Auditing error handling consistency** → run `tools/error-audit.ts <path>` and fix reported issues
  - **Generating result types and error enums for a module** → run `tools/result-type-gen.ts <module-name>` and integrate output

## Conventions

### Core principle

Return `{ ok, error }` result types instead of throwing. Only throw at system boundaries where the framework expects exceptions (middleware, process-level handlers, unrecoverable panics).

### Result type

All internal functions return a discriminated union:

```ts
type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

interface AppError {
  code: string;
  message: string;
  details?: FieldError[];
}

interface FieldError {
  field: string;
  message: string;
  constraint?: string;
}
```

Helper constructors keep call sites clean:

```ts
function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

Usage:

```ts
async function getUser(id: string): Promise<Result<User>> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) return err({ code: "USER_NOT_FOUND", message: `No user with id ${id}` });
  return ok(user);
}
```

### When to return results

- All internal functions and service-layer methods
- Data access / repository functions
- Validation logic
- Any function where the caller needs to decide how to handle failure

### When to throw

Throwing is correct at **system boundaries** only:

- **Unrecoverable errors**: corrupt state, missing required env vars at startup, assertion failures
- **Framework expectations**: Hono/Express middleware that must throw `HTTPException`, React error boundaries that catch thrown errors
- **Process-level handlers**: top-level `process.on("uncaughtException")` or `Bun.serve` error handlers

At the boundary between result-based internal code and throw-expecting frameworks, convert explicitly:

```ts
app.get("/users/:id", async (c) => {
  const result = await getUser(c.req.param("id"));
  if (!result.ok) {
    throw new HTTPException(mapCodeToStatus(result.error.code), {
      message: result.error.message,
    });
  }
  return c.json({ ok: true, data: result.data });
});
```

### Error codes

- **Format**: `SCREAMING_SNAKE_CASE`
- **Domain-prefixed**: `AUTH_INVALID_TOKEN`, `PAYMENT_DECLINED`, `PROJECT_NOT_FOUND`
- **Generic codes** for cross-cutting concerns: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `INTERNAL_ERROR`
- Define codes as a `const` enum or object per module so they are discoverable and autocomplete-friendly:

```ts
export const AuthErrors = {
  INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  EXPIRED_SESSION: "AUTH_EXPIRED_SESSION",
  INSUFFICIENT_SCOPE: "AUTH_INSUFFICIENT_SCOPE",
} as const;
```

### Error propagation

- **Map at layer boundaries**: a database constraint violation becomes a domain error, which becomes an API error — each layer adds context, never leaks internals
- **Don't let DB errors reach the client**: catch database-specific errors in the repository layer and return a domain-level result
- **Preserve the chain for logging**: attach the original error as a `cause` property when re-wrapping, log it server-side, but strip it from the client response

```ts
async function createUser(input: NewUser): Promise<Result<User>> {
  try {
    const user = await db.insert(users).values(input).returning();
    return ok(user);
  } catch (e) {
    if (e instanceof DatabaseError && e.code === "23505") {
      return err({ code: "USER_ALREADY_EXISTS", message: "A user with this email already exists" });
    }
    // Unknown DB error — log and return generic error
    logger.error("createUser failed", { cause: e });
    return err({ code: "INTERNAL_ERROR", message: "Failed to create user" });
  }
}
```

### Zod validation errors

Convert Zod errors to structured field-level details:

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

### Async error handling

- Always `await` promises — never let a promise float unwatched
- Use `Promise.allSettled` when running independent operations that should not short-circuit each other
- Wrap third-party SDK calls in a try/catch at the integration boundary and return a result

### Logging errors

- Log errors with structured context: error code, operation name, relevant IDs
- Log at the point where the error is **handled**, not where it is created
- Use `warn` for expected failures (validation, not found), `error` for unexpected failures (DB down, unhandled)

## Result type setup

When setting up a new project:

1. Create `src/lib/result.ts` with the `Result<T, E>` type, `ok()`, and `err()` helpers
2. Create `src/lib/errors.ts` with `AppError`, `FieldError` interfaces and the `fromZodError` converter
3. Create domain error code objects per module as the project grows (e.g., `src/modules/auth/errors.ts`)
4. Add a global error handler at the API boundary that converts results to HTTP responses

## Migrating from throw-based code

1. Identify functions that throw for expected cases (not found, invalid input, business rule violations)
2. Change return type to `Promise<Result<T>>`
3. Replace `throw` with `return err(...)` for expected failures
4. Keep `throw` only for truly unexpected errors (or convert those to try/catch + err too)
5. Update all callers to check `result.ok` instead of wrapping in try/catch
6. Run `tools/error-audit.ts <path>` to verify no inconsistencies remain

## Error boundaries

For React/React Native UI code:

- Use React error boundaries to catch rendering errors — these rightfully use throw/catch
- Place boundaries at route level and around independent widget areas
- Show a fallback UI, log the error, offer retry
- For data fetching errors returned as results, handle them inline — don't throw to trigger an error boundary

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: result } = useQuery({ queryKey: ["user", userId], queryFn: () => getUser(userId) });

  if (!result) return <Skeleton />;
  if (!result.ok) return <ErrorCard code={result.error.code} message={result.error.message} />;
  return <ProfileView user={result.data} />;
}
```

## Key references

| File | What it covers |
|---|---|
| `tools/error-audit.ts` | Scan codebase for inconsistent error handling patterns |
| `tools/result-type-gen.ts` | Generate Result type helpers and error code enums for a module |
