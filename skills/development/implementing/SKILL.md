---
name: implementing
description: Implements code changes — adds features, creates new files, writes functions, wires up integrations, and validates the result. Works with or without a formal plan: handles both full-plan execution and small direct tasks. Ensures imports, exports, and module wiring are correct. Flags ambiguities before writing code. Use when the user wants code written. Trigger phrases: "implement this", "build this", "write the code for", "follow the plan", "execute this", "add X", "create X", "make X work", "write a function that", "add an endpoint", "add a field", "add a component", "add a test", "extend this".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Implementing

## Decision Tree

- What is the starting point?
  - **Small, clear task — no formal plan** (e.g. "add a field", "write a helper", "create a route") → follow "Direct Implementation" below
  - **Formal plan exists and looks complete** → follow "Plan Execution" below
  - **Formal plan has gaps or ambiguities** → follow "Gap Resolution" below, then return to Plan Execution
  - **No clear task and no plan** → stop, use the planning skill first
  - **Implementation is done, needs validation** → follow "Validation" below

## Direct Implementation

For small, well-defined tasks where a formal plan would be overkill:

1. Understand the task precisely — what needs to exist that doesn't exist now?
2. Locate where the change belongs:
   - **Adding to an existing file** → read it fully, understand its structure, then edit in place
   - **New file needed** → read 2–3 neighboring files to understand the expected pattern before creating
3. Check for similar existing code — if there's a function, component, or endpoint of the same kind elsewhere, follow its structure exactly
4. Write the change, following all conventions below
5. Run `tools/import-wire.ts` if new exports were added
6. Verify the result matches what was requested; confirm no unintended files were changed

## Plan Execution

When working from a formal plan:

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

Before writing code, resolve ambiguities:

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
2. Check acceptance criteria — walk through each one manually if needed
3. Run `tools/diff-summary.ts` and verify:
   - Every planned step has a corresponding change
   - No unplanned files were modified
   - No debug code or commented-out code was left behind
4. If integration points were touched (API endpoints, database, auth), verify each one works end-to-end
5. Report what was implemented and flag any deviations from the original task

## Conventions

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
