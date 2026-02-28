---
name: refactoring
description: Restructures, extracts, and cleans up existing code without changing external behavior. Covers symbol renaming, module moves, pattern migration, function and module extraction, duplication removal, dead code detection, and unused dependency pruning. Use when the user wants to clean up code, rename symbols, move modules, extract functions, remove duplicated logic, find unused exports, prune dead dependencies, detect unreachable code, or migrate to a new pattern. Trigger phrases: "clean up", "refactor", "restructure", "rename", "move this", "migrate to", "extract", "too complex", "duplicated code", "pull this out", "split this up", "remove unused", "dead code", "unused exports", "prune packages", "what can I delete".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Refactoring

## Decision Tree

- What kind of refactor is this?
  - **Rename a symbol (function, type, variable, file)** → follow "Symbol Rename" below
  - **Move a module to a different location** → follow "Module Move" below
  - **Migrate from one pattern to another** → follow "Pattern Migration" below
  - **Extract a function that is too long or complex** → follow "Function Extraction" below
  - **Extract duplicated code into a shared utility** → follow "Duplication Extraction" below
  - **Split a module with too many responsibilities** → follow "Module Extraction" below
  - **Remove unused exports, dependencies, or dead code** → follow "Dead Code Removal" below
  - **General cleanup: reduce complexity, improve naming** → follow "General Cleanup" below
  - **Not sure what needs refactoring** → follow "Full Audit" below

## Before Any Refactor

Always run the test suite first and capture the baseline:

```
tools/refactor-verify.ts --baseline
```

If there are no tests covering the code being changed, write them before refactoring. Refactoring without test coverage is rewriting with risk.

For any removal, run `tools/removal-impact.ts <symbol-or-file>` first to simulate the impact. Never delete code that you haven't verified is truly unused.

## Symbol Rename

1. Identify all usages: `tools/rename-symbol.ts --find <old-name>` to preview impact
2. Check if the symbol is exported from a public API — if so, flag as a breaking change
3. Run `tools/rename-symbol.ts <old-name> <new-name>` to rename across the codebase with import updates
4. Verify: run the test suite, check for any string references (e.g., in config files or logs)
5. Update documentation and comments that reference the old name

## Module Move

1. Identify all importers of the module: `tools/move-module.ts --find <path>` to preview impact
2. Move the file: `tools/move-module.ts <old-path> <new-path>` to rewrite all imports
3. Check for:
   - **Circular dependencies** — the new location may create cycles; verify with `tools/dep-graph.ts`
   - **Barrel file exports** — update any `index.ts` that re-exports the module
   - **Config references** — tsconfig paths, build config, test config
4. Run the test suite to confirm nothing broke

## Pattern Migration

1. Identify all instances of the old pattern in the codebase
2. Understand why the new pattern is better — don't migrate just for the sake of it
3. Migrate incrementally, one call site at a time
   - **Many instances** → write a script or use codemod; don't do it manually
   - **Few instances** → edit directly, verify each one compiles and tests pass
4. Do not mix old and new patterns in the same file — finish the file before moving on
5. Remove the old pattern's implementation once all call sites are migrated

## Function Extraction

Extract when a function does more than one thing, or when a section of logic deserves a name.

1. Run `tools/complexity-scan.ts <path>` to find functions above the complexity threshold
2. Identify the cohesive section: it should do exactly one thing and have a clear purpose
3. Define its interface: what inputs does it need? What does it return?
   - **Needs too many parameters** → the extraction boundary is wrong; reconsider
   - **Parameters are naturally grouped** → consider extracting a type or struct too
4. Extract the function with a meaningful name that describes what it does (not how)
5. Ensure the extracted function is testable in isolation
6. Write or update tests for the extracted function
7. Verify the original function still works correctly

## Duplication Extraction

1. Run `tools/extract-candidate.ts <path>` to find repeated patterns
2. Understand why the duplication exists — is it truly the same logic, or just similar-looking?
   - **Same logic, same purpose** → extract to a shared utility
   - **Similar but different domain** → don't force a shared abstraction; duplication is fine here
3. Identify the single right home for the extracted code:
   - **Used only within one module** → keep it in that module
   - **Used across modules** → move to a shared `utils/` or feature-appropriate location
