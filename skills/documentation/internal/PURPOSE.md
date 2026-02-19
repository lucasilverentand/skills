# Internal Documentation

Architecture docs, system overviews, and data flow diagrams.

## Responsibilities

- Write architecture documentation
- Create system overviews
- Document data flow diagrams
- Maintain decision records (ADRs) for significant architecture choices
- Document environment variables, feature flags, and configuration options

## Tools

- `tools/adr-scaffold.ts` — create a new Architecture Decision Record from a template with contextual defaults
- `tools/mermaid-gen.ts` — generate Mermaid diagrams from module imports and database schema definitions
- `tools/env-docs.ts` — scan source for environment variable usage and generate a documented .env.example
