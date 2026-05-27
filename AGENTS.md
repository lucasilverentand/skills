# Skills of Luca
Reusable Agent Skills for Codex, Claude Code, Cursor, and other agents that understand the open `SKILL.md` format.

## Repository Layout
|Path|Purpose|
|---|---|
|`plugins/<name>/skills/<skill-name>/`|Authored skill source for that plugin. Edit these files first.|
|`plugin-groups.json`|Defines plugin metadata and the skills owned by each plugin.|
|`plugins/<name>/.codex-plugin/plugin.json`|Generated Codex plugin manifest.|
|`plugins/<name>/.claude-plugin/plugin.json`|Generated Claude Code plugin manifest.|
|`plugins/<name>/.cursor-plugin/plugin.json`|Generated Cursor plugin manifest.|
|`.agents/plugins/marketplace.json`|Generated Codex marketplace.|
|`.claude-plugin/marketplace.json`|Generated Claude Code marketplace.|
|`.cursor-plugin/marketplace.json`|Generated Cursor marketplace.|

The `plugins/` tree is committed because it is both the installable package tree and the authored skill source. Generated files are limited to plugin manifests, marketplaces, and plugin READMEs.

## Development Workflow
- Edit authored skill content under `plugins/<plugin>/skills/<skill-name>/`.
- Update `plugin-groups.json` when plugin membership, plugin metadata, commands, or skill ownership changes.
- Run `bun run marketplace:write` after changing plugin membership, skill metadata, plugin README source, command lists, or anything that affects generated manifests or marketplaces.
- Run `bun run marketplace` after generation; it should report everything up to date.
- Run `bun run check` before finishing docs or skill changes.

Useful commands:

```bash
bun run check
bun run check:fix
bun run marketplace
bun run marketplace:write
```

`bun run check` validates token and structure expectations for Markdown skills and docs. `bun run check:fix` applies safe Markdown compaction only; use it deliberately and review the diff.

## Generated Artifacts
- Do not hand-edit generated plugin manifests, generated plugin READMEs, or marketplace JSON unless the generator is being changed.
- If generated files are stale, update the source files first, then run `bun run marketplace:write`.
- Keep generated output committed when the source change requires it.
- `bun run marketplace` is the dry-run validation that confirms generated artifacts match the sources.

## Skill Authoring Rules
- Keep `SKILL.md` files close to the open Agent Skills spec: concise frontmatter, clear trigger language, and agent-readable workflow steps.
- Put reusable supporting material under the skill's own directory, usually in `references/` or `scripts/`, and load it progressively from `SKILL.md`.
- Keep product-specific behavior in generated plugin manifests or product-specific metadata where possible.
- A skill belongs to exactly one plugin. Cross-plugin workflows should reference the other skill by name instead of copying its files.
- Prefer compact, concrete instructions over broad policy text. The check script flags large context-injected files because `SKILL.md` content is loaded when a skill triggers.

## Install Notes
Codex reads `.agents/plugins/marketplace.json`, then loads plugin manifests from `plugins/<name>/.codex-plugin/plugin.json`.

Claude Code reads `.claude-plugin/marketplace.json`, then loads plugin manifests from `plugins/<name>/.claude-plugin/plugin.json`. Claude-only legacy command shims live under `plugins/<name>/commands/`; prefer skills for portable workflows.

Cursor reads `.cursor-plugin/marketplace.json`, then loads plugin manifests from `plugins/<name>/.cursor-plugin/plugin.json`. Command shims under `plugins/<name>/commands/` are also available in Cursor plugins; prefer skills for portable workflows.

Direct local skill installs are available for personal skills directories:

```bash
bun run install:codex-skills -- creating-commits creating-prs
bun run install:claude-skills -- creating-commits creating-prs
```

Omit skill names to install every skill. Add `--symlink` for local development and `--force` to replace existing installed skills. Skill names can be plain (`creating-commits`) or plugin-qualified (`git:creating-commits`).

## Cursor Cloud specific instructions
- **Runtime**: Bun is the sole runtime dependency. There are no `node_modules`, no lockfile, and no npm/yarn/pnpm usage. The update script ensures Bun is installed and on `PATH`.
- **No services to start**: This is a content-only repo (Markdown skills + TypeScript validation scripts). There are no servers, databases, or Docker containers.
- **Validation commands** are documented in the Development Workflow section above. After any skill or metadata change, run `bun run marketplace:write` then `bun run marketplace` then `bun run check`.
- **`bun run check` exit codes**: exit 0 means pass (warnings are informational only). Exit 1 means there are errors that must be fixed.
- **Generated plugin READMEs**: `marketplace:write` regenerates `plugins/*/README.md` files. If your diff includes only these generated files, that is expected—commit them alongside source changes.
