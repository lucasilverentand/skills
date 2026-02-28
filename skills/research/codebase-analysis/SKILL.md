---
name: codebase-analysis
description: Explores codebase architecture, discovers conventions, analyzes dependencies, identifies dead code, traces data flow, and assesses the impact of proposed changes. Use when the user needs to understand an unfamiliar codebase, audit for unused exports, evaluate the blast radius of a refactor, detect breaking changes, or check test coverage gaps before making modifications.
allowed-tools: Read Glob Grep Bash
context: fork
agent: Explore
---

# Codebase Analysis

## Decision Tree

- What is the analysis goal?
  - **Understand overall architecture of an unfamiliar codebase** → follow "Architecture Mapping" below
  - **Find and catalog patterns and conventions** → follow "Convention Discovery" below
  - **Analyze module dependencies** → follow "Dependency Analysis" below
  - **Identify dead code and unused exports** → follow "Dead Code Audit" below
  - **Trace how data flows through the system** → follow "Data Flow Tracing" below
  - **Assess blast radius of modifying or deleting a file** → follow "Blast Radius Trace" below
  - **Detect breaking changes in types, interfaces, or APIs** → follow "Breaking Change Detection" below
  - **Check test coverage before making changes** → follow "Coverage Gap Assessment" below
  - **Evaluate risk of a large refactor or migration** → follow "Refactor Risk Assessment" below

## Architecture Mapping

1. Start from the top: read `package.json` (or workspace root), `README.md`, and any `docs/` directory
2. Identify the major layers:
   - Entry points (CLI, HTTP server, event handlers)
   - Business logic layer (services, use cases, domain models)
   - Data access layer (repositories, ORM models, raw queries)
   - Infrastructure (config, logging, external clients)
3. Run `tools/dependency-graph.ts` to generate a module graph — use it to verify your layer model
4. For each layer, identify:
   - Key files and their responsibilities
   - How layers communicate (direct imports, interfaces, dependency injection)
   - Where cross-cutting concerns live (auth, validation, error handling)
5. Produce an architecture summary: layer diagram (Mermaid), key file map, and notable patterns

## Convention Discovery

1. Run `tools/convention-report.ts` to analyze naming, file structure, and style consistency
2. Examine several representative files in each category:
   - API route handlers
   - Service/use-case functions
   - Data models/schemas
   - Tests
3. Document discovered conventions:
   - Naming: files (kebab-case, PascalCase), functions (camelCase), types/interfaces
   - File organization: co-location vs. dedicated directories, index barrel patterns
   - Error handling: throws vs. result types, error class hierarchy
   - Async patterns: async/await, explicit error wrapping
4. Flag inconsistencies — note where conventions diverge and how widespread the deviation is
5. Produce a conventions reference document suitable for onboarding new contributors

## Dependency Analysis

1. Run `tools/dependency-graph.ts` to produce the full module graph
2. Identify:
   - Highly connected modules (many importers) — these are high-risk change targets
   - Circular dependencies — flag all cycles with the import chain
   - Cross-layer imports — check that lower layers don't import from higher layers
3. Map external package usage: which packages are used where, version pinning
4. For monorepos: trace which workspace packages depend on which others
5. Produce a dependency report: coupling hotspots, cycle list, cross-layer violations

## Dead Code Audit

1. Run `tools/dead-export-scan.ts` to find exported symbols with no importers
2. For each flagged symbol:
   - **Re-exported through a barrel** → check if the barrel itself is used
   - **Used only in tests** → note it, may still be intentional
   - **Truly unused** → confirm by Grep across the full repo, then flag for removal
3. Also check:
   - Unused dependencies in `package.json` (packages listed but never imported)
   - Dead feature flags or config keys that are never read
4. Categorize findings: safe to remove, needs investigation, intentionally kept (e.g., public API)
5. Produce a prioritized removal list with confidence level for each item

## Data Flow Tracing

1. Identify the data entity to trace (e.g., a user record, a payment, a message)
2. Find the entry point where the data first enters the system (HTTP request, webhook, CLI input)
3. Follow the data forward through each transformation:
   - Validation and parsing (Zod schemas, input sanitization)
   - Business logic transformations
   - Persistence (ORM calls, raw SQL)
   - Response serialization or side effects (emails, events)
