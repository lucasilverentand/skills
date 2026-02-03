---
name: caching-strategies
description: Implements caching patterns for performance. Use when adding caching layers, configuring CDNs, or optimizing data fetching.
argument-hint: [layer]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Caching Strategies

Implements caching patterns for better performance.

## Your Task

1. **Identify targets**: Find cacheable resources
2. **Choose strategy**: Select appropriate caching
3. **Implement**: Add caching logic
4. **Configure TTL**: Set expiration times
5. **Test**: Verify cache behavior

## Cache Layers

```
Browser Cache → CDN → Application Cache → Database Cache → Database
```

## HTTP Caching

```typescript
// Static assets - long cache
app.use('/assets', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

// API responses - short cache with revalidation
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(products);
});

// Private data - no caching
app.get('/api/user', (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json(user);
});
```

## Application Cache (Redis)

```typescript
import { Redis } from 'ioredis';

const redis = new Redis();

async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Usage
const user = await getCached(
  `user:${id}`,
  () => db.user.findUnique({ where: { id } }),
  3600
);
```

## React Query Caching

```typescript
const { data } = useQuery({
  queryKey: ['users', id],
  queryFn: () => fetchUser(id),
  staleTime: 5 * 60 * 1000,     // Consider fresh for 5 minutes
  gcTime: 30 * 60 * 1000,       // Keep in cache for 30 minutes
});
```

## Cache Invalidation

```typescript
// Time-based
await redis.setex(key, 300, value);

// Event-based
async function updateUser(id: string, data: UpdateData) {
  await db.user.update({ where: { id }, data });
  await redis.del(`user:${id}`);
  await redis.del('users:list');
}

// Pattern-based
await redis.keys('user:*').then(keys =>
  keys.length && redis.del(...keys)
);
```

## Cache Headers Reference

| Directive | Purpose |
|-----------|---------|
| `public` | Cacheable by CDN/proxies |
| `private` | Only browser can cache |
| `max-age=N` | Cache for N seconds |
| `s-maxage=N` | CDN cache duration |
| `no-store` | Never cache |
| `stale-while-revalidate` | Serve stale while fetching |

## Tips

- Cache close to the user
- Use cache keys that include version
- Invalidate on writes
- Monitor cache hit rates
