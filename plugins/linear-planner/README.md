# Linear Planner
Linear planning workflows for creating real project records from reusable planner structures without keeping template issues live.

## Skills
- `linear-planner:create-planner-project`
- `linear-planner:estimate-issue-complexity`
- `linear-planner:pickup-work`

Codex and Claude Code also expose command shims for this plugin: `/linear-planner:pickup-work`. Prefer the portable skills above for automatic loading.

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

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `linear-planner` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install linear-planner@skills-of-luca
```

This plugin owns its skill source under `plugins/linear-planner/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
