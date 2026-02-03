---
name: authoring-skills
description: Creates, validates, and improves Claude Code skills. Use when making a skill, creating a skill, checking skill quality, improving a skill, or someone says "make this into a skill".
argument-hint: [action] [skill-name]
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
context: fork
agent: general-purpose
---

# Skill Authoring

Creates, validates, and improves Claude Code skills.

## Your Task

Determine the action from $ARGUMENTS or context:

| Intent | Action |
|--------|--------|
| "create a skill", "make a skill for X" | Create new skill |
| "check this skill", "validate", "is this correct" | Validate existing skill |
| "improve this skill", "make it better" | Improve existing skill |
| After solving complex problem | Suggest extracting as skill |

## Creating Skills

1. **Get the basics** (from args or ask):
   - Name (gerund form: `searching-jira`, `processing-pdfs`)
   - What it does (one sentence)
   - When to invoke it

2. **Pick skill type:**
   - `mcp-caller` - Wraps MCP tools (high freedom)
   - `code-generator` - Creates files (medium freedom)
   - `config-manager` - Edits configs (medium freedom)
   - `workflow` - Multi-step process (low freedom, forked)
   - `analyzer` - Reviews code (medium freedom)
   - `investigator` - Spawns agents (forked)

3. **Determine execution context:**
   - Simple skills: `context: main` (default) - runs in conversation
   - Autonomous/agent-spawning: `context: fork` - isolated execution
   - See `references/AGENTS.md` for agent types and forking details

4. **Generate from template** in `references/templates/{type}.md`

4. **Validate** before finishing

## Validating Skills

Check these rules:

**Name (Critical):**
- Max 64 chars, lowercase, hyphens only
- No `--`, no start/end hyphen
- Gerund form: `processing-pdfs` not `pdf-processor`
- Matches directory name

**Description (Critical):**
- Third person ("Searches..." not "I search...")
- Includes "Use when" trigger
- Has searchable keywords

**Content:**
- Has `## Your Task` section
- Has examples and error handling
- Under 300 lines (500 max)

**Output style:** Conversational prose, explain issues with fixes.

## Improving Skills

1. Read and assess current state
2. Prioritize improvements:
   - Description voice/triggers (highest impact)
   - Naming (high impact)
   - Size/structure (medium)
   - Workflow patterns (lower)
3. Show before/after for each change
4. Apply after user approval
5. Validate result

## Suggesting Skill Extraction

After solving a complex problem, proactively suggest:

```
That was a useful pattern for [problem type]. Want me to turn
this into a skill? I'd call it "debugging-auth-issues" or similar.
```

Suggest when you notice:
- Multi-step solution (5+ steps)
- Reusable pattern
- Domain expertise applied
- Tool orchestration

## Naming Rules

| Rule | Example |
|------|---------|
| Gerund form | `analyzing-code` not `code-analyzer` |
| Max 64 chars | `processing-pdfs` |
| Lowercase + hyphens | `my-skill` not `My_Skill` |

**Conversions:**
- `pdf-processor` → `processing-pdfs`
- `code-review` → `reviewing-code`

## Description Rules

**Good:** `Searches Jira issues and projects. Use when finding tickets, querying Jira, or looking up issues.`

**Bad:** `I help you search Jira.` (first person)

## Scripts

```bash
# Validate a skill
scripts/validate-skill.sh skill-name

# Validate all skills
scripts/validate-skill.sh --all

# Scaffold new skill
scripts/scaffold-skill.sh searching-jira integrations mcp-caller
```

## Examples

### Create

```
User: Create a skill for searching Jira

You: Creating searching-jira as an mcp-caller skill...
[Generates SKILL.md from template]
Created at skills/integrations/searching-jira/SKILL.md
```

### Validate

```
User: Check if this skill is correct

You: Looking at searching-jira...

Name: Good gerund form
Description: Third-person with "Use when" - looks good
Size: 89 lines - nice and concise

Passes validation.
```

### Improve

```
User: Make this skill better

You: Looking at processing-pdfs...

The description starts with "I can help" - needs third-person.

Before: "I can help you extract text from PDFs"
After: "Extracts text and metadata from PDFs. Use when processing documents or converting PDF to text."

Want me to apply this fix?
```

## Agents and Context

For skills that need to spawn subagents or run autonomously, read `references/AGENTS.md`.

**Quick reference:**

| Agent Type | Use For |
|------------|---------|
| `general-purpose` | Multi-step tasks needing all tools |
| `Explore` | Read-only codebase research |
| `Bash` | Command execution only |
| `Plan` | Architecture planning |

| Context | Use For |
|---------|---------|
| `main` (default) | Simple skills, user sees steps |
| `fork` | Autonomous work, spawning subagents |

## Error Handling

| Issue | Response |
|-------|----------|
| Skill not found | Search for similar names, list available skills |
| Invalid YAML | Show syntax error location, suggest fix |
| Name conflict | Suggest alternative name or confirm replace |
| Template not found | List available templates |
