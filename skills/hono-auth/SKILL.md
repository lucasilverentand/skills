---
name: hono-auth
description: Authentication with Hono including better-auth, JWT, OAuth, and session management. Use when implementing auth in Hono applications.
argument-hint: [auth-type]
---

# Hono Authentication

Comprehensive guide to implementing authentication in Hono applications.

## Authentication Options

Based on `$ARGUMENTS`, provide guidance for:

- `better-auth` - Full-featured auth library (recommended)
- `jwt` - JSON Web Token authentication
- `basic` - Basic HTTP authentication
- `bearer` - Bearer token authentication
- `oauth` - OAuth 2.0 flows

## Better-Auth Integration (Recommended)

Better-auth is a comprehensive authentication library that works well with Hono.

### Installation

```bash
npm install better-auth
```

### Basic Setup

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // or 'mysql', 'sqlite'
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})
```

### Hono Integration

```typescript
// index.ts
import { Hono } from 'hono'
import { auth } from './lib/auth'

const app = new Hono()

// Mount auth routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

// Protected route example
app.get('/api/protected', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({ user: session.user })
})

export default app
```

### Auth Middleware

```typescript
// middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth'

type AuthVariables = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
}

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})

// Usage
app.use('/api/protected/*', authMiddleware)

app.get('/api/protected/profile', (c) => {
  const user = c.get('user')
  return c.json(user)
})
```

### Social Auth with Better-Auth

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  // ... base config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
})
```

### Role-Based Access Control

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  // ... base config
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
    },
  },
})

// middleware/roles.ts
export const requireRole = (role: string) => {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')

    if (user.role !== role && user.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })
}

// Usage
app.use('/api/admin/*', authMiddleware, requireRole('admin'))
```

## JWT Authentication

### Using Hono's Built-in JWT Middleware

```typescript
import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'

type JWTPayload = {
  sub: string
  email: string
  role: string
  exp: number
}

const app = new Hono()

// JWT middleware for protected routes
app.use('/api/*', jwt({
  secret: process.env.JWT_SECRET!,
}))

// Login endpoint
app.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  const user = await validateCredentials(email, password)
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  }

  const token = await sign(payload, process.env.JWT_SECRET!)

  return c.json({ token })
})

// Access JWT payload in handlers
app.get('/api/profile', (c) => {
  const payload = c.get('jwtPayload') as JWTPayload
  return c.json({ userId: payload.sub, email: payload.email })
})
```

### Refresh Tokens

```typescript
import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

app.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await validateCredentials(email, password)

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const accessToken = await sign({
    sub: user.id,
    type: 'access',
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
  }, process.env.JWT_SECRET!)

  const refreshToken = await sign({
    sub: user.id,
    type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }, process.env.JWT_REFRESH_SECRET!)

  return c.json({ accessToken, refreshToken })
})

app.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json()

  try {
    const payload = await verify(refreshToken, process.env.JWT_REFRESH_SECRET!)

    if (payload.type !== 'refresh') {
      return c.json({ error: 'Invalid token type' }, 401)
    }

    const accessToken = await sign({
      sub: payload.sub,
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
    }, process.env.JWT_SECRET!)

    return c.json({ accessToken })
  } catch {
    return c.json({ error: 'Invalid refresh token' }, 401)
  }
})
```

## Basic Authentication

```typescript
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'

const app = new Hono()

// Simple static credentials
app.use('/admin/*', basicAuth({
  username: 'admin',
  password: process.env.ADMIN_PASSWORD!,
}))

// Dynamic verification (database lookup)
app.use('/api/*', basicAuth({
  verifyUser: async (username, password, c) => {
    const user = await findUserByUsername(username)
    if (!user) return false

    const valid = await verifyPassword(password, user.passwordHash)
    if (valid) {
      c.set('user', user)
    }
    return valid
  },
}))

// Multiple users
app.use('/team/*', basicAuth({
  verifyUser: (username, password) => {
    const users = {
      alice: 'password1',
      bob: 'password2',
    }
    return users[username] === password
  },
}))
```

## Bearer Token Authentication

```typescript
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

const app = new Hono()

// Static token
app.use('/api/*', bearerAuth({
  token: process.env.API_TOKEN!,
}))

// Multiple tokens
app.use('/api/*', bearerAuth({
  token: [process.env.API_TOKEN_1!, process.env.API_TOKEN_2!],
}))

// Custom verification (API keys from database)
app.use('/api/*', bearerAuth({
  verifyToken: async (token, c) => {
    const apiKey = await findApiKey(token)
    if (!apiKey || apiKey.revoked) {
      return false
    }

    c.set('apiKey', apiKey)
    c.set('workspace', apiKey.workspace)
    return true
  },
}))
```

## OAuth 2.0 Patterns

### OAuth Client Flow

```typescript
import { Hono } from 'hono'

const app = new Hono()

