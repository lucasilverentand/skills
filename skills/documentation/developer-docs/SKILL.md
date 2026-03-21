---
name: developer-docs
description: Writes and maintains project documentation — READMEs, CONTRIBUTING.md, architecture overviews, ADRs, GitHub templates, changelogs, and Mermaid diagrams — with built-in support for Library/CLI, Service, Monorepo, Expo, Rust, and Swift project types. Use when creating docs for a new project, updating existing documentation, scaffolding contributor workflows, or generating architecture diagrams from code.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Developer Docs

## Voice & Style
> See `documentation/style` for full guide (`references/voice-and-tone.md`)

Friendly and practical. Every example must be copy-pasteable. Tables for options and config. Start with the simplest use case, then show advanced patterns. No filler — every section earns its place.

> For substantial documents, follow the co-authoring workflow: `documentation/style` → `references/co-authoring-workflow.md`

## Decision Tree

- What do you need?
  - **README** → what kind of project?
    - **Published library or CLI tool** → follow "Generating a README" using the Library/CLI structure in `references/structures.md`
    - **Internal service or app** → follow "Generating a README" using the Internal Service structure in `references/structures.md`
    - **Workspace package in a monorepo** → follow "Generating a README" using the Workspace Package structure in `references/structures.md`
    - **Expo / React Native app** → use the Expo App structure in `references/structures.md`
    - **Rust CLI tool** → use the Rust CLI structure in `references/structures.md`
    - **Swift / iOS app** → use the Swift App structure in `references/structures.md`
  - **Existing README needs updating** → follow "Updating a README" below
  - **Code examples are stale or broken** → run `tools/example-validator.ts`
  - **Badges are outdated or missing** → see `references/badges.md` and run `tools/badge-sync.ts`
  - **Contributing guide** → does a CONTRIBUTING.md already exist?
    - **Yes** → run `tools/contrib-gen.ts --update` to merge new tooling into existing doc
    - **No** → run `tools/contrib-gen.ts` to scaffold from scratch
  - **PR or issue templates** → see `references/github-templates.md` and run `tools/template-scaffold.ts`
  - **CODEOWNERS** → see `references/github-templates.md` for format and patterns
  - **Security policy** → see `references/github-templates.md` for SECURITY.md template
  - **Code of conduct** → see `references/code-of-conduct.md`
  - **Architecture documentation** → follow "Architecture overview" below
  - **A significant design decision** → follow "ADR" below
  - **Data flow or module relationships** → run `tools/mermaid-gen.ts`
  - **Full project doc scaffold** → follow "Full scaffold" below
  - **Verifying setup steps work** → run `tools/setup-validator.ts` — are there failures?
    - **Yes** → fix the documented commands, then re-run until clean
    - **No** → setup docs are valid

## Full scaffold

For a new project that needs everything:

1. Read existing tooling: `package.json`, CI config, directory structure to understand the stack
2. Run `tools/readme-gen.ts` to generate README.md
3. Run `tools/contrib-gen.ts` to generate CONTRIBUTING.md
4. Run `tools/template-scaffold.ts` to generate PR and issue templates
5. Add `CODEOWNERS` if the project has multiple teams (see `references/github-templates.md`)
6. Add `SECURITY.md` for public projects (see `references/github-templates.md`)
7. Add `CODE_OF_CONDUCT.md` (see `references/code-of-conduct.md`)
8. Run `tools/badge-sync.ts` to add badges to the README
9. Run `tools/example-validator.ts` to verify code examples compile
10. Run `tools/setup-validator.ts` to verify documented setup steps execute cleanly

## Generating a README

1. Run `tools/readme-gen.ts` — it reads `package.json`, `tsconfig.json`, and directory structure
2. Review the scaffold and fill in using the appropriate structure from `references/structures.md`
3. Run `tools/example-validator.ts` to type-check embedded code blocks
4. Run `tools/badge-sync.ts` to add badges if applicable (see `references/badges.md`)

### README content ordering

1. **Title + tagline** — what this is in one line
2. **Badges** — CI, version, license (see `references/badges.md`)
3. **Install** — how to get it
4. **Quick Start** — shortest working example
5. **Usage** — features with examples
6. **Configuration** — options table
7. **API Reference** — inline or link to generated docs
8. **Contributing** — link to CONTRIBUTING.md
9. **License**

### Writing good examples

- Every example must be copy-pasteable and runnable
- Show the output in a comment: `// { ok: true, data: '...' }`
- Start with the simplest use case, then show advanced patterns
- Run `tools/example-validator.ts` to verify examples compile
- Full guidance: `references/examples-and-api.md`

### Install instructions

Choose the right install pattern for the project type. Include multiple package managers when applicable. See `references/examples-and-api.md` for all patterns.

### API documentation

- **Small libraries**: inline the API in the README with parameter tables and examples
- **Large libraries**: link to generated docs (TypeDoc, rustdoc, etc.)
- See `references/examples-and-api.md` for both patterns

## Updating a README

1. Read the current README and identify what has changed
2. Update sections that reference changed APIs, CLI flags, configuration, or install steps
3. Re-run `tools/example-validator.ts` — fail on any type errors in examples
4. Re-run `tools/badge-sync.ts` if the package has been published or CI config has changed

## Contributing guide

