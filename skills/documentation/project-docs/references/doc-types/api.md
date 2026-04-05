# Doc Type: API Reference (`docs/api.md`)

```markdown
# API Reference

## Base URL
Production and development base URLs.

## Authentication
How to authenticate. Token format, header name, how to obtain credentials.

## Common patterns
- Request/response format (JSON, etc.)
- Pagination approach
- Error response structure
- Rate limiting

## Endpoints
Group by resource or domain. For each endpoint:
- **Method and path** — `GET /api/users/:id`
- **Description** — what it does
- **Parameters** — path params, query params, request body
- **Response** — status codes and response shape
- **Example** — curl or fetch example

## Webhooks
If the project sends webhooks: events, payload format, delivery guarantees, retry policy.

## SDKs and clients
If typed clients or SDKs exist, where to find them and how to use them.
```

**Guidance:**
- If an OpenAPI spec exists, reference it as the source of truth and only document patterns/auth here
- Group endpoints by the resource they operate on, not by HTTP method
- Examples should be copy-pasteable — use real-looking data, not `{id}`
- Error response examples are as important as success examples
