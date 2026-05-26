# GitHub
GitHub workflow toolkit for creating pull requests, monitoring CI, and getting PRs ready to merge.

## Skills
- `github:creating-prs`
- `github:fix-pr`
- `github:monitoring-ci`

Codex and Claude Code also expose command shims for this plugin: `/github:ci`, `/github:create-draft-pr`, `/github:create-pr`, `/github:fix-pr`. Prefer the portable skills above for automatic loading.

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