const OAUTH_CONFIG = {
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET!,
  authorizationEndpoint: 'https://provider.com/oauth/authorize',
  tokenEndpoint: 'https://provider.com/oauth/token',
  redirectUri: 'https://myapp.com/callback',
}

// Initiate OAuth flow
app.get('/auth/login', (c) => {
  const state = crypto.randomUUID()
  // Store state in session/cookie for verification

  const authUrl = new URL(OAUTH_CONFIG.authorizationEndpoint)
  authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId)
  authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)

  return c.redirect(authUrl.toString())
})

// Handle OAuth callback
app.get('/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')

  // Verify state matches stored value

  if (!code) {
    return c.json({ error: 'Missing authorization code' }, 400)
  }

  // Exchange code for tokens
  const tokenResponse = await fetch(OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
    }),
  })

  const tokens = await tokenResponse.json()

  // Create session, set cookies, etc.
  return c.redirect('/dashboard')
})
```

## Session Management

### Cookie-Based Sessions

```typescript
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

const SESSION_SECRET = process.env.SESSION_SECRET!

// Login - create session
app.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await validateCredentials(email, password)

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const sessionToken = await sign({
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }, SESSION_SECRET)

  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return c.json({ success: true })
})

// Session middleware
const sessionMiddleware = createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, 'session')

  if (!sessionToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verify(sessionToken, SESSION_SECRET)
    const user = await findUserById(payload.sub)

    if (!user) {
      deleteCookie(c, 'session')
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', user)
    await next()
  } catch {
    deleteCookie(c, 'session')
    return c.json({ error: 'Invalid session' }, 401)
  }
})

// Logout
app.post('/logout', (c) => {
  deleteCookie(c, 'session')
  return c.json({ success: true })
})
```

## Role-Based Access Control (RBAC)

```typescript
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

type Role = 'admin' | 'editor' | 'viewer'

type User = {
  id: string
  email: string
  role: Role
}

type AuthVariables = {
  user: User
}

// Permission definitions
const permissions = {
  admin: ['read', 'write', 'delete', 'manage'],
  editor: ['read', 'write'],
  viewer: ['read'],
} as const

// Check if role has permission
const hasPermission = (role: Role, permission: string): boolean => {
  return permissions[role]?.includes(permission as any) ?? false
}

// Role middleware
const requireRole = (...roles: Role[]) => {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')

    if (!roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })
}

// Permission middleware
const requirePermission = (permission: string) => {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')

    if (!hasPermission(user.role, permission)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })
}

const app = new Hono<{ Variables: AuthVariables }>()

app.use('/api/*', authMiddleware)

// Role-based routes
app.get('/api/posts', requirePermission('read'), getPosts)
app.post('/api/posts', requirePermission('write'), createPost)
app.delete('/api/posts/:id', requirePermission('delete'), deletePost)

// Admin-only routes
app.use('/api/admin/*', requireRole('admin'))
app.get('/api/admin/users', getUsers)
app.post('/api/admin/users', createUser)
```

## API Key Authentication

```typescript
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'

type ApiKey = {
  id: string
  key: string
  name: string
  workspaceId: string
  scopes: string[]
  createdAt: Date
  lastUsedAt: Date | null
}

const apiKeyAuth = createMiddleware<{
  Variables: { apiKey: ApiKey }
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const apiKeyHeader = c.req.header('X-API-Key')

  const key = apiKeyHeader || authHeader?.replace('Bearer ', '')

  if (!key) {
    return c.json({ error: 'API key required' }, 401)
  }

  const apiKey = await findApiKeyByKey(key)

  if (!apiKey) {
    return c.json({ error: 'Invalid API key' }, 401)
  }

  // Update last used timestamp
  await updateApiKeyLastUsed(apiKey.id)

  c.set('apiKey', apiKey)
  await next()
})

// Scope checking
const requireScope = (scope: string) => {
  return createMiddleware<{ Variables: { apiKey: ApiKey } }>(async (c, next) => {
    const apiKey = c.get('apiKey')

    if (!apiKey.scopes.includes(scope) && !apiKey.scopes.includes('*')) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    await next()
  })
}

const app = new Hono()

app.use('/api/*', apiKeyAuth)
app.get('/api/read', requireScope('read'), handler)
app.post('/api/write', requireScope('write'), handler)
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Hash passwords** with bcrypt or argon2
3. **Use httpOnly cookies** for session tokens
4. **Implement rate limiting** on auth endpoints
5. **Validate and sanitize** all inputs
6. **Use secure session configuration:**

   ```typescript
   setCookie(c, 'session', token, {
     httpOnly: true,     // Prevents XSS
     secure: true,       // HTTPS only
     sameSite: 'Strict', // CSRF protection
     path: '/',
     maxAge: 60 * 60 * 24 * 7,
   })
   ```

7. **Implement token rotation** for long-lived sessions
8. **Log authentication events** for auditing
9. **Use constant-time comparison** for tokens
