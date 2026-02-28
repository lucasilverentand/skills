---
name: shared-packages
description: Creates and maintains shared workspace packages in a bun monorepo — package scaffolding, tsconfig inheritance, exports map, peer dependencies, versioning, and unused package detection. Use when adding a new shared package, fixing broken imports between packages, auditing unused packages, or establishing monorepo conventions for the first time.
allowed-tools: Read Write Edit Glob Grep Bash
---

# Shared Packages

## Decision Tree

- What are you working on?
  - **Creating a new shared package** → follow "Scaffold a package" workflow
  - **Broken imports between packages** → what kind of import error?
    - **"Module not found" or "Cannot find module"** → run `tools/export-check.ts` to verify exports map entries resolve, then check consuming package has the dependency in `package.json`
    - **"Cannot find type" or type errors on import** → check `tsconfig.json` extends root config and has correct `rootDir`/`include`, run `bun install` to refresh workspace links
    - **Circular dependency error** → run `tools/unused-packages.ts` to visualize the dependency graph, then break the cycle by extracting shared code into a lower-level package
  - **Checking what packages exist** → run `tools/export-check.ts`
  - **Finding unused packages** → run `tools/unused-packages.ts`
  - **Setting up monorepo for the first time** → see "Workspace setup" section

## Workspace setup

Root `package.json`:
```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

Root `tsconfig.json` — base config inherited by all packages:
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

## Scaffold a package

1. Run `tools/package-scaffold.ts <name>` or create manually:
   ```
   packages/<name>/
     src/
       index.ts
     package.json
     tsconfig.json
   ```
2. `package.json` — minimal, no build step (Bun resolves `.ts` directly):
   ```json
   {
     "name": "@<project>/<name>",
     "type": "module",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```
3. `tsconfig.json` — extend from root:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src"]
   }
   ```
4. Add the package as a dependency in the consuming app: `bun add @<project>/<name>`

## Exports map rules

- Always declare an `exports` map — do not rely on `main`
- Each entry point (`"."`, `"./utils"`) must map to an actual file
- Run `tools/export-check.ts` to verify all entries resolve
- Keep public surface minimal — only export what consuming packages actually need

## Peer dependencies

- Declare peer deps for anything the consuming package must provide (React, Hono, etc.)
- List exact peer version ranges in `peerDependencies`, not `dependencies`
- Test that importing the package in an app without the peer dep gives a useful error

## Versioning

- In most projects: no version field or `"version": "0.0.0"` — packages are path-resolved, not published
- If publishing to npm: use conventional commits + changesets for versioning
- Keep a `CHANGELOG.md` per package for any published packages

## Conventions

- One package per concern — don't combine schema + logger into one package
- Package names follow `@<project>/<name>` pattern
- `src/index.ts` is the only required entry point; add more only if the surface warrants it
- No circular dependencies between packages — check import chains manually or use the `types` skill's `tools/circular-check.ts`

## Key references

| File | What it covers |
|---|---|
| `tools/package-scaffold.ts` | Generate new package with tsconfig, index.ts, and package.json |
| `tools/export-check.ts` | Verify exports map matches actual entry points |
| `tools/unused-packages.ts` | Detect packages not imported by any app or other package |
