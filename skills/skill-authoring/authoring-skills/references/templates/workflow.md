---
name: {skill-name}
description: Guides {process} step by step with validation. Use when {trigger conditions}.
argument-hint: [options]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Bash
context: fork
agent: general-purpose
---

# {Skill Title}

Guides through {process} with validation at each step.

## Your Task

Execute these phases in order. Only proceed when each step validates.

### Phase 1: Assessment

1. Check prerequisites:

   ```bash
   {prerequisite-check}
   ```

2. Examine current state
3. Identify what needs to happen

### Phase 2: Planning

1. Determine approach based on assessment
2. Present plan to user
3. **Get confirmation before proceeding**

### Phase 3: Execution

1. Step 1: {action}

   ```bash
   {command}
   ```

   Verify: {expected result}

2. Step 2: {action}

   ```bash
   {command}
   ```

   Verify: {expected result}

### Phase 4: Verification

1. Run final check:

   ```bash
   {verification-command}
   ```

2. Report what was done
3. Suggest next steps

## Error Handling

| Issue | Response |
|-------|----------|
| Prerequisite missing | Explain what's needed |
| Step fails | Show error, attempt fix, retry |
| User wants rollback | Execute rollback steps |
