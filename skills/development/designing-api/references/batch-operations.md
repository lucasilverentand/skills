# Batch Operations

## Endpoint convention

Use `POST /v1/{resource}/batch` with an `items` array in the body:

```
POST /v1/users/batch
{ "items": [{ "name": "Alice" }, { "name": "Bob" }] }
```

## Response strategy

**Creates** — all-or-nothing. Wrap in a database transaction. If any item fails validation or conflicts, roll back and return a single error response.

**Updates and deletes** — partial success. Each item gets its own result:

```json
{
  "ok": true,
  "data": [
    { "ok": true, "data": { "id": "usr_abc", "name": "Alice" } },
    { "ok": false, "error": { "code": "NOT_FOUND", "message": "User usr_xyz not found" } }
  ]
}
```

## Limits

- Max batch size: 100 items per request
- Validate the entire batch before processing any items (for all-or-nothing creates)
