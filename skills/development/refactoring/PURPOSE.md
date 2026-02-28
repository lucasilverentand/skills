# Refactoring

Restructure, extract, and clean up code without changing external behavior.

## Responsibilities

- Rename symbols and move modules with full import rewrites
- Migrate between patterns and conventions incrementally
- Extract functions, utilities, and modules to reduce complexity and duplication
- Detect and remove unused exports, dead dependencies, and unreachable code
- Identify code smells, tight coupling, and circular dependencies
- Ensure test suites pass before and after every change

## Tools

- `tools/smell-detect.ts` — scan source files for common code smells like long functions and deep nesting
- `tools/rename-symbol.ts` — rename a symbol across the codebase with import path updates
- `tools/move-module.ts` — relocate a module to a new path and rewrite all dependent imports
- `tools/refactor-verify.ts` — run the test suite before and after a refactor and diff the results
- `tools/complexity-scan.ts` — find functions exceeding cyclomatic complexity thresholds
- `tools/coupling-report.ts` — map import dependencies between modules and flag tight coupling
- `tools/extract-candidate.ts` — identify repeated code patterns suitable for extraction into shared utilities
- `tools/dep-graph.ts` — generate a dependency graph for a module and detect circular references
- `tools/unused-exports.ts` — find exported symbols with zero imports across the project
- `tools/dead-deps.ts` — list installed packages not referenced in any source file
- `tools/unreachable-code.ts` — detect code paths behind always-false conditions or after early returns
- `tools/removal-impact.ts` — simulate removing a symbol and report which files would be affected
