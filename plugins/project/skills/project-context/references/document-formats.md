# Document Formats

Templates for each `.context/` document type. These are starting structures — adapt sections based on what's actually relevant to the project.

## overview.md

The single most important context file. An LLM reading only this file should understand the project's shape.

```markdown
# Project Overview

## What this project does

One paragraph describing the product/service and its purpose.

## Architecture

How the system is structured at the highest level. Include:
- Major modules/packages and their responsibilities
- How they communicate (HTTP, message queue, function calls, etc.)
- Data flow for the primary use case

## Directory structure

Top-level directories and what lives in each:

| Directory | Purpose |
|---|---|
| `src/` | Application source code |
| `api/` | API route handlers |
| ... | ... |

## Key decisions

Architectural choices that aren't obvious from the code:
- Why X framework over Y
- Why this data model shape
- Why monorepo / polyrepo
- Any constraints driving the architecture (compliance, performance, team size)

## Development workflow

How to run, build, test, and deploy. Include actual commands.

## Current state

What's actively being worked on, what's stable, what's deprecated.
```

## conventions.md

Patterns and standards that code in this project should follow.

```markdown
# Conventions

## Code style

- Language version and configuration (e.g., TypeScript strict mode, Rust edition)
- Formatter and linter used, how to run them
- Import ordering convention

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `user-service.ts` |
| Functions | camelCase | `getUserById()` |
| Types | PascalCase | `UserProfile` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| ... | ... | ... |

## Error handling

How errors are created, propagated, and handled.
- Are exceptions thrown or are result types returned?
- Is there a standard error type?
- How are errors logged?

## File organization

- Where new files of type X go
- How modules are structured internally
- What gets exported vs. kept internal

## Patterns

Recurring patterns used across the codebase:
- Repository pattern, service layer, etc.
- How dependency injection works (if applicable)
- How configuration is loaded
- How environment-specific behavior is handled

## Anti-patterns

Things to explicitly avoid and why:
- Don't use X because Y
- Prefer A over B because C
```

## glossary.md

Domain terms that have specific meaning in this project.

```markdown
# Domain Glossary

Terms used in code, comments, and conversation that have project-specific meaning.

| Term | Definition | Where used |
|---|---|---|
| Workspace | A tenant's isolated environment containing their projects and settings | `src/workspace/`, database `workspaces` table |
| Pipeline | An ordered sequence of processing steps applied to incoming data | `src/pipeline/`, configured in `pipeline.config.ts` |
| ... | ... | ... |

## Entity relationships

How the core domain objects relate to each other:

- A **Workspace** has many **Projects**
- A **Project** has many **Pipelines**
- A **Pipeline** has an ordered list of **Steps**
- ...

## Abbreviations

| Abbreviation | Full term |
|---|---|
| `ws` | Workspace |
| `pl` | Pipeline |
| ... | ... |
```

## dependencies.md

External libraries and services the project relies on.

```markdown
# Dependencies

## Runtime dependencies

| Package | Purpose | Why this one |
|---|---|---|
| `hono` | HTTP framework | Lightweight, runs on Cloudflare Workers |
| `drizzle-orm` | Database ORM | Type-safe, supports D1 |
| ... | ... | ... |

## Dev dependencies

| Package | Purpose |
|---|---|
| `biome` | Linting and formatting |
| `vitest` | Test runner |
| ... | ... |

## External services

| Service | Purpose | Configuration |
|---|---|---|
| Stripe | Payment processing | API keys in env, webhook in `src/webhooks/stripe.ts` |
| ... | ... | ... |

## Configuration

Where dependency configuration lives and what the non-obvious settings do.
```

## Subdirectory files (`<dirname>.md`)

For major subdirectories that need their own context. Named after the directory: `api.md`, `src.md`, `packages.md`, etc.

```markdown
# <Directory Name>

## Purpose

What this directory is responsible for.

## Structure

Subdirectories and key files within:

| Path | Purpose |
|---|---|
| `routes/` | HTTP route definitions |
| `middleware/` | Request/response middleware |
| `index.ts` | Entry point, exports public API |

## Key patterns

Patterns specific to this directory that differ from or extend the project-wide conventions.

## Dependencies

What this module depends on (other modules, external services) and what depends on it.

## Adding new <things>

Step-by-step for the most common modification (e.g., "Adding a new API endpoint", "Adding a new component").
```
