---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
context: fork
agent: general-purpose
---

# {Title}

Executes {workflow description}.

## Your Task

Follow this exact sequence:

### Step 1: {First Step}

- Action: {what to do}
- Verify: {success criteria}
- On failure: {recovery action}

### Step 2: {Second Step}

- Action: {what to do}
- Verify: {success criteria}
- On failure: {recovery action}

### Step 3: {Third Step}

- Action: {what to do}
- Verify: {success criteria}
- On failure: {recovery action}

## Progress Checklist

- [ ] Step 1: {description}
- [ ] Step 2: {description}
- [ ] Step 3: {description}

## Example

```
User: {example request}
Steps executed:
1. {step 1 result}
2. {step 2 result}
3. {step 3 result}
Result: {final outcome}
```

## Error Handling

| Error | Response |
|-------|----------|
| Step fails | Stop, report, offer recovery options |
| Partial completion | Report progress, suggest resume |
| Precondition unmet | Explain requirement, suggest fix |
