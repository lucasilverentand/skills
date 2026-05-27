# Apple Design
Apple Human Interface Guidelines as a single plugin: foundations, services, and a skill per Apple platform.

## Skills
- `apple-design:foundations`
- `apple-design:ios`
- `apple-design:macos`
- `apple-design:services`
- `apple-design:tvos`
- `apple-design:visionos`
- `apple-design:watchos`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install apple-design@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `apple-design` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install apple-design@skills-of-luca
```

This plugin owns its skill source under `plugins/apple-design/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
