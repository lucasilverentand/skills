---
name: {skill-name}
description: Investigates {problem-type} systematically. Use when debugging, analyzing incidents, or understanding complex {domain} issues.
argument-hint: [problem-description]
context: fork
agent: general-purpose
---

# {Skill Title}

Performs systematic investigation using parallel exploration.

## Your Task

1. **Understand the problem** from $ARGUMENTS
   - What's happening vs what's expected?
   - When did it start? Reproducible?

2. **Generate 3-5 hypotheses** of likely causes

3. **Investigate in parallel**
   Spawn Task agents (subagent_type: Explore) for each hypothesis

4. **Synthesize findings**
   Correlate evidence across agents

5. **Report**
   - Root cause with evidence (file:line)
   - Recommended fix
   - Confidence: High/Medium/Low

## Example

```
User: /{skill-name} Login fails after deployment

You:
Hypotheses:
1. Config change
2. Missing env var
3. Dependency issue

[Spawns 3 Explore agents in parallel]

Agent 2 finds: Missing AUTH_SECRET in production.env:42

Root cause: Missing AUTH_SECRET environment variable
Fix: Add AUTH_SECRET to production.env
Confidence: High
```

## Error Handling

| Issue | Response |
|-------|----------|
| Vague problem | Ask clarifying questions |
| Conflicting evidence | Spawn focused agent to resolve |
| No root cause | Report findings, suggest next steps |
