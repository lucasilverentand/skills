# Parts

Unified skill for navigating, creating, and maintaining monorepo workspace packages. Covers all package types: infrastructure (config, types, schema, utils, logger), features (auth, payments, email, analytics, notifications, i18n), and apps (Expo, iOS, React dashboard, Astro website, CLI tools, UI library).

## Responsibilities

- Route to the right component type via the decision tree in SKILL.md
- Provide per-component setup guides and conventions in references/
- Validate package structure and dependency graphs
- Scaffold new packages with correct boilerplate
- Audit cross-cutting concerns (exports, circular deps, unused packages)

## Tools

- `tools/part-list.ts` — list all workspace parts with type and dependencies
- `tools/part-validate.ts` — check each part for required files, exports, and package.json fields
- `tools/part-deps.ts` — show the internal dependency graph, detect circular dependencies
- `tools/export-check.ts` — verify exports map entries resolve to real files
- `tools/package-scaffold.ts` — generate new package with tsconfig, index.ts, package.json
- Plus 30+ component-specific tools for auditing, scaffolding, and checking
