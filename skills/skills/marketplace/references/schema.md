# Marketplace & Plugin Schema

## marketplace.json

Lives at `.claude-plugin/marketplace.json` in a repo. Defines available plugins and their skills.

### Top-level fields

| Field | Required | Type | Description |
|---|---|---|---|
| `name` | Yes | string | Marketplace identifier (kebab-case) |
| `owner` | Yes | object | `{ name: string, url?: string, email?: string }` |
| `plugins` | Yes | array | Plugin definitions |
| `metadata` | No | object | Marketplace-level metadata |

### metadata fields

| Field | Type | Description |
|---|---|---|
| `metadata.description` | string | Marketplace description |
| `metadata.version` | string | Marketplace version (semver) |
| `metadata.homepage` | string | URL to homepage |
| `metadata.repository` | string | URL to source repository |
| `metadata.license` | string | License identifier |
| `metadata.pluginRoot` | string | Base directory prepended to relative source paths |

### Plugin entry fields

Required:

| Field | Type | Description |
|---|---|---|
| `name` | string | Plugin identifier (kebab-case) |
| `source` | string/object | Where to fetch the plugin |

Optional:

| Field | Type | Description |
|---|---|---|
| `description` | string | What the plugin does |
| `version` | string | Semver version |
| `category` | string | Category for organization |
| `skills` | array | Paths to skill directories |
| `strict` | boolean | If `false`, marketplace entry IS the full definition (no plugin.json needed). Default: `true`. |
| `commands` | string/array | Paths to command files |
| `agents` | string/array | Paths to agent files |
| `hooks` | string/object | Hook configurations |
| `mcpServers` | string/object | MCP server configurations |

### Source types

**Relative path:**
```json
{ "source": "./" }
```

**GitHub:**
```json
{ "source": "github", "repo": "owner/repo", "ref": "v2.0" }
```

**Git URL:**
```json
{ "source": "url", "url": "https://gitlab.com/team/plugin.git" }
```

**npm:**
```json
{ "source": "npm", "package": "pkg-name", "version": "1.0.0" }
```

## plugin.json

Lives at `.claude-plugin/plugin.json` in a plugin repo. Optional when marketplace uses `strict: false`.

| Field | Required | Type | Description |
|---|---|---|---|
| `name` | Yes | string | Unique identifier, becomes skill namespace |
| `version` | No | string | Semver version |
| `description` | No | string | What the plugin does |
| `skills` | No | array | Paths to skill directories |
| `commands` | No | array | Paths to command files |
| `agents` | No | array | Paths to agent files |
| `hooks` | No | object | Hook configurations |
| `mcpServers` | No | object | MCP server configurations |

## Skill discovery locations

| Scope | Location | Applies to |
|---|---|---|
| Personal | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<skill-name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<skill-name>/SKILL.md` | Where plugin is enabled |
| Enterprise | Managed settings | All org users |

Plugin skills use namespaced invocation: `plugin-name:skill-name`.

## External distribution

Skills can be distributed via the `npx skills` CLI:

```bash
npx skills add owner/repo          # install from GitHub
npx skills find "query"            # search available skills
npx skills list                    # list installed skills
```

Installed skills go to `~/.agents/skills/` with a lock file at `~/.agents/.skill-lock.json`.
