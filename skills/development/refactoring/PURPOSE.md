# Refactoring

General-purpose refactoring: extract, restructure, and migrate patterns.

## Responsibilities

- Extract and restructure code
- Migrate between patterns and conventions
- Improve code organization without changing behavior
- Identify code smells and suggest targeted refactors
- Ensure test suites pass before and after changes

## Tools

- `tools/smell-detect.ts` — scan source files for common code smells like long functions and deep nesting
- `tools/rename-symbol.ts` — rename a symbol across the codebase with import path updates
- `tools/move-module.ts` — relocate a module to a new path and rewrite all dependent imports
- `tools/refactor-verify.ts` — run the test suite before and after a refactor and diff the results
