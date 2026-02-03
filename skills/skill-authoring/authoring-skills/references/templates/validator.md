---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# {Title}

Validates {what} against {standard/rules}.

## Your Task

1. Identify validation targets
2. Apply validation rules
3. Collect violations
4. Report with severity and fix suggestions
5. Optionally auto-fix

## Validation Rules

| Rule | Severity | Auto-fix |
|------|----------|----------|
| {rule1} | Error | Yes/No |
| {rule2} | Warning | Yes/No |
| {rule3} | Info | Yes/No |

## Output Format

```
## Validation Report: {target}

Status: {PASS/FAIL}

### Errors ({count})
- [{rule}] {file}:{line} - {message}
  Fix: {suggestion}

### Warnings ({count})
- [{rule}] {file}:{line} - {message}

### Summary
- Files checked: {n}
- Errors: {n}
- Warnings: {n}
- Auto-fixable: {n}
```

## Example

```
User: {example request}
Checked: {n} files against {n} rules
Result: {PASS/FAIL with summary}
```

## Error Handling

| Error | Response |
|-------|----------|
| No files match | Clarify target pattern |
| Unknown rule | List available rules |
| Auto-fix fails | Report, suggest manual fix |
