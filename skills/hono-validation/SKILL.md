---
name: hono-validation
description: Request validation in Hono with Zod, Valibot, or custom validators. Use when validating request data or generating types from schemas.
---

# Hono Validation

Comprehensive guide to request validation in Hono applications.

## Validation Options

Hono supports multiple validation approaches:

- **Zod** - Most popular, excellent TypeScript integration
- **Valibot** - Lightweight alternative to Zod
- **Standard Schema** - Universal validator interface
- **Manual** - Built-in `validator` function

## Zod Validation (Recommended)

### Installation

```bash
npm install zod @hono/zod-validator
```

### Basic Usage

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// Validate JSON body
app.post(
  '/users',
  zValidator('json', z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().int().min(0).optional(),
  })),
  async (c) => {
    const data = c.req.valid('json')
    // data is typed: { name: string; email: string; age?: number }
    return c.json({ id: '123', ...data })
  }
)
```

### Validation Targets

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// JSON body
app.post('/users', zValidator('json', userSchema), handler)

// Form data
app.post('/upload', zValidator('form', formSchema), handler)

// Query parameters
app.get('/search', zValidator('query', z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})), handler)

// URL parameters
app.get('/users/:id', zValidator('param', z.object({
  id: z.string().uuid(),
})), handler)

// Headers (use lowercase names)
app.get('/api', zValidator('header', z.object({
  authorization: z.string().startsWith('Bearer '),
  'x-request-id': z.string().uuid().optional(),
})), handler)

// Cookies
app.get('/session', zValidator('cookie', z.object({
  session: z.string(),
})), handler)
```

### Multiple Validators

Chain validators for different request parts:

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.put(
  '/posts/:id',
  zValidator('param', z.object({
    id: z.string().uuid(),
  })),
  zValidator('query', z.object({
    notify: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  })),
  zValidator('json', z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    tags: z.array(z.string()).max(10).optional(),
  })),
  async (c) => {
    const { id } = c.req.valid('param')
    const { notify } = c.req.valid('query')
    const body = c.req.valid('json')

    return c.json({ id, ...body })
  }
)
```

### Custom Error Responses

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

app.post(
  '/users',
  zValidator('json', userSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        details: result.error.flatten(),
      }, 400)
    }
  }),
  handler
)

// Reusable error handler
const validationHook = (result: any, c: Context) => {
  if (!result.success) {
    return c.json({
      error: 'Validation failed',
      issues: result.error.issues.map((issue: any) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    }, 400)
  }
}

app.post('/users', zValidator('json', userSchema, validationHook), handler)
```

### Common Zod Patterns

```typescript
import { z } from 'zod'

// String validations
const stringSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
})

// Number validations
const numberSchema = z.object({
  age: z.number().int().min(0).max(150),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
})

// Coercion for query params (strings to proper types)
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  active: z.coerce.boolean().default(true),
})

// Arrays
const arraySchema = z.object({
  tags: z.array(z.string()).min(1).max(10),
  ids: z.array(z.string().uuid()),
})

// Enums
const enumSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
})

// Optional and nullable
const optionalSchema = z.object({
  nickname: z.string().optional(),              // string | undefined
  bio: z.string().nullable(),                   // string | null
  avatar: z.string().nullish(),                 // string | null | undefined
  tags: z.array(z.string()).optional().default([]),
})

// Transformations
const transformSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  date: z.string().transform(v => new Date(v)),
  trimmed: z.string().trim(),
})

// Refinements (custom validation)
const refinedSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Union types
const unionSchema = z.object({
  type: z.enum(['email', 'sms']),
  value: z.union([
    z.string().email(),
    z.string().regex(/^\+?[1-9]\d{1,14}$/),
  ]),
})

// Discriminated unions
const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('scroll'), position: z.number() }),
  z.object({ type: z.literal('input'), value: z.string() }),
])
```

## Valibot Validation

### Valibot Installation

```bash
npm install valibot @hono/valibot-validator
```

### Valibot Usage

```typescript
import { Hono } from 'hono'
import { vValidator } from '@hono/valibot-validator'
import * as v from 'valibot'

const app = new Hono()

const userSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
})

app.post(
  '/users',
  vValidator('json', userSchema),
  async (c) => {
    const data = c.req.valid('json')
    return c.json({ id: '123', ...data })
  }
)
```

## Standard Schema Validator

