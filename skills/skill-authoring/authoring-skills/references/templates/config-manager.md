---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Edit
  - Glob
---

# {Title}

Manages {config type} configuration.

## Your Task

1. Locate config file (check common paths)
2. Parse current configuration
3. Apply requested changes
4. Validate result
5. Report what changed

## Config Locations

Check in order:
1. Project root ({filename})
2. User config (~/.{filename})
3. Create if not found (ask first)

## Example

```
User: {example request}
Action: Update {key} in {file}
Output: Changed {key}: {old} → {new}
```

## Error Handling

| Error | Response |
|-------|----------|
| Config not found | Offer to create with defaults |
| Parse error | Show location, suggest fix |
| Invalid value | Explain valid options |
