# Marketplace & Plugin Schema
This repository has plugin-owned skills and two generated marketplace surfaces.

## Source of truth
|Path|Purpose|
|---|---|
|`plugins/<name>/skills/<skill-name>/SKILL.md`|Open Agent Skills source owned by one plugin|
|`plugin-groups.json`|Marketplace metadata and plugin skill ownership|
|`scripts/marketplace.ts`|Generator and validator for plugin manifests and marketplaces|

Edit skills in place under their owning plugin. Do not create root-level skill copies.

## Generated surfaces
|Consumer|Generated path|Notes|
|---|---|---|
|Codex marketplace|`.agents/plugins/marketplace.json`|Repo-scoped Codex plugin catalog|
|Codex plugin manifest|`plugins/<name>/.codex-plugin/plugin.json`|Required Codex plugin entry point|
|Claude marketplace|`.claude-plugin/marketplace.json`|Claude Code plugin catalog|
|Claude plugin manifest|`plugins/<name>/.claude-plugin/plugin.json`|Claude Code plugin entry point|
|Plugin README|`plugins/<name>/README.md`|Generated install notes for that plugin|

Codex can also read `.claude-plugin/marketplace.json` as a legacy-compatible marketplace, but this repo generates the Codex-native `.agents/plugins/marketplace.json` so install behavior is explicit.

## `plugin-groups.json`
Top-level fields:

|Field|Required|Description|
|---|---|---|
|`name`|Yes|Marketplace identifier, kebab-case|
|`owner`|Yes|Maintainer metadata|
|`metadata.version`|Yes|Shared semver for generated marketplaces and plugin manifests|
|`metadata.homepage`|No|Homepage URL|
|`metadata.repository`|No|Repository URL|
|`metadata.license`|No|SPDX license identifier|
|`plugins`|Yes|Plugin group definitions|

Plugin group fields:

|Field|Required|Description|
|---|---|---|
|`name`|Yes|Plugin identifier and namespace|
|`displayName`|Yes|Codex install-surface display name|
|`description`|Yes|Long plugin description|
|`shortDescription`|Yes|Codex short display copy|
|`category`|Yes|Install-surface category|
|`skills`|Yes|Skill directory names owned by this plugin under `plugins/<name>/skills/`|
|`commands`|No|Claude-only legacy command shims under `plugins/<name>/commands/*.md`|
|`author`|Yes|Plugin author metadata|
|`keywords`|No|Discovery tags|

A skill belongs to exactly one plugin. For cross-plugin workflows, reference companion skills by name instead of copying their files into another plugin.

## Codex marketplace shape
Generated at `.agents/plugins/marketplace.json`:

```json
{
  "name": "skills-of-luca",
  "interface": {
    "displayName": "Skills of Luca"
  },
  "plugins": [
    {
      "name": "git",
      "source": {
        "source": "local",
        "path": "./plugins/git"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Development"
    }
  ]
}
```

Codex resolves `source.path` relative to the marketplace root. For a repo marketplace, keep plugin paths inside the repo and start them with `./`.

## Codex plugin shape
Generated at `plugins/<name>/.codex-plugin/plugin.json`:

```json
{
  "name": "git",
  "version": "1.1.0",
  "description": "Git workflow toolkit",
  "skills": "./skills/",
  "interface": {
    "displayName": "Git",
    "shortDescription": "Git workflow automation",
    "category": "Development"
  }
}
```

Codex plugin manifests use `.codex-plugin/plugin.json`; only the manifest belongs in `.codex-plugin/`. Skills stay at the plugin root under `skills/`.

## Claude marketplace shape
Generated at `.claude-plugin/marketplace.json`:

```json
{
  "name": "skills-of-luca",
  "owner": {
    "name": "Luca Silverentand"
  },
  "plugins": [
    {
      "name": "git",
      "source": "./plugins/git",
      "description": "Git workflow toolkit",
      "version": "1.1.0"
    }
  ]
}
```

Relative plugin sources resolve from the repository root containing `.claude-plugin/`.

## Claude plugin shape
Generated at `plugins/<name>/.claude-plugin/plugin.json`:

```json
{
  "name": "git",
  "description": "Git workflow toolkit",
  "version": "1.1.0",
  "skills": ["./skills/creating-commits"],
  "commands": ["./commands/create-commit.md"]
}
```

Commands are included only in Claude plugin manifests. New portable workflows should be authored as skills.

## Direct skill installation
Direct skill consumers can install from the plugin-owned skill tree:

```bash
bun run install:codex-skills -- creating-commits creating-prs
bun run install:claude-skills -- creating-commits creating-prs
```

Without skill names, the installer targets every plugin-owned skill. Add `--symlink` for local development and `--force` to replace an existing installed skill.
