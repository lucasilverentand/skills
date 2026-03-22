---
name: description
description: Generates a comprehensive project description by scanning the codebase — covers purpose, tech stack, architecture, directory structure, dependencies, dev setup, CI/CD, configuration, and conventions. Use when asked to describe a project, give a project overview, summarize the codebase, profile a project, or explain what a project does and how it's built.
allowed-tools: Read Glob Grep Bash
---

# Project Description

## Current context

- Project root: `!pwd`
- Has package.json: `!test -f package.json && echo yes || echo no`
- Has README: `!test -f README.md && echo yes || echo no`

## Decision Tree

- What are you doing?
  - **Generating a full project description** → run `tools/project-describe.ts`, then compose the description following "Full description template" below
  - **Identifying the tech stack only** → run `tools/tech-stack-detect.ts`
  - **Mapping directory structure only** → run `tools/structure-map.ts`
  - **Quick summary ("what is this project?")** → run `tools/project-describe.ts --json`, summarize name, purpose, stack, and architecture type in 2-3 sentences
  - **Comparing two projects** → run `tools/project-describe.ts --json` in each project root, then diff the outputs section by section

## Full description template

When composing a project description, cover these sections in order. Skip sections that don't apply.

### 1. Name and purpose

State the project name and what it does in 1-2 sentences. Source: `package.json` name/description and the first paragraph of `README.md`.

### 2. Tech stack

List runtime, language, package manager, frameworks, testing tools, and linters. Run `tools/tech-stack-detect.ts` or pull from the `techStack` section of `tools/project-describe.ts --json`.

### 3. Architecture

Describe whether it's a monorepo or standalone, how many workspace packages exist, and what the major layers are (API, web, workers, shared libs). Identify entry points.

### 4. Directory structure

Show the top-level layout with brief descriptions of each directory's purpose. Run `tools/structure-map.ts` for an annotated tree.

### 5. Key dependencies

List the most important external dependencies grouped by role (framework, database, auth, UI, testing, tooling). For monorepos, also list internal workspace package relationships.

### 6. Development setup

Document how to install, build, run in dev mode, and test. Source: `package.json` scripts, `Makefile`, `Dockerfile`, or README setup section.

### 7. CI/CD

List CI pipelines, what they run (lint, test, build, deploy), and what triggers them. Source: `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`.

### 8. Configuration and environment

List config files (`.env.example`, `wrangler.toml`, `biome.json`, `tsconfig.json`) and what they control. Note any required environment variables.

### 9. API surface and entry points

Identify HTTP routes, CLI commands, event handlers, or exported modules that form the project's public interface.

### 10. Conventions

Note naming conventions, code style tools, commit conventions, and any project-specific patterns discovered.

## Data sources

| Section | Primary sources |
|---|---|
| Name and purpose | `package.json` name/description, `README.md` first paragraph |
| Tech stack | Lock files, `tsconfig.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `package.json` deps |
| Architecture | `workspaces` field, directory layout, entry points |
| Directory structure | Top-level dirs, `packages/` or `apps/` listing |
| Dependencies | `package.json` dependencies and devDependencies |
| Dev setup | `package.json` scripts, `README.md` setup section, `Makefile` |
| CI/CD | `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `Dockerfile` |
| Config/env | `.env.example`, `wrangler.toml`, `biome.json`, `tsconfig.json` |
| API surface | Route files, exported modules, OpenAPI specs |
| Conventions | `biome.json`, `.editorconfig`, commit hooks, naming patterns |

## Output format

- **For humans**: use the template sections above with markdown formatting
- **For downstream tools**: run with `--json` and pass the structured output
- **For a specific section**: run `tools/project-describe.ts --section <name>` where name is one of: name, stack, architecture, structure, deps, setup, ci, config, api, conventions

## Key references

| File | What it covers |
|---|---|
| `tools/project-describe.ts` | Full project profile — scans all signals and assembles structured output |
| `tools/tech-stack-detect.ts` | Detect runtime, language, frameworks, testing, linting, deployment targets |
| `tools/structure-map.ts` | Annotated directory tree with file counts and descriptions |
