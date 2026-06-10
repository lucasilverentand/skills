# Design
Design system synthesis from screenshots, moodboards, videos, URLs, chat briefs, and mixed visual references.

## Skills
- `design:design-system`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install design@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `design` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install design@skills-of-luca
```

This plugin owns its skill source under `plugins/design/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
