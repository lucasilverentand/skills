---
name: rest-design
description: Designs RESTful API endpoints and resources. Use when planning API structure, naming endpoints, or following REST best practices.
argument-hint: [resource]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# REST API Design

Designs RESTful APIs following best practices.

## Your Task

1. **Identify resources**: Define the domain entities
2. **Design endpoints**: Plan URL structure
3. **Define methods**: Map HTTP methods to operations
4. **Plan responses**: Design response formats
5. **Document**: Create API reference

## REST Conventions

### URL Structure

```
GET    /users           # List users
POST   /users           # Create user
GET    /users/:id       # Get user
PUT    /users/:id       # Replace user
PATCH  /users/:id       # Update user
DELETE /users/:id       # Delete user

# Nested resources
GET    /users/:id/posts      # List user's posts
POST   /users/:id/posts      # Create post for user

# Query parameters
GET    /users?status=active&limit=20&offset=0
GET    /posts?sort=-createdAt&include=author
```

### HTTP Methods

| Method | Action | Idempotent |
|--------|--------|------------|
| GET | Read | Yes |
| POST | Create | No |
| PUT | Replace | Yes |
| PATCH | Update | Yes |
| DELETE | Delete | Yes |

### Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing auth |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business logic error |

## Response Format

```json
// Success (single resource)
{
  "data": { "id": "1", "name": "John" }
}

// Success (collection)
{
  "data": [{ "id": "1", "name": "John" }],
  "meta": { "total": 100, "limit": 20, "offset": 0 }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "field": "email", "message": "Invalid format" }]
  }
}
```

## Tips

- Use nouns for resources, not verbs
- Use plural names (/users not /user)
- Use hyphens for multi-word resources
- Version your API (/v1/users)
