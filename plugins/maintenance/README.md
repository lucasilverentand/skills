# Maintenance
Evolution and maintenance workflows for resolving conflicts, mining agent sessions for durable improvements, and encoding long-term user taste into reusable skills.

## Skills
- `maintenance:resolving-conflicts`
- `maintenance:retrospecting`
- `maintenance:taste-encoding`

Codex and Claude Code also expose command shims for this plugin: `/maintenance:rebase`. Prefer the portable skills above for automatic loading.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install maintenance@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `maintenance` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install maintenance@skills-of-luca
```

This plugin owns its skill source under `plugins/maintenance/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
