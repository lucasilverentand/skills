# Skills of Luca
Reusable Agent Skills for Codex, Claude Code, and other agents that understand the open `SKILL.md` format.

## Layout
|Path|Purpose|
|---|---|
|`skills/<skill-name>/`|Canonical skill source. Edit these files first.|
|`plugin-groups.json`|Defines which skills are bundled into each plugin.|
|`plugins/<name>/`|Generated installable plugin packages for Codex and Claude Code.|
|`.agents/plugins/marketplace.json`|Generated Codex marketplace.|
|`.claude-plugin/marketplace.json`|Generated Claude Code marketplace.|

The `plugins/` tree is committed because plugin users should not need Bun just to install. Treat generated skill copies under `plugins/<name>/skills/` as build output.

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
Use the canonical root skills without plugin packaging:

```bash
bun run install:codex-skills -- creating-commits creating-prs
bun run install:claude-skills -- creating-commits creating-prs
```

Omit skill names to install every canonical skill. Add `--symlink` for local development and `--force` to replace existing installed skills.

## Development
- `bun run check` — token and structure check for Markdown skills and docs
- `bun run check:fix` — apply safe Markdown compaction
- `bun run marketplace` — dry-run generator and validation
- `bun run marketplace:write` — regenerate plugin packages and both marketplaces

Workflow:

1. Edit `skills/<skill-name>/`.
2. Update `plugin-groups.json` if plugin membership or install copy changes.
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
- Use root `skills/` as source of truth.
- Do not hand-edit generated skill copies in `plugins/<name>/skills/`.
- Keep `SKILL.md` files close to the open Agent Skills spec. Put product-specific behavior in generated plugin manifests or product-specific metadata where possible.
- A canonical skill may be bundled into more than one plugin when that makes the plugin self-contained.
