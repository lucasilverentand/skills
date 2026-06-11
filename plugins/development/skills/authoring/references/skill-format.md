# SKILL.md Format

## Frontmatter
`SKILL.md` uses YAML frontmatter between `---` fences. For skills that should work across Codex, Claude Code, and other Agent Skills clients, write the portable fields first and add product-specific fields only when the target client supports them.

## Compatibility matrix
|Surface|Minimum to author|Notes|
|---|---|---|
|Open Agent Skills spec|`name`, `description`, Markdown body|This is the portable baseline. Use it unless you are intentionally targeting one client.|
|Codex|`name`, `description`, Markdown body|Codex uses `name`, `description`, and path in the initial skill list. UI metadata and dependencies live in `agents/openai.yaml`, not SKILL.md frontmatter.|
|Claude Code|`description` is recommended; `name` can default from the directory|Keep `name` and `description` anyway for portability. Claude Code adds extra frontmatter fields listed below.|

### Portable fields
|Field|Required|Description|
|---|---|---|
|`name`|Yes|Lowercase letters, numbers, hyphens only. 1-64 chars. Must match the parent directory name for portable skills. No leading, trailing, or consecutive hyphens.|
|`description`|Yes|What the skill does and when to use it. Max 1024 chars. Put the trigger intent first because clients may truncate long skill lists.|
|`license`|No|License name or path to a bundled license file.|
|`compatibility`|No|Environment requirements. Max 500 chars. Use for things like intended client, required CLIs, network needs, or OS expectations.|
|`metadata`|No|Arbitrary key-value mapping. Clients may ignore it.|
|`allowed-tools`|No|Experimental in the open spec. Support and semantics vary by client, so do not rely on it as the only safety boundary.|

### Claude Code fields
These fields are Claude Code-specific. Other clients may ignore them or fail strict validation.

|Field|Default|Description|
|---|---|---|
|`when_to_use`|None|Additional trigger guidance appended to `description` in Claude Code's skill listing.|
|`argument-hint`|None|Hint shown in autocomplete. Example: `[issue-number]`.|
|`arguments`|None|Named positional arguments for `$name` substitution. Accepts a space-separated string or YAML list.|
|`disable-model-invocation`|`false`|Prevents Claude from automatically loading the skill. Users can still invoke it directly.|
|`user-invocable`|`true`|Hides the skill from the `/` menu when `false`; it does not block model invocation by itself.|
|`allowed-tools`|None|Pre-approves listed tools while the skill is active. In Claude Code this grants permission; it does not restrict every other tool.|
|`disallowed-tools`|None|Removes listed tools from Claude's available pool while the skill is active.|
|`model`|Inherit session|Model override for the current turn, or `inherit`.|
|`effort`|Inherit session|Reasoning effort. Values include `low`, `medium`, `high`, `xhigh`, and `max`; availability depends on the model.|
|`context`|Inline|Set to `fork` to run the skill in a forked subagent context.|
|`agent`|`general-purpose`|Subagent type when `context: fork` is set.|
|`hooks`|None|Hooks scoped to the skill lifecycle.|
|`paths`|None|Glob patterns that limit automatic activation to matching files.|
|`shell`|`bash`|Shell used for Claude Code dynamic context injection.|

`skills` is a subagent frontmatter field, not a normal `SKILL.md` field. Use it when defining a custom subagent that preloads skills; do not add it to a portable skill unless the target client documents support.

### Codex metadata
Codex app UI metadata and dependency declarations live in `agents/openai.yaml`:

```yaml
interface:
  display_name: "Short human name"
  short_description: "Human-facing summary"
  default_prompt: "Optional prompt to start with this skill"
policy:
  allow_implicit_invocation: false
dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
```

Only add `agents/openai.yaml` when the skill benefits from UI metadata, explicit invocation policy, or tool dependencies. Keep it in sync with `SKILL.md` whenever the skill's purpose changes.

### Example portable frontmatter
```yaml
---
name: data-reports
description: Use this skill when the user needs to analyze tabular exports, summarize metrics, or generate a report from CSV, TSV, or spreadsheet-like data.
---
```

### Example Claude Code task frontmatter
```yaml
---
name: deploy
description: Deploy the application after tests pass.
disable-model-invocation: true
context: fork
allowed-tools: Bash(npm test *) Bash(npm run build *) Bash(git status *)
---
```

## Naming rules
- Lowercase alphanumeric + hyphens only
- 1-64 characters
- No leading, trailing, or consecutive hyphens
- Directory name must match the `name` field for portable skills
- Avoid vague names (`helper`, `utils`, `api`) and reserved prefixes (`anthropic-*`, `claude-*`)

### Naming convention
Names are short and direct. The owning plugin or folder provides context, so the skill name should not repeat it.

|Pattern|When to use|Examples|
|---|---|---|
|`<gerund>`|Pure activity skills|`committing`, `debugging`, `testing`, `writing`|
|`<noun>`|Domain or concern|`conflicts`, `errors`, `performance`, `database`|
|`<platform>`|Platform/tool-specific skills|`cloudflare`, `docker`, `discord`|

Rules:

- Drop redundancy with the parent category: `security/audit`, not `security/auditing-security`.
- Be specific: `scaffolding`, not `parts`; `knowledge`, not `info`.
- Use gerunds only when the skill is truly an activity (`debugging`, `testing`), not when the category already implies the verb.

## Invocation and substitutions
|Variable|Description|
|---|---|
|`$ARGUMENTS`|All arguments passed when invoking. Claude Code supports this in skills.|
|`$ARGUMENTS[N]` or `$N`|Specific argument by 0-based index in Claude Code.|
|`${CLAUDE_SESSION_ID}`|Claude Code session ID. Claude-specific.|
|`${CLAUDE_SKILL_DIR}`|Directory containing the SKILL.md file in Claude Code. Claude-specific.|

Claude Code also supports dynamic context injection with `` !`command` `` and ````!` fenced blocks. Treat that as Claude-specific preprocessing: Codex and the open spec do not use it as portable syntax.

## Permission control
Permission controls are client-specific:

|Client|Control surface|
|---|---|
|Codex|Codex configuration, plugin policy, host approvals, and optional `agents/openai.yaml` invocation policy.|
|Claude Code|`allowed-tools`, `disallowed-tools`, `disable-model-invocation`, `user-invocable`, permission rules, and skill overrides.|

Do not describe `allowed-tools` as a universal sandbox. In Claude Code it grants pre-approval for listed tools while the skill is active; permission settings still govern other tools.
