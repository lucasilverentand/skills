---
name: generating-skill-from-chat
description: Extracts reusable skills from conversation patterns. Use when a complex problem was just solved and could become a skill, or when Claude should proactively suggest turning a solution into a skill.
argument-hint: [skill-name]
allowed-tools:
  - Read
  - Write
  - Glob
---

# Generate Skill from Conversation

Captures successful problem-solving patterns as reusable skills.

## When to Suggest This

Proactively suggest creating a skill when you notice:

1. **Complex multi-step solution** - You just walked through 5+ steps to solve something
2. **Reusable pattern** - The solution would apply to similar problems
3. **Domain expertise applied** - You used specialized knowledge the user might need again
4. **Tool orchestration** - You coordinated multiple tools in a specific way

**Suggestion format:**

```text
That was a useful pattern for [problem type]. Want me to turn this into
a skill so you can reuse it? I'd call it "solving-{domain}-issues" or similar.
```

## Your Task

When creating a skill from conversation:

1. **Identify the pattern:**
   - What problem was solved?
   - What were the key steps?
   - What tools were used?
   - What decisions were made and why?

2. **Extract the reusable parts:**
   - Core workflow (not one-off details)
   - Decision points and how to handle them
   - Validation/verification steps
   - Error handling learned during the process

3. **Determine skill type:**
   - Did it mostly call MCP tools? → mcp-caller
   - Did it generate code? → code-generator
   - Did it investigate/debug? → investigator
   - Did it follow exact steps? → workflow

4. **Create the skill:**
   - Name: gerund form describing the action
   - Description: third-person, "Use when" trigger
   - Keep it focused on the reusable pattern

5. **Generalize appropriately:**
   - Replace specific values with parameters
   - Keep domain knowledge that applies broadly
   - Remove one-off details

## Extraction Template

From the conversation, extract:

```
Problem solved: {one sentence}
Key insight: {what made this work}
Steps taken:
1. {step}
2. {step}
3. {step}

Tools used: {list}
Decisions made: {key decision points}
Errors encountered: {and how resolved}

Reusable as: {skill type}
Suggested name: {gerund-form-name}
```

## Example

```
[After debugging a complex auth issue together]

You: That was a useful debugging pattern - checking token flow,
verifying middleware order, testing with curl. Want me to capture
this as a skill? Something like "debugging-auth-issues"?

User: Yes, do it

You: Creating debugging-auth-issues...

Extracted pattern:
1. Check token presence in request headers
2. Verify middleware execution order
3. Test endpoint directly with curl
4. Check token validation logic
5. Verify user lookup

[Creates skills/debugging/debugging-auth-issues/SKILL.md]

Created! Next time you have auth issues, this pattern will
be available. You can invoke it with "debug this auth problem"
or /debugging-auth-issues.
```

## What NOT to Extract

Don't create skills for:
- Simple one-liner solutions
- Highly specific one-off fixes
- Things that already have skills
- Trivial patterns anyone would follow

## Error Handling

| Issue | Response |
|-------|----------|
| Pattern too simple | Don't suggest extraction, it's not worth a skill |
| User declines | Acknowledge, continue conversation |
| Similar skill exists | Point to existing skill, offer to enhance it instead |
| Can't generalize | Note it's too specific, skip extraction |

## Skill Quality Check

Before finalizing, verify:
- [ ] Name is gerund form
- [ ] Description is third-person with "Use when"
- [ ] Steps are generalized (not hardcoded to this case)
- [ ] Error handling reflects what we learned
- [ ] Under 200 lines (it's a focused pattern)
