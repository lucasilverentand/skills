---
name: {skill-name}
description: Generates {artifact} with {framework} conventions. Use when creating, scaffolding, or adding {artifact} to projects.
argument-hint: [name] [options]
allowed-tools:
  - Read
  - Write
  - Glob
  - Bash
---

# {Skill Title}

Creates {artifact} following best practices.

## Your Task

1. Check existing project structure
2. Gather requirements from $ARGUMENTS (ask if critical info missing)
3. Generate files using template below
4. Validate syntax: `{validation-command}`
5. If errors, fix and re-validate until passing

## Template

```{language}
// Generated {artifact}
{template code with placeholders}
```

## Examples

### Basic Generation

```
User: /{skill-name} my-component
→ Creates component with default options
→ Validates syntax
→ Reports what was created
```

## Error Handling

| Issue | Response |
|-------|----------|
| Already exists | Ask: replace, rename, or cancel? |
| Validation fails | Fix errors, re-validate |
| Missing dependencies | Show installation command |
