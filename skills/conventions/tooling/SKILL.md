---
name: tooling
description: Opinionated tooling decisions — which runtime, linter, framework, container engine, database, and deployment target to use and why. Use when choosing between tools for a new project, evaluating whether to adopt a technology, or wondering "should I use X or Y?"
---

# Tooling Decisions

## Decision Tree

- What are you choosing?
  - **Runtime / package manager** → see "Runtime" below
  - **Linter / formatter** → see "Code Quality" below
  - **Web framework (pages / content)** → see "Web Framework" below
  - **API framework** → see "API Framework" below
  - **Database** → see "Database" below
  - **Container runtime** → see "Containers" below
  - **Deployment target** → see "Deployment" below
  - **CSS / styling** → see "Styling" below
  - **Authentication** → see "Auth" below
  - **Inherited project with different tools** → see "When to Break the Rules" below

## Decisions

### Runtime

| Choose | Instead of | Why |
|---|---|---|
| **Bun** | Node, Deno | Single tool for runtime, test runner, and package manager. Faster installs, native TS execution, built-in SQLite. Simplifies the toolchain from three tools to one. |

Use `bun` for everything: `bun run`, `bun test`, `bun install`, `bunx`. Never `npm`, `npx`, `yarn`, `pnpm`.

### Code Quality

| Choose | Instead of | Why |
|---|---|---|
| **Biome** | ESLint + Prettier | One tool replaces two. Faster (Rust-based), zero config for sensible defaults, consistent formatting + linting in a single pass. |

Remove ESLint and Prettier from any project that has them. See `project/structure` for Biome setup.

### Web Framework

| Choose | Instead of | Why |
|---|---|---|
| **Astro** | Next.js, Remix, Gatsby | Ships zero JS by default — add interactivity only where needed via islands. No vendor lock-in to Vercel. Simpler mental model for content-heavy sites. |

Use Astro for marketing sites, docs, blogs, and content-driven apps. For pure SPAs, use Vite + React directly.

### API Framework

| Choose | Instead of | Why |
|---|---|---|
| **Hono** | Express, Fastify, Nest | Tiny, fast, runs everywhere (Cloudflare Workers, Bun, Node, Deno). Web-standard Request/Response. First-class middleware and type-safe routes. |

See `development/typescript/api` for Hono patterns and route conventions.

### Database

| Scenario | Choose | Why |
|---|---|---|
| Small project, single region | **D1 / SQLite** | Zero-config, embedded, free tier on Cloudflare. Good enough for most apps. |
| Complex queries, multi-region, relational joins | **Postgres (Neon)** | Serverless Postgres with branching. Full SQL power when SQLite hits its limits. |

Use **Drizzle** as the ORM in both cases. See `development/typescript/database` for schema and migration patterns.

### Containers

| Choose | Instead of | Why |
|---|---|---|
| **OrbStack** | Docker Desktop | Faster startup, lower memory, native macOS integration, same Docker CLI. Drop-in replacement. |

See `infrastructure/docker` for container configuration.

### Deployment

| Scenario | Choose | Why |
|---|---|---|
| Edge functions, static sites, Workers | **Cloudflare** | Global edge network, generous free tier, D1/R2/KV ecosystem. Best for serverless. |
| Long-running processes, full containers | **Railway** | Simple container deploys with persistent storage. Good for APIs that need background jobs or WebSockets. |
| Homelab / self-hosted | **Kubernetes** | Full control, GitOps with Flux CD. See `infrastructure/gitops`. |

See `deployment/cloudflare`, `deployment/railway`, `deployment/kubernetes` for deploy workflows.

### Styling

| Platform | Choose | Instead of | Why |
|---|---|---|---|
| Web | **Tailwind CSS** | CSS modules, styled-components, Emotion | Utility-first, no context switching to CSS files, purges unused styles, consistent design tokens. |
| React Native | **NativeWind** | StyleSheet.create, Tamagui, Unistyles | Tailwind syntax in React Native. Same mental model as web. |

### Auth

| Choose | Instead of | Why |
|---|---|---|
| **Better Auth** | NextAuth, Clerk, Auth0, Lucia | Self-hosted, framework-agnostic, works with Hono and Expo. No vendor dependency for auth. Supports `@better-auth/expo` for React Native. |

## When to Break the Rules

These preferences are for **new projects you control**. Break them when:

- **Inherited codebase** — don't rewrite a working Express app to Hono just because. Adopt conventions incrementally.
- **Team constraints** — if the team knows React Native but not NativeWind, ship first, migrate later.
- **Platform requirements** — some hosting requires Node (not Bun), some clients require specific frameworks.
- **Client/contract work** — match the client's existing stack unless they explicitly want your recommendations.

The goal is consistency within projects, not religious adherence across all contexts.
