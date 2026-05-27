# Skills of Luca
Reusable Agent Skills for Codex, Claude Code, Cursor, and other agents that understand the open `SKILL.md` format.

Each plugin is the source of truth for its own skills under `plugins/<plugin>/skills/<skill>/`. The repo publishes Codex, Claude Code, and Cursor marketplaces from those plugin packages.

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

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install plugins as Required or Optional

Cursor (IDE):

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
Edit `plugins/<plugin>/skills/`, update `plugin-groups.json` when plugin membership changes, then run:

```bash
bun run marketplace:write
bun run ci
```

`bun run ci` is the same validation GitHub Actions runs on pull requests (marketplace sync, Cursor marketplace layout, skill checks, markdown format, JSON manifests). Use `bun run check` locally for a non-strict dry-run with warnings only.

Agent and contributor guidance lives in `AGENTS.md`.
