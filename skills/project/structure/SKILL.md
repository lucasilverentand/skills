---
name: structure
description: Scaffolds new projects and monorepos, configures bun workspaces, tsconfig project references, and shared tooling (Biome, CI). Manages ongoing monorepo operations including workspace dependencies, cross-package builds, and adding new packages. Use when starting a new project, adding a workspace package, managing dependencies between packages, or auditing structure and naming across the repo.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Project Structure

## Decision Tree

- What are you doing?
  - **Scaffolding a new project** → what kind of project?
    - **Standalone app or service** (single package) → run `tools/scaffold-project.ts --type standalone`, then follow "New project setup" below
    - **Monorepo with multiple packages** → run `tools/scaffold-project.ts --type monorepo`, then follow "Monorepo layout" below
    - **Not sure yet** → does the project have more than one deployable artifact or shared libraries?
      - **Yes** → monorepo
      - **No** → standalone
  - **Adding a workspace package** → follow "Adding a package" below
  - **Managing workspace dependencies** → what specifically?
    - **Linking a package to another** → follow "Dependency linking" in Monorepo Management below
    - **Versioning workspace packages** → follow "Workspace versioning" below
    - **Resolving workspace dependency issues** → run `tools/workspace-graph.ts`, check for circular deps, then follow "Dependency troubleshooting" below
  - **Running cross-package builds or scripts** → follow "Build orchestration" below
  - **Auditing or fixing structure** → run `tools/convention-check.ts` then fix reported violations
  - **Checking workspace dependencies** → run `tools/workspace-graph.ts`
  - **Listing all dev scripts** → run `tools/script-list.ts`
  - **Checking script health** → run `tools/script-audit.ts`

## New project setup

1. Determine project type:
   - **Standalone app** → single `package.json` at root, no workspaces
   - **Monorepo with multiple packages** → bun workspaces layout (see "Monorepo layout" below)
2. Run `tools/scaffold-project.ts` — pass `--type monorepo` or `--type standalone`
3. Set up shared tooling configs:
   - `biome.json` at root — extend from `@biomejs/biome` recommended, no eslint/prettier
   - `tsconfig.json` at root with `"composite": true` and `references` to each package
   - `.github/workflows/ci.yml` — lint, typecheck, test on push and PR
4. Add `.gitignore` — include `node_modules`, `.env`, `dist`, `.wrangler`
5. Add root `package.json` with `"workspaces": ["packages/*"]` for monorepos

## Monorepo layout

```
project-root/
  package.json         # root — workspaces, dev deps, scripts
  biome.json           # shared lint/format config
  tsconfig.json        # root tsconfig with project references
  .github/workflows/
  packages/
    config/            # env vars, feature flags → project/parts/config
    types/             # shared types → project/parts/types
    schema/            # db schema + migrations → project/parts/schema
    auth/              # Better Auth setup → project/parts/auth
    ui/                # component library → project/parts/ui
    email/             # email templates → project/parts/email
    api/               # Hono API → development/api
    web/               # website → project/parts/website
    app/               # Expo app → project/parts/expo-app
```

Only include packages the project actually needs — don't scaffold unused ones.

## Adding a package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Set `"name": "@<scope>/<name>"` in `package.json`
3. Add `"references": [{ "path": "../<name>" }]` to root `tsconfig.json`
4. Add `"<name>": "workspace:*"` to any packages that depend on it
5. Run `bun install` to link the workspace
6. If a project/parts skill exists for this package type, follow that skill for internal setup

## Monorepo Management

### Dependency linking

Link packages within the monorepo using `workspace:*` protocol:

```jsonc
// packages/api/package.json
{
  "dependencies": {
    "@scope/schema": "workspace:*",
    "@scope/config": "workspace:*"
  }
}
```

- Always use `workspace:*` — bun resolves to the local package automatically
- Import via the package name: `import { db } from "@scope/schema"`
- Each package must export from `src/index.ts` and have `"main"` or `"exports"` in `package.json`
- Run `tools/workspace-graph.ts` to visualize the dependency tree and catch circular dependencies

