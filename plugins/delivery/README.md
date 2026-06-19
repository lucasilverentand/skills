# Delivery
Repository management and delivery workflows for commits, pull requests, rebases, conflict resolution, CI repair, PR readiness, stale state cleanup, releases, and getting work safely shipped.

## Skills
- `delivery:repo-management`

Codex and Claude Code also expose command shims for this plugin: `/delivery:ci`, `/delivery:clean-repo`, `/delivery:create-commit`, `/delivery:create-draft-pr`, `/delivery:create-pr`, `/delivery:fix-pr`, `/delivery:rebase`. Prefer the portable skills above for automatic loading.

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
