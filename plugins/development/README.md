# Development
Implementation and code craft workflows for commits, skill authoring, reusable tooling, and publishing agent skills as maintained software artifacts.

## Skills
- `development:authoring`
- `development:creating-commits`
- `development:publishing`
- `development:tooling`

Codex and Claude Code also expose command shims for this plugin: `/development:create-commit`. Prefer the portable skills above for automatic loading.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install development@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `development` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install development@skills-of-luca
```

This plugin owns its skill source under `plugins/development/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
