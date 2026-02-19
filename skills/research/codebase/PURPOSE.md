# Codebase Research

Architecture mapping, pattern discovery, and dependency analysis.

## Responsibilities

- Map codebase architecture
- Discover patterns and conventions
- Analyze dependencies and their relationships
- Identify dead code and unused exports
- Trace data flow through modules and layers
- Catalog shared utilities and internal libraries

## Tools

- `tools/dependency-graph.ts` — generate a dependency graph of internal packages and modules
- `tools/dead-export-scan.ts` — find exported symbols that are never imported elsewhere in the codebase
- `tools/convention-report.ts` — analyze naming conventions, file structure patterns, and code style consistency
