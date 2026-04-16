# Marketplace & Plugin Schema

## Where skills are discovered
|Scope|Location|Applies to|
|---|---|---|
|Personal|`~/.claude/skills/<skill-name>/SKILL.md`|All your projects|
|Project|`.claude/skills/<skill-name>/SKILL.md`|This project only|
|Plugin|`<plugin>/skills/<skill-name>/SKILL.md`|Where plugin is enabled|
|Enterprise|Managed settings|All org users|

Plugin skills use namespaced invocation: `plugin-name:skill-name`.

## marketplace.json
Lives at `.claude-plugin/marketplace.json` in a repo. Defines available plugins and their skills.

### Top-level fields
|Field|Required|Type|Description|
|---|---|---|---|
|`name`|Yes|string|Marketplace identifier (kebab-case)|
|`owner`|Yes|object|`{ name: string, url?: string, email?: string }`|
|`plugins`|Yes|array|Plugin definitions|
|`metadata`|No|object|Marketplace-level metadata|

### metadata fields
|Field|Type|Description|
|---|---|---|
|`metadata.description`|string|Marketplace description|
|`metadata.version`|string|Marketplace version (semver)|
|`metadata.homepage`|string|URL to homepage|
|`metadata.repository`|string|URL to source repository|
|`metadata.license`|string|License identifier|
|`metadata.pluginRoot`|string|Base directory prepended to relative source paths|

### Plugin entry fields
Required:

|Field|Type|Description|
|---|---|---|
|`name`|string|Plugin identifier (kebab-case)|
|`source`|string/object|Where to fetch the plugin|

Optional:

|Field|Type|Description|
|---|---|---|
|`description`|string|What the plugin does|
|`version`|string|Semver version|
|`category`|string|Category for organization|
|`skills`|array|Paths to skill directories|
|`strict`|boolean|If `false`, marketplace entry IS the full definition (no plugin.json needed). Default: `true`.|
|`commands`|string/array|Paths to command files|
|`agents`|string/array|Paths to agent files|
|`hooks`|string/object|Hook configurations|
|`mcpServers`|string/object|MCP server configurations|
|`keywords`|array|String tags for search and discovery|
|`homepage`|string|URL to plugin homepage|
|`repository`|string|URL to source repository|

New plugin entry template:

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

### Source types
The plugin `source` field is either a string (for relative paths) or an object (for remote sources). These examples show the value of the `source` field in a plugin entry.

**Relative path** (string):

```json
"source": "./"
```

**GitHub** (object — `source` inside the object identifies the type):

```json
"source": { "source": "github", "repo": "owner/repo", "ref": "v2.0" }
```

**Git URL:**

```json
"source": { "source": "url", "url": "https://gitlab.com/team/plugin.git" }
```

**Git subdirectory:**

```json
"source": { "source": "git-subdir", "url": "https://github.com/org/monorepo.git", "path": "plugins/my-plugin" }
```

**npm:**

```json
"source": { "source": "npm", "package": "pkg-name", "version": "1.0.0" }
```

### Bundles
Optional top-level `bundles` array groups plugins into installable collections.

|Field|Required|Type|Description|
|---|---|---|---|
|`name`|Yes|string|Bundle identifier (kebab-case, must not collide with plugin names)|
|`description`|Yes|string|What the bundle provides|
|`plugins`|Yes|array|Plugin names to include, or `["*"]` for all|

```json
{
  "bundles": [
    {
      "name": "full-stack",
      "description": "All development skills",
      "plugins": ["git", "github", "frontend"]
    }
  ]
}
```

Using `"*"` as the only element includes all plugins. It cannot be mixed with specific names.

## plugin.json
Lives at `.claude-plugin/plugin.json` in a plugin repo. Optional when marketplace uses `strict: false`.

|Field|Required|Type|Description|
|---|---|---|---|
|`name`|Yes|string|Unique identifier, becomes skill namespace|
|`version`|No|string|Semver version|
|`description`|No|string|What the plugin does|
|`skills`|No|array|Paths to skill directories|
|`commands`|No|array|Paths to command files|
|`agents`|No|array|Paths to agent files|
|`hooks`|No|object|Hook configurations|
|`mcpServers`|No|object|MCP server configurations|

## External distribution
Skills can be distributed via the `npx skills` CLI:

```bash
npx skills add owner/repo          # install from GitHub
npx skills find "query"            # search available skills
npx skills list                    # list installed skills
```

Installed skills go to `~/.agents/skills/` with a lock file at `~/.agents/.skill-lock.json`.
