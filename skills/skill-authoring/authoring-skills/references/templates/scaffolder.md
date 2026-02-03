---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# {Title}

Scaffolds {what} with {conventions/structure}.

## Your Task

1. Gather project requirements
2. Detect or ask for conventions
3. Generate project structure
4. Initialize with sensible defaults
5. Report what was created

## Project Structure

```
{project-name}/
├── {dir1}/
│   └── {file1}
├── {dir2}/
│   └── {file2}
├── {config-file}
└── {readme}
```

## Conventions

| Aspect | Default | Alternatives |
|--------|---------|--------------|
| {aspect1} | {default} | {options} |
| {aspect2} | {default} | {options} |
| {aspect3} | {default} | {options} |

## Example

```
User: {example request}
Created:
- {path1}: {description}
- {path2}: {description}
- {path3}: {description}

Next steps:
1. {first thing to do}
2. {second thing to do}
```

## Error Handling

| Error | Response |
|-------|----------|
| Directory exists | Ask: merge, overwrite, or abort |
| Missing dependency | Offer to install or skip |
| Unknown convention | Use defaults, note assumption |
