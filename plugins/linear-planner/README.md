# Linear Planner
Linear planning workflows for creating real project records from reusable planner structures without keeping template issues live.

## Skills
- `linear-planner:create-planner-project`
- `linear-planner:estimate-issue-complexity`
- `linear-planner:pickup-work`

Claude Code also exposes legacy command shims for this plugin: `/linear-planner:pickup-work`. Prefer the portable skills above for Codex and other agents.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install linear-planner@skills-of-luca
```

This plugin owns its skill source under `plugins/linear-planner/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
