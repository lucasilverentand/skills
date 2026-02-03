---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
context: fork
agent: general-purpose
---

# {Title}

Refactors {what} to {goal}.

## Your Task

1. Analyze current code structure
2. Plan refactoring steps
3. Execute changes incrementally
4. Verify each step (tests pass, no regressions)
5. Report changes made

## Refactoring Steps

### Step 1: Analyze

- Identify all affected files
- Map dependencies
- Note test coverage

### Step 2: Plan

Present plan before executing:
- Files to modify
- Changes per file
- Risk assessment

### Step 3: Execute

For each change:
1. Make change
2. Verify tests pass
3. Commit logically

### Step 4: Verify

- All tests pass
- No new warnings
- Behavior unchanged

## Example

```
User: {example request}
Plan: {n} files, {changes summary}
Executed: {what was done}
Verified: Tests pass, no regressions
```

## Error Handling

| Error | Response |
|-------|----------|
| Tests fail | Revert, report issue |
| Circular dependency | Report, suggest resolution |
| Missing tests | Warn, offer to add tests first |
