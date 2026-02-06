---
name: managing-marketplace
description: Validates and manages Claude Code plugin marketplace repositories. Checks marketplace.json integrity, verifies skill paths exist, finds orphan skills, validates SKILL.md frontmatter, and generates health reports. Use when checking marketplace health, syncing marketplace.json, adding plugins, or running marketplace CI validation.
argument-hint: [validate|sync|add-plugin|report]
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Marketplace Management

Validates and manages Claude Code plugin marketplace repositories.

## Your Task

Determine action from $ARGUMENTS or context:

| Intent | Action |
|--------|--------|
| "validate", "check", "verify" | Run full validation suite |
| "sync" | Update marketplace.json to match disk |
| "add plugin", "register" | Add new plugin/skill entries |
| "report", "health" | Generate marketplace health report |

Default: validate (if no argument given).

## Progress Checklist

- [ ] Determine action
- [ ] Locate marketplace.json
- [ ] Execute action
- [ ] Report results
- [ ] Suggest fixes

---

## Validate

Run the verification script against the marketplace:

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/skills/tooling/managing-marketplace/scripts/verify-marketplace.py .claude-plugin/marketplace.json
```

If the script is not available, perform manual validation using the rules below.

### Validation Rules

| Rule | Severity | Auto-fix |
|------|----------|----------|
| marketplace.json is valid JSON | Error | No |
| Required fields present (name, plugins) | Error | No |
| All skill paths resolve to SKILL.md | Error | Yes (remove) |
| No orphan skills on disk | Warning | Yes (add) |
| Plugin names are unique | Error | No |
| Skill names match directory (or parent-dir pattern) | Warning | No |
| SKILL.md has valid YAML frontmatter | Error | No |
| Name follows conventions (gerund, lowercase-hyphens, <=64 chars) | Warning | No |
| Description is third-person with "Use when" trigger | Warning | No |
| Description <= 1024 chars | Error | No |
| No duplicate skill paths across plugins | Error | No |
| SKILL.md under 500 lines | Warning | No |
| Plugin has description and category | Warning | No |

### Manual Validation Steps

1. Read `.claude-plugin/marketplace.json`
2. For each plugin, check each skill path:
   - Does `{skill_path}/SKILL.md` exist?
   - Parse frontmatter: name, description, allowed-tools
   - Name: lowercase-hyphens, gerund-first, <=64 chars, matches directory
   - Description: third-person, has "Use when", <=1024 chars
3. Glob for `skills/**/SKILL.md` and compare against registered paths
4. Report using output format below

---

## Sync

Update marketplace.json to match what's on disk:

1. Run validation to identify missing skills and orphans
2. Remove entries for skills that don't exist on disk
3. Remove plugins that have no remaining skills
4. For orphan skills, determine the appropriate plugin:
   - Match by category directory (e.g., `skills/git/*` → git plugin)
   - If no plugin matches, create a new plugin entry
5. Write updated marketplace.json
6. Re-validate to confirm sync

---

## Add Plugin

Register a new plugin or skill in marketplace.json:

1. Read current marketplace.json
2. Verify the skill path exists and has a valid SKILL.md
3. If adding to existing plugin: append to its skills array
4. If creating new plugin:

   ```json
   {
     "name": "{plugin-name}",
     "source": "./",
     "description": "{description}",
     "category": "{category}",
     "skills": ["./{skill-path}"],
     "strict": false
   }
   ```

5. Validate no duplicate names or paths
6. Write updated marketplace.json
7. Run validation

---

## Report

Generate a health report:

1. Run full validation
2. Summarize:
   - Total plugins and skills
   - Missing skills count
   - Orphan skills count
   - Errors and warnings
   - Per-plugin breakdown
3. Highlight actionable items

---

## Output Format

```
## Marketplace Validation Report

Status: {PASS/FAIL}

### Errors ({count})
- [{rule}] {path} - {message}
  Fix: {suggestion}

### Warnings ({count})
- [{rule}] {path} - {message}

### Summary
- Plugins checked: {n}
- Skills checked: {n}
- Skills missing: {n}
- Orphans found: {n}
- Errors: {n}
- Warnings: {n}
```

## Example

```
User: /managing-marketplace validate

Ran verification against .claude-plugin/marketplace.json...

## Marketplace Validation Report

Status: FAIL

### Errors (3)
- [missing-skill] ./skills/devenv/search - Skill path does not exist
  Fix: Remove from plugin 'devenv' or create skills/devenv/search/SKILL.md
- [missing-skill] ./skills/devenv/init - Skill path does not exist
- [missing-skill] ./skills/devenv/config - Skill path does not exist

### Warnings (2)
- [orphan-skill] skills/git/commit-conventions - Not in marketplace.json
  Fix: Add './skills/git/commit-conventions' to a plugin
- [non-gerund-name] skills/neovim/config - First word 'config' is not gerund form

### Summary
- Plugins checked: 14
- Skills checked: 45
- Skills missing: 3
- Orphans found: 2
- Errors: 3
- Warnings: 2
```

## Error Handling

| Error | Response |
|-------|----------|
| marketplace.json not found | Search for it in .claude-plugin/, show expected path |
| Invalid JSON | Show parse error, suggest manual fix |
| Permission denied | Report, suggest checking file permissions |
| Script not available | Fall back to manual validation using rules above |

## Scripts

- **Full verification**: `scripts/verify-marketplace.py [--json] [--fix] [path]`
- **Single skill check**: `scripts/verify-skill.sh <skill-directory>`
