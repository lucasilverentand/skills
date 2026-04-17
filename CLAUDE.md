# Skills Marketplace
A Bun-based catalog of Claude Code plugins (skills + commands).

## Commands
- `bun check` — token-optimize all `.md` files (dry-run); `bun check:fix` to apply
- `bun marketplace` — regenerate marketplace.json + plugin.json from disk (dry-run); `bun marketplace:write` to apply

## Layout
- `plugins/<name>/skills/<skill>/SKILL.md` — skills (discovered automatically)
- `plugins/<name>/commands/<cmd>.md` — slash commands
- `.claude-plugin/marketplace.json` — generated; do not hand-edit
- `plugins/*/.claude-plugin/plugin.json` — generated; only `name`, `description`, `author` are preserved

## Conventions
- Flat plugins, no bundles
- Avoid plugin/skill names that collide with Claude Code built-in namespaces
- Run `bun check:fix` before committing markdown changes
