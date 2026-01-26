---
name: example
description: An example skill showing the SKILL.md format. Use this as a template for creating new skills.
disable-model-invocation: true
---

# Example Skill

This is a template showing how to create skills.

## Frontmatter Options

```yaml
---
name: skill-name                    # Display name (defaults to directory name)
description: What this does         # When Claude should use it (important!)
argument-hint: [args]               # Shown in autocomplete
disable-model-invocation: true      # Only manual invocation via /skill-name
user-invocable: false               # Hide from / menu (background knowledge)
allowed-tools: Read, Grep           # Restrict available tools
context: fork                       # Run in isolated subagent
agent: Explore                      # Which agent to use with fork
---
```

## Content

The markdown content below the frontmatter is the prompt Claude follows.

Use `$ARGUMENTS` to reference user input:
- `/example foo bar` → $ARGUMENTS = "foo bar"

## Dynamic Context

Inject shell command output with backticks and !:
- Current branch: !`git branch --show-current`
- PR diff: !`gh pr diff`
