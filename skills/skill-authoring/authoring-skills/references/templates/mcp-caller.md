---
name: {skill-name}
description: Searches {service} for {resources}. Use when finding, querying, or discovering {service} data.
argument-hint: [query]
allowed-tools:
  - mcp__{server}__tool_name
---

# {Skill Title}

Searches {service} and presents formatted results.

## Your Task

1. Parse the query from $ARGUMENTS
2. Call the MCP tool with appropriate parameters
3. Format results clearly with descriptions
4. Suggest related searches if helpful

## Examples

### Basic Search

```
User: /{skill-name} authentication
→ Call MCP tool, show top results with descriptions
```

### No Results

```
→ Suggest alternative search terms
→ Show popular searches in this category
```

## Error Handling

| Issue | Response |
|-------|----------|
| Empty query | Show usage examples |
| No results | Suggest alternative terms |
| Tool unavailable | Explain, suggest manual approach |
