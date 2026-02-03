---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Write
  - Glob
---

# {Title}

Generates {what} based on {input}.

## Your Task

1. Parse $ARGUMENTS for: {expected args}
2. Detect project context (language, framework)
3. Generate code following project conventions
4. Write to appropriate location
5. Validate output

## Output Format

- Match existing code style
- Include necessary imports
- Add minimal documentation

## Example

```
User: {example request}
Action: Generate {file} at {path}
Output: Created {path} with {description}
```

## Error Handling

| Error | Response |
|-------|----------|
| Path exists | Ask: overwrite, rename, or abort |
| Unknown project type | Ask for language/framework |
| Missing context | Request additional info |
