---
name: parts
description: Guides navigation and modification of monorepo workspace packages (parts). Explains how parts relate to each other, what each part is responsible for, and how to validate their structure. Use when working across multiple workspace packages, adding a new part, or understanding which part owns a given concern.
allowed-tools: Read Glob Grep Bash
---

# Project Parts

Each "part" is a workspace package with a dedicated responsibility. Parts live in `packages/` and are linked via bun workspaces.

## Decision Tree

- What are you doing?
  - **Understanding what owns a concern** → what kind of concern?
    - **Data layer** (schema, migrations, DB client) → `schema` part
    - **Authentication or authorization** → `auth` part
    - **API routes or server logic** → `api` part (see `project/parts/hono-api`)
    - **Shared types or interfaces** → `types` part
    - **Environment config or feature flags** → `config` part
    - **UI components or styling** → `ui` part
    - **Email sending or templates** → `email` part
    - **Logging or observability** → `logger` part
    - **Cross-cutting utility used by many parts** → `shared-packages` or `utils`
    - **None of the above** → create a new part (see "Adding a part" below)
  - **Adding a new part** → follow "Adding a part" below
  - **Validating parts are well-formed** → run `tools/part-validate.ts`
  - **Understanding dependencies between parts** → run `tools/part-deps.ts`
  - **Listing all parts and their types** → run `tools/part-list.ts`

## Responsibility map

| Part | Owns |
|---|---|
| `config` | Env vars, feature flags, typed accessors (Zod-validated) |
| `types` | Shared TypeScript types used across parts |
| `schema` | Drizzle ORM schema, migrations, db client |
| `auth` | Better Auth config, session types, middleware |
| `ui` | Shared component library (Tailwind) |
| `email` | Email templates and sending utilities |
| `api` | Hono API routes, handlers, middleware |
| `web` | Astro marketing/content site |
| `app` | Expo React Native app |
| `logger` | Logging utilities |
| `shared-packages` | Cross-cutting utilities used by many parts |
| `utils` | One-off helper functions |

When a concern doesn't fit any existing part, create a new one rather than polluting an existing one.

## Dependency rules

- `config` and `types` → no internal dependencies (leaf packages)
- `schema` → depends on `config`
- `auth` → depends on `schema`, `config`
- `api` → depends on `auth`, `schema`, `config`
- `web` and `app` → depend on `config`, `types`; may depend on `ui`
- `email` → depends on `config`
- `ui` → depends on `types` only

Never create circular dependencies. Run `tools/part-deps.ts` to verify.

## Adding a part

1. Create `packages/<name>/` with:
   - `package.json` — `"name": "@scope/<name>"`, correct dependencies
   - `tsconfig.json` — extends root, sets `"composite": true`
   - `src/index.ts` — named exports for all public API
2. Add to root `tsconfig.json` references
3. Add to bun workspace (automatic if in `packages/`)
4. Run `tools/part-validate.ts packages/<name>` to confirm structure

## Key references

| File | What it covers |
|---|---|
| `tools/part-list.ts` | All workspace parts with type and dependencies |
| `tools/part-validate.ts` | Required files, exports, package.json fields |
| `tools/part-deps.ts` | Internal dependency graph between parts |
| `skills/project/parts/astro-site/SKILL.md` | Astro site setup |
| `skills/project/parts/auth/SKILL.md` | Better Auth setup |
| `skills/project/parts/config/SKILL.md` | Config and env vars |
| `skills/project/parts/email/SKILL.md` | Email templates |
| `skills/project/parts/expo-app/SKILL.md` | Expo React Native app |
