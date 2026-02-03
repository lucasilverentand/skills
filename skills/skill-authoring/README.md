# Skill Authoring

Tools for creating, validating, and improving Claude Code skills.

## Skills

| Skill | Description |
|-------|-------------|
| `authoring-skills` | Create, validate, and improve skills (consolidated) |
| `generating-skill-from-chat` | Extract skills from conversation patterns (auto-suggested) |

## Usage

Just describe what you want:

```
Create a skill for searching Jira
Check if this skill is correct
Make this skill better
```

Or be explicit:

```
/authoring-skills create searching-jira mcp-caller
/authoring-skills validate processing-pdfs
/authoring-skills improve my-skill
```

## Scripts

Scripts are bundled in `authoring-skills/scripts/`:

```bash
# Validate a skill
authoring-skills/scripts/validate-skill.sh skill-name

# Validate all skills
authoring-skills/scripts/validate-skill.sh --all

# Scaffold new skill
authoring-skills/scripts/scaffold-skill.sh searching-jira integrations mcp-caller
```

## Skill File Format

```yaml
---
name: searching-jira           # gerund form, kebab-case
description: Searches Jira issues. Use when finding tickets.
argument-hint: [query]
allowed-tools: [Read, Glob]
context: fork                  # optional
agent: general-purpose         # optional
---

# Searching Jira

## Your Task
{what the skill does}

## Examples
{usage examples}

## Error Handling
{common issues}
```

## Key Rules

**Names:** Gerund form (`processing-pdfs`), max 64 chars, lowercase + hyphens

**Descriptions:** Third person, include "Use when", add keywords

**Size:** Target under 300 lines
