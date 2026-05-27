# Skills of Luca
This repo uses `AGENTS.md` as the canonical agent guide. Read it first for layout, generated-file rules, skill authoring constraints, and validation commands.

## Cursor Notes
Add the marketplace and install a plugin with Cursor slash commands:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install git@skills-of-luca
```

Cursor reads `.cursor-plugin/marketplace.json`, then loads plugin manifests from `plugins/<name>/.cursor-plugin/plugin.json`. Command shims under `plugins/<name>/commands/` are available in Cursor plugins; prefer skills for portable workflows.

To submit this marketplace to the official Cursor catalog, see [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