### Workspace versioning

- Use `workspace:*` for all internal dependencies during development
- For publishing: bun replaces `workspace:*` with the actual version at publish time
- Keep all workspace packages at the same version or use independent versioning — pick one per project
- Pin external dependency versions in the root `package.json` to keep packages aligned

### Build orchestration

Run scripts across all packages from the root:

```bash
# Run in all packages that have the script
bun run --filter '*' build

# Run in a specific package
bun run --filter '@scope/api' dev

# Run in packages matching a pattern
bun run --filter './packages/shared-*' typecheck
```

- Bun respects workspace dependency order — dependencies build before dependents
- Add root-level scripts for common operations:
  ```jsonc
  {
    "scripts": {
      "build": "bun run --filter '*' build",
      "check": "biome check .",
      "typecheck": "tsc --build",
      "test": "bun run --filter '*' test"
    }
  }
  ```
- Use `tsc --build` at root level — it follows project references and builds in dependency order

### How project/parts skills plug in

Each `project/parts/*` skill handles the internals of one package type. This skill handles the monorepo-level concerns:

| This skill handles | Parts skills handle |
|---|---|
| Workspace layout and structure | Internal package setup and config |
| Dependency linking between packages | Package-specific dependencies |
| Build orchestration and scripts | Package-specific build steps |
| Naming conventions and directory layout | Package-internal file structure |
| Adding/removing packages | Setting up package internals |

When adding a new package: use this skill for workspace integration, then delegate to the relevant parts skill for internal setup.

### Dependency troubleshooting

Common workspace dependency issues and fixes:

- **Package not found** → check `"name"` in the package's `package.json` matches the import, run `bun install`
- **Circular dependency** → run `tools/workspace-graph.ts`, extract shared code into a separate package (usually `types` or `utils`)
- **Stale types after changes** → run `tsc --build --force` to rebuild project references
- **Version mismatch on external dep** → move the dependency to root `package.json` so all packages share one version

## Dev tooling package

Internal dev tooling (`packages/tools/`) is a private workspace package that automates repetitive tasks across the monorepo — code generation, workspace utilities, build helpers. It is not published.

### Script conventions

Every script follows the same pattern:
- Every script has `--help`
- Every script that writes files has `--dry-run`
- Every script that outputs data has `--json`
- Scripts are self-contained — no build step needed, run directly with `bun run`
- Zero external dependencies — use Bun APIs (`Bun.file`, `Bun.Glob`, `Bun.spawn`)

### Common codegen patterns

- **Types from schema**: read Drizzle schema or Zod schemas, emit TypeScript interfaces
- **Route manifest**: scan file-based routes, emit a typed route map
- **API client**: read OpenAPI spec or route definitions, emit typed fetch wrappers
- **Barrel files**: scan a directory, generate `index.ts` that re-exports everything

### Workspace utilities

- **Dependency sync**: check that shared dependencies use the same version across packages
- **Config sync**: copy or merge `tsconfig.json`, `biome.json` from a template to all packages
- **Unused dependency check**: find `dependencies` entries that aren't imported anywhere
- **Workspace graph**: show which packages depend on which

## Naming conventions

- Package dirs: `kebab-case`
- Package names: `@scope/kebab-case`
- Source files: `kebab-case.ts`
- Exported symbols: `camelCase` for functions/vars, `PascalCase` for types/classes
- Run `tools/convention-check.ts` to validate

## Key references

| File | What it covers |
|---|---|
| `tools/scaffold-project.ts` | Full project scaffolding with all boilerplate |
| `tools/convention-check.ts` | Validates naming and layout against conventions |
| `tools/workspace-graph.ts` | Bun workspace dependency graph as a tree |
| `tools/script-list.ts` | List all scripts in the tools package with descriptions |
| `tools/script-audit.ts` | Check that all scripts have --help, --json, and --dry-run flags |
