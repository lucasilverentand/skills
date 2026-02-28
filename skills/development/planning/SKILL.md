---
name: planning
description: Breaks down features and requirements into structured implementation plans with ordered tasks, dependency maps, and risk flags. Use when the user wants to plan a feature, figure out where to start, understand what files need to change, or sequence a complex multi-step change. Trigger phrases: "how should I approach", "plan this", "break this down", "where do I start", "what needs to change", "figure out the steps".
allowed-tools: Read Grep Glob Bash
---

# Planning

## Decision Tree

- What is the starting point?
  - **Feature description or user story** → follow "Feature Planning" below
  - **Existing codebase that needs to change** → follow "Change Planning" below
  - **Already have a draft plan, need to validate it** → follow "Plan Validation" below
  - **High-risk area flagged, need to assess scope** → follow "Scope Assessment" below

## Feature Planning

1. Understand the feature completely before touching code
   - What does "done" look like? Write acceptance criteria first
   - What edge cases exist? What can go wrong?
2. Explore the codebase to understand the existing structure
   - Find where similar features live — follow their pattern
   - Identify the data model changes required
   - Identify the API surface changes required
   - Identify the UI changes required
3. Run `tools/plan-scaffold.ts "<feature description>"` to generate a structured template
4. Fill in the plan sections:
   - **Data layer** — schema changes, migrations, model updates
   - **Business logic** — service layer, validation, rules
   - **API layer** — endpoints, request/response shapes
   - **UI layer** — components, routing, state
   - **Tests** — unit, integration, and E2E test cases
5. For each step, name the specific file(s) that will change
6. Run `tools/dep-order.ts` on the plan to get a valid execution sequence

## Change Planning

1. Understand the current state: read the files that will be affected
2. Define the minimal change set — resist the urge to refactor adjacent code
3. Identify the dependency chain:
   - What does this code depend on? Those dependencies may need updating first
   - What depends on this code? Those consumers may break
4. Run `tools/scope-estimate.ts <files>` to quantify the blast radius
5. Order steps so each step leaves the codebase in a working state
   - **Cannot do this** → identify the smallest atomic unit that can be safely done first
6. Flag high-risk steps explicitly — changes to shared code, auth, or data migrations

## Plan Validation

1. Run `tools/plan-validate.ts <plan-file>` to check for structural issues
2. Check for:
   - **Missing steps** — is there a step that bridges A to B?
   - **Undefined references** — does a step reference a file or function that doesn't exist yet?
   - **Circular dependencies** — does step 3 depend on step 5?
   - **Missing tests** — every behavior change should have a corresponding test step
3. Walk through the plan as if implementing it — does each step make sense given the previous one?
4. Identify the highest-risk step and make sure it has a clear rollback path

## Scope Assessment

1. Run `tools/scope-estimate.ts <changed-files>` to get file and line counts
2. Map which teams or owners are affected by the change
3. Flag:
   - **Shared utilities** — changes here affect every consumer
   - **Database schema** — requires a migration and possibly a data backfill
   - **Public API surface** — may break external consumers
   - **Auth or security logic** — needs extra review
4. Recommend splitting the plan if it touches more than 3 distinct domains

## Key references

| File | What it covers |
|---|---|
| `tools/plan-scaffold.ts` | Generate a structured plan template from a feature description |
| `tools/dep-order.ts` | Analyze task dependencies and produce a valid execution order |
| `tools/scope-estimate.ts` | Estimate the number of files and lines affected by a planned change |
| `tools/plan-validate.ts` | Check a plan for missing steps, circular dependencies, or undefined references |
