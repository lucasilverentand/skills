---
name: auth-patterns
description: Implements secure authentication patterns. Use when adding authentication, managing sessions, or implementing OAuth/JWT.
argument-hint: [auth-type]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Authentication Patterns

Implements secure authentication patterns.

## Your Task

1. **Choose approach**: Session, JWT, or OAuth
2. **Implement auth**: Set up authentication flow
3. **Secure storage**: Handle credentials safely
4. **Add protection**: Implement rate limiting, CSRF
5. **Test**: Verify security measures

## JWT Authentication

```typescript
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function createTokens(userId: string) {
  const accessToken = sign({ sub: userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = sign({ sub: userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
}

function verifyToken(token: string) {
  return verify(token, JWT_SECRET) as { sub: string };
}
```

## Session Authentication

```typescript
import { sessionMiddleware } from 'hono/session';

app.use(sessionMiddleware({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
}));
```

## Password Hashing

```typescript
import { hash, verify } from '@node-rs/argon2';

async function hashPassword(password: string) {
  return hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function verifyPassword(hash: string, password: string) {
  return verify(hash, password);
}
```

## Security Checklist

| Item | Implementation |
|------|----------------|
| Password hashing | Argon2id or bcrypt |
| Token storage | HttpOnly cookies |
| CSRF protection | SameSite + CSRF tokens |
| Rate limiting | Login attempts throttling |
| Secure transport | HTTPS only |
| Token refresh | Short access, long refresh |

## Tips

- Never store passwords in plain text
- Use HttpOnly cookies for tokens
- Implement token rotation
- Add MFA for sensitive operations
- Log authentication events
