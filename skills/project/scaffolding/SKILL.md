---
name: scaffolding
description: Guides navigation, creation, and maintenance of monorepo workspace packages (parts). Covers infrastructure packages (config, types, schema, utils, logger), feature packages (auth, payments, email, analytics, notifications, i18n), and app packages (Expo, iOS, React dashboard, Astro website, TanStack Router SPA, CLI tools, UI component library). Use when working across workspace packages, adding a new part, understanding which part owns a concern, or setting up any package type from scratch.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Project Parts

Each "part" is a workspace package with a dedicated responsibility. Parts live in `packages/` (libraries) or `apps/` (applications) and are linked via bun workspaces.

## Decision Tree

- What are you doing?
  - **Understanding what owns a concern** → what kind of concern?
    - Data layer (schema, migrations, DB client) → `references/schema.md`
    - Authentication or authorization → `references/auth.md`
    - Shared types or Zod schemas → `references/types.md`
    - Environment config or feature flags → `references/config.md`
    - UI components or design tokens → `references/ui.md`
    - Email sending or templates → `references/email.md`
    - Logging or observability → `references/logger.md`
    - Payments or subscriptions (Stripe) → `references/payments.md`
    - Push notifications → `references/notifications.md`
    - Analytics or feature flags (PostHog) → `references/analytics.md`
    - Internationalization → `references/i18n.md`
    - Pure utility functions → `references/utils.md`
    - Cross-cutting shared packages → `references/shared-packages.md`
  - **Building an app** → what kind?
    - Expo React Native app → `references/expo-app.md`
    - iOS Swift app → `references/ios-app.md`
    - React admin dashboard (React Router v7) → `references/react-dashboard.md`
    - React SPA with type-safe routing (TanStack Router) → `references/tanstack-app.md`
    - Astro marketing/content site → `references/website.md`
    - CLI tool (Bun or Rust) → `references/cli-tool.md`
  - **Adding a new part** → follow "Adding a part" below
  - **Validating parts are well-formed** → run `tools/part-validate.ts`
  - **Understanding dependencies between parts** → run `tools/part-deps.ts`
  - **Listing all parts** → run `tools/part-list.ts`
  - **Checking workspace exports resolve** → run `tools/export-check.ts`
  - **Scaffolding a new package** → run `tools/package-scaffold.ts <name>`

## Responsibility map

| Part | Owns |
|---|---|
| `config` | Env vars, feature flags, typed Zod-validated accessors. **All secret access goes through this package — never read `process.env` directly.** |
| `types` | Shared TypeScript types, Zod schemas, branded IDs |
| `schema` | Drizzle ORM table definitions, migrations, DB client |
| `auth` | Better Auth config, session types, middleware, RBAC |
| `ui` | Shared component library (Tailwind, design tokens) |
| `email` | React Email templates and sending utilities |
| `logger` | Structured logging (LogTape), sinks, redaction |
| `payments` | Stripe checkout, subscriptions, webhooks |
| `analytics` | PostHog tracking, feature flags, user identification |
| `notifications` | Push notifications (Expo, APNs, web push) |
| `i18n` | Translation files, locale detection, type-safe keys |
| `utils` | Pure helper functions (formatters, validators, transformers) |

When a concern doesn't fit any existing part, create a new one rather than polluting an existing one.

## Dependency rules

- `config` and `types` → no internal dependencies (leaf packages)
- `schema` → depends on `config`
- `auth` → depends on `schema`, `config`
- `api` → depends on `auth`, `schema`, `config`
- `web` and `app` → depend on `config`, `types`; may depend on `ui`
- `email`, `logger`, `payments`, `analytics` → depend on `config`
- `ui` → depends on `types` only

Never create circular dependencies. Run `tools/part-deps.ts` to verify.

## Adding a part

1. Create `packages/<name>/` with:
   - `package.json` — `"name": "@scope/<name>"`, `"type": "module"`, `"exports": { ".": "./src/index.ts" }`
   - `tsconfig.json` — extends root, sets `"rootDir": "./src"`
   - `src/index.ts` — named exports for all public API
2. Add to root `tsconfig.json` references
3. Add as a dependency in consuming packages: `bun add @scope/<name>`
4. Run `tools/part-validate.ts packages/<name>` to confirm structure
5. If the part handles secrets or API keys, add a `.env.example` with placeholder values documenting expected variables. Secrets are injected at runtime via Doppler — never stored in files. Configure redaction in `packages/logger` for any secret-adjacent logging. See `security/agent-safety` and `infrastructure/secrets`.

## Workspace setup

Root `package.json`:
```json
{ "workspaces": ["packages/*", "apps/*"] }
```

Root `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "isolatedModules": true
  }
}
```

## Key references

| File | What it covers |
|---|---|
| `tools/part-list.ts` | All workspace parts with type and dependencies |
| `tools/part-validate.ts` | Required files, exports, package.json fields |
| `tools/part-deps.ts` | Internal dependency graph, circular dependency detection |
| `tools/export-check.ts` | Verify exports map entries resolve to real files |
| `tools/package-scaffold.ts` | Generate new package with tsconfig, index.ts, package.json |
| `references/*.md` | Per-component-type setup guides and conventions |
