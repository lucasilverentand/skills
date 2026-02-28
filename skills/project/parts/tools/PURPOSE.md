# Tools

Internal dev tooling package: code generation, workspace utilities, build and release scripts.

## Responsibilities

- Set up the tools package in a bun workspace monorepo
- Create code generation scripts (types, routes, barrel files, API clients)
- Build workspace utilities (dependency sync, config sync, workspace graph)
- Write build and release helpers (version bumping, changelog generation)
- Enforce script conventions (--help, --json, --dry-run flags)
- Manage script registration and cross-package access

## Tools

- `tools/script-list.ts` — list all scripts in a tools package with their descriptions and flags
- `tools/script-audit.ts` — check that all scripts follow conventions (--help, --json, --dry-run)
