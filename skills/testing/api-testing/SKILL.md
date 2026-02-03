---
name: api-testing
description: Sets up API testing for REST and GraphQL endpoints. Use when testing HTTP endpoints, validating API contracts, or creating integration tests.
argument-hint: [endpoint]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# API Testing

Sets up API testing for REST and GraphQL endpoints.

## Your Task

1. **Identify endpoints**: Find API routes to test
2. **Set up test client**: Configure supertest or similar
3. **Write tests**: Cover success and error cases
4. **Mock dependencies**: Isolate external services
5. **Run and verify**: Execute tests

## Quick Start

```bash
npm install -D supertest @types/supertest
```

## REST API Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Users API', () => {
  it('GET /users returns user list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  it('POST /users creates user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201);

    expect(response.body.user.name).toBe('Test');
  });

  it('GET /users/:id returns 404 for missing user', async () => {
    await request(app)
      .get('/api/users/nonexistent')
      .expect(404);
  });
});
```

## GraphQL Test Example

```typescript
import request from 'supertest';
import { app } from '../src/app';

it('queries users successfully', async () => {
  const response = await request(app)
    .post('/graphql')
    .send({
      query: `
        query {
          users {
            id
            name
          }
        }
      `,
    })
    .expect(200);

  expect(response.body.data.users).toBeDefined();
});
```

## Tips

- Test both success and error responses
- Verify response schemas, not just status codes
- Use fixtures for consistent test data
- Mock external API calls
