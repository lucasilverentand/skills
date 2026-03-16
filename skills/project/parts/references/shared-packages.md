# Shared Packages

Cross-cutting conventions for creating and maintaining workspace packages in a bun monorepo.

## Scaffolding a package

Run `tools/package-scaffold.ts <name>` or create manually:

```
packages/<name>/
  src/index.ts
  package.json
  tsconfig.json
```

### package.json (no build step — Bun resolves .ts directly)

```json
{
  "name": "@<project>/<name>",
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
```

### tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src"]
}
```

## Exports map rules

- Always declare an `exports` map — do not rely on `main`
- Each entry point must map to an actual file
- Run `tools/export-check.ts` to verify all entries resolve
- Keep public surface minimal

## Peer dependencies

- Declare peer deps for anything the consuming package must provide (React, Hono, etc.)
- List exact peer version ranges in `peerDependencies`, not `dependencies`

## Conventions

- One package per concern
- Package names follow `@<project>/<name>` pattern
- `src/index.ts` is the only required entry point
- No circular dependencies between packages
- No version field needed for path-resolved packages (`"version": "0.0.0"`)

## Debugging broken imports

- "Module not found" → run `tools/export-check.ts`, verify consuming package has the dependency
- "Cannot find type" → check tsconfig extends root config, run `bun install` to refresh workspace links
- Circular dependency → run `tools/part-deps.ts` to visualize, extract shared code into a lower-level package
