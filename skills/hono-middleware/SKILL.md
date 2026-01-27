---
name: hono-middleware
description: Create and use Hono middleware. Use when building custom middleware, composing middleware chains, or integrating built-in middleware.
---

# Hono Middleware

Comprehensive guide to creating and using middleware in Hono applications.

## Middleware Basics

Middleware in Hono processes requests before and/or after handlers. Middleware should either:

- Call `await next()` to continue to the next middleware/handler
- Return a `Response` to short-circuit the chain

### Execution Order

Middleware executes in registration order, creating a nested flow:

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.use(async (c, next) => {
  console.log('1. Before')
  await next()
  console.log('4. After')
})

app.use(async (c, next) => {
  console.log('2. Before')
  await next()
  console.log('3. After')
})

app.get('/', (c) => c.text('Handler'))

// Output order: 1. Before -> 2. Before -> Handler -> 3. After -> 4. After
```

## Built-in Middleware

### Logger

Log requests and responses:

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()
app.use(logger())
```

### CORS

Handle Cross-Origin Resource Sharing:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Allow all origins
app.use('/api/*', cors())

// Restrict origins
app.use('/api/*', cors({
  origin: ['https://example.com', 'https://app.example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
  exposeHeaders: ['X-Response-Id'],
  maxAge: 86400,
  credentials: true,
}))

// Dynamic origin
app.use('/api/*', cors({
  origin: (origin) => {
    return origin.endsWith('.example.com') ? origin : null
  },
}))
```

### Secure Headers

Add security headers:

```typescript
import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()

app.use(secureHeaders())

// Custom configuration
app.use(secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}))
```

### CSRF Protection

Protect against Cross-Site Request Forgery:

```typescript
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'

const app = new Hono()

app.use(csrf({
  origin: ['https://example.com'],
}))
```

### Basic Auth

Simple username/password authentication:

```typescript
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono()

app.use('/admin/*', basicAuth({
  username: 'admin',
  password: 'secret',
}))

// Multiple users
app.use('/admin/*', basicAuth({
  verifyUser: (username, password, c) => {
    return username === 'admin' && password === c.env.ADMIN_PASSWORD
  },
}))
```

### Bearer Auth

Token-based authentication:

```typescript
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

const app = new Hono()

app.use('/api/*', bearerAuth({
  token: 'my-secret-token',
}))

// Custom verification
app.use('/api/*', bearerAuth({
  verifyToken: async (token, c) => {
    const user = await verifyJWT(token)
    if (user) {
      c.set('user', user)
      return true
    }
    return false
  },
}))
```

### JWT

JSON Web Token validation:

```typescript
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

const app = new Hono()

app.use('/api/*', jwt({
  secret: 'my-secret-key',
}))

// Access payload in handler
app.get('/api/profile', (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload)
})
```

### Compress

Compress responses:

```typescript
import { Hono } from 'hono'
import { compress } from 'hono/compress'

const app = new Hono()

app.use(compress())

// Specify encoding
app.use(compress({ encoding: 'gzip' }))
```

### ETag

Add ETag headers for caching:

```typescript
import { Hono } from 'hono'
import { etag } from 'hono/etag'

const app = new Hono()

app.use(etag())

// Weak ETag
app.use(etag({ weak: true }))
```

### Cache

Cache responses:

```typescript
import { Hono } from 'hono'
import { cache } from 'hono/cache'

const app = new Hono()

app.get('/static/*', cache({
  cacheName: 'my-app',
  cacheControl: 'max-age=3600',
}))
```

### Body Limit

Limit request body size:

```typescript
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'

const app = new Hono()

app.post('/upload', bodyLimit({
  maxSize: 50 * 1024 * 1024, // 50MB
  onError: (c) => {
    return c.json({ error: 'File too large' }, 413)
  },
}), async (c) => {
  // Handle upload
})
```

### Timeout

Set request timeouts:

```typescript
import { Hono } from 'hono'
import { timeout } from 'hono/timeout'