4. Note at each step: what shape the data takes, what validation is applied, what errors can occur
5. Produce a data flow diagram (Mermaid sequence diagram) and a written summary

## Blast Radius Trace

1. Identify the file(s) that will change
2. Run `tools/blast-radius.ts <file>` to produce the full transitive import graph
3. Review the output in layers:
   - **Direct importers** — files that import the changed file directly
   - **Indirect consumers** — files that import the direct importers
   - **Entry points reached** — HTTP routes, CLI commands, or event handlers in the blast radius
4. For each direct importer: what does it use from the changed file, and will the proposed change break that usage?
5. Classify the blast radius:
   - **Narrow** (1-5 files, no entry points) → low risk, proceed with care
   - **Medium** (5-20 files, some entry points) → test all affected paths
   - **Wide** (20+ files or core shared utilities) → plan incremental rollout
6. Produce a blast radius report: file list, entry points affected, risk classification

## Breaking Change Detection

1. Identify the type signatures, interfaces, or exported APIs being changed
2. Run `tools/breaking-change-detect.ts <file>` to diff current vs. proposed signatures
3. For each flagged breaking change:
   - **Removed export** → find all importers of that symbol; each is a required update
   - **Changed function signature** (added required param, changed return type) → check all call sites
   - **Narrowed type** → check all consumers for now-invalid assignments
   - **Widened type** → usually safe, but verify consumers handle the new cases
4. Check whether the changed API is:
   - **Internal only** → only project files affected; update all call sites
   - **Public / SDK boundary** → document the breaking change; consider a migration path
5. Produce a breaking change report: what changed, who is affected, required updates

## Coverage Gap Assessment

1. Identify the files in the planned change set
2. Run `tools/coverage-gap.ts <file1> <file2> ...` to cross-reference with coverage data
3. For each file, note:
   - Current line/branch coverage percentage
   - Uncovered branches in code paths most likely affected by the change
   - Whether any tests exercise the specific logic being modified
4. Classify each gap:
   - **Critical** — changed code has no tests; write tests before making the change
   - **Partial** — some coverage but key branches are uncovered; add targeted tests
   - **Adequate** — existing tests cover the affected paths; proceed but watch for regressions
5. Produce a coverage gap report and a list of tests to write before proceeding

## Refactor Risk Assessment

1. Define the full scope: what files will move, be renamed, or have signatures changed?
2. Run blast radius analysis for each affected file
3. Run breaking change detection for all changed exports
4. Run coverage gap assessment for all affected files
5. Synthesize findings:
   - Total files affected
   - Number of breaking changes
   - Coverage gaps in affected paths
   - Presence of any public/SDK-boundary changes
6. Classify overall risk:
   - **Low** — narrow blast radius, no breaking changes, good coverage
   - **Medium** — medium blast radius or minor breaking changes with coverage
   - **High** — wide blast radius, multiple breaking changes, or significant coverage gaps
7. For high-risk refactors, produce a phased plan:
   - Phase 1: add tests to cover gaps
   - Phase 2: make internal changes with existing tests as a safety net
   - Phase 3: update consumers
   - Phase 4: remove deprecated paths

## Conventions

- Always start with the dependency graph or blast radius tool before manually tracing imports
- Report all findings with file paths relative to the project root
- Use Mermaid diagrams for architecture maps, dependency graphs, and data flow traces
- Classify risk and coverage gaps using the standard labels: narrow/medium/wide, critical/partial/adequate, low/medium/high
- When tracing data flow, document the data shape at every transformation boundary
- For dead code audits, always confirm with a full-repo Grep before flagging a symbol as unused
- Combine blast radius + breaking change + coverage gap tools when assessing refactor risk

## Key References

| File | What it covers |
|---|---|
| `tools/dependency-graph.ts` | Generate dependency graph of internal packages and modules |
| `tools/dead-export-scan.ts` | Find exported symbols that are never imported elsewhere |
| `tools/convention-report.ts` | Analyze naming conventions, file structure, and code style consistency |
| `tools/blast-radius.ts` | Trace imports to list all files transitively affected by a given file change |
| `tools/breaking-change-detect.ts` | Diff type signatures and exported interfaces to flag breaking changes |
| `tools/coverage-gap.ts` | Cross-reference changed files with test coverage data to find untested paths |
