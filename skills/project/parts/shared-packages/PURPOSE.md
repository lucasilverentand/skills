# Shared Packages

Guidance for creating and maintaining shared workspace packages.

## Responsibilities

- Establish conventions for shared packages
- Guide package creation and maintenance
- Enforce consistent tsconfig and build output settings
- Ensure packages declare peer dependencies correctly
- Manage package versioning and changelog conventions

## Tools

- `tools/package-scaffold.ts` — generate a new shared package with tsconfig, index.ts, and package.json
- `tools/export-check.ts` — verify that each package's exports map matches its actual entry points
- `tools/unused-packages.ts` — detect shared packages that are not imported by any app or other package
