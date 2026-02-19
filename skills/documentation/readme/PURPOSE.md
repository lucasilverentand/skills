# README

Generate and update README files for projects and packages.

## Responsibilities

- Generate README files from project context
- Keep README content up to date
- Ensure README includes accurate install, usage, and configuration instructions
- Validate that code examples in README are syntactically correct

## Tools

- `tools/readme-gen.ts` — scaffold a README from package.json, tsconfig, and directory structure
- `tools/example-validator.ts` — extract code blocks from markdown and type-check them with bun
- `tools/badge-sync.ts` — generate and update status badges for CI, coverage, and npm version
