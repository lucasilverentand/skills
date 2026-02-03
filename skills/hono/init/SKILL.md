---
name: hono-init
description: Initializes new Hono web applications for various runtimes including Cloudflare Workers, Node.js, Bun, Deno, Vercel, and AWS Lambda. Use when creating a new Hono project, scaffolding application structure, setting up for a specific runtime, or adding Hono to an existing project.
argument-hint: [runtime]
allowed-tools: [Bash, Read, Write, Glob]
---

# Hono Project Initialization

Guide users through creating new Hono web applications with proper configuration for their target runtime.

## Your Task

Help the user initialize a Hono project by:

1. **Determine target runtime** from `$ARGUMENTS` or ask:
   - `cloudflare` - Cloudflare Workers/Pages
   - `node` - Node.js with @hono/node-server
   - `bun` - Bun runtime
   - `deno` - Deno runtime
   - `vercel` - Vercel Edge Functions
   - `aws-lambda` - AWS Lambda

2. **Check existing project state:**
   - Look for existing `package.json`, `deno.json`, or `bun.lockb`
   - Check for existing Hono installation
   - Offer to add Hono to existing project or create new

3. **Create or scaffold the project:**
   - Use `create-hono` for new projects
   - Install dependencies manually for existing projects

4. **Set up TypeScript configuration**
5. **Create initial application structure**
6. **Provide next steps and development commands**

## Quick Start Commands

### New Project (Recommended)

```bash
# npm
npm create hono@latest my-app

# yarn
yarn create hono my-app

# pnpm
pnpm create hono@latest my-app

# bun
bun create hono@latest my-app

# deno
deno init --npm hono@latest my-app
```

Select the appropriate template when prompted.

### Add to Existing Project

```bash
# npm
npm install hono

# For Node.js, also install:
npm install @hono/node-server

# For validation:
npm install @hono/zod-validator zod
```

## Runtime-Specific Setup

### Cloudflare Workers

**Project Structure:**

```text
my-app/
├── src/
│   └── index.ts
├── wrangler.toml
├── package.json
└── tsconfig.json
```

**wrangler.toml:**

```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
MY_VAR = "my-value"
```

**src/index.ts:**

```typescript
import { Hono } from "hono";

type Bindings = {
  MY_VAR: string;
  // Add KV, D1, R2 bindings here
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Cloudflare Workers!");
});

export default app;
```

**package.json scripts:**

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}
```

**Development:**

```bash
npm run dev
# Opens http://localhost:8787
```

### Node.js

**Project Structure:**

```text
my-app/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

**src/index.ts:**

```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Node.js!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

**package.json:**

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Bun

**Project Structure:**

```text
my-app/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

**src/index.ts:**

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Bun!");
});

export default {
  port: 3000,
  fetch: app.fetch,
};
```

**package.json:**

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "start": "bun run src/index.ts"
  },
  "dependencies": {
    "hono": "^4.0.0"
  }
}
```

### Deno

**Project Structure:**

```text
my-app/
├── main.ts
└── deno.json
```

**main.ts:**

```typescript
import { Hono } from "npm:hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Deno!");
});

Deno.serve(app.fetch);
```

**deno.json:**

```json
{
  "tasks": {
    "dev": "deno run --allow-net --watch main.ts",
    "start": "deno run --allow-net main.ts"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@hono/hono/jsx"
  }
}
```

### Vercel Edge Functions

**Project Structure:**

```text
my-app/
├── api/
│   └── index.ts
├── vercel.json
├── package.json
└── tsconfig.json
```

**api/index.ts:**

```typescript
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Hello Vercel!" });
});

export const GET = handle(app);
export const POST = handle(app);
```

**vercel.json:**

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api" }]
}
```

### AWS Lambda

**src/index.ts:**

```typescript
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello Lambda!" });
});

export const handler = handle(app);
```

## TypeScript Configuration

**tsconfig.json (recommended):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Remove `"types": ["@cloudflare/workers-types"]` for non-Cloudflare runtimes.

## Recommended Dependencies

### Core

- `hono` - The framework itself

### Validation

- `@hono/zod-validator` - Zod integration
- `zod` - Schema validation

### Testing

- `vitest` - Test runner (recommended)
- `@cloudflare/vitest-pool-workers` - Cloudflare-specific testing

### Development

- `tsx` - TypeScript execution (Node.js)
- `wrangler` - Cloudflare CLI

## Project Structure Conventions

```text
my-app/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Route handlers
│   │   ├── users.ts
│   │   └── posts.ts
│   ├── middleware/       # Custom middleware
│   │   └── auth.ts
│   ├── validators/       # Validation schemas
│   │   └── schemas.ts
│   └── types/           # TypeScript types
│       └── index.ts
├── tests/               # Test files
├── public/              # Static assets (if needed)
├── package.json
├── tsconfig.json
└── wrangler.toml        # Cloudflare only
```

## Next Steps After Initialization

1. **Run development server:**

   ```bash
   npm run dev
   ```

2. **Add routes:**
   Create route handlers in `src/routes/`

3. **Add middleware:**
   Set up logging, CORS, authentication

4. **Add validation:**
   Install `@hono/zod-validator` and create schemas

5. **Set up testing:**
   Create test files and configure test runner

## Common Issues

### "Cannot find module 'hono'"

- Ensure dependencies are installed: `npm install`
- Check `package.json` has `"type": "module"` for ESM

### TypeScript JSX errors

- Add JSX configuration to `tsconfig.json`
- Use `.tsx` extension for files with JSX

### Port already in use

- Change port in configuration
- Kill existing process: `lsof -i :3000` then `kill <PID>`
