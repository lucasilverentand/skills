# SKILL.md Format

## Frontmatter

SKILL.md uses YAML frontmatter between `---` fences. Only `name` and `description` are needed for most skills.

### Standard fields (Agent Skills spec)

| Field | Required | Description |
|---|---|---|
| `name` | No | Lowercase letters, numbers, hyphens only. 1-64 chars. Should match parent directory name. No leading/trailing/consecutive hyphens. If omitted, defaults to the directory name. |
| `description` | Recommended | What the skill does AND when to use it. Max 1024 chars. Claude uses this to decide when to apply the skill. If omitted, uses the first paragraph of markdown content. |
| `license` | No | License name or path to bundled license file. |
| `compatibility` | No | Environment requirements. Max 500 chars. |
| `metadata` | No | Arbitrary key-value pairs. |
| `allowed-tools` | No | Space-delimited list of pre-approved tools. |

### Claude Code extensions

These fields only work in Claude Code, not in other agents.

| Field | Default | Description |
|---|---|---|
| `argument-hint` | — | Hint shown in autocomplete. Example: `[issue-number]` |
| `disable-model-invocation` | `false` | Set `true` to prevent Claude from auto-loading. User-only via `/name`. |
| `user-invocable` | `true` | Set `false` to hide from `/` menu. Background knowledge only. |
| `model` | — | Override model when skill is active. |
| `context` | — | Set to `fork` to run in a forked subagent context. |
| `agent` | — | Subagent type when `context: fork` is set (`Explore`, `Plan`, `general-purpose`, or custom). |
| `hooks` | — | Hooks scoped to this skill's lifecycle. |

### Invocation control

| Configuration | User can invoke | Claude can invoke |
|---|---|---|
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

### Example frontmatter

```yaml
---
name: my-skill
description: Processes data exports and generates summary reports. Use when the user asks to analyze CSV files, generate reports, or summarize data.
allowed-tools: Read Grep Glob Bash
---
```

## Naming rules

- Lowercase alphanumeric + hyphens only
- 1-64 characters
- No leading, trailing, or consecutive hyphens
- Directory name must match the `name` field
- Use gerund form: `processing-pdfs`, `managing-databases`
- Avoid: vague names (`helper`, `utils`), reserved prefixes (`anthropic-*`, `claude-*`)

## String substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed when invoking. If not present in content, arguments are appended as `ARGUMENTS: <value>`. |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index. |
| `${CLAUDE_SESSION_ID}` | Current session ID. Useful for logging or creating session-specific files. |
| `${CLAUDE_SKILL_DIR}` | Directory containing the skill's SKILL.md. For plugin skills, this is the skill's subdirectory within the plugin, not the plugin root. Use to reference bundled scripts/files regardless of working directory. |

## Dynamic context injection

The `` !`command` `` syntax runs shell commands and injects output before the skill content reaches Claude:

```markdown
## Current context
- Branch: !`git branch --show-current`
- Status: !`git status --short`
```
