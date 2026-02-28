---
name: internal
description: Writes and maintains internal technical documentation — architecture overviews, system diagrams, Architecture Decision Records (ADRs), data flow documentation, environment variable references, and feature flag inventories. Use when the user needs to document system design, record a significant decision, create a Mermaid diagram, or generate an .env.example from source.
allowed-tools: Read Grep Glob Bash
---

# Internal Documentation

## Decision Tree

- What do you need to document?
  - **Overall system architecture** → follow "Architecture overview" below
  - **A significant design decision** → follow "ADR" below
  - **Data flow or module relationships** → run `tools/mermaid-gen.ts`
  - **Environment variables** → run `tools/env-docs.ts`
  - **Updating existing docs after changes** → follow "Keeping docs current" below

## Architecture overview

1. Read the project's directory structure and key entry points
2. Identify the major layers (e.g. API, workers, database, external services)
3. Write `docs/ARCHITECTURE.md` with:
   - **System overview** — what the system does and its main components
   - **Component diagram** — use Mermaid (`graph TD` or `C4Context`) via `tools/mermaid-gen.ts`
   - **Data flow** — how a request moves through the system end to end
   - **Key design decisions** — link to relevant ADRs

## ADR

1. Run `tools/adr-scaffold.ts "<title>"` to create a numbered ADR file in `docs/decisions/`
2. Fill in the four sections:
   - **Context** — what situation forced a decision?
   - **Decision** — what was decided?
   - **Alternatives considered** — what else was on the table and why it was rejected
   - **Consequences** — what does this decision make easier or harder going forward?
3. Link the ADR from `ARCHITECTURE.md` or the relevant module's docs

## Mermaid diagrams

1. Run `tools/mermaid-gen.ts` to generate diagrams from module imports or database schema
2. Available diagram types: `flowchart`, `sequenceDiagram`, `erDiagram`
3. Review the output — auto-generated diagrams often need manual cleanup for clarity
4. Embed diagrams directly in Markdown using fenced code blocks with `mermaid` language tag

## Environment variables

1. Run `tools/env-docs.ts` to scan source files for `process.env.*` and `Env.get()` usage
2. The tool generates a `.env.example` with each variable, its type, and whether it's required
3. Review the output:
   - **Missing descriptions** → add inline comments explaining purpose and format
   - **Secrets** → mark clearly and add a note pointing to the secrets manager
4. Commit `.env.example` to the repo; never commit `.env`

## Keeping docs current

- Architecture docs drift fastest during major refactors — update `ARCHITECTURE.md` as part of those PRs
- Run `tools/mermaid-gen.ts` after schema changes to regenerate ER diagrams
- Run `tools/env-docs.ts` after adding or removing env vars to keep `.env.example` in sync

## Key references

| File | What it covers |
|---|---|
| `tools/adr-scaffold.ts` | Create numbered ADR files from a template |
| `tools/mermaid-gen.ts` | Generate Mermaid diagrams from modules and DB schema |
| `tools/env-docs.ts` | Scan source for env var usage and generate `.env.example` |
