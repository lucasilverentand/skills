# API Design

Design endpoints, generate OpenAPI specs, review consistency, and create type-safe contracts.

## Responsibilities

- Design API endpoints and resource structures
- Define and enforce response shape, naming, and status code conventions
- Generate and maintain OpenAPI specifications
- Detect breaking changes between API versions
- Generate client SDKs from API definitions
- Set up middleware chains (request ID, logging, auth, rate limiting)
- Configure structured logging with LogTape
- Design batch operation endpoints
- Design outbound webhooks with HMAC signing
- Manage API key lifecycle (creation, scoping, rotation)

## Tools

- `tools/openapi-gen.ts` — generate an OpenAPI spec from route definitions
- `tools/breaking-changes.ts` — diff two OpenAPI specs and report breaking changes
- `tools/route-lint.ts` — check API routes for naming inconsistencies and missing validation
- `tools/client-gen.ts` — generate type-safe client code from an OpenAPI spec
