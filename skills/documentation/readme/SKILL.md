---
name: readme
description: Generates and updates README files for projects and packages. Scaffolds content from package.json, directory structure, and tsconfig; validates code examples; and syncs badges. Use when creating a README for a new project or package, updating one after significant changes, or fixing stale examples and badges.
allowed-tools: Read Glob Bash Write Edit
---

# README

## Decision Tree

- What do you need?
  - **New project or package with no README** → what kind of project?
    - **Published library or CLI tool** → follow "Generating a README" using the Library/CLI structure in `references/structures.md`
    - **Internal service or app** → follow "Generating a README" using the Internal Service structure in `references/structures.md`
    - **Workspace package in a monorepo** → follow "Generating a README" using the Workspace Package structure in `references/structures.md`
    - **Expo / React Native app** → use the Expo App structure in `references/structures.md`
    - **Rust CLI tool** → use the Rust CLI structure in `references/structures.md`
    - **Swift / iOS app** → use the Swift App structure in `references/structures.md`
  - **Existing README needs updating** → follow "Updating a README" below
  - **Code examples are stale or broken** → run `tools/example-validator.ts`
  - **Badges are outdated or missing** → see `references/badges.md` and run `tools/badge-sync.ts`
  - **Need a README for a different audience** → is it for contributors?
    - **Yes** → use the `documentation/contributing` skill instead
    - **No** → follow the appropriate structure in `references/structures.md`

## Generating a README

1. Run `tools/readme-gen.ts` — it reads `package.json`, `tsconfig.json`, and directory structure
2. Review the scaffold and fill in using the appropriate structure from `references/structures.md`
3. Run `tools/example-validator.ts` to type-check embedded code blocks
4. Run `tools/badge-sync.ts` to add badges if applicable (see `references/badges.md`)

## Updating a README

1. Read the current README and identify what has changed
2. Update sections that reference changed APIs, CLI flags, configuration, or install steps
3. Re-run `tools/example-validator.ts` — fail on any type errors in examples
4. Re-run `tools/badge-sync.ts` if the package has been published or CI config has changed

## README principles

### Content ordering

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

Choose the right install pattern for the project type. Include multiple package managers when applicable:

```markdown
npm install package-name
# or
bun add package-name
# or
pnpm add package-name
```

For CLI tools, include global install and Homebrew options. For Rust crates, include `cargo add` and `cargo install`. See `references/examples-and-api.md` for all patterns.

### API documentation

- **Small libraries**: inline the API in the README with parameter tables and examples
- **Large libraries**: link to generated docs (TypeDoc, rustdoc, etc.)
- See `references/examples-and-api.md` for both patterns

## Badges

Badges provide at-a-glance project status. Use shields.io for consistency. Full reference in `references/badges.md`.

### Quick reference

```markdown
![CI](https://img.shields.io/github/actions/workflow/status/org/repo/ci.yml?branch=main&label=CI)
![npm](https://img.shields.io/npm/v/package-name)
![License](https://img.shields.io/github/license/org/repo)
```

### Placement rules

- Place badges directly below the project title/tagline, before the first section
- Order: CI status, version, license, then optional (downloads, bundle size, coverage)
- Do not add badges for internal services or workspace packages
- Only include badges for services you actually use

## Social preview and SEO

### GitHub social preview

- Upload a social preview image (1280x640px) in repo Settings > General
- Use a clean design with the project name and tagline
- This image shows when the repo is shared on social media

### GitHub topics

Add relevant topics in repo Settings for discoverability:
- Language: `typescript`, `rust`, `swift`
- Framework: `hono`, `expo`, `astro`
- Category: `cli`, `api`, `library`, `app`

### Description

Set a concise repo description (under 120 chars) that appears in search results and social cards.

## Changelog

For projects with a changelog:

- Prefer a separate `CHANGELOG.md` or GitHub Releases over inlining in the README
- Link from the README: `See [CHANGELOG.md](CHANGELOG.md) for a full list of changes.`
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Group changes: Added, Changed, Fixed, Removed, Security

## Key references

| File | What it covers |
|---|---|
| `references/structures.md` | Complete README templates: Library/CLI, Service, Workspace, Expo, Rust CLI, Swift |
| `references/badges.md` | Badge patterns, shields.io syntax, colors, dynamic badges |
| `references/examples-and-api.md` | Writing examples, inline API docs, install instructions, generated docs |
| `tools/readme-gen.ts` | Scaffold README from package.json, tsconfig, directory structure |
| `tools/example-validator.ts` | Extract and type-check code blocks from Markdown |
| `tools/badge-sync.ts` | Generate and update CI, coverage, npm version badges |