const app = new Hono()

app.use(timeout(5000)) // 5 seconds

// Custom timeout response
app.use(timeout(5000, () => {
  return new Response('Request timed out', { status: 408 })
}))
```

### Request ID

Add unique request IDs:

```typescript
import { Hono } from 'hono'
import { requestId } from 'hono/request-id'

const app = new Hono()

app.use(requestId())

app.get('/', (c) => {
  const id = c.get('requestId')
  return c.json({ requestId: id })
})
```

### Pretty JSON

Format JSON responses:

```typescript
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// Enable with ?pretty query param
app.use(prettyJSON())

app.get('/data', (c) => {
  return c.json({ complex: { nested: { data: true } } })
})
// GET /data?pretty returns formatted JSON
```

### IP Restriction

Restrict by IP address:

```typescript
import { Hono } from 'hono'
import { ipRestriction } from 'hono/ip-restriction'

const app = new Hono()

app.use('/admin/*', ipRestriction({
  rules: [
    { pattern: '192.168.0.0/16', allow: true },
    { pattern: '10.0.0.0/8', allow: true },
  ],
  fallback: false, // Deny by default
}))
```

## Custom Middleware

### Inline Middleware

Simple middleware defined inline:

```typescript
import { Hono } from 'hono'

const app = new Hono()

// Before handler
app.use(async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  c.header('X-Response-Time', `${ms}ms`)
})

// Path-specific
app.use('/api/*', async (c, next) => {
  console.log(`API Request: ${c.req.method} ${c.req.path}`)
  await next()
})
```

### Reusable Middleware with createMiddleware

Use `createMiddleware` for type-safe, reusable middleware:

```typescript
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

// Simple middleware
const timing = createMiddleware(async (c, next) => {
  const start = Date.now()
  await next()
  c.header('X-Response-Time', `${Date.now() - start}ms`)
})

// Middleware with options
const customLogger = (prefix: string) => {
  return createMiddleware(async (c, next) => {
    console.log(`${prefix}: ${c.req.method} ${c.req.path}`)
    await next()
  })
}

const app = new Hono()
app.use(timing)
app.use(customLogger('[API]'))
```

### Typed Middleware

Middleware that sets typed context variables:

```typescript
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

type User = {
  id: string
  email: string
  role: 'admin' | 'user'
}

type AuthVariables = {
  user: User
}

const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const user = await verifyToken(token)
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    c.set('user', user)
    await next()
  }
)

// Role-based middleware
const requireRole = (role: 'admin' | 'user') => {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')

    if (user.role !== role && user.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })
}

const app = new Hono<{ Variables: AuthVariables }>()

app.use('/api/*', authMiddleware)
app.use('/admin/*', requireRole('admin'))

app.get('/api/profile', (c) => {
  const user = c.get('user') // Fully typed
  return c.json(user)
})
```

### Middleware that Modifies Response

```typescript
import { createMiddleware } from 'hono/factory'

// Add headers to all responses
const addHeaders = createMiddleware(async (c, next) => {
  await next()
  c.header('X-Powered-By', 'Hono')
  c.header('X-Request-Id', crypto.randomUUID())
})

// Modify response body
const wrapResponse = createMiddleware(async (c, next) => {
  await next()

  // Only wrap JSON responses
  const contentType = c.res.headers.get('Content-Type')
  if (contentType?.includes('application/json')) {
    const body = await c.res.json()
    c.res = new Response(
      JSON.stringify({
        success: c.res.ok,
        data: body,
        timestamp: new Date().toISOString(),
      }),
      c.res
    )
  }
})
```

### Error Handling Middleware

```typescript
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createMiddleware } from 'hono/factory'

const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof HTTPException) {
      return err.getResponse()
    }

    console.error('Unhandled error:', err)

    return c.json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development'
        ? (err as Error).message
        : undefined,
    }, 500)
  }
})

