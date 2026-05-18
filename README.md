# Skills of Luca
Reusable Agent Skills for Codex, Claude Code, and other agents that understand the open `SKILL.md` format.

Canonical skills live in `skills/<skill-name>/`. Generated plugin packages live in `plugins/<name>/`, with marketplaces at `.agents/plugins/marketplace.json` for Codex and `.claude-plugin/marketplace.json` for Claude Code.

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

Direct local skill install:

```bash
bun run install:codex-skills -- creating-commits creating-prs
bun run install:claude-skills -- creating-commits creating-prs
```

## Development
Edit root `skills/`, update `plugin-groups.json` when bundle membership changes, then run:

```bash
bun run marketplace:write
bun run marketplace
bun run check
```
