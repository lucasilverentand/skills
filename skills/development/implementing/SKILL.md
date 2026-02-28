---
name: implementing
description: Implements code changes according to a provided plan, following project conventions, wiring up integrations, and validating against acceptance criteria. Use when the user has a plan and wants it executed, or when adding a feature that has already been designed. Ensures imports, exports, and module wiring are correct. Flags plan gaps before writing code. Trigger phrases: "implement this", "build this", "write the code for", "follow the plan", "execute this".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Implementing

## Decision Tree

- What is the state of the plan?
  - **No plan exists yet** → stop, use the planning skill first
  - **Plan exists and looks complete** → follow "Implementation Workflow" below
  - **Plan has gaps or ambiguities** → follow "Gap Resolution" below
  - **Implementation is done, needs validation** → follow "Validation" below

## Implementation Workflow

1. Read the plan fully before writing a single line of code
2. Identify what already exists — read all files the plan references
   - **File exists** → understand its structure and conventions before editing
   - **File is new** → read neighboring files to understand the expected pattern
3. Run `tools/plan-check.ts <plan-file>` to parse the plan and get ordered steps
4. Implement step by step — do not skip ahead
   - Follow the naming, structure, and pattern of existing code in the same module
   - Keep each step atomic: one logical change at a time
   - After each step, the codebase should still compile (or pass a quick check)
5. After each new module is added, run `tools/import-wire.ts` to catch missing imports/exports
6. Run `tools/convention-lint.ts` on changed files to verify naming and structure conventions
7. After all steps are complete, run `tools/diff-summary.ts` to get a summary of changes

## Gap Resolution

Before writing code, resolve ambiguities in the plan:

- **Missing file path** — search the codebase for similar patterns; infer the correct location
- **Unclear interface** — read the consuming code first; implement what is actually needed
- **Conflicting conventions** — find the most recent example of similar code and follow it
- **Unknown behavior** — check if a test exists that documents the expected behavior
- **Decision required** → stop and ask the user; do not guess on behavior that affects correctness

Document any resolved gaps so the plan can be updated.

## Validation

1. Run the test suite for affected modules
   - **Tests pass** → continue
   - **Tests fail** → use the debugging skill to root-cause before moving on
2. Check the acceptance criteria from the plan — walk through each one manually if needed
3. Run `tools/diff-summary.ts` and verify:
   - Every planned step has a corresponding change
   - No unplanned files were modified
   - No debug code or commented-out code was left behind
4. If the plan referenced integration points (API endpoints, database, auth), verify each one works end-to-end
5. Report what was implemented and flag any deviations from the plan

## Conventions to follow

When implementing, always match the existing codebase style:

- **Return types** — use `{ ok, error }` result types; do not throw except at system boundaries
- **File structure** — follow the existing directory layout; don't create new patterns unilaterally
- **Imports** — use the same import style as neighboring files (named vs. default, path aliases)
- **Naming** — match the casing and naming patterns of the module (camelCase, snake_case, etc.)
- **Error handling** — propagate errors to the caller; don't silently swallow them

## Key references

| File | What it covers |
|---|---|
| `tools/plan-check.ts` | Parse a plan file and verify all steps have corresponding code changes |
| `tools/import-wire.ts` | Detect missing imports and exports after new modules are added |
| `tools/convention-lint.ts` | Check new code against project-specific naming and structure conventions |
| `tools/diff-summary.ts` | Generate a human-readable summary of changes made during implementation |
