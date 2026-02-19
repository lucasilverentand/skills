# Implementing

Implement code based on a plan provided by the planner.

## Responsibilities

- Implement code changes according to a provided plan
- Follow established patterns and conventions during implementation
- Wire up imports, exports, and module integrations
- Validate implementation against acceptance criteria
- Flag ambiguities or gaps in the plan before proceeding

## Tools

- `tools/plan-check.ts` — parse a plan file and verify all steps have corresponding code changes
- `tools/import-wire.ts` — detect missing imports and exports after new modules are added
- `tools/convention-lint.ts` — check new code against project-specific naming and structure conventions
- `tools/diff-summary.ts` — generate a human-readable summary of changes made during implementation
