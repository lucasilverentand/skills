# Codebase Analysis

Explore codebase architecture, discover conventions, analyze dependencies, and assess the impact of proposed changes.

## Responsibilities

- Map codebase architecture and identify layers
- Discover patterns, naming conventions, and code style
- Analyze module dependencies and detect circular imports
- Identify dead code and unused exports
- Trace data flow through modules and layers
- Analyze blast radius of proposed file changes
- Detect breaking changes in types, interfaces, and exported APIs
- Assess test coverage gaps for files about to change
- Evaluate overall risk of large refactors and migrations

## Tools

- `tools/dependency-graph.ts` — generate a dependency graph of internal packages and modules
- `tools/dead-export-scan.ts` — find exported symbols that are never imported elsewhere in the codebase
- `tools/convention-report.ts` — analyze naming conventions, file structure patterns, and code style consistency
- `tools/blast-radius.ts` — trace imports to list all files transitively affected by a given file change
- `tools/breaking-change-detect.ts` — diff type signatures and exported interfaces to flag breaking changes
- `tools/coverage-gap.ts` — cross-reference changed files with test coverage data to find untested paths
