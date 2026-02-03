---
name: api-versioning
description: Plans API versioning strategies. Use when managing breaking changes, supporting multiple API versions, or planning API evolution.
argument-hint:
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# API Versioning

Plans and implements API versioning strategies.

## Your Task

1. **Assess needs**: Understand versioning requirements
2. **Choose strategy**: Select versioning approach
3. **Implement**: Add versioning to API
4. **Document**: Update API documentation
5. **Plan migration**: Create deprecation timeline

## Versioning Strategies

### 1. URL Path Versioning

```
GET /v1/users
GET /v2/users
```

```typescript
// Route setup
app.use('/v1', v1Router);
app.use('/v2', v2Router);
```

**Pros**: Clear, cacheable, easy to understand
**Cons**: Code duplication across versions

### 2. Header Versioning

```
GET /users
Accept: application/vnd.api+json; version=1
```

```typescript
app.use('/users', (req, res, next) => {
  const version = req.headers['accept']?.match(/version=(\d+)/)?.[1] || '1';
  req.apiVersion = parseInt(version);
  next();
});
```

**Pros**: Clean URLs
**Cons**: Less visible, harder to test

### 3. Query Parameter

```
GET /users?version=1
```

**Pros**: Easy to use
**Cons**: Not RESTful, caching issues

## Deprecation Strategy

```yaml
# Response headers for deprecated endpoints
Deprecation: true
Sunset: Sat, 31 Dec 2024 23:59:59 GMT
Link: </v2/users>; rel="successor-version"
```

## Version Lifecycle

| Phase | Duration | Actions |
|-------|----------|---------|
| Current | Ongoing | Active development |
| Deprecated | 6-12 months | Bug fixes only, migration warnings |
| Sunset | 1-3 months | Read-only, final warnings |
| Retired | - | Return 410 Gone |

## Tips

- Version from day one
- Use semantic versioning for major changes
- Provide migration guides
- Monitor version usage before retiring
- Consider API gateways for version routing
