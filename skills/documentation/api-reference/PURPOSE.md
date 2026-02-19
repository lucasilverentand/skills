# API Reference

Generate API reference documentation from code.

## Responsibilities

- Generate API reference docs from source code
- Keep API documentation in sync with implementation
- Document request/response schemas with examples
- Validate that documented endpoints match actual route definitions

## Tools

- `tools/openapi-gen.ts` — extract route handlers and Zod schemas to generate an OpenAPI spec
- `tools/endpoint-diff.ts` — compare documented endpoints against registered routes and report drift
- `tools/example-gen.ts` — generate example request/response payloads from Zod schemas and type definitions
