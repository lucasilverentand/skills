---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Glob
  - Grep
---

# {Title}

Analyzes {what} for {purpose}.

## Your Task

1. Identify target files/code
2. Apply analysis criteria
3. Collect findings
4. Prioritize by severity/impact
5. Present actionable report

## Analysis Criteria

| Check | Severity | Description |
|-------|----------|-------------|
| {check1} | High | {what it catches} |
| {check2} | Medium | {what it catches} |
| {check3} | Low | {what it catches} |

## Output Format

```
## Analysis: {target}

### Critical ({count})
- {finding}: {location} - {suggestion}

### Warnings ({count})
- {finding}: {location} - {suggestion}

### Info ({count})
- {finding}: {location}

Summary: {x} issues found, {y} critical
```

## Example

```
User: {example request}
Analysis: Scanned {n} files
Found: {findings summary}
```

## Error Handling

| Error | Response |
|-------|----------|
| No files found | Clarify target path/pattern |
| Too many results | Offer to filter by severity |
| Unknown file type | Skip with warning |
