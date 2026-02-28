---
name: team
description: Orchestrates Claude agent teams — defines specialist agent roles, maps skills to agents, distributes tasks, and monitors progress. Use when spinning up a multi-agent workflow, assigning skills to team roles, checking if all responsibilities are covered, or resolving agent blockers. Works with the Claude Agent SDK team primitives.
allowed-tools: Read Glob Bash
---

# Team

## Decision Tree

- What are you doing?
  - **Spinning up a new agent team** → see "Team scaffolding workflow" below
  - **Checking skill coverage across agent roles** → see "Coverage mapping workflow" below
  - **Reviewing task progress or unblocking agents** → see "Monitoring workflow" below
  - **Rebalancing workload across agents** → run `tools/workload-balance.ts` and redistribute per suggestions

## Team scaffolding workflow

1. Understand the project scope: what domains of work are involved?
2. List the skills from this repo that apply to those domains
3. Run `tools/team-scaffold.ts` — generates agent config files from a team definition template
4. Review the generated configs:
   - Each agent should have a focused role with 2-5 skills — avoid generalist agents
   - No two agents should have overlapping primary responsibilities
   - Every skill used must exist in the skills repo
5. Run `tools/skill-map.ts` — verifies all skills resolve and flags coverage gaps
6. Adjust configs until `skill-map.ts` reports no gaps

## Coverage mapping workflow

1. Run `tools/skill-map.ts` to match available skills to current agent roles
2. Review the output:
   - **Covered** → no action needed
   - **Gap: skill exists but not assigned** → assign it to the most appropriate agent role
   - **Gap: no skill exists** → note the missing capability; consider authoring a new skill or handling it inline
3. Do not over-assign skills to compensate — prefer creating a dedicated agent for a significant gap

## Monitoring workflow

1. Run `tools/team-status.ts` — aggregates task progress across all agents
2. Review the status report:
   - **Blocked agents** → identify the blocker (dependency, missing info, tool failure) and resolve it
   - **Idle agents** → check if there are unassigned tasks that match their skills
   - **Behind-schedule agents** → consider splitting their remaining tasks to another agent
3. Use `tools/workload-balance.ts` if redistribution is needed — review suggestions before applying

## Key references

| File | What it covers |
|---|---|
| `tools/team-scaffold.ts` | Generate agent configuration files from a team definition |
| `tools/skill-map.ts` | Match skills to agent roles and detect coverage gaps |
| `tools/workload-balance.ts` | Analyze task assignments and suggest redistribution |
| `tools/team-status.ts` | Aggregate task progress and report overall completion |
