# Verification
Quality and verification workflows for CI monitoring, pull request repair, merge readiness, and evidence-driven validation.

## Skills
- `verification:fix-pr`
- `verification:monitoring-ci`

Codex and Claude Code also expose command shims for this plugin: `/verification:ci`, `/verification:fix-pr`. Prefer the portable skills above for automatic loading.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install verification@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `verification` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install verification@skills-of-luca
```

This plugin owns its skill source under `plugins/verification/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
