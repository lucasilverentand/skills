# Planning
Planning skills for requirements, task specs, project intent interviews, Linear project setup, issue authoring, complexity estimation, work pickup, and project tidy-up.

## Skills
- `planning:create-planner-project`
- `planning:estimate-issue-complexity`
- `planning:issue-authoring`
- `planning:pickup-work`
- `planning:project-intent`
- `planning:requirements`
- `planning:task-spec`
- `planning:tidy-linear-project`

Codex and Claude Code also expose command shims for this plugin: `/planning:pickup-work`, `/planning:tidy-linear-project`. Prefer the portable skills above for automatic loading.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install planning@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `planning` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install planning@skills-of-luca
```

This plugin owns its skill source under `plugins/planning/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.

## Project document
The project source of truth for this plugin is [documents/project-brief.md](documents/project-brief.md). Read it before changing planner behavior, Linear record creation rules, project type support, or the reusable planner structure.

The detailed operational structure lives in [skills/create-planner-project/references/planner-project-structure.md](skills/create-planner-project/references/planner-project-structure.md).

The shared issue workflow lives in [skills/issue-authoring/SKILL.md](skills/issue-authoring/SKILL.md). It owns platform-neutral issue writing, implementer-ready body shape, routing metadata, dependency semantics, and complexity scoring. Destination references are metadata adapters only.

The project intent workflow lives in [skills/project-intent/SKILL.md](skills/project-intent/SKILL.md). Use it before docs, projects, or issues when an idea needs structured interviews, A/B/C narrowing, portfolio triage, or an LLM alignment packet.

The compatibility entrypoints [skills/estimate-issue-complexity/SKILL.md](skills/estimate-issue-complexity/SKILL.md) and [skills/tidy-linear-project/SKILL.md](skills/tidy-linear-project/SKILL.md) route old triggers to `issue-authoring` and its references.

## Planning flow
Use `project-intent` when direction is still fuzzy, `requirements` for whole-system requirements, `task-spec` for bounded implementation briefs, `issue-authoring` for ticket-ready issue bodies and metadata, and `create-planner-project` when a real Linear initiative/project needs the full planning spine.

Filled product documents are created per real project, usually from `documentation:project-docs` templates, and stay with the Linear project or product repo that owns the work.
