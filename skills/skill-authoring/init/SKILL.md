---
name: skill-init
description: Scaffolds new Claude Code skills with proper structure and best practices. Use when creating a new skill, setting up skill scaffolding, or starting a new SKILL.md file.
argument-hint: [skill-name] [category]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Skill Initialization

Guides users through creating a new Claude Code skill with proper structure and official best practices.

## Your Task

Help the user create a new skill by:

1. **Gather skill information:**
   - Skill name from $ARGUMENTS (or ask if not provided)
   - Category (devtools, quality, web-development, editor, etc.)
   - Brief description of what the skill does
   - When should Claude auto-invoke this skill?

2. **Validate the skill name per official spec:**
   - Max 64 characters
   - Lowercase letters, numbers, and hyphens only
   - Cannot start or end with a hyphen
   - No consecutive hyphens allowed
   - Use gerund form (verb + -ing): `processing-pdfs`, `analyzing-spreadsheets`
   - Check it doesn't conflict with existing skills

3. **Determine skill type and degrees of freedom:**
   - **Tool caller**: Invokes specific tools (MCP, Bash, etc.)
   - **Code generator**: Creates/modifies code files
   - **Documentation/teaching**: Provides guidance and examples
   - **Configuration**: Manages config files
   - **Workflow**: Multi-step process with validation

4. **Create skill directory and SKILL.md:**
   - Create `skills/{category}/{skill-name}/SKILL.md`
   - Include comprehensive YAML frontmatter
   - Add appropriate sections based on skill type
   - Create optional subdirectories if needed (scripts/, references/, assets/)

5. **Update marketplace.json if needed:**
   - Check if skill should be added to an existing plugin
   - Or suggest creating a new plugin bundle

## Naming Conventions

### Official Specification

Names must follow these constraints:

| Constraint | Rule |
|------------|------|
| Max length | 64 characters |
| Characters | Lowercase letters, numbers, hyphens only |
| Hyphens | Cannot start/end with hyphen, no consecutive hyphens |
| Style | Gerund form recommended (verb + -ing) |

### Gerund Form Examples

Use verb + -ing pattern to clearly describe the action:

| Good (Gerund) | Avoid |
|---------------|-------|
| `processing-pdfs` | `pdf-processor` |
| `analyzing-spreadsheets` | `spreadsheet-analysis` |
| `reviewing-pull-requests` | `pr-review` |
| `generating-tests` | `test-generator` |
| `deploying-containers` | `container-deploy` |

### Validation Check

```bash
# Check if name follows spec
NAME="your-skill-name"
if [[ ${#NAME} -gt 64 ]]; then echo "Too long"; fi
if [[ $NAME =~ ^- || $NAME =~ -$ ]]; then echo "Cannot start/end with hyphen"; fi
if [[ $NAME =~ -- ]]; then echo "No consecutive hyphens"; fi
if [[ ! $NAME =~ ^[a-z0-9-]+$ ]]; then echo "Invalid characters"; fi
```

## Description Requirements

### Official Rules

- **Max length**: 1024 characters
- **Must be third person**: Describes what the skill does, not what "I" or "you" can do
- **Include trigger conditions**: End with "Use when..." clause
- **Include keywords**: Terms users might mention when needing this skill

### Writing Style

| Correct (Third Person) | Incorrect |
|------------------------|-----------|
| "Extracts text from PDF files." | "I can help you extract text from PDFs." |
| "Generates unit tests for functions." | "You can use this to generate tests." |
| "Analyzes code for security vulnerabilities." | "This skill helps with security analysis." |

### Good Description Examples

```yaml
# Tool caller skill
description: Searches devenv packages and configuration options. Use when finding or discovering available devenv packages.

# Code generator skill
description: Scaffolds new Hono web applications with TypeScript configuration. Use when creating a new Hono project or initializing API structure.

# Review skill
description: Reviews code for bugs, security issues, and best practices violations. Use when reviewing PRs, analyzing code quality, or performing security audits.

# Workflow skill
description: Guides database migration processes with validation at each step. Use when migrating schemas, updating database structure, or running migration scripts.
```

### Bad Description Examples

```yaml
# Too vague, no trigger
description: Helps with devenv.

# First person - violates third-person rule
description: I can search for things and help you find packages.

# Second person - violates third-person rule
description: You can use this for development tasks.

# No keywords, no trigger phrase
description: This skill does stuff.
```

## Progressive Disclosure Architecture

Skills use three-level progressive disclosure to optimize token usage:

### Level 1: Metadata (~100 tokens)

Loaded at startup for all available skills:

- `name`: Skill identifier
- `description`: Discovery and auto-invocation trigger

This is why descriptions must be concise but keyword-rich.

### Level 2: Instructions (<5000 tokens recommended)

