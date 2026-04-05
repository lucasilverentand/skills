# Marketplace Validation Errors

## Errors (block commit)

| Code | Fix |
|---|---|
| `invalid-json` | Fix JSON syntax errors in marketplace.json |
| `missing-required-field` | Add the missing field — applies to top-level, plugin, bundle, and source object fields |
| `invalid-type` | Field has wrong type — check schema for expected type (string, object, boolean, array) |
| `invalid-name` | Must be kebab-case: lowercase alphanumeric + hyphens, 1-64 chars |
| `reserved-name` | Marketplace name is reserved (e.g. `anthropic-marketplace`, `claude-code-plugins`) |
| `invalid-version` | Must be valid semver: `X.Y.Z` |
| `invalid-category` | Must be one of: `devtools` |
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

## Warnings (non-blocking)

| Code | Fix |
|---|---|
| `unsorted` | Plugins or skills not in alphabetical order — run with `--fix` to auto-sort |
| `orphan-skill` | Skill exists on disk but isn't registered in any plugin |
| `empty-skill-body` | SKILL.md has frontmatter but no content body |
| `unknown-tool` | SKILL.md `allowed-tools` references an unrecognized tool name |
| `description-too-long` | SKILL.md frontmatter description exceeds 1024 characters |
| `invalid-url` | A URL field (homepage, repository) isn't a valid URL |
| `name-collision` | Bundle name collides with a plugin name |
