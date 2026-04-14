---
name: project-context
description: Generates and maintains a hierarchical .context/ directory with architecture overviews, coding conventions, domain glossaries, and dependency maps that give any LLM working in the project the right background. Use when setting up a new project for AI-assisted development, when the user asks to create or update context docs, when onboarding a new LLM tool to an existing codebase, or when the user says the AI doesn't understand their project.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Project Context

Build and maintain the `.context/` directory — a set of markdown files that give any LLM (Claude, Cursor, Copilot, Windsurf, etc.) the background it needs to work effectively in this codebase. These files are tool-agnostic. Agent-specific files like CLAUDE.md or .cursorrules reference them.

## Current context

- Repo: !`basename $(git rev-parse --show-toplevel)`
- Root: !`git rev-parse --show-toplevel`
- Existing context: !`ls .context/ 2>/dev/null || echo "no .context/ directory"`

## Decision tree

- What are you doing?
  - **Creating context for a new project** (no `.context/` exists) -> follow "Initial setup" below
  - **Updating existing context** (`.context/` exists) -> follow "Audit and update" below
  - **Adding context for a specific area** (user asks about one topic) -> follow "Single document" below
  - **User says the AI doesn't understand their project** -> run "Audit and update" to find gaps, then fill them

## Initial setup

### 1. Analyze the project

Run these to understand the codebase:

- `ls` the root and major directories to understand structure
- Read `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, or equivalent for dependencies
- Read existing docs: README, CONTRIBUTING, CLAUDE.md, .cursorrules
- `git log --oneline -20` for recent activity and commit style
- Glob for config files: `**/*.config.*`, `**/tsconfig*`, `biome.json`, `.eslintrc*`, etc.

### 2. Recommend a context plan

Based on analysis, recommend which documents the project needs. Every project gets `overview.md`. The rest depend on complexity:

| Document | When to include | What it covers |
|---|---|---|
| `overview.md` | Always | Architecture, module boundaries, data flow, key decisions |
| `conventions.md` | Projects with >5 files | Coding standards, naming, error handling, file organization |
| `glossary.md` | Domain-heavy projects | Business terms, entity definitions, domain relationships |
| `dependencies.md` | Projects with >3 external deps | Key deps, why chosen, how configured, what for |
| `<dirname>.md` | Major subdirectories (src/, api/, lib/, etc.) | Subdirectory-specific architecture and conventions |

Present the plan as a checklist and get user confirmation before generating.

### 3. Generate documents

For each document in the plan:

1. Read the relevant code thoroughly — don't guess, read the actual files
2. Write the document following the format in `references/document-formats.md`
3. Write it to `.context/<name>.md`

Generate `overview.md` first since other documents reference it.

### 4. Wire up agent files

After generating `.context/`, suggest additions to agent-specific files:

- **CLAUDE.md**: add `See .context/ for project architecture, conventions, and domain knowledge.`
- **.cursorrules**: add equivalent pointer
- **AGENTS.md**: add equivalent pointer

Don't overwrite existing content — append the pointer or suggest where to add it.

## Audit and update

### 1. Diff analysis

Compare the current `.context/` files against the actual codebase:

1. Read each `.context/*.md` file
2. Scan the codebase for changes since the context was written — new directories, changed dependencies, new patterns
3. Identify: **stale** (info contradicts current code), **missing** (new areas with no context), **accurate** (still correct)

### 2. Report

Present a table:

```
| File | Status | What changed |
|---|---|---|
| overview.md | Stale | New api/ module added, auth rewritten |
| conventions.md | Accurate | — |
| glossary.md | Missing terms | "workspace" and "tenant" used but undefined |
```

### 3. Update

For each stale or missing item:

1. Read the relevant current code
2. Update the `.context/` file with accurate information
3. Show the diff of what changed

## Single document

When the user asks for a specific document:

1. Determine which document type from the table in "Initial setup"
2. Analyze the relevant part of the codebase
3. Write the document following `references/document-formats.md`
4. If `.context/` doesn't exist yet, create it and also generate `overview.md` as a baseline

## Writing principles

Context documents serve LLMs, not humans. This changes how you write:

- **Be explicit about relationships** — "OrderService calls PaymentGateway.charge() which calls Stripe" is better than "OrderService handles payments"
- **Name the files** — "authentication logic lives in `src/auth/` with the main entry point at `src/auth/index.ts`" beats "the auth module"
- **State the non-obvious** — skip things any LLM can infer from reading the code (function signatures, import paths). Focus on *why* decisions were made and *how* modules interact
- **Keep it current or delete it** — wrong context is worse than no context. If something is stale and you can't verify it, remove it rather than leaving potentially wrong information

## Key references

| File | What it covers |
|---|---|
| `references/document-formats.md` | Templates and structure for each document type |
