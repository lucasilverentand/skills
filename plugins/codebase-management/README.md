# Codebase Management
Codebase management skills for repository structure, project-type organization, monorepo boundaries, code ownership, cleanup of LLM-generated layouts, and incremental codebase reorganization.

## Skills
- `codebase-management:codebase-structure`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install codebase-management@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `codebase-management` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install codebase-management@skills-of-luca
```

This plugin owns its skill source under `plugins/codebase-management/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
