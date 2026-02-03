---
name: docker-compose
description: Creates Docker Compose configurations for multi-container applications. Use when setting up local development environments or orchestrating multiple services.
argument-hint: [services]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Docker Compose

Creates Docker Compose configurations for multi-container applications.

## Your Task

1. **Identify services**: List all required containers
2. **Create compose file**: Write docker-compose.yml
3. **Configure networks**: Set up service communication
4. **Add volumes**: Configure persistent storage
5. **Test**: Run and verify the stack

## Web App with Database

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Development Override

```yaml
# docker-compose.override.yml
version: '3.8'

services:
  app:
    build:
      target: development
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
```

## Tips

- Use `depends_on` with health checks
- Use named volumes for persistence
- Use override files for dev vs prod
- Use `docker compose watch` for hot reload
