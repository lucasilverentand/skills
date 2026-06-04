# Repository Docs
Repository documentation maintenance for public open-source projects and private internal project hubs.

## Skills
- `repository-docs:closed-source-docs`
- `repository-docs:open-source-docs`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install repository-docs@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `repository-docs` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install repository-docs@skills-of-luca
```

This plugin owns its skill source under `plugins/repository-docs/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
