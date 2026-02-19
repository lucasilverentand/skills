# Impact Analysis

Analyze the blast radius of proposed changes across the codebase.

## Responsibilities

- Analyze blast radius of proposed changes
- Identify affected modules and consumers
- Assess risk of code modifications
- Map upstream and downstream dependencies of changed files
- Estimate test coverage gaps for affected areas
- Flag breaking changes in public APIs and shared contracts

## Tools

- `tools/blast-radius.ts` — trace imports to list all files transitively affected by a given file change
- `tools/breaking-change-detect.ts` — diff type signatures and exported interfaces to flag breaking changes
- `tools/coverage-gap.ts` — cross-reference changed files with test coverage data to find untested paths