The SKILL.md body, loaded when the skill is triggered:

- Core instructions and guidance
- Decision trees and workflows
- Inline examples and templates

**Key guideline**: Keep SKILL.md under 500 lines. If it grows larger, split content into reference files.

### Level 3: Resources (Unlimited)

On-demand files loaded only when explicitly referenced:

- `references/` - Additional documentation
- `scripts/` - Executable code
- `assets/` - Templates, configurations, static files

### Token Budget Guidelines

| Level | Budget | Content |
|-------|--------|---------|
| Metadata | ~100 tokens | Name + description only |
| Instructions | <5000 tokens | Core SKILL.md body |
| Resources | Unlimited | Loaded on-demand |

## Degrees of Freedom Pattern

Match the specificity of your instructions to the fragility of the task:

### High Freedom (Text Instructions)

For flexible, creative, or context-dependent tasks:

```markdown
## Your Task

Analyze the codebase and suggest improvements based on:
- Code organization and architecture
- Naming conventions and readability
- Performance considerations
- Security best practices

Prioritize suggestions based on impact and effort required.
```

Use when: Tasks benefit from Claude's judgment, context varies widely.

### Medium Freedom (Pseudocode/Parameters)

For structured tasks with configurable options:

```markdown
## Your Task

1. Read the configuration file at `{config_path}`
2. For each migration in `migrations/`:
   - Check if already applied (query migrations table)
   - If not applied:
     - Begin transaction
     - Execute migration SQL
     - Record in migrations table
     - Commit transaction
3. Report summary of applied migrations
```

Use when: Process is defined but parameters vary, some flexibility needed.

### Low Freedom (Exact Scripts)

For fragile, critical, or security-sensitive operations:

```markdown
## Your Task

Execute exactly this sequence:

1. Run pre-flight check:
   ```bash
   ./scripts/preflight-check.sh
   ```

2. If check passes, run deployment:

   ```bash
   ./scripts/deploy.sh --environment=$ENVIRONMENT --version=$VERSION
   ```

3. Verify deployment:

   ```bash
   ./scripts/verify-deployment.sh
   ```

```

Use when: Operations are fragile, exact steps are critical, security matters.

## Directory Structure

### Required Files

```

skill-name/
└── SKILL.md              # Main skill file (required)

```

### Optional Directories

```

skill-name/
├── SKILL.md              # Main instructions (required)
├── scripts/              # Executable code
│   ├── validate.sh
│   ├── generate.py
│   └── helpers/
├── references/           # Additional documentation
│   ├── REFERENCE.md      # Detailed reference material
│   ├── EXAMPLES.md       # Extended examples
│   └── API.md            # API documentation
└── assets/               # Static resources
    ├── template.json
    ├── config.yaml
    └── schema.json

```

### When to Use Each Directory

| Directory | Use For | Examples |
|-----------|---------|----------|
| `scripts/` | Executable code, validation scripts, generators | `validate.sh`, `generate.py` |
| `references/` | Extended docs, API specs, detailed examples | `API.md`, `PATTERNS.md` |
| `assets/` | Templates, schemas, configuration files | `template.json`, `schema.yaml` |

## File Reference Guidelines

### Keep References Shallow

References should be one level deep from SKILL.md. Avoid deeply nested reference chains.

**Good:**
```

SKILL.md → references/PATTERNS.md
SKILL.md → scripts/validate.sh

```

**Avoid:**
```

SKILL.md → references/PATTERNS.md → references/details/ADVANCED.md → ...

```

### Reference Loading Pattern

In SKILL.md, instruct Claude when to load references:

```markdown
## Additional Resources

For advanced configuration options, read `references/ADVANCED-CONFIG.md`.

For API integration examples, read `references/API-EXAMPLES.md`.
```

## SKILL.md Template

```markdown
---
name: {skill-name}
description: {Third-person description of what it does}. Use when {trigger conditions}.
argument-hint: [{expected-arguments}]
allowed-tools:
  - {list of tools this skill can use}
context: {main or fork}    # optional: fork for isolated execution
agent: {agent-type}        # optional: general-purpose, Explore, Bash, Plan
---

# {Skill Title}

{One-line third-person description of what this skill does.}

## Your Task

{Detailed explanation of what the skill should accomplish}

1. **Step one:**
   - Sub-step details
   - Validation to perform

2. **Step two:**
   - Sub-step details

## Examples

### Basic Example

```text
User: /{skill-name} {example-args}
Claude: [Explain what happens]
```

### Advanced Example

{Show a more complex usage scenario}

## Templates

{Include any code templates, configuration samples, or reusable snippets}

## Error Handling

### Common Issues

1. **Issue description:**
   - Symptoms
   - Cause
   - Solution

## Validation Checklist

Before completing, copy this checklist and check off items:

```markdown
- [ ] Pre-condition verified
- [ ] Main task completed
- [ ] Output validated
- [ ] User informed of results
```

## Tips

- Tip 1
- Tip 2

```

