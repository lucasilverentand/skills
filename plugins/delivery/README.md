# Delivery
Operations, reliability, and delivery workflows for opening pull requests, cleaning repositories, preparing releases, and getting work safely shipped.

## Skills
- `delivery:cleaning-repos`
- `delivery:creating-prs`

Codex and Claude Code also expose command shims for this plugin: `/delivery:clean-repo`, `/delivery:create-draft-pr`, `/delivery:create-pr`. Prefer the portable skills above for automatic loading.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install delivery@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `delivery` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install delivery@skills-of-luca
```

This plugin owns its skill source under `plugins/delivery/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
