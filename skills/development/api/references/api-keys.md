# API Key Management

## Key format

- Prefix: `sk_live_` for production, `sk_test_` for development/staging
- Key body: nanoid (32 characters)
- Full example: `sk_test_example00000000000000000000`

## Storage

- Store only the SHA-256 hash of the key in the database
- Display the raw key **once** at creation — it cannot be retrieved again
- Store a truncated hint (last 4 characters) for identification: `...7kP2`

## Scopes

Per-resource scopes control what an API key can access:

```
users:read
users:write
projects:read
projects:write
```

- Each key has an array of granted scopes
- Auth middleware checks the key's scopes against the required scope for the route
- Use a scope-checking middleware helper (e.g. `requireScope("users:write")`) on protected routes
- `*` scope grants full access (use sparingly, for admin keys only)

## Rotation

- Keys can be rotated: create a new key, mark the old one as expiring (grace period of 7 days), then revoke
- Revoked keys return 401 immediately
- Log all key creation, rotation, and revocation events
