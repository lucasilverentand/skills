---
name: api-docs
description: Generates API documentation from code. Use when documenting APIs, creating endpoint references, or setting up documentation sites.
argument-hint: [format]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# API Documentation

Generates API documentation from code and specifications.

## Your Task

1. **Identify API surface**: Find all endpoints/functions
2. **Choose format**: OpenAPI, TypeDoc, or custom
3. **Generate docs**: Create documentation
4. **Add examples**: Include request/response samples
5. **Publish**: Set up documentation hosting

## OpenAPI Documentation

```yaml
# Add to openapi.yaml
paths:
  /users:
    get:
      summary: List all users
      description: |
        Returns a paginated list of users. Results can be filtered
        by status and sorted by creation date.
      parameters:
        - name: status
          in: query
          description: Filter by user status
          schema:
            type: string
            enum: [active, inactive, pending]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              example:
                users:
                  - id: "abc123"
                    email: "user@example.com"
                    status: "active"
```

## TypeDoc Setup

```bash
npm install -D typedoc
```

```json
// typedoc.json
{
  "entryPoints": ["./src/index.ts"],
  "out": "docs",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "README.md"
}
```

## JSDoc Comments

```typescript
/**
 * Creates a new user in the system.
 *
 * @param data - The user creation data
 * @param data.email - User's email address
 * @param data.name - User's display name
 * @returns The created user object
 * @throws {ValidationError} If email is invalid
 *
 * @example
 * ```ts
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 * });
 * ```
 */
export async function createUser(data: CreateUserInput): Promise<User> {
  // implementation
}
```

## Documentation Hosting

- **Swagger UI** - Interactive API explorer
- **Redoc** - Clean API reference
- **Docusaurus** - Full documentation site
- **GitHub Pages** - Free static hosting

## Tips

- Include request/response examples
- Document error responses
- Keep docs close to code
- Automate doc generation in CI
