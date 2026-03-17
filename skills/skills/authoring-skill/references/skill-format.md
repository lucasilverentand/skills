# SKILL.md Format

## Frontmatter

SKILL.md uses YAML frontmatter between `---` fences. Only `name` and `description` are needed for most skills.

### Standard fields (Agent Skills spec)

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Lowercase letters, numbers, hyphens only. 1-64 chars. Must match parent directory name. No leading/trailing/consecutive hyphens. |
| `description` | Yes | What the skill does AND when to use it. Max 1024 chars. Written in third person. |
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
- Avoid: vague names (`helper`, `utils`, `api`), reserved prefixes (`anthropic-*`, `claude-*`)

### Naming convention

Names are **activity-first** (gerund form) and use **singular nouns**.

| Pattern | When to use | Examples |
|---|---|---|
| `<gerund>` | Pure activity skills | `committing`, `debugging`, `testing`, `writing` |
| `<gerund>-<singular-noun>` | Activity on a specific domain | `resolving-conflict`, `handling-error`, `optimizing-performance` |
| `<gerund>-<platform>` | Platform/tool-specific skills | `deploying-cloudflare`, `managing-docker`, `messaging-discord` |

**Rules:**
- Always lead with a gerund (verb-ing): `auditing-accessibility`, not `accessibility`
- Use singular nouns: `managing-secret`, not `managing-secrets`
- Be specific: `scaffolding`, not `parts`; `gathering-knowledge`, not `knowledge`
- For platform skills, the verb describes what you do _with_ the platform: `deploying-kubernetes`, not just `kubernetes`

## String substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed when invoking. |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index. |
| `${CLAUDE_SESSION_ID}` | Current session ID. |

## Dynamic context injection

The `` !`command` `` syntax runs shell commands and injects output before the skill content reaches Claude:

```markdown
## Current context
- Branch: !`git branch --show-current`
- Status: !`git status --short`
```
