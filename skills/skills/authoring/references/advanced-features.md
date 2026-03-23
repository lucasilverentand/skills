# Advanced Features

Official Claude Code skill features beyond the core format and structure.

## Extended thinking

Include the word "ultrathink" anywhere in your SKILL.md content to enable extended thinking mode when the skill is active. This is a trigger word recognized by Claude Code, not a frontmatter field.

## Legacy command compatibility

`.claude/commands/*.md` files are treated as skills. Both `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` create the `/deploy` command and work identically. Existing command files keep working. If a skill and a legacy command share the same name, the skill takes precedence.

## Bundled skills

Claude Code ships with built-in skills that are always available:

| Skill | Purpose |
|---|---|
| `/batch <instruction>` | Orchestrate large-scale parallel changes across a codebase using git worktrees |
| `/claude-api` | Load Claude API reference material for your project's language |
| `/debug [description]` | Troubleshoot your current Claude Code session |
| `/loop [interval] <prompt>` | Run a prompt repeatedly on an interval |
| `/simplify [focus]` | Review recently changed files for code reuse, quality, and efficiency |

## Preloading skills into subagents

Subagents can preload skills via the `skills` field in their frontmatter. The full skill content is injected into the subagent's context at startup — not just made available for invocation.

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---
```

Subagents don't inherit skills from the parent conversation. Only explicitly listed skills are available.

## Hooks in skills

The `hooks` frontmatter field scopes hooks to a skill's lifecycle. Hooks are registered when the skill becomes active and automatically cleaned up when it finishes. All hook events are supported with the same format as settings-based hooks.

```yaml
---
name: secure-ops
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "${CLAUDE_SKILL_DIR}/scripts/security-check.sh"
---
```

Four handler types: `command`, `http`, `prompt`, `agent`. Paths can use `$CLAUDE_PROJECT_DIR` and `${CLAUDE_SKILL_DIR}`.
