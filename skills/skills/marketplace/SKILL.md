---
name: marketplace
description: Manages the skills marketplace — validates marketplace.json integrity, publishes and updates skills, enforces naming and category conventions, manages semver versioning, and generates the marketplace catalog. Use when adding a skill to the marketplace, updating a published skill, validating marketplace.json, or regenerating the catalog.
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
  - **Validating marketplace.json** → run `tools/marketplace-lint.ts`, fix any errors per "Fixing validation errors" below
  - **Generating marketplace.json from disk** → run `bun run scripts/generate-marketplace.ts` from the repo root
  - **Adding a skill path to an existing plugin** → which plugin category?
    - **Skill category matches an existing plugin** → add the path to that plugin's `skills` array
    - **Skill category is new** → create a new plugin entry, then add the skill path
  - **Fixing a validation error** → see "Fixing validation errors" below
  - **Checking if a skill is published** → search marketplace.json for the skill path in any plugin's `skills` array

## Publishing a skill

1. Ensure the skill directory has a valid `SKILL.md` with correct frontmatter (`name`, `description`)
2. Ensure `PURPOSE.md` exists with responsibilities and tools listed
3. Run the authoring skill's validator: `bun run skills/skills/authoring/tools/skill-validate.ts <path>` to confirm structure is valid
4. Add the skill path to `.claude-plugin/marketplace.json`:
   - Find the plugin entry matching the skill's category directory
   - Add `"./skills/<category>/<skill-name>"` to the plugin's `skills` array
   - If no matching plugin exists, create a new plugin entry (see "Plugin entry format" below)
5. Run `tools/marketplace-lint.ts` to validate
6. Fix any errors before committing

For bulk additions, run `bun run scripts/generate-marketplace.ts` to regenerate the entire marketplace.json from all SKILL.md files on disk.

## Conventions

### marketplace.json structure

The file lives at `.claude-plugin/marketplace.json` in the repo root.

```json
{
  "name": "marketplace-name",
  "owner": { "name": "Owner Name", "url": "https://..." },
  "metadata": {
    "description": "...",
    "version": "0.2.0",
    "homepage": "https://...",
    "repository": "https://...",
    "license": "MIT"
  },
  "plugins": [
    {
      "name": "category-name",
      "source": "./",
      "description": "Human-readable description of the plugin",
      "category": "devtools",
      "skills": ["./skills/category/skill-one", "./skills/category/skill-two"],
      "strict": false
    }
  ]
}
```

### Required fields

| Scope | Field | Description |
|---|---|---|
| Top-level | `name` | Marketplace identifier (kebab-case) |
| Top-level | `owner` | `{ name: string, url?: string, email?: string }` |
| Top-level | `plugins` | Array of plugin definitions |
| Plugin | `name` | Plugin identifier (kebab-case), matches the category directory |
| Plugin | `source` | Where to fetch the plugin — `"./"` for local |

### Plugin entry format

When creating a new plugin entry:

```json
{
  "name": "<category-directory-name>",
  "source": "./",
  "description": "Skills for <what this category covers>",
  "category": "<marketplace-category>",
  "skills": ["./skills/<category>/<skill-name>"],
  "strict": false
}
```

### Plugin categories

This repo uses the following category mapping:

| Category directory | Marketplace category |
|---|---|
| communication, data, deployment, development, documentation, git, infrastructure, research, security, skills | `devtools` |
| editors | `editor` |
| project | `web-development` |

### Source types

- **Relative path**: `"./"` for same-repo plugins
- **GitHub**: `{ "source": "github", "repo": "owner/repo", "ref": "v2.0" }`
- **Git URL**: `{ "source": "url", "url": "https://gitlab.com/team/plugin.git" }`
- **npm**: `{ "source": "npm", "package": "pkg-name", "version": "..." }`

### Naming rules

- Skill names: lowercase alphanumeric + hyphens, 1-64 characters, no leading/trailing/consecutive hyphens
- Plugin names: same rules, typically match the top-level category directory name
- Descriptions: max 1024 characters, third person, specific about what the skill does

### Versioning

- `metadata.version` in marketplace.json tracks the overall marketplace version
- Individual skills do not carry separate versions — the marketplace version covers all
- Use semver: `MAJOR.MINOR.PATCH`
  - **patch** — bug fixes, wording improvements, no behavior change
  - **minor** — new skills, new tools, backwards-compatible additions
  - **major** — breaking changes, removed skills, restructured categories

### `strict: false` mode

When a plugin entry has `strict: false`, the marketplace entry IS the full definition — no separate `plugin.json` file is needed. This repo uses `strict: false` for all plugins since everything is co-located.

## Fixing validation errors

| Error | Fix |
|---|---|
| `name mismatch` | Directory name, SKILL.md `name` field, and marketplace.json path must all match |
| `invalid-name` | Must be kebab-case: lowercase alphanumeric + hyphens |
| `invalid category` | Use only categories from the mapping above |
| `invalid-version` | Must be valid semver: `X.Y.Z` |
| `missing-required-field` | Add the missing `name`, `source`, or other required field |
| `duplicate-name` | Each plugin name must be unique across the marketplace |
| `source-not-found` | The path in `skills` array must point to an existing directory with a SKILL.md |
| `missing-skill-md` | The skill directory exists but has no SKILL.md — create one |
| `invalid-json` | Fix JSON syntax errors in marketplace.json |

## Key references

| File | What it covers |
|---|---|
| `references/schema.md` | Full marketplace.json and plugin.json schema documentation |
| `tools/marketplace-lint.ts` | Validate marketplace.json against schema and check skill paths |
| `scripts/generate-marketplace.ts` | Regenerate entire marketplace.json from SKILL.md files on disk |
| `scripts/validate-metadata.ts` | Validate plugin.json and marketplace.json structural integrity |