4. Extract the shared function with the most general interface that satisfies all call sites
5. Replace all call sites one by one, verifying each one still works
6. Run `tools/dep-graph.ts` after to confirm no circular dependencies were introduced

## Module Extraction

Extract when a module has grown to handle multiple unrelated concerns.

1. Run `tools/coupling-report.ts <path>` to see which parts of the module are heavily imported
2. Identify the seams: which groups of functions are always used together?
3. Define the new module boundary: what is its single responsibility?
4. Check the new dependency direction:
   - **New module depends on old module** → acceptable
   - **Old module depends on new module** → may create a cycle; check with `tools/dep-graph.ts`
   - **Both depend on each other** → introduce a third module with shared types
5. Move the identified code to the new module
6. Update all import paths
7. Verify the new module's dependency graph is clean and acyclic

## Dead Code Removal

- What kind of dead code are you hunting?
  - **Unused exported symbols** → run `tools/unused-exports.ts` to find exports with zero imports
  - **Installed packages not used in code** → run `tools/dead-deps.ts` to find unreferenced packages
  - **Unreachable code paths** → run `tools/unreachable-code.ts <path>` to detect dead branches
  - **Not sure — full sweep** → run all three in sequence, prioritize by impact

Before removing anything, watch for:
- Dynamic imports: `import(variableName)`
- String-based references: reflection, `eval`, config-driven module loading
- Re-exports through barrel files: a symbol may be exported but the barrel itself is unused
- Test-only usage: some symbols exist only to be tested

Safe removal protocol:
1. Run `tools/removal-impact.ts <symbol>` first — review the full impact report
2. Remove one thing at a time, not everything at once
3. After each removal, verify: TypeScript compiles, tests pass, build succeeds
4. Commit removals in focused chunks by module, not as one giant deletion

## General Cleanup

1. Run `tools/smell-detect.ts <path>` to get an objective list of issues
2. Prioritize by impact:
   - **Long functions** → extract sub-functions with meaningful names
   - **Deep nesting** → invert conditions, use early returns
   - **Duplicate logic** → extract to a shared helper
   - **Misleading names** → rename to match actual behavior
3. Change one thing at a time — don't rename AND restructure in the same commit
4. Preserve the existing external interface unless explicitly changing it
5. Run `tools/refactor-verify.ts` to diff test results before and after

## Full Audit

Run all detection tools to get a complete picture, then prioritize:

1. `tools/smell-detect.ts <path>` — code smells (complexity, length, coupling, naming)
2. `tools/complexity-scan.ts <path>` — functions above cyclomatic complexity threshold
3. `tools/coupling-report.ts <path>` — tight dependencies and circular imports
4. `tools/extract-candidate.ts <path>` — duplicated code patterns
5. `tools/unused-exports.ts <project-dir>` — exported symbols with zero imports
6. `tools/dead-deps.ts <project-dir>` — installed packages not referenced in source
7. `tools/unreachable-code.ts <path>` — dead branches and unreachable statements

Discuss findings with the user before proceeding — not every issue needs immediate fixing.

## Key References

| File | What it covers |
|---|---|
| `tools/smell-detect.ts` | Scan for common code smells: long functions, deep nesting, etc. |
| `tools/rename-symbol.ts` | Rename a symbol across the codebase with import path updates |
| `tools/move-module.ts` | Relocate a module and rewrite all dependent imports |
| `tools/refactor-verify.ts` | Run tests before and after a refactor and diff the results |
| `tools/complexity-scan.ts` | Find functions exceeding cyclomatic complexity thresholds |
| `tools/coupling-report.ts` | Map import dependencies between modules and flag tight coupling |
| `tools/extract-candidate.ts` | Identify repeated code patterns suitable for extraction |
| `tools/dep-graph.ts` | Generate a dependency graph and detect circular references |
| `tools/unused-exports.ts` | Find exported symbols with zero imports across the project |
| `tools/dead-deps.ts` | List installed packages not referenced in any source file |
| `tools/unreachable-code.ts` | Detect code behind always-false conditions or after early returns |
| `tools/removal-impact.ts` | Simulate removing a symbol and report affected files |
