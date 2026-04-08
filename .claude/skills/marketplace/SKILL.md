---
name: marketplace
description: Manages the .claude-plugin/marketplace.json catalog — adds, removes, and syncs plugins and skills, bumps versions, regenerates from disk, and validates. Use when adding a skill to the marketplace, removing a skill, syncing marketplace.json with what's on disk, bumping the version, or validating the catalog.
allowed-tools: Read Edit Write Bash Glob Grep
---

# Marketplace Management

## Decision Tree

- What are you doing?
  - **Adding a skill to the marketplace** -> follow "Adding a skill" below
  - **Removing a skill from the marketplace** -> follow "Removing a skill" below
  - **Syncing marketplace.json with disk** -> follow "Syncing from disk" below
  - **Bumping the marketplace version** -> follow "Bumping version" below
  - **Validating marketplace.json** -> follow "Validating" below
  - **Adding a new plugin entry** -> follow "Adding a plugin" below
  - **Bootstrapping marketplace.json from scratch** -> follow "Syncing from disk" with `--fix` — it creates the file if missing
  - **Moving a skill between plugins** -> remove from old plugin's `skills` array, add to new one, then validate

## File locations

| File | Purpose |
|---|---|
| `.claude-plugin/marketplace.json` | The catalog — source of truth for what's published |
| `plugins/*/skills/*/SKILL.md` | Skill definitions on disk |
| `plugins/skill-creation/skills/authoring/tools/marketplace-lint.ts` | Validator script |

## Adding a skill

1. Confirm the skill directory exists and has a valid `SKILL.md` with frontmatter (`name`, `description`)
2. Find the matching plugin entry in marketplace.json by category or ask which plugin it belongs to
3. Add `"./<relative-path-to-skill>"` to the plugin's `skills` array, keeping it alphabetically sorted
4. Bump the patch or minor version in `metadata.version`
5. Validate: `bun run plugins/skill-creation/skills/authoring/tools/marketplace-lint.ts`

## Removing a skill

1. Remove the skill path from the plugin's `skills` array in marketplace.json
2. If the plugin has no remaining skills, remove the entire plugin entry
3. Bump the version — minor if backwards-compatible, major if consumers depended on it
4. Validate

## Adding a plugin

New plugin entry template:

```json
{
  "name": "<kebab-case-name>",
  "source": "./plugins/<plugin-name>",
  "description": "Skills for <what this plugin covers>",
  "category": "devtools",
  "skills": [],
  "strict": false
}
```

Insert alphabetically by `name` in the `plugins` array. Then add skills per "Adding a skill".

## Syncing from disk

Use `tools/sync-marketplace.ts` to regenerate the marketplace from what's actually on disk:

```bash
bun run .claude/skills/marketplace/tools/sync-marketplace.ts
```

This scans `plugins/*/skills/*/SKILL.md`, compares against marketplace.json, and reports:
- Skills on disk but missing from marketplace (orphans)
- Skills in marketplace but missing from disk (stale entries)

Use `--fix` to auto-update marketplace.json.

Always review the diff after syncing — it may add skills you didn't intend to publish or remove manual entries.

## Bumping version

The `metadata.version` field in marketplace.json uses semver:
- **Patch** (0.8.0 -> 0.8.1): bug fixes, wording tweaks
- **Minor** (0.8.0 -> 0.9.0): new skills, new plugins, backwards-compatible additions
- **Major** (0.8.0 -> 1.0.0): removed skills, renamed categories, breaking changes

## Validating

```bash
bun run plugins/skill-creation/skills/authoring/tools/marketplace-lint.ts
```

Options:
- `--fix` — auto-fix alphabetical ordering
- `--json` — JSON output for scripting

The linter checks: required fields, naming conventions, semver format, duplicate names, skill paths exist on disk, SKILL.md frontmatter validity, orphan detection, alphabetical ordering.

## Conventions

- All plugins use `category: "devtools"` and `strict: false`
- Plugin and skill names must be kebab-case, 1-64 characters
- Skill paths must start with `./` and not end with `/`
- Keep plugins and skills arrays sorted alphabetically
- Source is `"./plugins/<name>"` for local plugins (or `"./"` if skills are at the repo root)
