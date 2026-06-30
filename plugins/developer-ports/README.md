# Developer Ports
Local development port registry tools for scanning projects, finding collisions, checking live listeners, suggesting free ports, and reserving user-scoped project ports.

## Skills
- `developer-ports:port-registry`

This plugin also exposes MCP tools from `./.mcp.json`.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install developer-ports@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `developer-ports` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install developer-ports@skills-of-luca
```

This plugin owns its skill source under `plugins/developer-ports/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
