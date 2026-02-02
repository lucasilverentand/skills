# Skill Authoring

Tools for creating, validating, and improving Claude Code skills.

## Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| `skill-init` | Initialize new skills with proper structure | Creating a new skill |
| `skill-validate` | Validate skill files for correctness | Checking skill quality before publishing |
| `skill-improve` | Enhance existing skills with better docs and examples | Improving skill quality |
| `skill-examples` | Generate templates for different skill types | Needing reference implementations |

## Quick Start

### Create a New Skill

```
/skill-init my-new-skill devtools
```

Or describe what you want:

```
"Create a new skill for managing Docker containers"
```

### Validate Your Skill

```
/skill-validate my-new-skill
```

Or validate all skills:

```
"Validate all skills in the marketplace"
```

### Improve an Existing Skill

```
/skill-improve devenv-search
```

Or describe the improvement:

```
"Add more examples to the devenv-search skill"
```

### Get Templates

```
/skill-examples mcp-tool-caller
```

Available types:

- `mcp-tool-caller` - For skills that call MCP tools
- `code-generator` - For skills that create code
- `config-manager` - For skills that modify configs
- `workflow` - For multi-step processes
- `analyzer` - For code review/analysis

## Skill File Format

Every skill needs a `SKILL.md` file with:

```yaml
---
name: skill-name           # kebab-case identifier
description: Brief desc. Use when {trigger conditions}.
argument-hint: [args]      # optional
allowed-tools: [tools]     # optional
---

# Skill Title

## Your Task
{What the skill does}

## Examples
{Usage examples}

## Error Handling
{Common issues and fixes}
```

## Best Practices

### Descriptions

The description field drives auto-invocation. Good descriptions:

- Start with an action verb
- Explain what the skill does
- End with "Use when {specific conditions}"
- Include key terms users might mention

### Examples

Include at minimum:

- Basic usage example
- Advanced/complex example
- Error case example

### Error Handling

Document:

- Common failure modes
- How to detect them
- How to fix them
- Fallback options

### Validation Checklist

Always include a checklist of verifications before considering the task complete.

## Plugin Integration

After creating skills, add them to a plugin in `marketplace.json`:

```json
{
  "name": "my-plugin",
  "description": "Plugin description",
  "skills": ["./skills/category/skill-name"]
}
```

## Quality Checklist

Before publishing a skill:

- [ ] Name is kebab-case and unique
- [ ] Description includes "Use when" trigger
- [ ] Has clear "Your Task" section
- [ ] Includes realistic examples
- [ ] Has error handling section
- [ ] Has validation checklist
- [ ] Passes `/skill-validate`
