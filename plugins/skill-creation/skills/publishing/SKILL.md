---
name: publishing
description: Manages Codex, Claude Code, and Cursor skill marketplaces — publishes plugin-owned skills, updates plugin groups, removes entries, packages skills for distribution, regenerates plugin manifests, and validates catalog integrity. Use when publishing a skill to the marketplace, bumping a version, removing a skill from the catalog, packaging a skill as a .skill file, regenerating marketplace files, moving a skill between plugins, or fixing marketplace validation errors.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Skill Publishing

## Decision Tree
- What are you doing?
  - **Publishing a skill to the marketplace** -> follow "Publishing" below
  - **Updating a published skill** -> what changed?
    - **Bug fix or wording tweak** -> bump patch version in `plugin-groups.json` `metadata.version`
    - **New skills, new tools, or backwards-compatible additions** -> bump minor version in `plugin-groups.json` `metadata.version`
    - **Breaking changes (removed skills, renamed categories, restructured)** -> bump major version in `plugin-groups.json` `metadata.version`
  - **Removing a skill from the marketplace** -> follow "Removing" below
  - **Moving a skill to a different plugin** -> move `plugins/<old>/skills/<skill>` to `plugins/<new>/skills/<skill>`, update `plugin-groups.json`, then run `bun run marketplace:write`
  - **Packaging a skill for distribution** -> run `scripts/package-skill.ts <path/to/skill-folder>`
  - **Validating marketplace.json** -> run `bun run marketplace`, fix any errors per `references/marketplace-errors.md`
  - **Regenerating marketplace.json from disk** -> follow "Regenerating manifests" below

## Publishing
1. Ensure the skill directory exists at `plugins/<plugin>/skills/<skill-name>/SKILL.md`
2. Run the validator: `bun run plugins/skill-creation/skills/publishing/scripts/quick-validate.ts plugins/<plugin>/skills/<skill-name>`
3. Add the skill name to exactly one plugin entry in `plugin-groups.json`
4. Run `bun run marketplace:write` to regenerate:
   - `plugins/<name>/.claude-plugin/plugin.json`
   - `plugins/<name>/.codex-plugin/plugin.json`
   - `plugins/<name>/.cursor-plugin/plugin.json`
   - `plugins/<name>/README.md`
   - `.claude-plugin/marketplace.json`
   - `.cursor-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
5. Run `bun run marketplace` again; it must report everything up to date

For bulk additions, update `plugin-groups.json` first, then regenerate once.

## Removing
1. Remove the skill name from its plugin in `plugin-groups.json`
2. Delete `plugins/<plugin>/skills/<skill-name>/`
3. Bump `plugin-groups.json` `metadata.version` — minor if backwards-compatible, major if consumers depended on it
4. Run `bun run marketplace:write`, then `bun run marketplace`

## Regenerating manifests
To rebuild plugin manifests and marketplaces from the plugin-owned source tree:

1. Edit skills under `plugins/<plugin>/skills/`
2. Edit plugin metadata or skill ownership in `plugin-groups.json`
3. Run `bun run marketplace:write`
4. Review the generated diff under plugin manifests, plugin READMEs, `.claude-plugin/`, `.cursor-plugin/`, and `.agents/plugins/`
5. Run `bun run marketplace` to confirm no generated files are stale

## Marketplace conventions
See `references/marketplace-schema.md` for the full schema. Key conventions:

- **Skill source**: `plugins/<name>/skills/<skill-name>/` directories are authored directly
- **Generated files**: plugin manifests, plugin READMEs, and marketplace files are overwritten by `bun run marketplace:write`
- **Naming**: lowercase alphanumeric + hyphens, 1-64 characters
- **Versioning**: `plugin-groups.json` `metadata.version` is the source for generated marketplace and plugin manifest versions. Do not hand-edit generated marketplace JSON to bump a version.
- **Codex marketplace**: generated at `.agents/plugins/marketplace.json`
- **Claude marketplace**: generated at `.claude-plugin/marketplace.json`
- **Cursor marketplace**: generated at `.cursor-plugin/marketplace.json` (team-template layout with `metadata.pluginRoot`)
- **Cursor validation**: `bun run validate:cursor` after regenerating Cursor artifacts
- **Commands**: command shims may be used for explicit Codex, Claude, and Cursor slash-command entrypoints; portable workflows should still be skills

## Key references
|File|What it covers|
|---|---|
|`references/marketplace-schema.md`|Codex, Claude, and Cursor marketplace schemas, plugin manifests, and source types|
|`references/marketplace-errors.md`|Validation error codes and fixes|
|`plugin-groups.json`|Source of truth for plugin grouping and metadata|
|`scripts/marketplace.ts`|Regenerates both marketplaces and plugin manifests|
|`scripts/quick-validate.ts`|Quick SKILL.md frontmatter validation|
|`scripts/package-skill.ts`|Packages a skill folder into a distributable `.skill` zip file|
