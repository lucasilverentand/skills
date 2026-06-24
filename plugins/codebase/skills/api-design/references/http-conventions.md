# HTTP Conventions

## URLs
- Lowercase, plural nouns, kebab-case or snake_case: `/orders`, `/line-items`, `/order_items`.
- Resources, not RPC verbs: `/orders/:id/refund` not `/refundOrder`. Because resource-shaped URLs let HTTP verbs carry their standard meaning, and resource URLs are cacheable while RPC-style ones are not.
- At most one level of nesting: `/customers/:id/orders` is fine, `/customers/:id/orders/:oid/items/:iid` is not — flatten to `/items/:iid`. Because deep paths are fragile, hard to cache, and force clients to track parent IDs they may not need.
- No file extensions in URLs. Use `Accept` headers for content negotiation.
- Query params for filtering (`?status=active`), sorting (`?sort=-created_at`), and pagination (`?cursor=abc`).

## Verbs
|Verb|Purpose|Safe|Idempotent|
|---|---|---|---|
|`GET`|Read a resource or list|Yes|Yes|
|`POST`|Create a resource, or trigger a sub-action (`/orders/:id/refund`)|No|No|
|`PUT`|Full replace of a resource (rare — prefer PATCH)|No|Yes|
|`PATCH`|Partial update — send only changed fields|No|Yes*|
|`DELETE`|Remove a resource|No|Yes|

*PATCH is idempotent when applied as a merge-patch (same patch produces same result). POST is the verb for sub-actions like refund, cancel, archive — because these are not CRUD on the resource itself.

## Status Codes
|Code|When to use|
|---|---|
|`200 OK`|Successful GET, PATCH, DELETE (with body), or sub-action|
|`201 Created`|Successful POST that created a resource. Include `Location` header.|
|`202 Accepted`|Request accepted for async processing. Return a job/status URL.|
|`204 No Content`|Successful DELETE or PUT with no response body|
|`400 Bad Request`|Malformed syntax — unparseable JSON, wrong content type|
|`401 Unauthorized`|No valid credentials provided. Should be called "Unauthenticated".|
|`403 Forbidden`|Authenticated but not authorized for this resource|
|`404 Not Found`|Resource does not exist (or caller lacks permission and you want to hide existence)|
|`409 Conflict`|State conflict — duplicate idempotency key with different body, concurrent edit|
|`410 Gone`|Resource existed but was permanently deleted. Useful for tombstones.|
|`422 Unprocessable Entity`|Valid JSON but fails business validation (e.g., negative quantity)|
|`429 Too Many Requests`|Rate limited. Must include `Retry-After` header.|
|`500 Internal Server Error`|Unhandled server bug. Never return this for user input errors.|
|`502/503/504`|Upstream failures, maintenance, or timeouts. Clients should retry with backoff.|

**Common mistakes:** returning `200` with `{"error": "..."}` (clients can't distinguish success from failure by status code), returning `500` for validation errors (makes monitoring useless), returning `404` when you should return `403` (leaks resource existence when the caller is authenticated but unauthorized).

## Request/Response Shapes
- **JSON always** for public APIs. No XML, no form-encoded for API responses.
- **Dates:** ISO 8601 UTC (`2024-03-15T09:30:00Z`). Never Unix timestamps — ambiguous units (seconds vs milliseconds) and no timezone signal.
- **Money:** integer cents + currency string (`{ "amount": 1999, "currency": "USD" }`). Never floats — `0.1 + 0.2 !== 0.3` in IEEE 754, and you will lose pennies.
- **IDs:** prefixed strings (`ord_abc123`, `usr_def456`). Never bare integers — JSON numbers lose precision above 2^53, and prefixes make IDs self-describing in logs and support tickets.
- **Casing:** `snake_case` for public APIs, `camelCase` for internal. Pick one per API and never mix.
- **Null semantics:** missing field = "not provided" (client didn't send it), `null` = "explicitly cleared" (client wants to unset), empty array `[]` = "zero items" (not the same as missing).
- **Single resource:** bare object response. **List:** `{ "data": [...], "meta": { "next_cursor": "...", "has_more": true } }`.

## CORS
- Explicit allowlist per environment: production allows only known origins, staging allows staging + localhost, dev allows `localhost:*`.
- Never `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true` — browsers block it, and if they didn't it would be a security hole exposing authenticated endpoints to any origin.
- Cache preflight responses for 1 hour (`Access-Control-Max-Age: 3600`). Because preflight OPTIONS requests add latency to every cross-origin call, and CORS config rarely changes within an hour.
- Expose headers clients need: `X-Request-Id`, `X-RateLimit-Remaining`, `Retry-After`.
