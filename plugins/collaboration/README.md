# Collaboration
Collaboration and communication skills for shared understanding: repository docs, decision trees, onboarding context, and human-readable coordination artifacts.

## Skills
- `collaboration:closed-source-docs`
- `collaboration:decision-trees`
- `collaboration:open-source-docs`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install collaboration@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `collaboration` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install collaboration@skills-of-luca
```

This plugin owns its skill source under `plugins/collaboration/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