const app = new Hono()
app.use(errorHandler)
```

## Middleware Composition

### Combining Multiple Middleware

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()

// Apply multiple middleware in order
app.use(logger())
app.use(secureHeaders())
app.use(cors())

// Or combine for specific paths
const apiMiddleware = [
  cors({ origin: 'https://example.com' }),
  authMiddleware,
  rateLimitMiddleware,
]

app.use('/api/*', ...apiMiddleware)
```

### Conditional Middleware

```typescript
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

const conditionalMiddleware = (
  condition: (c: Context) => boolean,
  middleware: MiddlewareHandler
) => {
  return createMiddleware(async (c, next) => {
    if (condition(c)) {
      return middleware(c, next)
    }
    await next()
  })
}

const app = new Hono()

// Only apply auth for non-public routes
app.use(conditionalMiddleware(
  (c) => !c.req.path.startsWith('/public'),
  authMiddleware
))
```

### Middleware Factory Pattern

```typescript
import { createMiddleware } from 'hono/factory'

interface RateLimitOptions {
  limit: number
  windowMs: number
  keyGenerator?: (c: Context) => string
}

const rateLimit = (options: RateLimitOptions) => {
  const { limit, windowMs, keyGenerator = (c) => c.req.header('CF-Connecting-IP') || 'unknown' } = options
  const store = new Map<string, { count: number; resetTime: number }>()

  return createMiddleware(async (c, next) => {
    const key = keyGenerator(c)
    const now = Date.now()
    const record = store.get(key)

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs })
    } else if (record.count >= limit) {
      c.header('X-RateLimit-Limit', limit.toString())
      c.header('X-RateLimit-Remaining', '0')
      c.header('X-RateLimit-Reset', record.resetTime.toString())
      return c.json({ error: 'Too many requests' }, 429)
    } else {
      record.count++
    }

    await next()
  })
}

// Usage
const app = new Hono()
app.use('/api/*', rateLimit({ limit: 100, windowMs: 60000 }))
```

## Testing Middleware

```typescript
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { myMiddleware } from './middleware'

describe('myMiddleware', () => {
  it('should add custom header', async () => {
    const app = new Hono()
    app.use(myMiddleware)
    app.get('/', (c) => c.text('OK'))

    const res = await app.request('/')

    expect(res.headers.get('X-Custom')).toBe('value')
  })

  it('should block unauthorized requests', async () => {
    const app = new Hono()
    app.use(authMiddleware)
    app.get('/', (c) => c.text('OK'))

    const res = await app.request('/')

    expect(res.status).toBe(401)
  })

  it('should allow authorized requests', async () => {
    const app = new Hono()
    app.use(authMiddleware)
    app.get('/', (c) => c.text('OK'))

    const res = await app.request('/', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
  })
})
```

## Common Patterns

### Request Logging with Context

```typescript
const requestLogger = createMiddleware(async (c, next) => {
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)

  const start = Date.now()
  console.log(`[${requestId}] --> ${c.req.method} ${c.req.path}`)

  await next()

  const duration = Date.now() - start
  console.log(`[${requestId}] <-- ${c.res.status} (${duration}ms)`)
})
```

### Database Connection

```typescript
const withDb = createMiddleware<{
  Variables: { db: Database }
}>(async (c, next) => {
  const db = await getConnection(c.env.DATABASE_URL)
  c.set('db', db)

  try {
    await next()
  } finally {
    await db.close()
  }
})
```

### Feature Flags

```typescript
const featureFlag = (flag: string) => {
  return createMiddleware(async (c, next) => {
    const flags = await getFeatureFlags(c.env)

    if (!flags[flag]) {
      return c.json({ error: 'Feature not available' }, 404)
    }

    await next()
  })
}

app.get('/beta/feature', featureFlag('beta-feature'), handler)
```
