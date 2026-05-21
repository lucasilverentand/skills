# Linear Planner
Linear planning workflows for creating real project records from reusable planner structures without keeping template issues live.

## Skills
- `linear-planner:create-planner-project`

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

## Project document
The project source of truth for this plugin is [documents/project-brief.md](documents/project-brief.md). Read it before changing planner behavior, Linear record creation rules, project type support, or the reusable planner structure.

The detailed operational structure lives in [skills/create-planner-project/references/planner-project-structure.md](skills/create-planner-project/references/planner-project-structure.md).

The shared Linear issue-creation rules live in [skills/create-planner-project/references/linear-issue-creation.md](skills/create-planner-project/references/linear-issue-creation.md).
