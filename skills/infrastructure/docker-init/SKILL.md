---
name: docker-init
description: Creates optimized Dockerfiles for various runtimes. Use when containerizing applications, optimizing image sizes, or setting up Docker builds.
argument-hint: [runtime]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Docker Init

Creates optimized Dockerfiles with multi-stage builds and security best practices.

## Your Task

1. **Detect runtime**: Identify the application type (Node, Python, Go, etc.)
2. **Create Dockerfile**: Write optimized multi-stage Dockerfile
3. **Add .dockerignore**: Exclude unnecessary files
4. **Verify**: Build and test the image
5. **Document**: Add build instructions

## Node.js Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./
USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Python Dockerfile

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt > requirements.txt
COPY . .

FROM python:3.12-slim AS runner
WORKDIR /app
RUN useradd --create-home app
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --from=builder --chown=app:app /app .
USER app
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0"]
```

## .dockerignore

```
node_modules
.git
.env*
*.log
dist
coverage
.next
```

## Tips

- Use multi-stage builds to reduce image size
- Run as non-root user for security
- Pin base image versions
- Use .dockerignore to speed up builds
