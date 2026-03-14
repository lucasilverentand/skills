---
name: marketplace
description: Manages the skills marketplace — validates marketplace.json integrity, publishes and updates skills, enforces naming and category conventions, manages semver versioning, and generates the marketplace catalog. Use when adding a skill to the marketplace, updating a published skill, removing a skill, validating marketplace.json, regenerating the catalog, or when a new skill directory exists but isn't registered yet.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Marketplace

## Decision Tree

- What are you doing?
  - **Publishing a new skill to the marketplace** → follow "Publishing a skill" below
  - **Updating a published skill** → what changed?
    - **Bug fix or wording tweak** → bump patch version in `metadata.version` of marketplace.json
    - **New skills, new tools, or backwards-compatible additions** → bump minor version
    - **Breaking changes (removed skills, renamed categories, restructured)** → bump major version
  - **Removing a skill from the marketplace** → follow "Removing a skill" below
  - **Moving a skill to a different category** → remove the path from the old plugin's `skills` array, add it to the new one (create a new plugin entry if needed — see `references/schema.md` "Plugin entry fields"), then run `tools/marketplace-lint.ts`
  - **Validating marketplace.json** → run `tools/marketplace-lint.ts`, fix any errors per "Fixing validation errors" below
  - **Generating marketplace.json from disk** → follow "Regenerating from disk" below
  - **Adding a skill path to an existing plugin** → does a plugin for this category already exist?
    - **Yes** → add the path to that plugin's `skills` array
    - **New category** → create a new plugin entry (see `references/schema.md` "Plugin entry fields"), then add the skill path
  - **Fixing a validation error** → see "Fixing validation errors" below
  - **Checking if a skill is published** → search marketplace.json for the skill path in any plugin's `skills` array

## Publishing a skill

1. Ensure the skill directory has a valid `SKILL.md` with correct frontmatter (`name`, `description`) and a `PURPOSE.md`
2. Run the authoring skill's validator: `bun run skills/skills/authoring/tools/skill-validate.ts <path>`
3. Add the skill path to `.claude-plugin/marketplace.json`:
   - Find the plugin entry matching the skill's category directory
   - Add `"./skills/<category>/<skill-name>"` to the plugin's `skills` array
   - If no matching plugin exists, create a new plugin entry (see `references/schema.md` "Plugin entry fields")
4. Run `tools/marketplace-lint.ts` to validate — fix any errors before committing

For bulk additions, use "Regenerating from disk" below instead.

## Removing a skill

1. Remove the skill path from the plugin's `skills` array in marketplace.json
2. If the plugin has no remaining skills, remove the entire plugin entry
3. Run `tools/marketplace-lint.ts` to validate
4. Bump the marketplace version — minor if backwards-compatible, major if consumers depended on it

## Regenerating from disk

1. Run `bun run scripts/generate-marketplace.ts` from the repo root
2. Run `tools/marketplace-lint.ts` to validate the generated file
3. Review the diff — generation may add skills you didn't intend or lose manual edits

## Conventions

### Category mapping

| Category directory | Marketplace category |
|---|---|
| communication, data, deployment, development, documentation, git, infrastructure, research, security, skills | `devtools` |
| editors | `editor` |
| project | `web-development` |

### Naming and versioning

- Names: lowercase alphanumeric + hyphens, 1-64 characters, no leading/trailing/consecutive hyphens
- Plugin names match the top-level category directory name
- `metadata.version` tracks the overall marketplace version using semver (`MAJOR.MINOR.PATCH`)
- Individual skills don't carry separate versions

### `strict: false` mode

This repo uses `strict: false` for all plugins — the marketplace entry IS the full definition, no separate `plugin.json` needed. See `references/schema.md` for details.

## Fixing validation errors

### Errors (block commit)

| Code | Fix |
|---|---|
| `invalid-json` | Fix JSON syntax errors in marketplace.json |
| `missing-required-field` | Add the missing field — applies to top-level, plugin, bundle, and source object fields |
| `invalid-type` | Field has wrong type — check schema for expected type (string, object, boolean, array) |
| `invalid-name` | Must be kebab-case: lowercase alphanumeric + hyphens, 1-64 chars |
| `reserved-name` | Marketplace name is reserved (e.g. `anthropic-marketplace`, `claude-code-plugins`) |
| `invalid-version` | Must be valid semver: `X.Y.Z` |
| `invalid-category` | Must be one of: `devtools`, `editor`, `web-development` |
| `invalid-path` | Skill paths must start with `./`, use forward slashes, no trailing slash or `..` segments |
| `invalid-source` | Source object has unknown type or malformed fields (e.g. GitHub repo not `owner/repo`) |
| `duplicate-name` | Each plugin/bundle name must be unique |
| `duplicate-skill` | A skill path appears twice in the same plugin or across plugins |
| `source-not-found` | The skill path must point to an existing directory |
| `missing-skill-md` | The skill directory exists but has no SKILL.md — create one |
| `invalid-frontmatter` | SKILL.md has no valid frontmatter block (must start and end with `---`) |
| `missing-frontmatter-field` | SKILL.md frontmatter missing `name` or `description` |
| `name-mismatch` | SKILL.md `name` field doesn't match its directory name |
| `empty-array` | A `skills` or `plugins` array is empty — add entries or remove the parent |
| `empty-field` | A description or other string field is empty |
| `description-too-long` | Description exceeds 1024 characters |
| `unknown-plugin` | Bundle references a plugin name that doesn't exist |
| `duplicate-ref` | Bundle references the same plugin more than once |
| `invalid-wildcard` | `"*"` must be the only element in a bundle's plugins array |

### Warnings (non-blocking)

| Code | Fix |
|---|---|
| `unsorted` | Plugins or skills not in alphabetical order — run with `--fix` to auto-sort |
| `orphan-skill` | Skill exists on disk but isn't registered in any plugin |
| `missing-purpose-md` | Skill directory has SKILL.md but no PURPOSE.md |
| `empty-skill-body` | SKILL.md has frontmatter but no content body |
| `unknown-tool` | SKILL.md `allowed-tools` references an unrecognized tool name |
| `description-too-long` | SKILL.md frontmatter description exceeds 1024 characters |
| `invalid-url` | A URL field (homepage, repository) isn't a valid URL |
| `name-collision` | Bundle name collides with a plugin name |

## Key references

| File | What it covers |
|---|---|
| `references/schema.md` | Full marketplace.json and plugin.json schema, source types, plugin entry format |
| `tools/marketplace-lint.ts` | Validate marketplace.json against schema and check skill paths |
| `scripts/generate-marketplace.ts` | Regenerate entire marketplace.json from SKILL.md files on disk |