### CONTRIBUTING.md structure

Every CONTRIBUTING.md should cover these sections. Adapt depth to project size.

1. **Welcome and quick links** — short intro thanking contributors, linking to code of conduct, issue tracker, and discussion channels
2. **Development setup** — step-by-step instructions a new contributor can copy-paste, including prerequisites, install, and a verify step
3. **Branching strategy** — branching model and naming conventions
4. **Commit conventions** — commit format with examples (prefer Conventional Commits)
5. **Pull request process** — what a good PR looks like and how review works
6. **Testing requirements** — what tests are expected and how to run them
7. **Code style** — reference the formatter and linter config rather than listing rules

Run `tools/setup-validator.ts` to confirm documented setup commands succeed.

### Code of conduct

Use the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) as the default. See `references/code-of-conduct.md` for setup, customization, enforcement process, and a minimal alternative for small projects.

### CODEOWNERS

Assigns automatic reviewers based on file paths. Place at `.github/CODEOWNERS`. See `references/github-templates.md` for full syntax.

Key rules:
- Later rules override earlier ones (last match wins)
- Use `@org/team-name` for teams, `@username` for individuals
- Requires branch protection with "Require review from Code Owners" enabled

### Security policy

Public projects should have a `SECURITY.md` with supported versions, reporting instructions (not public issues), response timeline, and disclosure policy. See `references/github-templates.md`.

### GitHub repository settings

For a well-configured project, also set:
- **Branch protection on `main`**: require PR reviews, status checks, Code Owner reviews, linear history
- **Repository features**: enable Discussions and Security Advisories, disable wiki if using in-repo docs, add topics

## Architecture documentation

1. Read the project's directory structure and key entry points
2. Identify the major layers (e.g. API, workers, database, external services)
3. Write `docs/ARCHITECTURE.md` with:
   - **System overview** — what the system does and its main components
   - **Component diagram** — use Mermaid (`graph TD` or `C4Context`) via `tools/mermaid-gen.ts`
   - **Data flow** — how a request moves through the system end to end
   - **Key design decisions** — link to relevant ADRs

## ADR

> **Cross-reference:** Use `tools/adr-create.ts` to scaffold new ADRs.

1. Fill in the four sections:
   - **Context** — what situation forced a decision?
   - **Decision** — what was decided?
   - **Alternatives considered** — what else was on the table and why it was rejected
   - **Consequences** — what does this decision make easier or harder going forward?
2. Link the ADR from `ARCHITECTURE.md` or the relevant module's docs

## Mermaid diagrams

1. Run `tools/mermaid-gen.ts` to generate diagrams from module imports or database schema
2. Available diagram types: `flowchart`, `erDiagram`
3. Review the output — auto-generated diagrams often need manual cleanup for clarity
4. Embed diagrams directly in Markdown using fenced code blocks with `mermaid` language tag

## Badges

Badges provide at-a-glance project status. Use shields.io for consistency. Full reference in `references/badges.md`.

### Placement rules

- Place badges directly below the project title/tagline, before the first section
- Order: CI status, version, license, then optional (downloads, bundle size, coverage)
- Do not add badges for internal services or workspace packages
- Only include badges for services you actually use

## Keeping docs current

- Architecture docs drift fastest during major refactors — update `ARCHITECTURE.md` as part of those PRs
- Run `tools/mermaid-gen.ts` after schema changes to regenerate ER diagrams
- Run `tools/example-validator.ts` after API changes to catch stale examples
- Run `tools/setup-validator.ts` after tooling changes to verify setup docs still work

## Changelog

- Prefer a separate `CHANGELOG.md` or GitHub Releases over inlining in the README
- Link from the README: `See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.`
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Group changes: Added, Changed, Fixed, Removed, Security

## Social preview and SEO

- Upload a social preview image (1280x640px) in repo Settings > General
- Add relevant topics in repo Settings for discoverability
- Set a concise repo description (under 120 chars) for search results and social cards

## Key references

| File | What it covers |
|---|---|
| `references/structures.md` | Complete README templates: Library/CLI, Service, Workspace, Expo, Rust CLI, Swift |
| `references/badges.md` | Badge patterns, shields.io syntax, colors, dynamic badges |
| `references/examples-and-api.md` | Writing examples, inline API docs, install instructions, generated docs |
| `references/github-templates.md` | PR template, issue templates, CODEOWNERS, SECURITY.md, FUNDING.yml |
| `references/code-of-conduct.md` | Contributor Covenant setup, minimal CoC, enforcement process |
| `tools/readme-gen.ts` | Scaffold README from package.json, tsconfig, directory structure |
| `tools/contrib-gen.ts` | Scaffold CONTRIBUTING.md from repo tooling and branch strategy |
| `tools/template-scaffold.ts` | Generate GitHub PR and issue templates |
| `tools/example-validator.ts` | Extract and type-check code blocks from Markdown |
| `tools/badge-sync.ts` | Generate and update CI, coverage, npm version badges |
| `tools/setup-validator.ts` | Verify documented setup steps run cleanly |
| `tools/mermaid-gen.ts` | Generate Mermaid diagrams from modules and DB schema |
| `documentation/style` | Shared voice, tone, formatting, and quality standards |
| `project/scaffolding` | Project structure and environment config reference |
