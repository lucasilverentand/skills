# Documentation
Documentation authoring and structured knowledge capture for design docs, ADRs, C4 diagrams, and decision trees.

## Skills
- `documentation:c4-diagrams`
- `documentation:decision-trees`
- `documentation:write-adr`
- `documentation:write-design-doc`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install documentation@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `documentation` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install documentation@skills-of-luca
```

This plugin owns its skill source under `plugins/documentation/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
