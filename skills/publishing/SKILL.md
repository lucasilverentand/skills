---
name: publishing
description: Manages dual Codex and Claude Code skill marketplaces — publishes skills, updates plugin groups, removes entries, packages skills for distribution, regenerates generated plugin packages, and validates catalog integrity. Use when publishing a skill to the marketplace, bumping a version, removing a skill from the catalog, packaging a skill as a .skill file, regenerating marketplace files, moving a skill between plugins, or fixing marketplace validation errors.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Skill Publishing

## Decision Tree
- What are you doing?
  - **Publishing a skill to the marketplace** -> follow "Publishing" below
  - **Updating a published skill** -> what changed?
    - **Bug fix or wording tweak** -> bump patch version in `metadata.version` of marketplace.json
    - **New skills, new tools, or backwards-compatible additions** -> bump minor version
    - **Breaking changes (removed skills, renamed categories, restructured)** -> bump major version
  - **Removing a skill from the marketplace** -> follow "Removing" below
  - **Moving a skill to a different plugin** -> edit `plugin-groups.json`, then run `bun run marketplace:write`
  - **Packaging a skill for distribution** -> run `scripts/package-skill.ts <path/to/skill-folder>`
  - **Validating marketplace.json** -> run `bun run marketplace`, fix any errors per `references/marketplace-errors.md`
  - **Regenerating marketplace.json from disk** -> follow "Regenerating generated packages" below

## Publishing
1. Ensure the canonical skill directory exists at `skills/<skill-name>/SKILL.md`
2. Run the validator: `bun run skills/publishing/scripts/quick-validate.ts skills/<skill-name>`
3. Add the skill name to one or more plugin entries in `plugin-groups.json`
4. Run `bun run marketplace:write` to regenerate:
   - `plugins/<name>/skills/<skill-name>/`
   - `plugins/<name>/.claude-plugin/plugin.json`
   - `plugins/<name>/.codex-plugin/plugin.json`
   - `.claude-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
5. Run `bun run marketplace` again; it must report everything up to date

For bulk additions, update `plugin-groups.json` first, then regenerate once.

## Removing
1. Remove the skill name from every relevant plugin in `plugin-groups.json`
2. Delete the canonical `skills/<skill-name>/` directory only if it is no longer published anywhere
3. Bump the marketplace version — minor if backwards-compatible, major if consumers depended on it
4. Run `bun run marketplace:write`, then `bun run marketplace`

## Regenerating generated packages
To rebuild plugin packages and marketplaces from the canonical source tree:

1. Edit canonical skills under `skills/`
2. Edit plugin grouping metadata in `plugin-groups.json`
3. Run `bun run marketplace:write`
4. Review the generated diff under `plugins/`, `.claude-plugin/`, and `.agents/plugins/`
5. Run `bun run marketplace` to confirm no generated files are stale

## Marketplace conventions
See `references/marketplace-schema.md` for the full schema. Key conventions:

- **Canonical skills**: root `skills/<skill-name>/` directories are the only authored skill source
- **Generated plugins**: `plugins/<name>/skills/` is overwritten by `bun run marketplace:write`
- **Naming**: lowercase alphanumeric + hyphens, 1-64 characters
- **Versioning**: `plugin-groups.json` `metadata.version` tracks both marketplace versions using semver
- **Codex marketplace**: generated at `.agents/plugins/marketplace.json`
- **Claude marketplace**: generated at `.claude-plugin/marketplace.json`
- **Commands**: legacy command shims stay Claude-only; portable workflows should be skills

## Key references
|File|What it covers|
|---|---|
|`references/marketplace-schema.md`|Codex + Claude marketplace schemas, plugin manifests, and source types|
|`references/marketplace-errors.md`|Validation error codes and fixes|
|`plugin-groups.json`|Source of truth for plugin grouping and metadata|
|`scripts/marketplace.ts`|Regenerates both marketplaces and plugin packages|
|`scripts/quick-validate.ts`|Quick SKILL.md frontmatter validation|
|`scripts/package-skill.ts`|Packages a skill folder into a distributable `.skill` zip file|