Works with any Standard Schema compatible library:

```typescript
import { Hono } from 'hono'
import { sValidator } from '@hono/standard-validator'
import * as v from 'valibot'  // or zod, arktype, etc.

const app = new Hono()

const schema = v.object({
  name: v.string(),
  age: v.number(),
})

app.post('/author', sValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json({ message: `${data.name} is ${data.age}` })
})
```

## Manual Validation

Use Hono's built-in `validator` for simple cases:

```typescript
import { Hono } from 'hono'
import { validator } from 'hono/validator'

const app = new Hono()

app.post(
  '/posts',
  validator('form', (value, c) => {
    const title = value['title']
    const body = value['body']

    if (!title || typeof title !== 'string') {
      return c.json({ error: 'Title is required' }, 400)
    }

    if (!body || typeof body !== 'string') {
      return c.json({ error: 'Body is required' }, 400)
    }

    // Return validated data
    return { title, body }
  }),
  (c) => {
    const { title, body } = c.req.valid('form')
    return c.json({ title, body })
  }
)
```

## Type Inference

Extract types from schemas for reuse:

```typescript
import { z } from 'zod'

// Define schema
const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
})

// Infer types
type CreateUserInput = z.infer<typeof createUserSchema>
// { name: string; email: string; role: 'admin' | 'user' }

// Use in service functions
async function createUser(input: CreateUserInput) {
  // input is typed
}

// Use in route
app.post('/users', zValidator('json', createUserSchema), async (c) => {
  const data = c.req.valid('json')
  const user = await createUser(data)
  return c.json(user)
})
```

## OpenAPI Integration

Generate OpenAPI schemas from Zod:

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()

const userSchema = z.object({
  id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
})

const route = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: userSchema,
        },
      },
      description: 'User found',
    },
    404: {
      description: 'User not found',
    },
  },
})

app.openapi(route, async (c) => {
  const { id } = c.req.valid('param')
  const user = await findUser(id)
  return c.json(user, 200)
})

// Get OpenAPI spec
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: { title: 'My API', version: '1.0.0' },
})
```

## File Upload Validation

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// Validate file uploads
app.post(
  '/upload',
  zValidator('form', z.object({
    file: z.instanceof(File).refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'File must be less than 5MB'
    ).refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, or WebP)'
    ),
    description: z.string().max(500).optional(),
  })),
  async (c) => {
    const { file, description } = c.req.valid('form')
    // Process file
    return c.json({ success: true })
  }
)
```

## Validation Middleware Factory

Create reusable validation middleware:

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// Pagination validator
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('desc'),
})

const withPagination = zValidator('query', paginationSchema)

// UUID param validator
const uuidParamSchema = z.object({
  id: z.string().uuid(),
})

const withUuidParam = zValidator('param', uuidParamSchema)

// Usage
app.get('/posts', withPagination, async (c) => {
  const { page, limit, sort } = c.req.valid('query')
  // ...
})

app.get('/posts/:id', withUuidParam, async (c) => {
  const { id } = c.req.valid('param')
  // ...
})
```

## Error Handling Best Practices

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z, ZodError } from 'zod'

const app = new Hono()

// Global error handler for validation errors
app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation Error',
      issues: err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    }, 400)
  }

  return c.json({ error: 'Internal Server Error' }, 500)
})

// Inline validation with custom hook
const validationHook = <T>(result: { success: boolean; data?: T; error?: ZodError }, c: Context) => {
  if (!result.success) {
    return c.json({
      error: 'Validation Error',
      issues: result.error!.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }, 400)
  }
}

app.post('/users', zValidator('json', userSchema, validationHook), handler)
```

## Content-Type Notes

When validating `json` or `form`, ensure the request includes the correct `Content-Type` header:

- JSON: `Content-Type: application/json`
- Form: `Content-Type: application/x-www-form-urlencoded` or `multipart/form-data`

Without the correct header, the validator may receive an empty object.

## Header Validation Notes

When validating headers, always use **lowercase** header names:

```typescript
// Correct
zValidator('header', z.object({
  'content-type': z.string(),
  'authorization': z.string(),
  'x-custom-header': z.string(),
}))

// Incorrect - will not match
zValidator('header', z.object({
  'Content-Type': z.string(),     // Won't work
  'Authorization': z.string(),    // Won't work
}))
```
