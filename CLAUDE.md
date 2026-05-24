# Skills of Luca
This repo uses `AGENTS.md` as the canonical agent guide. Read it first for layout, generated-file rules, skill authoring constraints, and validation commands.

## Claude Code Notes
Add the marketplace and install a plugin with Claude Code slash commands:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install git@skills-of-luca
```

Claude Code reads `.claude-plugin/marketplace.json`, then loads plugin manifests from `plugins/<name>/.claude-plugin/plugin.json`. Claude-only legacy command shims live under `plugins/<name>/commands/`; prefer skills for portable workflows.