## Skill Type Templates

### Tool Caller Skill

For skills that primarily invoke MCP or system tools:

```yaml
---
name: searching-{resource}
description: Searches {resource} using {tool/API}. Use when {trigger conditions}.
argument-hint: [query]
allowed-tools:
  - mcp__{server}__tool_name
  - Bash
---

# Searching {Resource}

Searches and retrieves information from {resource}.

## Your Task

1. **Parse the query** from $ARGUMENTS
2. **Call the appropriate tool**
3. **Format and present results**
4. **Handle errors gracefully**

## Examples

{Show tool invocation examples}

## Error Handling

- Empty results: Suggest alternative queries or broader search terms
- Tool failure: Provide fallback options or manual alternatives
- Invalid input: Explain expected format with examples
```

### Code Generator Skill

For skills that create or modify code:

```yaml
---
name: generating-{artifact}
description: Generates {artifact} with {framework/pattern}. Use when {trigger conditions}.
argument-hint: [options]
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# Generating {Artifact}

Creates {artifact} following {framework/pattern} conventions.

## Your Task

1. **Check existing setup** (read relevant files)
2. **Determine what to generate**
3. **Create/modify files**
4. **Validate the result**

## Templates

### Template 1

```{language}
{code template}
```

## Validation

After generation, verify:

1. Syntax is valid
2. Code compiles/runs
3. No conflicts with existing code

```

### Workflow Skill

For multi-step processes with validation:

```yaml
---
name: {action}-ing-{target}
description: Guides {process} with validation at each step. Use when {trigger conditions}.
argument-hint: [project-type]
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# {Workflow Name}

Guides users through {process} with validation checkpoints.

## Your Task

Guide the user through:

1. **Phase 1: Assessment**
   - Check current state
   - Identify requirements

2. **Phase 2: Planning**
   - Determine approach
   - Get user confirmation

3. **Phase 3: Execution**
   - Perform changes
   - Validate each step

4. **Phase 4: Verification**
   - Test the result
   - Document next steps

## Progress Checklist

Copy this checklist at the start and update as you progress:

```markdown
## Workflow Progress

### Phase 1: Assessment
- [ ] Current state analyzed
- [ ] Requirements identified
- [ ] Blockers documented

### Phase 2: Planning
- [ ] Approach determined
- [ ] User confirmed plan
- [ ] Resources ready

### Phase 3: Execution
- [ ] Step 1 complete
- [ ] Step 2 complete
- [ ] Step 3 complete

### Phase 4: Verification
- [ ] Tests pass
- [ ] Documentation updated
- [ ] User notified
```

## Decision Trees

### If {condition}:

- Do X
- Then Y

### If {other condition}:

- Do Z instead

```

## Workflow Patterns

### Copyable Checklists

For complex multi-step skills, provide checklists Claude can copy and track:

```markdown
## Deployment Checklist

Copy this checklist and check off items as you complete them:

```markdown
### Pre-deployment
- [ ] All tests pass
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Dependencies locked

### Deployment
- [ ] Backup created
- [ ] Migration run
- [ ] Application deployed
- [ ] Health check passes

### Post-deployment
- [ ] Monitoring verified
- [ ] Stakeholders notified
- [ ] Rollback plan documented
```

```

### Validation Loops

For iterative tasks, implement fix loops:

```markdown
## Validation Loop

1. Run validation:
   ```bash
   npm run lint && npm run test
   ```

2. If errors found:
   - Read the error output
   - Fix the identified issues
   - Return to step 1

3. If validation passes:
   - Proceed to next phase

```

## Frontmatter Fields Reference

### Required Fields

| Field | Constraints | Example |
|-------|-------------|---------|
| `name` | Max 64 chars, kebab-case, no start/end hyphen, no consecutive hyphens | `processing-pdfs` |
| `description` | Max 1024 chars, third person, include "Use when" | `Processes PDF files for text extraction. Use when extracting text from documents.` |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| `argument-hint` | Expected arguments display | `[query]`, `[file] [options]` |
| `allowed-tools` | Restrict available tools | `[Bash, Read, Write]` |
| `context` | Execution context for the skill | `fork` (separate context) or `main` (shared context) |
| `agent` | Agent type for skill execution | `general-purpose`, `Explore`, `Bash`, `Plan` |

### Context Field

The `context` field controls how the skill executes:

| Value | Behavior |
|-------|----------|
| `main` | Skill runs in the main conversation context (default) |
| `fork` | Skill runs in a separate forked context, isolated from main conversation |

