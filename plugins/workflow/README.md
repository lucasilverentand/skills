# Workflow
Execution and reasoning workflows for system design, repository management, decision trees, skill authoring, publishing, and retrospective improvement.

## Skills
- `workflow:architecture`
- `workflow:authoring`
- `workflow:c4-diagrams`
- `workflow:data-modeling`
- `workflow:decision-trees`
- `workflow:design-review`
- `workflow:design-workflow`
- `workflow:publishing`
- `workflow:repo-management`
- `workflow:retrospecting`
- `workflow:taste-encoding`
- `workflow:tooling`

Codex and Claude Code also expose command shims for this plugin: `/workflow:ci`, `/workflow:clean-repo`, `/workflow:create-commit`, `/workflow:create-draft-pr`, `/workflow:create-pr`, `/workflow:fix-pr`, `/workflow:rebase`. Prefer the portable skills above for automatic loading.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install workflow@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `workflow` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install workflow@skills-of-luca
```

This plugin owns its skill source under `plugins/workflow/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
