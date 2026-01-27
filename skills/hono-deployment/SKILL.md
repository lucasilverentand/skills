---
name: hono-deployment
description: Deploy Hono applications to various runtimes and platforms. Use when deploying Hono to Cloudflare, Vercel, AWS, or other platforms.
argument-hint: [platform]
---

# Hono Deployment

Guide to deploying Hono applications across different runtimes and platforms.

Based on `$ARGUMENTS`, provide deployment guidance for the specified platform.

## Cloudflare Workers

### Project Setup

```bash
npm create hono@latest my-app
# Select 'cloudflare-workers' template
cd my-app
npm install
```

### wrangler.toml Configuration

```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Environment variables
[vars]
API_VERSION = "v1"
NODE_ENV = "production"

# KV Namespace binding
[[kv_namespaces]]
binding = "CACHE"
id = "abc123"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xyz789"

# R2 Bucket binding
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"
```

### Application Code

```typescript
// src/index.ts
import { Hono } from 'hono'

type Bindings = {
  API_VERSION: string
  NODE_ENV: string
  CACHE: KVNamespace
  DB: D1Database
  BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.json({ version: c.env.API_VERSION })
})

app.get('/cache/:key', async (c) => {
  const value = await c.env.CACHE.get(c.req.param('key'))
  return c.json({ value })
})

export default app
```

### Local Development

```bash
# Create .dev.vars for local secrets
echo "SECRET_KEY=dev-secret" > .dev.vars

# Run development server
npm run dev
# Opens http://localhost:8787
```

### Deployment

```bash
# Deploy to Cloudflare
npm run deploy
# or
wrangler deploy
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Cloudflare Pages

### Setup for Pages Functions

```bash
npm create hono@latest my-app
# Select 'cloudflare-pages' template
```

### Pages Project Structure

```text
my-app/
├── functions/
│   └── [[route]].ts    # Catch-all route
├── public/
│   └── index.html      # Static files
├── package.json
└── wrangler.toml
```

### functions/[[route]].ts

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => c.json({ message: 'Hello from Pages!' }))

export const onRequest = handle(app)
```

### Pages Deployment

```bash
# Deploy to Pages
wrangler pages deploy public
```

## Node.js

### Node.js Setup

```bash
npm create hono@latest my-app
# Select 'nodejs' template
cd my-app
npm install
```

### Node.js Application Code

```typescript
// src/index.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.get('/', (c) => c.text('Hello Node.js!'))

const port = parseInt(process.env.PORT || '3000')

console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
```

### Graceful Shutdown

```typescript
import { serve } from '@hono/node-server'

const server = serve({
  fetch: app.fetch,
  port: 3000,
})

const shutdown = () => {
  console.log('Shutting down...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

### Node.js Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/dist ./dist
COPY --from=builder --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/package.json ./

USER hono
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Bun

### Bun Setup

```bash
bun create hono@latest my-app
cd my-app
bun install
```

### Bun Application Code

```typescript
// src/index.ts
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.get('/', (c) => c.text('Hello Bun!'))

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
```

### Dockerfile for Bun

```dockerfile
FROM oven/bun:1 AS base

FROM base AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

USER bun
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

## Deno

### Deno Setup

```bash
deno init --npm hono@latest my-app
cd my-app
```

### Deno Application Code

```typescript
// main.ts
import { Hono } from 'npm:hono'
import { serveStatic } from 'npm:hono/deno'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.get('/', (c) => c.text('Hello Deno!'))

Deno.serve({ port: 3000 }, app.fetch)
```

### deno.json

```json
{
  "tasks": {
    "dev": "deno run --allow-net --allow-read --watch main.ts",
    "start": "deno run --allow-net --allow-read main.ts"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@hono/hono/jsx"
  }
}
```

### Deno Deploy

```bash
# Install deployctl
deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy --project=my-project main.ts
```

## Vercel

### Vercel Setup

```bash
npm create hono@latest my-app
# Select 'vercel' template
```

### Vercel Project Structure

```text
my-app/
├── api/
│   └── [[...route]].ts
├── vercel.json
└── package.json
```

### api/[[...route]].ts

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const config = {
  runtime: 'edge',
}

const app = new Hono().basePath('/api')

app.get('/hello', (c) => c.json({ message: 'Hello Vercel!' }))

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
```

### vercel.json

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## AWS Lambda

### Lambda Setup

```bash
npm create hono@latest my-app
# Select 'aws-lambda' template
```

### Lambda Application Code

```typescript
// src/index.ts
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Hello Lambda!' }))

export const handler = handle(app)
```

### serverless.yml (Serverless Framework)

```yaml
service: my-hono-app

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    NODE_ENV: production

functions:
  api:
    handler: dist/index.handler
    events:
      - httpApi: '*'

plugins:
  - serverless-esbuild

custom:
  esbuild:
    bundle: true
    minify: true
```

### SAM Template

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    Runtime: nodejs20.x

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/index.handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
```

## Google Cloud Run

### Cloud Run Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
```

### Cloud Run Deployment

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/my-app

# Deploy to Cloud Run
gcloud run deploy my-app \
  --image gcr.io/PROJECT_ID/my-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Azure Functions

### Azure Setup

```bash
npm create hono@latest my-app
# Select 'azure-functions' template
```

### Azure Application Code

```typescript
// src/functions/api.ts
import { Hono } from 'hono'
import { azureFunction } from '@hono/azure-functions'

const app = new Hono()

app.get('/api/hello', (c) => c.json({ message: 'Hello Azure!' }))

export default azureFunction(app)
```

### host.json

```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": ""
    }
  }
}
```

## Environment Variables

### Platform-Specific Patterns

**Cloudflare Workers:**

```toml
# wrangler.toml
[vars]
PUBLIC_VAR = "value"

# Secrets (CLI)
# wrangler secret put SECRET_KEY
```

**Node.js/Bun:**

```bash
# .env file
DATABASE_URL=postgres://localhost/db
API_KEY=secret

# Load with dotenv or built-in support
```

**Vercel:**

```bash
# CLI
vercel env add DATABASE_URL

# Or via dashboard
```

**AWS Lambda:**

```yaml
# serverless.yml
provider:
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
```

## Production Checklist

### Security

- [ ] Enable HTTPS/TLS
- [ ] Configure CORS appropriately
- [ ] Add security headers (Secure Headers middleware)
- [ ] Enable CSRF protection where needed
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting

### Performance

- [ ] Enable compression (gzip/brotli)
- [ ] Configure caching headers
- [ ] Use CDN for static assets
- [ ] Minimize bundle size
- [ ] Enable HTTP/2 where possible

### Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging
- [ ] Add health check endpoint
- [ ] Set up uptime monitoring
- [ ] Configure alerting

### Reliability

- [ ] Implement graceful shutdown
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline
- [ ] Create staging environment
- [ ] Plan rollback strategy
