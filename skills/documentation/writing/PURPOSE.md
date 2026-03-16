# Writing

Write and maintain project documentation — READMEs, contributing guides, architecture overviews, and GitHub templates.

## Responsibilities

- Generate and update README files for any project type
- Create and maintain CONTRIBUTING.md with development setup, branching, and commit conventions
- Set up PR and issue templates, CODEOWNERS, security policies, and code of conduct
- Write architecture documentation with Mermaid diagrams
- Validate code examples and documented setup steps
- Keep badges, install instructions, and API docs current

## Tools

- `tools/readme-gen.ts` — scaffold a README from package.json, tsconfig, and directory structure
- `tools/contrib-gen.ts` — scaffold a CONTRIBUTING.md based on repo tooling, test runner, and branch strategy
- `tools/template-scaffold.ts` — generate GitHub issue and PR templates from project conventions
- `tools/example-validator.ts` — extract code blocks from markdown and type-check them with bun
- `tools/badge-sync.ts` — generate and update status badges for CI, coverage, and npm version
- `tools/setup-validator.ts` — verify that documented setup steps actually work
- `tools/mermaid-gen.ts` — generate Mermaid diagrams from module imports and database schema definitions

## Cross-references

- ADR scaffolding: `development/knowledge` (tools/adr-create.ts)
- Environment variable documentation: `project/parts/config` (tools/env-docs.ts)
