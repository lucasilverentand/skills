---
name: publish-skill
description: Manages the skill marketplace catalog — publishes skills, updates versions, removes entries, packages skills for distribution, regenerates marketplace.json from disk, and validates catalog integrity. Use when publishing a skill to the marketplace, bumping a version, removing a skill from the catalog, packaging a skill as a .skill file, regenerating marketplace.json, moving a skill between plugins, or fixing marketplace validation errors.
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
  - **Moving a skill to a different category** -> remove the path from the old plugin's `skills` array, add it to the new one (create a new plugin entry if needed — see `references/marketplace-schema.md` "Plugin entry fields"), then run `tools/marketplace-lint.ts`
  - **Packaging a skill for distribution** -> run `scripts/package-skill.ts <path/to/skill-folder>`
  - **Validating marketplace.json** -> run `tools/marketplace-lint.ts`, fix any errors per `references/marketplace-errors.md`
  - **Regenerating marketplace.json from disk** -> follow "Regenerating from disk" below

## Publishing

1. Ensure the skill directory has a valid `SKILL.md` with frontmatter (`description` recommended)
2. Run the validator: `bun run scripts/quick-validate.ts <path>` to check frontmatter
3. Add the skill path to `.claude-plugin/marketplace.json`:
   - Find the plugin entry matching the skill's category directory
   - Add `"./skills/<category>/<skill-name>"` to the plugin's `skills` array
   - If no matching plugin exists, create a new plugin entry (see `references/marketplace-schema.md` "Plugin entry fields")
4. Run `tools/marketplace-lint.ts` to validate — fix any errors before committing

For bulk additions, use "Regenerating from disk" below instead.

## Removing

1. Remove the skill path from the plugin's `skills` array in marketplace.json
2. If the plugin has no remaining skills, remove the entire plugin entry
3. Run `tools/marketplace-lint.ts` to validate
4. Bump the marketplace version — minor if backwards-compatible, major if consumers depended on it

## Regenerating from disk

To rebuild marketplace.json from the current directory structure:

1. Scan all `plugins/*/skills/*/SKILL.md` files to discover skills
2. Group them by plugin directory name
3. Write the result to `.claude-plugin/marketplace.json`, preserving existing `name`, `owner`, and `metadata` fields
4. Run `tools/marketplace-lint.ts` to validate the generated file
5. Review the diff — regeneration may add skills you didn't intend or lose manual edits (descriptions, ordering)

## Marketplace conventions

See `references/marketplace-schema.md` for the full schema. Key conventions:

- **Category mapping**: all plugins use `devtools`
- **Naming**: lowercase alphanumeric + hyphens, 1-64 characters
- **Versioning**: `metadata.version` tracks overall marketplace version using semver
- **`strict: false`**: this repo uses `strict: false` for all plugins — marketplace entry IS the full definition, no separate `plugin.json` needed

## Key references

| File | What it covers |
| --- | --- |
| `references/marketplace-schema.md` | marketplace.json schema, plugin.json, bundles, source types, skill discovery |
| `references/marketplace-errors.md` | Validation error codes and fixes |
| `tools/marketplace-lint.ts` | Validates marketplace.json (run with `--fix` to auto-sort, `--json` for CI) |
| `scripts/quick-validate.ts` | Quick SKILL.md frontmatter validation |
| `scripts/package-skill.ts` | Packages a skill folder into a distributable `.skill` zip file |
