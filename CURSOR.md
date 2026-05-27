# Skills of Luca
This repo uses `AGENTS.md` as the canonical agent guide. Read it first for layout, generated-file rules, skill authoring constraints, and validation commands.

## Cursor Notes

### Team marketplace (recommended)
Matches the [cursor-team-marketplace-template](https://github.com/fieldsphere/cursor-team-marketplace-template) layout (`metadata.pluginRoot`, lean manifests).

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Mark each plugin **Required** or **Optional**

### IDE slash commands
```text
/plugin marketplace add lucasilverentand/skills
/plugin install git@skills-of-luca
```

Cursor reads `.cursor-plugin/marketplace.json`, then loads plugin manifests from `plugins/<name>/.cursor-plugin/plugin.json`. Skills and commands are discovered from each plugin's `skills/` and `commands/` directories; prefer skills for portable workflows.

Validate before publishing:

```bash
bun run validate:cursor
```

To submit to the official Cursor catalog, see [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
