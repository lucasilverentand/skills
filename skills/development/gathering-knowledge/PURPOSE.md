# Knowledge

Record development learnings and manage Architecture Decision Records (ADRs).

## Responsibilities

- Capture and record learnings from development sessions
- Organize discoveries for future reference with tags and timestamps
- Surface relevant past learnings when similar issues arise
- Generate digests of recent learnings grouped by topic
- Create Architecture Decision Records (ADRs)
- Link decisions to relevant code and learnings to relevant files
- Review and update stale ADRs when referenced code changes
- Track superseded or deprecated decisions
- Summarize decision history for onboarding

## Tools

- `tools/learning-capture.ts` — append a timestamped learning entry to the project knowledge base
- `tools/learning-search.ts` — full-text search across recorded learnings by keyword or tag
- `tools/learning-digest.ts` — generate a summary of recent learnings grouped by topic
- `tools/learning-link.ts` — find and attach related learnings to a given file or module
- `tools/adr-create.ts` — scaffold a new ADR from a template with auto-incrementing ID
- `tools/adr-stale.ts` — find ADRs that reference changed or deleted code paths
- `tools/adr-index.ts` — generate a summary index of all ADRs with status and links
- `tools/adr-link.ts` — scan source files for decision references and verify they resolve to valid ADRs
