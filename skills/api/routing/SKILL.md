---
name: routing
description: Designs API endpoints with Hono, builds middleware chains, generates OpenAPI specs, detects breaking changes, scaffolds routes with validation boilerplate, and handles file uploads, webhooks, and batch operations. Use when designing new API routes, setting up a Hono project, adding middleware or error handling, generating OpenAPI specs or client SDKs, working with webhooks, batch endpoints, or file uploads.
allowed-tools: Read Grep Glob Bash Write Edit
---

# API Routing

## Current context

- Routes: !`find src -name "*.ts" -path "*/routes*" 2>/dev/null | head -10`
- App entry: !`find src -name "index.ts" -o -name "app.ts" 2>/dev/null | head -3`

## Decision Tree

- What are you doing?
  - **Setting up a new API project** → see `references/hono.md` for Hono project setup
  - **Deploying as a Cloudflare Worker** → see `references/workers-project.md` for wrangler config, Env type, and bindings
  - **Designing new endpoints** → see "Designing endpoints" below
  - **Adding middleware or error handling** → see `references/middleware.md`
  - **Adding logging/observability** → see `references/logging.md`
  - **Designing batch operations** → see `references/batch-operations.md`
  - **Adding outbound or inbound webhooks** → see `references/webhooks.md`
  - **Implementing file uploads** → see `references/file-uploads.md`
  - **Generating or updating an OpenAPI spec** → see `references/hono.md`
  - **Setting up Scalar API docs** → see `references/hono.md` "Option B: Static spec + Scalar"
  - **Checking for breaking changes** → run `tools/breaking-changes.ts <old-spec> <new-spec>`
  - **Linting existing routes** → run `tools/route-lint.ts`
  - **Generating a client SDK** → run `tools/client-gen.ts <spec-path>`
  - **Listing registered routes** → run `tools/route-list.ts`
  - **Auditing middleware stack** → run `tools/middleware-audit.ts`
  - **Scaffolding a new endpoint** → run `tools/endpoint-scaffold.ts`

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

- `code` is a machine-readable constant: `INVALID_EMAIL`, `NOT_FOUND`, `RATE_LIMITED`
- `details` is an optional array of field-level validation errors
- Never rely on unhandled exceptions reaching the client

### Status codes

Use granular HTTP status codes: 400 malformed input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 validation error. Don't collapse everything into 400.

### Naming

- **JSON fields**: camelCase — `createdAt`, `userId`
- **URL paths**: kebab-case — `/project-members`, `/api-keys`
- **Resources**: plural nouns — `/users`, `/projects`
- **Sub-resources**: one level deep max — `/projects/{id}/members`

### IDs

Prefixed nanoids: `{prefix}_{nanoid}` (e.g. `usr_V1StGXR8Z`, `prj_7mXAn9d3`). One prefix per resource type.

### Versioning

URL prefix: `/v1/users`. Bump major version only for breaking changes.

### Pagination

Cursor-based only. `?cursor=abc&limit=20`. Response includes `cursor` (null when done). Default 20, max 100.

### Filtering and sorting

Flat query params: `?status=active&sort=createdAt&order=desc`. Structured filters only when simple params aren't enough.

### Soft delete

`deletedAt` timestamp column. Filter out by default, `?includeDeleted=true` for admin endpoints. `DELETE` sets the timestamp, never removes the row.

## Designing endpoints

1. Start from the resource, not the operation
2. Define request and response schemas **before** writing the handler (schema-first)
3. Standard HTTP verbs: `GET` read, `POST` create/action, `PUT`/`PATCH` update, `DELETE` soft-delete
4. One router file per resource, mounted in the main app
5. For Hono patterns, see `references/hono.md`

## Testing

Test API routes against a real local database — no mocked DB. Test the full request/response cycle including validation, auth, and response shape. For Hono, use `testClient` — see `references/hono.md`.

## Breaking change detection

1. Obtain the previous spec (last release tag or main branch)
2. Run `tools/breaking-changes.ts <old-spec> <new-spec>`
3. Removed endpoint, changed response type, added required request field → breaking
4. Added optional field → non-breaking
5. Never ship breaking changes without communicating to consumers

## Tool reference

| Tool | What it does |
|---|---|
| `tools/route-list.ts` | List all registered routes with methods and paths |
| `tools/route-lint.ts` | Check routes for naming inconsistencies and missing validation |
| `tools/endpoint-scaffold.ts` | Generate a route file with validation boilerplate |
| `tools/middleware-audit.ts` | Show middleware stack for each route group |
| `tools/openapi-gen.ts` | Generate an OpenAPI spec from route definitions |
| `tools/breaking-changes.ts` | Diff two OpenAPI specs for breaking changes |
| `tools/client-gen.ts` | Generate type-safe client code from an OpenAPI spec |
