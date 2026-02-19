# Decision Recording

Create ADRs, link decisions to code, and review or update stale ADRs.

## Responsibilities

- Create Architecture Decision Records (ADRs)
- Link decisions to relevant code
- Review and update stale ADRs
- Discover existing decisions in the codebase
- Track superseded or deprecated decisions
- Summarize decision history for onboarding

## Tools

- `tools/adr-create.ts` — scaffold a new ADR from a template with auto-incrementing ID
- `tools/adr-stale.ts` — find ADRs that reference changed or deleted code paths
- `tools/adr-index.ts` — generate a summary index of all ADRs with status and links
- `tools/adr-link.ts` — scan source files for decision references and verify they resolve to valid ADRs
