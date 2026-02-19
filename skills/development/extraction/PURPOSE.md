# Extraction

Extract functions and modules, reduce coupling, and improve abstractions.

## Responsibilities

- Extract functions and modules from complex code
- Reduce coupling between components
- Improve abstractions and module boundaries
- Identify candidates for shared utility extraction
- Validate that extracted modules have clean dependency graphs

## Tools

- `tools/complexity-scan.ts` — find functions exceeding cyclomatic complexity thresholds
- `tools/coupling-report.ts` — map import dependencies between modules and flag tight coupling
- `tools/extract-candidate.ts` — identify repeated code patterns suitable for extraction into shared utilities
- `tools/dep-graph.ts` — generate a dependency graph for a module and detect circular references
