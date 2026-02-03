---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Glob
  - Grep
  - Task
context: fork
agent: general-purpose
---

# {Title}

Investigates {what} by {method}.

## Your Task

1. Understand the problem/question
2. Form hypotheses
3. Spawn parallel investigations
4. Synthesize findings
5. Present conclusions with evidence

## Investigation Strategy

### Phase 1: Gather Context

Spawn Explore agents for:
- {search area 1}
- {search area 2}
- {search area 3}

### Phase 2: Deep Dive

Based on Phase 1, investigate:
- {specific investigation}
- {specific investigation}

### Phase 3: Synthesize

Combine findings into actionable answer.

## Spawning Agents

```
Use Task tool with:
- subagent_type: Explore
- prompt: "{specific search question}"

Spawn multiple in single message for parallel execution.
```

## Example

```
User: {example question}
Investigation:
- Agent 1: Found {x}
- Agent 2: Found {y}
Conclusion: {answer with evidence}
```

## Error Handling

| Error | Response |
|-------|----------|
| No results | Broaden search, try alternatives |
| Conflicting info | Present both, explain discrepancy |
| Incomplete data | State confidence level, suggest next steps |
