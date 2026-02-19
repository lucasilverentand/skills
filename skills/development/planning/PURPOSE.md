# Planning

Break down features into implementation plans and tasks.

## Responsibilities

- Break down features into discrete implementation steps
- Create actionable task lists from requirements
- Identify dependencies and ordering constraints
- Estimate complexity and flag high-risk areas
- Produce implementation plans that map to specific files and modules

## Tools

- `tools/plan-scaffold.ts` — generate a structured plan template from a feature description
- `tools/dep-order.ts` — analyze task dependencies and produce a valid execution order
- `tools/scope-estimate.ts` — estimate the number of files and lines affected by a planned change
- `tools/plan-validate.ts` — check a plan for missing steps, circular dependencies, or undefined references
