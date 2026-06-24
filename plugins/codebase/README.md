# Codebase
Codebase design and structure skills for API interfaces, repository organization, runtime boundaries, ownership, and cleanup of LLM-generated layouts.

## Skills
- `codebase:api-design`
- `codebase:codebase-structure`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install codebase@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `codebase` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install codebase@skills-of-luca
```

This plugin owns its skill source under `plugins/codebase/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
