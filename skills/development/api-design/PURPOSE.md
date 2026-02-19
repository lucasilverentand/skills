# API Design

Design endpoints, generate OpenAPI specs, review consistency, and create type-safe contracts.

## Responsibilities

- Design API endpoints and resource structures
- Generate and maintain OpenAPI specifications
- Review API consistency and naming conventions
- Create type-safe API contracts
- Validate request and response schemas with Zod
- Detect breaking changes between API versions
- Generate client SDKs from API definitions

## Tools

- `tools/openapi-gen.ts` — generate an OpenAPI spec from Hono route definitions
- `tools/breaking-changes.ts` — diff two OpenAPI specs and report breaking changes
- `tools/route-lint.ts` — check API routes for naming inconsistencies and missing validation
- `tools/client-gen.ts` — generate type-safe client code from an OpenAPI spec
