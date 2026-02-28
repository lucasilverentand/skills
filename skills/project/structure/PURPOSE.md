# Structure

Scaffold projects, set up monorepos, manage workspace dependencies, and maintain conventions.

## Responsibilities

- Scaffold new projects and monorepos
- Define and document project conventions
- Configure bun workspaces and tsconfig project references
- Set up shared tooling configs for Biome, TypeScript, and CI
- Enforce directory layout and naming conventions across the repo
- Manage workspace dependency linking and versioning
- Orchestrate cross-package builds and scripts
- Integrate new packages into existing monorepos
- Troubleshoot workspace dependency issues

## Tools

- `tools/scaffold-project.ts` — generate a new monorepo or standalone project with all boilerplate
- `tools/convention-check.ts` — validate the repo structure against defined naming and layout rules
- `tools/workspace-graph.ts` — output the bun workspace dependency graph as a tree