Use `fork` for skills that:
- Perform extensive exploration or investigation
- Should not pollute the main conversation with intermediate steps
- Need to spawn multiple sub-agents autonomously

### Agent Field

The `agent` field specifies which agent type executes the skill:

| Value | Use Case |
|-------|----------|
| `general-purpose` | Complex multi-step tasks requiring all tools |
| `Explore` | Codebase exploration and research |
| `Bash` | Command execution focused tasks |
| `Plan` | Architecture and implementation planning |

## Testing Guidance

### Model-Specific Testing

Test your skill across different Claude models:

| Model | Characteristics | Guidance Level Needed |
|-------|-----------------|----------------------|
| Haiku | Fast, efficient | More explicit instructions, detailed steps |
| Sonnet | Balanced | Standard instructions work well |
| Opus | Most capable | Can handle higher degrees of freedom |

### Testing Checklist

```markdown
- [ ] Skill triggers correctly via explicit invocation (/{skill-name})
- [ ] Skill triggers correctly via auto-invocation (natural language)
- [ ] Skill handles missing arguments gracefully
- [ ] Skill handles invalid input appropriately
- [ ] Skill works with Haiku (most constrained test)
- [ ] Skill works with Sonnet
- [ ] Skill works with Opus (if targeting advanced users)
```

### Evaluation-First Development

1. **Define success criteria** before writing extensive documentation
2. **Create test cases** that cover common scenarios
3. **Iterate with Claude** to refine instructions
4. **Test edge cases** after core functionality works

## Pre-Creation Checks

Before creating the skill:

```bash
# Check if skill already exists
ls -la skills/*/{skill-name}/ 2>/dev/null

# Check for similar skill names
find skills -name "SKILL.md" -exec grep -l "name: {skill-name}" {} \;

# Validate proposed name
NAME="your-skill-name"
[[ ${#NAME} -le 64 ]] && echo "Length OK" || echo "Too long"
[[ ! $NAME =~ ^- && ! $NAME =~ -$ ]] && echo "Hyphen position OK" || echo "Bad hyphen position"
[[ ! $NAME =~ -- ]] && echo "No consecutive hyphens" || echo "Has consecutive hyphens"
[[ $NAME =~ ^[a-z0-9-]+$ ]] && echo "Characters OK" || echo "Invalid characters"
```

## Allowed Tools Reference

Common tool combinations by skill type:

| Skill Type | Recommended Tools |
|------------|-------------------|
| Search/Query | `mcp__*`, `Grep`, `Glob` |
| File Creation | `Read`, `Write`, `Bash` |
| Configuration | `Read`, `Write`, `Edit`, `Glob` |
| Code Review | `Read`, `Grep`, `Glob` |
| Build/Test | `Bash`, `Read` |
| Workflow | `Read`, `Write`, `Glob`, `Grep`, `Bash` |

## Post-Creation Steps

After creating the skill:

1. **Validate the SKILL.md:**

   ```bash
   ./scripts/validate-skills.sh
   ```

2. **Test the skill across models:**
   - Invoke it manually: `/{skill-name}`
   - Test auto-invocation by describing the task naturally
   - Test with Haiku to ensure instructions are explicit enough

3. **Add to a plugin bundle (optional):**
   - Update `marketplace.json` to include the skill in a plugin
   - Or create a new plugin if it's part of a new category

4. **Document the skill:**
   - Add to category README if exists
   - Update main README skill table

## Final Validation Checklist

Before completing skill creation, copy and verify:

```markdown
### Metadata
- [ ] Name follows spec (max 64 chars, kebab-case, gerund form)
- [ ] Name has no consecutive hyphens
- [ ] Name doesn't start/end with hyphen
- [ ] Description is third person (no "I" or "you")
- [ ] Description is under 1024 characters
- [ ] Description includes "Use when" trigger phrase

### Content
- [ ] SKILL.md is under 500 lines
- [ ] Has clear "Your Task" section
- [ ] Examples demonstrate usage
- [ ] Error handling section exists
- [ ] Validation checklist included

### Structure
- [ ] File references are one level deep
- [ ] Large content split into references/
- [ ] Scripts in scripts/ directory

### Testing
- [ ] Works with explicit invocation
- [ ] Works with auto-invocation
- [ ] Tested with target model(s)
```

## Tips

- Start with a minimal skill and iterate based on testing
- Use gerund naming for clarity: `reviewing-code` not `code-reviewer`
- Write descriptions in third person from the start
- Test auto-invocation by describing tasks naturally
- Include real-world examples from actual usage
- Add error handling for common failure modes
- Provide fallback options when tools aren't available
- Keep the skill focused on one thing done well
- Split large skills using progressive disclosure
- Test with Haiku to ensure instructions are explicit enough
