---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - mcp__{server}__{tool}
---

# {Title}

{One-line description}.

## Your Task

1. Parse $ARGUMENTS for: {expected args}
2. Call MCP tool with parameters
3. Format and present results

## Example

```
User: {example request}
Action: Call mcp__{server}__{tool} with {params}
Output: {formatted result}
```

## Error Handling

| Error | Response |
|-------|----------|
| Tool unavailable | Check MCP server status |
| Invalid params | Show required format |
| Empty result | Explain and suggest alternatives |
