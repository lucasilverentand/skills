# Error Handling

Codify error handling conventions using result types, define error code standards, and audit codebase consistency.

## Responsibilities

- Define and enforce the Result type pattern (`{ ok, data } | { ok, error }`)
- Establish error code naming conventions (SCREAMING_SNAKE_CASE, domain-prefixed)
- Guide migration from throw-based code to result types
- Set up error propagation rules across layer boundaries
- Convert Zod validation errors to structured field-level details
- Configure error boundaries for React/React Native UI
- Handle errors at system boundaries where throwing is appropriate
- Audit codebase for inconsistent error handling patterns
- Generate Result type helpers and error code enums for new modules

## Tools

- `tools/error-audit.ts` — scan codebase for inconsistent error handling (bare throws, untyped catches, missing error codes)
- `tools/result-type-gen.ts` — generate Result type helpers and error code enums for a module
