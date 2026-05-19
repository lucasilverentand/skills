# GitHub
GitHub workflow toolkit for creating pull requests and monitoring CI.

## Skills
- `github:creating-prs`
- `github:monitoring-ci`

Claude Code also exposes legacy command shims for this plugin: `/github:ci`, `/github:create-draft-pr`, `/github:create-pr`. Prefer the portable skills above for Codex and other agents.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install github@skills-of-luca
```

This plugin owns its skill source under `plugins/github/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
