---
name: {skill-name}
description: Configures {tool} settings safely. Use when changing {tool} options, updating configuration, or setting up {tool}.
argument-hint: [setting] [value]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Bash
---

# {Skill Title}

Manages {tool} configuration with validation.

## Your Task

1. Find config file (check standard locations below)
2. Read current configuration
3. Apply changes from $ARGUMENTS
4. Validate: `{validation-command}`
5. If invalid, fix and re-validate

## Config Locations

| Location | Priority |
|----------|----------|
| `./{config-file}` | Project-level |
| `~/.config/{tool}/{config-file}` | User-level |

## Examples

### Change Setting

```
User: /{skill-name} theme dark
→ Finds config, updates theme, validates, confirms
```

## Error Handling

| Issue | Response |
|-------|----------|
| Config not found | Create with sensible defaults |
| Invalid syntax | Show error location, suggest fix |
| Unknown setting | List similar settings |
