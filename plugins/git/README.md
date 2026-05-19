# Git
Git workflow toolkit for commits, conflict resolution, rebases, and repository cleanup.

## Skills
- `git:cleaning-repos`
- `git:creating-commits`
- `git:resolving-conflicts`

Claude Code also exposes legacy command shims for this plugin: `/git:clean-repo`, `/git:create-commit`, `/git:rebase`. Prefer the portable skills above for Codex and other agents.

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install git@skills-of-luca
```

This plugin owns its skill source under `plugins/git/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
