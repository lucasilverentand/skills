---
name: authoring-skills
description: Creates, validates, and improves Claude Code skills. Use when making a skill, creating a skill, checking skill quality, improving a skill, scaffolding SKILL.md, or extracting patterns into reusable skills.
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

Determine action from $ARGUMENTS or context:

| Intent | Action |
|--------|--------|
| "create a skill", "make a skill for X" | Create new skill |
| "check this skill", "validate", "is this correct" | Validate skill |
| "improve this skill", "make it better" | Improve skill |
| Complex problem just solved | Suggest extracting as skill |

## Progress Checklist

- [ ] Determine action (create/validate/improve)
- [ ] Gather requirements
- [ ] Execute action
- [ ] Validate result
- [ ] Suggest next steps

---

## Creating Skills

### Step 1: Get the Basics

From $ARGUMENTS or ask:
- Name (action-first gerund: `searching-jira`, `processing-pdfs`)
- What it does (one sentence)
- When Claude should invoke it

### Step 2: Pick Skill Type

| Template | Freedom | Use Case |
|----------|---------|----------|
| `mcp-caller` | High | Wraps MCP tools |
| `code-generator` | Medium | Creates files |
| `config-manager` | Medium | Edits configs |
| `workflow` | Low | Multi-step processes |
| `analyzer` | Medium | Reviews/audits code |
| `investigator` | Medium | Spawns agents, debugs |
| `documentation` | Medium | Generates docs |
| `refactorer` | Low | Transforms code |
| `teaching` | High | Explains concepts |
| `integration` | Medium | Connects services |
| `validator` | Low | Checks compliance |
| `scaffolder` | Medium | Project initialization |

### Step 3: Determine Context

| Context | When |
|---------|------|
| `main` (default) | Simple skills, user sees steps |
| `fork` | Autonomous work, spawning subagents |

### Step 4: Generate SKILL.md

Use template from `references/templates/{type}.md`.

### Step 5: Validate

Check against rules below before finishing.

---

## Validating Skills

### Name Rules (Critical)

| Rule | Valid | Invalid |
|------|-------|---------|
| Max 64 chars | `processing-pdfs` | `processing-pdf-files-from-various-sources-...` |
| Lowercase + hyphens | `my-skill` | `My_Skill` |
| No `--` | `my-skill` | `my--skill` |
| No start/end hyphen | `my-skill` | `-my-skill-` |
| Gerund form | `searching-jira` | `jira-searcher` |
| Action-first | `searching-jira` | `jira-searching` |
| Matches directory | `skills/foo/foo/` | `skills/foo/bar/` |

### Description Rules (Critical)

| Rule | Valid | Invalid |
|------|-------|---------|
| Third person | "Searches..." | "I search..." |
| Has "Use when" | "...Use when finding..." | "Searches Jira." |
| Has keywords | "...tickets, issues, Jira..." | "Searches things." |
| Max 1024 chars | (short) | (too long) |

### Content Rules

| Rule | Check |
|------|-------|
| Has title | `# Title` exists |
| Has task section | `## Your Task` exists |
| Has examples | `## Example` exists |
| Has error handling | `## Error` exists |
| Size | Under 300 lines preferred, 500 max |

### Output Style

Explain findings conversationally:

```
Looking at searching-jira...

Name: Good gerund form, matches directory.
Description: Third-person with "Use when" - good.
Size: 89 lines - concise.

Issue: Missing error handling section.
Fix: Add ## Error Handling with common failure cases.

Overall: 1 issue to fix.
```

---

## Improving Skills

### Priority Order

1. **Description** (highest impact) - drives auto-invocation
2. **Naming** - gerund form, action-first
3. **Size/structure** - under 300 lines
4. **Patterns** - checklists, validation loops

### Process

1. Read skill, assess against rules
2. List improvements with priority
3. Show before/after for each
4. Apply after user approval
5. Validate result

---

## Suggesting Skill Extraction

After solving a complex problem, proactively suggest:

```
That was a useful pattern. Want me to turn this into a skill?
I'd call it "debugging-auth-issues" or similar.
```

Suggest when:
- Multi-step solution (5+ steps)
- Reusable pattern
- Domain expertise applied
- Tool orchestration

---

## Style Guide

### Core Principles

**Always explain the why.** Don't just do things - explain reasoning.

**Fail fast.** Validate inputs early. Check preconditions before work:
- Required files exist?
- Arguments valid?
- Dependencies available?

**Idempotent.** Running twice is safe:
- Check before creating
- Update rather than duplicate
- Report "already exists" vs failing

**Smart defaults.** On ambiguity:
1. Make reasonable assumption
2. Proceed with sensible default
3. State what was assumed
4. Let user correct

### Verbosity by Freedom

| Freedom | Verbosity | Why |
|---------|-----------|-----|
| High | Sparse | Over-specification constrains |
| Low | Detailed | Fragile ops need exact steps |

### Tone

Technical and precise. Like a spec document:
- Unambiguous language
- Clear terminology
- No filler

### Output

Verbose walkthrough:
1. What was done
2. Why that approach
3. What each step accomplished
4. Next steps
5. Improvement suggestions

### Error Handling

Present options when something fails:

```
Config file couldn't be parsed.

Options:
1. Show syntax error for manual fix
2. Attempt auto-repair
3. Use default config
4. Abort

Which approach?
```

### Checklists

Required for all multi-step tasks. Copyable format:

```markdown
## Progress
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
```

### Validation Loops

Build into skills:
1. Perform action
2. Check result
3. If invalid: analyze, fix, repeat
4. Only proceed when valid

### Composability

Design for chaining:
- Structured output
- Clear success/failure
- Consistent argument patterns

### Path Handling

Smart detection:
1. Look for project markers (package.json, Cargo.toml)
2. Check conventions (src/, lib/)
3. Fall back to cwd
4. Allow explicit override

---

## Agent Types

| Type | Use For | Tools |
|------|---------|-------|
| `general-purpose` | Multi-step tasks | All |
| `Explore` | Codebase research | Read-only |
| `Bash` | Command execution | Bash only |
| `Plan` | Architecture planning | Read-only |

### Spawning Subagents

Use Task tool with `subagent_type`:

```
Spawn Task agents in parallel:
- subagent_type: Explore
- prompt: "Find files handling auth"
```

For parallel investigation, spawn multiple in single message.

---

## Error Handling

| Issue | Response |
|-------|----------|
| Skill not found | Search similar names, list available |
| Invalid YAML | Show error location, suggest fix |
| Name conflict | Suggest alternative or confirm replace |
| Template not found | List available templates |

---

## Templates

Templates are in `references/templates/`. Each contains:
- YAML frontmatter structure
- Your Task section template
- Example format
- Error handling table

Available: `mcp-caller`, `code-generator`, `config-manager`, `workflow`, `analyzer`, `investigator`, `documentation`, `refactorer`, `teaching`, `integration`, `validator`, `scaffolder`.
