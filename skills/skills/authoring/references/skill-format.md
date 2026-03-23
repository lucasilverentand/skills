# SKILL.md Format

## Frontmatter

SKILL.md uses YAML frontmatter between `---` fences. Most skills only need `description`.

### Standard fields (Agent Skills spec)

| Field | Required | Description |
|---|---|---|
| `name` | No | Lowercase letters, numbers, hyphens only. 1-64 chars. Must match parent directory name. No leading/trailing/consecutive hyphens. Defaults to parent directory name if omitted. |
| `description` | Recommended | What the skill does AND when to use it. Max 1024 chars. Written in third person. Falls back to the first paragraph of the markdown body if omitted. |
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
| `effort` | — | Thinking effort level: `low`, `medium`, `high`, or `max`. Opus 4.6 only. Overrides session effort level. |
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
- Directory name must match the `name` field (when specified)
- Avoid: vague names (`helper`, `utils`, `api`), reserved prefixes (`anthropic-*`, `claude-*`)

### Naming convention

Names are **short and direct** — the category provides context, so the skill name should not repeat it.

| Pattern | When to use | Examples |
|---|---|---|
| `<gerund>` | Pure activity skills | `committing`, `debugging`, `testing`, `writing` |
| `<noun>` | Domain or concern | `conflicts`, `errors`, `performance`, `database` |
| `<platform>` | Platform/tool-specific skills | `cloudflare`, `docker`, `discord` |

**Rules:**
- Drop redundancy with the parent category: `security/audit`, not `security/auditing-security`
- Be specific: `scaffolding`, not `parts`; `knowledge`, not `info`
- Use gerunds only when the skill is truly an activity (`debugging`, `testing`), not when the category already implies the verb

## String substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed when invoking. |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index. |
| `${CLAUDE_SESSION_ID}` | Current session ID. |
| `${CLAUDE_SKILL_DIR}` | Directory containing the SKILL.md file. |

## Dynamic context injection

The `` !`command` `` syntax runs shell commands and injects output before the skill content reaches Claude:

```markdown
## Current context
- Branch: !`git branch --show-current`
- Status: !`git status --short`
```

## Permission control

Three ways to restrict skill access:

| Method | Effect |
|---|---|
| Deny `Skill` tool in `/permissions` | Blocks all skill loading |
| `Skill(commit)` | Allow/deny a specific skill by exact name |
| `Skill(deploy *)` | Allow/deny skills by prefix match |
| `disable-model-invocation: true` | Per-skill opt-out from auto-loading (user can still invoke via `/name`) |
