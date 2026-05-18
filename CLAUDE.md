# Skills of Luca
Reusable Agent Skills for Codex, Claude Code, and other agents that understand the open `SKILL.md` format.

## Layout
|Path|Purpose|
|---|---|
|`plugins/<name>/skills/<skill-name>/`|Authored skill source for that plugin. Edit these files first.|
|`plugin-groups.json`|Defines plugin metadata and the skills owned by each plugin.|
|`plugins/<name>/.codex-plugin/plugin.json`|Generated Codex plugin manifest.|
|`plugins/<name>/.claude-plugin/plugin.json`|Generated Claude Code plugin manifest.|
|`.agents/plugins/marketplace.json`|Generated Codex marketplace.|
|`.claude-plugin/marketplace.json`|Generated Claude Code marketplace.|

The `plugins/` tree is committed because it is the installable package tree and the authored skill source. Generated files are limited to manifests, marketplaces, and plugin READMEs.

## Install
### Codex
Add the marketplace, then install plugins from the Codex plugin directory:

```bash
codex plugin marketplace add lucasilverentand/skills
```

For local development:

```bash
codex plugin marketplace add ./path/to/skills
```

Codex reads `.agents/plugins/marketplace.json`, then loads plugin manifests from `plugins/<name>/.codex-plugin/plugin.json`.

### Claude Code
Add the marketplace and install a plugin:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install git@skills-of-luca
```

Claude Code reads `.claude-plugin/marketplace.json`, then loads plugin manifests from `plugins/<name>/.claude-plugin/plugin.json`. Claude-only legacy command shims live under `plugins/<name>/commands/`; prefer skills for portable workflows.

### Direct Skills
Install plugin-owned skills directly into a personal skills directory:

```bash
bun run install:codex-skills -- creating-commits creating-prs
bun run install:claude-skills -- creating-commits creating-prs
```

Omit skill names to install every skill. Add `--symlink` for local development and `--force` to replace existing installed skills. Skill names can be plain (`creating-commits`) or plugin-qualified (`git:creating-commits`).

## Development
- `bun run check` — token and structure check for Markdown skills and docs
- `bun run check:fix` — apply safe Markdown compaction
- `bun run marketplace` — dry-run generator and validation
- `bun run marketplace:write` — regenerate plugin manifests, plugin READMEs, and both marketplaces

Workflow:

1. Edit `plugins/<plugin>/skills/<skill-name>/`.
2. Update `plugin-groups.json` if plugin membership changes.
3. Run `bun run marketplace:write`.
4. Run `bun run marketplace`; it should report everything up to date.
5. Run `bun run check`.

## Plugin Bundles
- `apple-design` — Apple HIG guidance by platform
- `documentation` — C4 diagrams, decision trees, ADRs, design docs
- `frontend` — interactive design option prototypes
- `git` — commits, repo cleanup, conflict resolution
- `github` — pull requests and CI monitoring
- `project` — project context and requirements
- `skill-creation` — skill authoring, publishing, tooling, retrospectives
- `systems-design` — requirements through architecture, data modeling, API design, docs, diagrams, ADRs, and review

## Notes for Agents
- Use `plugins/<name>/skills/` as the source of truth.
- Keep `SKILL.md` files close to the open Agent Skills spec. Put product-specific behavior in generated plugin manifests or product-specific metadata where possible.
- A skill belongs to exactly one plugin. Cross-plugin workflows should reference the other skill by name instead of copying its files.
