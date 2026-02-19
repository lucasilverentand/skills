# Team

Orchestrate Claude agent teams — define specialist agents that use skills from this repo.

## Responsibilities

- Define specialist agent configurations
- Orchestrate multi-agent team workflows
- Map skills to agent roles
- Balance workload distribution across agents
- Monitor agent task progress and resolve blockers

## Tools

- `tools/team-scaffold.ts` — generate agent configuration files from a team definition template
- `tools/skill-map.ts` — match available skills to agent roles and detect coverage gaps
- `tools/workload-balance.ts` — analyze task assignments and suggest redistribution for even load
- `tools/team-status.ts` — aggregate task progress across all agents and report overall completion
