---
name: api-design
description: Designs API endpoints, generates OpenAPI specs, reviews naming and consistency, detects breaking changes, and generates type-safe client code. Use when designing a new API surface, generating an OpenAPI spec, checking for breaking changes before a release, linting route consistency, or generating a typed client SDK.
allowed-tools: Read Grep Glob Bash Write Edit
---

# API Design

## Decision Tree

- What are you doing?
  - **Designing a new API or endpoints** → see "Designing endpoints" below
  - **Setting up a new API project** → see `references/hono.md` for Hono/TS project setup
  - **Adding middleware or error handling** → see `references/middleware.md`
  - **Adding logging/observability** → see `references/logging.md`
  - **Designing batch operations** → see `references/batch-operations.md`
  - **Adding outbound webhooks** → see `references/webhooks.md`
  - **Setting up API key management** → see `references/api-keys.md`
  - **Designing authentication** → single API or multiple? See `references/auth.md`
  - **Generating or updating an OpenAPI spec** → see `references/hono.md` for generation workflow
  - **Checking for breaking changes** → see "Breaking change detection" below
  - **Linting existing routes** → run `tools/route-lint.ts` and fix reported issues
  - **Generating a client SDK** → run `tools/client-gen.ts <spec-path>` and review output

## Conventions

### Response shape

All responses use an `ok` discriminator:

```json
// Success
{ "ok": true, "data": { ... } }

// Success with pagination
{ "ok": true, "data": [ ... ], "cursor": "next_cursor_token" }

// Error
{ "ok": false, "error": { "code": "INVALID_EMAIL", "message": "...", "details": [] } }
```

- `code` is a machine-readable constant like `INVALID_EMAIL`, `NOT_FOUND`, `RATE_LIMITED`
- `details` is an optional array of field-level validation errors (field name, message, constraint)
- Always return structured error responses — never rely on unhandled exceptions reaching the client

### Status codes

Use granular HTTP status codes — 400 for malformed input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 validation error. Don't collapse everything into 400.

### Naming

- **JSON fields**: camelCase — `createdAt`, `userId`
- **URL paths**: kebab-case — `/project-members`, `/api-keys`
- **Resources**: plural nouns — `/users`, `/projects`
- **Sub-resources**: one level deep max — `/projects/{id}/members`

### IDs

Prefixed nanoids for all resource IDs: `{prefix}_{nanoid}` (e.g. `usr_V1StGXR8Z`, `prj_7mXAn9d3`). Define a prefix per resource type. Use a nanoid library available for your language.

### Versioning

URL prefix: `/v1/users`. Start at `/v1`, bump major version only for breaking changes.

### Authentication

- **Single API**: session-based auth (cookie-based) for browsers, API keys for programmatic access. Middleware checks for session first, falls back to API key. In TypeScript, use Better Auth.
- **Multiple APIs**: central internal auth API issues short-lived JWTs. Public-facing APIs verify the JWT signature locally — no round-trip per request. See `references/auth.md` for the full pattern.
- **Programmatic access**: API keys with `Bearer` token in `Authorization` header (both single and multi-API)

### Pagination

Cursor-based only. Request: `?cursor=abc&limit=20`. Response includes `cursor` (null/absent when no more results). Default limit 20, max 100.

### Filtering and sorting

Simple flat query params: `?status=active&sort=createdAt&order=desc`. Add structured filters per-endpoint only when simple params aren't enough.

### Soft delete

All important resources use `deletedAt` timestamp. Filter out by default, expose `?includeDeleted=true` for admin endpoints. `DELETE` sets the timestamp, never removes the row.

## Designing endpoints

1. Start from the resource, not the operation
2. Define request and response schemas **before** writing the route handler (schema-first always). Use your language's validation library (Zod in TS, Pydantic in Python, serde in Rust, Codable in Swift, etc.)
3. Standard HTTP verbs: `GET` read, `POST` create/action, `PUT`/`PATCH` update, `DELETE` soft-delete
4. Follow all conventions above
5. One router file per resource — each exports a router, mounted in the main app
6. For TypeScript/Hono-specific patterns, see `references/hono.md`

## Testing

Test API routes against a real local database. No mocked DB. Test the full request/response cycle including validation, auth, and response shape. For Hono, use `testClient` — see `references/hono.md`.

## Breaking change detection

1. Obtain the previous spec (last release tag or main branch)
2. Run `tools/breaking-changes.ts <old-spec> <new-spec>`
3. Removed endpoint or required field, changed response type, added required request field → breaking, requires version bump or deprecation cycle
4. Added optional field → non-breaking, safe to ship
5. Never ship breaking changes without communicating to consumers first

## Key references

| File | What it covers |
|---|---|
| `references/hono.md` | TypeScript/Hono: project setup, route structure, OpenAPI via zod-openapi, Scalar, testClient, hono/client |
| `references/auth.md` | Single-API vs multi-API authentication, JWT pattern, Service Bindings |
| `references/middleware.md` | Middleware chain ordering, global error handler, health/readiness endpoints |
| `references/logging.md` | LogTape setup, standard log fields, platform-specific sink configuration |
| `references/batch-operations.md` | Batch endpoint conventions, response strategies, limits |
| `references/webhooks.md` | Outbound webhook payload shape, HMAC signing, delivery |
| `references/api-keys.md` | Key format, hashed storage, per-resource scopes, rotation |
| `tools/openapi-gen.ts` | Generate an OpenAPI spec from route definitions |
| `tools/breaking-changes.ts` | Diff two OpenAPI specs and report breaking changes |
| `tools/route-lint.ts` | Check API routes for naming inconsistencies and missing validation |
| `tools/client-gen.ts` | Generate type-safe client code from an OpenAPI spec |
