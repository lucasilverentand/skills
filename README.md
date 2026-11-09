# SevenTwo Team
A shared skill for Claude Code, Codex and compatible agents. The current thread leads a small team that protects efficiency, scope and the project's interests, then selects specialists for the task. The package includes 16 role presets, model and effort selection guidance, independent review, and current-system documentation practices.

The skill adapts to the user's repository, planner, knowledge store and available providers. On first use it discovers established conventions and asks only about consequential gaps. Explicit reusable preferences are saved in an agreed private location outside this repository. Provider access and integrations must already be available in the host; installing this skill does not provision them.

## Install
Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install seventwo-team@skills-of-luca
```

Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
codex plugin add seventwo-team@skills-of-luca
```

The Codex marketplace is published at [.agents/plugins/marketplace.json](.agents/plugins/marketplace.json). Direct installation from a local clone is also supported:

```bash
git clone https://github.com/lucasilverentand/skills.git
cd skills
bun run install:codex-skills -- seventwo-team
# Or for Claude Code:
bun run install:claude-skills -- seventwo-team
```

The direct installer copies into `~/.agents/skills` for Codex or `~/.claude/skills` for Claude Code. It skips existing skills unless `--force` is supplied. Use `--symlink` for local development. Copies need reinstalling after an update; symlinks follow the checkout. Installation does not remove older local skills or sync private preferences between machines.

After installing, start a new session and ask your agent to use SevenTwo Team; it should name the skill and size a team for the task. If it does not recognize the skill, reload the host or check that the plugin is enabled.

Cursor users can import `https://github.com/lucasilverentand/skills` in Dashboard → Settings → Plugins → Import, then select SevenTwo Team. Coordination depends on the agent tools available in that host.

## Use
Ask your agent to “Use SevenTwo Team to complete this task.” To make it the default for product and open-source work, add the [portable routing instructions](docs/default-routing.md) to your host's user or project guidance, such as `AGENTS.md` or `CLAUDE.md`.

The lead sizes the team to the task: tiny changes run directly with no advisors, standard work gets one combined efficiency and scope advisor, and consequential work gets separate efficiency, scope and context advocates. Optional specialists cover development and architecture, independent review, Git and PRs, UX, UI, writing, accessibility, security and privacy, performance and reliability, verification, product analysis, and knowledge maintenance. The presets are role instructions selected by the lead, not separately registered agents.

The skill only activates when you ask for it or make it your default; it does not trigger on ordinary requests. Read [the skill](plugins/seventwo-team/skills/seventwo-team/SKILL.md) for the workflow and [preferences](plugins/seventwo-team/skills/seventwo-team/references/preferences.md) for private persistence and project scoping. New users can choose repository-local docs, no tracker or one provider; Notion, Linear and a particular model subscription are not required.

## Catalog migration
Catalog 4.0.0 replaces all earlier plugins with `seventwo-team` (skill release 0.2.1). Old plugin names and paths are retired. Install the replacement explicitly; marketplace updates do not automatically uninstall previous plugins or migrate local configuration. Earlier contents remain available in Git history.

## Development
Authored source lives in `plugins/seventwo-team/skills/seventwo-team/`. Update metadata in `plugin-groups.json`, then regenerate and validate:

```bash
bun run marketplace:write
bun run ci
```

The catalog version and plugin version are independent. `metadata.version` versions the catalog; the plugin's `version` versions the distributed skill. Commit generated manifests, marketplaces and plugin README with their source changes. The existing CI validates marketplace synchronization, Cursor layout, skill structure, Markdown formatting and JSON.

Run `bun run tree` for the skill inventory. Contributor and agent guidance lives in [AGENTS.md](AGENTS.md). Keep personal profiles and private workspace knowledge outside the shared package.

## License
[MIT](LICENSE).
