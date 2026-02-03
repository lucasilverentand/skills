---
name: openapi-spec
description: Creates OpenAPI/Swagger specifications for APIs. Use when documenting REST APIs, generating API clients, or creating API contracts.
argument-hint: [api-path]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# OpenAPI Specification

Creates OpenAPI (Swagger) specifications for REST APIs.

## Your Task

1. **Identify endpoints**: List all API routes
2. **Define schemas**: Create request/response models
3. **Write spec**: Create openapi.yaml or openapi.json
4. **Validate**: Check spec validity
5. **Generate docs**: Set up documentation UI

## OpenAPI Template

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: API description

servers:
  - url: https://api.example.com/v1
    description: Production

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'

    post:
      summary: Create user
      operationId: createUser
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserInput'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string

    CreateUserInput:
      type: object
      required: [email]
      properties:
        email:
          type: string
          format: email
        name:
          type: string

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

## Tips

- Use `$ref` to reuse schemas
- Add `operationId` for client generation
- Use tags to organize endpoints
- Include example values for better docs
