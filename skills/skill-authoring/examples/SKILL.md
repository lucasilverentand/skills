---
name: skill-examples
description: Generates templates and examples for Claude Code skills based on skill type and purpose. Use when the user needs skill templates, example content, reference implementations, or guidance on structuring skills with progressive disclosure.
argument-hint: [skill-type]
allowed-tools:
  - Read
  - Write
  - Glob
---

# Skill Examples and Templates

Provide ready-to-use templates and examples for different types of Claude Code skills following official Anthropic patterns.

## Your Task

When the user needs skill examples or templates:

1. **Determine the skill type** from $ARGUMENTS or by asking:
   - MCP tool caller (high freedom)
   - Code generator (medium freedom)
   - Configuration manager (medium freedom)
   - Workflow orchestrator (low freedom)
   - Code analyzer (medium freedom)
   - Document processor (low freedom)

2. **Provide appropriate template:**
   - Complete SKILL.md structure with official frontmatter
   - Type-specific sections
   - Progressive disclosure examples for complex skills

3. **Explain customization:**
   - What to change for their use case
   - Required vs optional sections
   - Best practices for the template type
   - Degrees of freedom considerations

---

## Official Frontmatter Specification

All skills must use these exact constraints:

### Name Field Rules

| Rule | Description | Example |
|------|-------------|---------|
| Max length | 64 characters | `processing-pdfs` |
| Characters | Lowercase letters, numbers, hyphens only | `api-client-v2` |
| No start/end hyphen | Cannot begin or end with hyphen | `my-skill` not `-my-skill-` |
| No consecutive hyphens | Single hyphens only | `my-skill` not `my--skill` |
| Gerund form | Use -ing verbs when applicable | `analyzing-code`, `generating-reports` |

### Description Field Rules

| Rule | Description |
|------|-------------|
| Max length | 1024 characters |
| Voice | Third person (not "I" or "You") |
| Content | Must include BOTH what it does AND when to use it |
| Keywords | Include terms users might mention |
| Trigger | End with "Use when..." clause |

### Good Description Examples

```yaml
# Third person, what + when, specific keywords
description: Searches for devenv packages and configuration options. Use when finding or discovering available devenv packages, languages, or services.

description: Generates TypeScript API clients from OpenAPI specifications. Use when creating type-safe HTTP clients, integrating with REST APIs, or scaffolding SDK code.

description: Analyzes code for security vulnerabilities and best practice violations. Use when reviewing pull requests, auditing code quality, or performing security assessments.
```

### Bad Description Examples

```yaml
# First person - WRONG
description: I help you search for packages.

# No trigger - WRONG
description: Searches for packages.

# Too vague - WRONG
description: Helps with development tasks. Use when developing.

# Second person - WRONG
description: You can use this to find packages.
```

---

## Progressive Disclosure Architecture

Skills use three-level progressive disclosure to optimize token usage:

```
Level 1 (Metadata): ~100 tokens - name/description loaded at startup
Level 2 (Instructions): <5000 tokens - SKILL.md body loaded when triggered
Level 3 (Resources): Unlimited - bundled files loaded only as needed
```

### Skill Directory Structure

```
skill-name/
├── SKILL.md              # Main instructions (required, <500 lines)
├── references/           # Additional docs loaded on-demand
│   ├── REFERENCE.md      # Domain knowledge, specifications
│   ├── EXAMPLES.md       # Extended examples collection
│   └── FORMS.md          # Form templates, schemas
├── scripts/              # Executable helper code
│   ├── validator.py      # Validation scripts
│   └── generator.sh      # Generation scripts
└── assets/               # Static resources
    ├── template.json     # Configuration templates
    └── schema.yaml       # Validation schemas
```

### When to Use Reference Files

| Scenario | Solution |
|----------|----------|
| SKILL.md exceeds 500 lines | Split into SKILL.md + references/ |
| Domain-specific knowledge | Put in references/REFERENCE.md |
| Many examples needed | Put in references/EXAMPLES.md |
| Complex forms/templates | Put in references/FORMS.md |
| Executable logic | Put in scripts/ directory |
| Static data files | Put in assets/ directory |

### Reference File Pattern

**SKILL.md (main file):**

```markdown
## Domain Reference

For detailed specifications and domain knowledge, read:
- `references/REFERENCE.md` - Complete API specifications
- `references/EXAMPLES.md` - Extended code examples

Only read these files when you need the specific information.
```

**references/REFERENCE.md (100+ lines should have TOC):**

```markdown
# API Reference

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Error Codes](#error-codes)
4. [Rate Limits](#rate-limits)

---

## Authentication

{detailed content}

## Endpoints

{detailed content}
```

---

## Degrees of Freedom Pattern

Match instruction specificity to task fragility:

| Freedom Level | When to Use | Instruction Style |
|---------------|-------------|-------------------|
| **High** | Flexible, creative tasks | Text instructions, guidelines |
| **Medium** | Structured tasks with options | Pseudocode, decision trees |
| **Low** | Fragile, exact operations | Exact scripts, precise steps |

### High Freedom Example (MCP Tool Caller)

```markdown
## Your Task

Search for packages matching the user's query. Present results clearly
with descriptions and usage examples. Suggest related packages when helpful.
```

### Medium Freedom Example (Code Generator)

```markdown
## Your Task

1. Check existing project structure
2. Determine appropriate template based on:
   - If package.json exists -> use Node.js template
   - If pyproject.toml exists -> use Python template
   - Otherwise -> ask user preference
3. Generate files following the template
4. Validate syntax before completing
```

### Low Freedom Example (Document Processor)

```markdown
## Your Task

Execute these steps exactly:

1. Read the input file using the Read tool
2. Run the validator script:
   ```bash
   python scripts/validator.py "$INPUT_FILE"
   ```

3. If validation fails, fix errors and repeat step 2
4. Generate output using exact format in references/FORMS.md
5. Write output file and verify it exists

```

---

## Skill Type Templates

### 1. MCP Tool Caller (High Freedom)

For skills that invoke MCP server tools (search, query, API calls).

```yaml
---
name: searching-{service}
description: Searches {service} for {what} and presents formatted results. Use when the user wants to find, discover, or query {service} resources.
argument-hint: [query]
allowed-tools:
  - mcp__{server}__tool_name
  - mcp__{server}__other_tool
---

# Searching {Service}

Searches {service} and presents results with context and usage examples.

## Degrees of Freedom: HIGH

This skill handles flexible search queries. Interpret user intent and
provide helpful results even for ambiguous queries.

## Your Task

When the user provides a query in $ARGUMENTS:

1. **Parse the query:**
   - Extract search terms and intent
   - Identify any filters or options
   - Handle empty input gracefully

2. **Call the appropriate MCP tool:**
   - Use `mcp__{server}__tool_name` for {purpose}
   - Use `mcp__{server}__other_tool` for {other purpose}

3. **Present results:**
   - Format output clearly with descriptions
   - Highlight most relevant items
   - Provide usage examples for top results

4. **Handle edge cases:**
   - No results: suggest alternative queries
   - Too many results: offer to filter
   - Errors: explain and suggest fixes

## Examples

### Basic Search

```text
User: /searching-{service} authentication
You: [Call mcp__{server}__tool_name with query "authentication"]

Found 5 packages for "authentication":

1. **oauth2-client** - OAuth 2.0 client library
   Usage: `npm install oauth2-client`

2. **jwt-validator** - JWT token validation
   Usage: `npm install jwt-validator`

Related searches: authorization, tokens, session
```

### No Results

```text
User: /searching-{service} nonexistent-thing
You: No results found for "nonexistent-thing".

Try:
- Broader terms: "thing" or "related-concept"
- Check spelling
- Use different keywords

Popular searches in this category:
- common-term-1
- common-term-2
```

## Error Handling

| Scenario | Response |
|----------|----------|
| Empty query | Show usage examples and popular searches |
| MCP unavailable | Note the issue, suggest manual alternatives |
| Ambiguous results | Group by category, explain each group |

```

---

### 2. Code Generator (Medium Freedom)

For skills that create or scaffold code with validation loops.

```yaml
---
name: generating-{framework}-{component}
description: Generates {component} code for {framework} projects with validation. Use when creating new {components}, scaffolding {framework} structure, or adding {feature type} to projects.
argument-hint: [name] [options]
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# Generating {Framework} {Component}

Creates {component} code following {framework} best practices with automatic validation.

## Degrees of Freedom: MEDIUM

Follow the structured workflow but adapt templates to user's specific needs
and existing project conventions.

## Your Task

Help the user generate {component} by:

1. **Check existing setup:**
   - Look for existing {relevant files}
   - Detect project configuration
   - Identify naming conventions in use

2. **Gather requirements:**
   - From $ARGUMENTS if provided
   - Ask for missing critical info only
   - Use sensible defaults otherwise

3. **Generate code:**
   - Create files using templates below
   - Follow {framework} best practices
   - Match existing code style

4. **Validate and fix:**
   - Run syntax validation
   - Fix any errors found
   - Repeat until validation passes

5. **Guide next steps:**
   - Explain what was created
   - Show how to use/test it

## Task Progress Checklist

Copy and track progress:

```

Task Progress:

- [ ] Step 1: Check existing project structure
- [ ] Step 2: Gather requirements from user
- [ ] Step 3: Generate code files
- [ ] Step 4: Validate syntax (run validator)
- [ ] Step 5: Fix any errors and re-validate
- [ ] Step 6: Confirm completion with user

```

## Pre-Creation Checks

```bash
# Check for existing project
ls {config-file} 2>/dev/null

# Check for conflicts
ls {output-directory}/ 2>/dev/null
```

If already exists, ask user: replace, augment, or cancel?

## Templates

### Basic Template

```{language}
// {Description}
// Generated by generating-{framework}-{component}

{template code with clear placeholders}

// Usage:
// {how to use this code}
```

### With Options Template

```{language}
// {Description}
// Options: {list of variations}

{extended template with conditional sections}
```

## Validation Loop

After generation, run validation and fix errors:

```bash
# Step 1: Run validator
{syntax-check-command}

# Step 2: If errors, fix and repeat
# Common fixes:
# - Missing imports: add required imports
# - Type errors: correct type annotations
# - Syntax errors: fix brackets, semicolons
```

**Validation loop pattern:**

1. Run validator
2. If errors found:
   - Read error message
   - Apply fix
   - Run validator again
3. Repeat until validation passes
4. Only then consider task complete

## Output Structure

```
{project-name}/
├── {main-file}         # {description}
├── {config-file}       # {description}
└── {directory}/
    └── {file}          # {description}
```

## Error Handling

| Issue | Solution |
|-------|----------|
| Directory not empty | Offer to merge, subdirectory, or backup+replace |
| Missing dependencies | Provide installation command |
| Invalid name | Sanitize: `my project` -> `my-project`, warn user |
| Validation fails | Fix errors, re-run validation |

```

---

### 3. Configuration Manager (Medium Freedom)

For skills that modify configuration files with validation.

```yaml
---
name: configuring-{tool}
description: Configures {tool} by modifying settings and validating changes. Use when the user wants to change {tool} settings, add features, or customize behavior.
argument-hint: [setting] [value]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Configuring {Tool}

Manages {tool} configuration with validation and safe updates.

## Degrees of Freedom: MEDIUM

Follow structured validation but adapt to user's specific configuration
needs and existing settings.

## Your Task

Help the user configure {tool} by:

1. **Locate configuration:**
   - Find existing config: `{config-paths}`
   - Create if doesn't exist
   - Detect format (YAML/JSON/TOML)

2. **Understand current state:**
   - Read existing configuration
   - Identify current settings
   - Note any potential conflicts

3. **Apply changes:**
   - Parse requested changes from $ARGUMENTS
   - Validate before applying
   - Make targeted edits (preserve other settings)

4. **Validate and fix:**
   - Check config syntax
   - Test configuration loads
   - Fix errors and repeat if needed

## Task Progress Checklist

```

Task Progress:

- [ ] Step 1: Locate configuration file
- [ ] Step 2: Read and understand current config
- [ ] Step 3: Plan changes (show user)
- [ ] Step 4: Apply changes
- [ ] Step 5: Validate syntax
- [ ] Step 6: Test configuration loads
- [ ] Step 7: Confirm with user

```

## Configuration Locations

| Platform | Path |
|----------|------|
| Default | `{default-path}` |
| Project | `./{config-name}` |
| User | `~/.config/{tool}/{config-name}` |

## Supported Settings

### Category 1

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `setting.name` | string | `"default"` | What it controls |
| `setting.enabled` | bool | `false` | Enable feature |

## Configuration Templates

### Minimal Configuration

```{format}
# Minimal {tool} configuration
{minimal settings}
```

### Recommended Configuration

```{format}
# Recommended {tool} configuration
# Includes common best practices

{recommended settings with comments}
```

## Validation Loop

After every configuration change:

```bash
# Step 1: Validate syntax
{validation-command}

# Step 2: Test configuration loads
{test-command}

# Step 3: Verify setting took effect
{verification-command}
```

If validation fails:

1. Read error message carefully
2. Identify the problematic setting
3. Fix the issue
4. Run validation again
5. Repeat until all checks pass

## Error Handling

| Issue | Solution |
|-------|----------|
| Config not found | Ask user which location, create with template |
| Invalid syntax | Identify error location, suggest fix |
| Conflicting settings | Explain conflict, ask which to keep |
| Unknown setting | Search for similar, suggest alternatives |

```

---

### 4. Workflow Orchestrator (Low Freedom)

For skills that guide multi-step processes with exact steps.

```yaml
---
name: {workflow-name}
description: Guides through {process description} with step-by-step validation. Use when {starting new project, setting up environment, performing complex multi-step task}.
argument-hint: [project-type]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# {Workflow Name}

Guides through {process} with validation at each step.

## Degrees of Freedom: LOW

Follow the exact workflow steps. Each phase must complete and validate
before proceeding to the next.

## Your Task

Guide the user through {process} following these exact phases:

1. **Assessment Phase:** Understand current state
2. **Planning Phase:** Determine approach, get confirmation
3. **Execution Phase:** Perform steps with validation
4. **Verification Phase:** Test and document results

## Task Progress Checklist

Copy this checklist and update as you complete each step:

```

Workflow Progress:
=================

Phase 1: Assessment

- [ ] Check prerequisites installed
- [ ] Examine current project state
- [ ] Identify requirements

Phase 2: Planning

- [ ] Determine workflow option (A/B/C)
- [ ] Present plan to user
- [ ] Get user confirmation to proceed

Phase 3: Execution

- [ ] Step 3.1: {description}
- [ ] Step 3.2: {description}
- [ ] Step 3.3: {description}
- [ ] Each step validated before next

Phase 4: Verification

- [ ] Run completeness check
- [ ] Run functional test
- [ ] Document what was done
- [ ] Provide next steps

Status: [ ] NOT STARTED / [ ] IN PROGRESS / [ ] COMPLETE

```

## Phase 1: Assessment

### Pre-Checks (Execute Exactly)

```bash
# Check prerequisites
{prerequisite-check-command-1}
{prerequisite-check-command-2}

# Check current state
ls -la {relevant-files} 2>/dev/null
```

### Requirements Gathering

From $ARGUMENTS or by asking:

- {requirement 1}: {how to determine}
- {requirement 2}: {how to determine}
- {requirement 3}: {how to determine}

### Context Detection

```
Existing files indicate:
├── {file-1} exists → {project type 1}
├── {file-2} exists → {project type 2}
└── Neither → Ask user explicitly
```

## Phase 2: Planning

### Decision Tree

```
Project Type?
├── Type A (detected by {indicator})
│   └── Use Workflow Option A
├── Type B (detected by {indicator})
│   └── Use Workflow Option B
└── Unknown
    └── Ask user to choose
```

### Workflow Option A

**Conditions:** {when to use}

**Steps:**

1. {exact step}
2. {exact step}
3. {exact step}

### Workflow Option B

**Conditions:** {when to use}

**Steps:**

1. {exact step}
2. {exact step}

**IMPORTANT:** Present the plan to user and get explicit confirmation before proceeding to Phase 3.

## Phase 3: Execution

### Step 3.1: {Step Name}

**Action:**

```bash
{exact commands to run}
```

**Validation:**

```bash
# Verify step completed
{verification-command}
# Expected: {expected output}
```

**If validation fails:**

1. Check error message
2. Apply fix: {common fix}
3. Re-run validation
4. Only proceed when validation passes

### Step 3.2: {Step Name}

**Depends on:** Step 3.1 must pass validation

**Action:**

```bash
{exact commands}
```

**Validation:**

```bash
{verification-command}
```

### Step 3.3: {Step Name}

{Continue pattern - every step has action + validation}

## Phase 4: Verification

### Completeness Check

Run these checks and mark results:

```bash
# Check 1: {description}
{check-command-1}

# Check 2: {description}
{check-command-2}

# Check 3: {description}
{check-command-3}
```

### Functional Test

```bash
# Test the complete result
{test-command}

# Expected output:
# {expected output description}
```

### Documentation

Summarize to user:

- **Created:** {list files/resources}
- **Configured:** {list settings}
- **Enabled:** {list features}
- **Next steps:** {what to do next}

## Error Recovery

### Checkpoint System

After each phase, the workflow state is:

- Phase 1 complete: {how to detect}
- Phase 2 complete: {how to detect}
- Phase 3 complete: {how to detect}

### Recovery from Interruption

If workflow was interrupted:

1. Run checkpoint detection
2. Resume from last successful phase
3. Re-validate before proceeding

### Rollback (If Requested)

```bash
# Undo changes in reverse order
{rollback-command-3}
{rollback-command-2}
{rollback-command-1}

# Verify clean state
{verify-clean-command}
```

```

---

### 5. Code Analyzer (Medium Freedom)

For skills that analyze or review code.

```yaml
---
name: analyzing-{type}
description: Analyzes code for {focus area} and provides actionable findings. Use when reviewing code quality, auditing security, checking performance, or examining {specific aspect}.
argument-hint: [file-or-directory]
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Analyzing {Type}

Analyzes code for {focus area} with categorized findings and fixes.

## Degrees of Freedom: MEDIUM

Apply analysis rules consistently but adapt reporting to the codebase
size and user's apparent priorities.

## Your Task

Analyze the specified code for {focus area}:

1. **Locate code to analyze:**
   - From $ARGUMENTS (file or directory path)
   - Current directory if not specified
   - Support glob patterns for multiple files

2. **Perform analysis:**
   - Check for {issue type 1}
   - Check for {issue type 2}
   - Check for {issue type 3}

3. **Report findings:**
   - Use consistent severity format
   - Provide actionable fixes
   - Summarize at the end

## Task Progress Checklist

```

Analysis Progress:

- [ ] Step 1: Locate and list files to analyze
- [ ] Step 2: Read each file
- [ ] Step 3: Check for Category 1 issues
- [ ] Step 4: Check for Category 2 issues
- [ ] Step 5: Check for Category 3 issues
- [ ] Step 6: Generate findings report
- [ ] Step 7: Generate summary

```

## Analysis Categories

### Category 1: {Name}

**What to check:**
- {specific pattern or issue}
- {specific pattern or issue}
- {specific pattern or issue}

**Severity indicators:**
- Critical: {conditions that make it critical}
- High: {conditions}
- Medium: {conditions}

### Category 2: {Name}

**What to check:**
- {specific pattern}
- {specific pattern}

## Severity Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| CRITICAL | {description} | Immediate fix required |
| HIGH | {description} | Fix before merge/deploy |
| MEDIUM | {description} | Should fix soon |
| LOW | {description} | Consider fixing |
| INFO | {description} | Informational only |

## Output Format

### Individual Finding

```

[{SEVERITY}] {Issue Title}
  File: {file-path}:{line-number}
  Issue: {what's wrong}
  Why: {impact/risk}
  Fix: {how to resolve}

  {code snippet showing the issue, max 5 lines}

```

### Summary Report

```

Analysis Summary: {target}
========================

Files analyzed: {count}
Total findings: {count}

By Severity:

- CRITICAL: {count}
- HIGH: {count}
- MEDIUM: {count}
- LOW: {count}
- INFO: {count}

Top Issues:

1. {most common issue} ({count} occurrences)
2. {second most common} ({count} occurrences)

Priority Actions:

1. {highest priority fix}
2. {second priority fix}

```

## Common Patterns to Detect

### Pattern 1: {Issue Name}

**Indicator:** {regex or description}

```{language}
// Bad - {why it's bad}
{problematic code}

// Good - {why it's better}
{correct code}
```

### Pattern 2: {Issue Name}

**Indicator:** {regex or description}

```{language}
// Bad
{problematic code}

// Good
{correct code}
```

## Error Handling

| Issue | Response |
|-------|----------|
| File not found | Report which files couldn't be read |
| Binary file | Skip with note, don't analyze |
| Very large file | Analyze first 1000 lines, note truncation |
| No issues found | Confirm clean analysis, suggest deeper checks |

```

---

### 6. Document Processor (Low Freedom)

For skills that process documents with exact formatting requirements.

```yaml
---
name: processing-{document-type}
description: Processes {document type} files extracting content and generating structured output. Use when the user needs to extract data from {document type}, convert {document type} to other formats, or analyze {document type} content.
argument-hint: [file-path]
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---

# Processing {Document Type}

Processes {document type} files with exact extraction and formatting.

## Degrees of Freedom: LOW

Follow the exact processing steps. Document formats are fragile -
use precise extraction patterns.

## Your Task

Process the {document type} file by executing these exact steps:

1. **Validate input file**
2. **Extract content using specified method**
3. **Validate extraction succeeded**
4. **Transform to output format**
5. **Validate output**
6. **Write result**

## Task Progress Checklist

```

Processing Progress:

- [ ] Step 1: Validate input file exists and is readable
- [ ] Step 2: Extract content (method: {method})
- [ ] Step 3: Validate extraction (check for empty/corrupt)
- [ ] Step 4: Transform to output format
- [ ] Step 5: Validate output format
- [ ] Step 6: Write output file
- [ ] Step 7: Verify output file exists

```

## Step 1: Validate Input

```bash
# Check file exists
test -f "$INPUT_FILE" || echo "ERROR: File not found"

# Check file is readable
test -r "$INPUT_FILE" || echo "ERROR: File not readable"

# Check file type (optional)
file "$INPUT_FILE"
```

**Expected:** File exists, is readable, matches expected type.

**If fails:** Report error to user, do not proceed.

## Step 2: Extract Content

For {document type}, use this exact extraction method:

```bash
# Extraction command
{exact-extraction-command}
```

OR for reading with Claude:

```
Read the file at $INPUT_FILE.
Extract the following elements:
- {element 1}: {how to identify}
- {element 2}: {how to identify}
- {element 3}: {how to identify}
```

## Step 3: Validate Extraction

Check that extraction produced valid content:

```bash
# Check output is not empty
test -s "$EXTRACTED_CONTENT" || echo "ERROR: Extraction produced empty output"

# Check for corruption indicators
grep -q "{corruption-pattern}" "$EXTRACTED_CONTENT" && echo "WARNING: Possible corruption"
```

**If validation fails:**

1. Report extraction error
2. Try alternative extraction method if available
3. Ask user for guidance if both fail

## Step 4: Transform to Output Format

Apply exact transformation:

```
Transform the extracted content to {output format}:

Required structure:
{
  "field1": "{extracted element 1}",
  "field2": "{extracted element 2}",
  "metadata": {
    "source": "{input filename}",
    "processed": "{timestamp}"
  }
}
```

## Step 5: Validate Output

```bash
# For JSON output
{json-validation-command}

# For other formats
{format-specific-validation}
```

**Validation loop:**

1. Run validator
2. If errors, fix and re-validate
3. Repeat until valid
4. Only proceed when validation passes

## Step 6: Write Result

```bash
# Write to output file
{write-command}

# Verify file was written
test -f "$OUTPUT_FILE" && echo "SUCCESS: Output written to $OUTPUT_FILE"
```

## Visual Content Analysis

If the document contains visual elements (images, diagrams, charts):

1. **Read the file using the Read tool** - Claude can analyze images directly
2. **Describe visual content:**
   - Charts: Extract data points, trends, labels
   - Diagrams: Describe structure, relationships
   - Images: Describe relevant content
3. **Include in output:**
   - `visual_elements` array with descriptions
   - Reference to original location in document

## Script Integration

For complex extraction, use bundled scripts:

### Execute Script (Produces Output)

```bash
# Run extraction script
python scripts/extractor.py "$INPUT_FILE" --output "$OUTPUT_FILE"

# Check script exit code
if [ $? -ne 0 ]; then
  echo "ERROR: Extraction script failed"
fi
```

### Read Script as Reference

Some scripts are reference implementations, not for execution:

```
Read `scripts/extractor.py` to understand the extraction logic,
then implement equivalent extraction using available tools.
```

## Output Templates

### Standard Output Format

```json
{
  "source": {
    "filename": "{original filename}",
    "type": "{document type}",
    "processed_at": "{ISO timestamp}"
  },
  "content": {
    "extracted_field_1": "{value}",
    "extracted_field_2": "{value}"
  },
  "visual_elements": [
    {
      "type": "chart",
      "location": "page 2",
      "description": "{description}"
    }
  ],
  "metadata": {
    "extraction_method": "{method used}",
    "confidence": "{high|medium|low}"
  }
}
```

## Error Handling

| Error | Response |
|-------|----------|
| File not found | Report error, ask for correct path |
| Unsupported format | List supported formats, suggest conversion |
| Extraction failed | Try alternative method, report if all fail |
| Output validation failed | Fix errors, re-validate, report if unfixable |
| Partial extraction | Report what succeeded, what failed |

```

---

## Script Bundling Guide

### Directory Structure

```

skill-name/
├── SKILL.md
└── scripts/
    ├── validator.py       # Validation script
    ├── generator.sh       # Generation script
    └── README.md          # Script documentation

```

### Execute vs Read Scripts

**Execute Script (Run it):**

```markdown
## Validation

Run the validation script:

```bash
python scripts/validator.py "$INPUT_FILE"
```

Check exit code: 0 = success, non-zero = errors found.

```

**Read Script (Reference only):**

```markdown
## Implementation Reference

Read `scripts/algorithm.py` for the reference implementation.
Implement equivalent logic using available tools.

Do NOT execute this script directly - it's for understanding the algorithm.
```

### Script Best Practices

1. **Include shebang:** `#!/usr/bin/env python3`
2. **Handle errors:** Exit with non-zero on failure
3. **Accept arguments:** File paths, options as CLI args
4. **Output to stdout:** Or accept --output flag
5. **Document usage:** In script header or scripts/README.md

---

## Reference File Guide

### When to Create Reference Files

| Condition | Action |
|-----------|--------|
| SKILL.md > 500 lines | Split content to references/ |
| Many code examples | Create references/EXAMPLES.md |
| Domain specifications | Create references/REFERENCE.md |
| Form templates | Create references/FORMS.md |
| Complex schemas | Create references/SCHEMAS.md |

### Reference File Structure

**references/REFERENCE.md:**

```markdown
# {Domain} Reference

## Table of Contents

1. [Section 1](#section-1)
2. [Section 2](#section-2)
3. [Section 3](#section-3)

---

## Section 1

{Detailed content - specifications, rules, constraints}

## Section 2

{More detailed content}
```

**references/EXAMPLES.md:**

```markdown
# Examples Collection

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Advanced Examples](#advanced-examples)
3. [Edge Cases](#edge-cases)

---

## Basic Examples

### Example 1: {Name}

{Complete working example with explanation}

### Example 2: {Name}

{Complete working example}
```

### Referencing from SKILL.md

```markdown
## Extended Documentation

For detailed specifications, read `references/REFERENCE.md`.
For additional examples, read `references/EXAMPLES.md`.

Only read these files when you need the specific information they contain.
```

---

## Choosing the Right Template

| If the skill needs to... | Template | Freedom |
|--------------------------|----------|---------|
| Call MCP or external APIs | MCP Tool Caller | High |
| Create files or projects | Code Generator | Medium |
| Modify config files | Configuration Manager | Medium |
| Guide multi-step processes | Workflow Orchestrator | Low |
| Review or analyze code | Code Analyzer | Medium |
| Process documents/files | Document Processor | Low |
| Combine multiple concerns | Start with Workflow | Low |

## Template Customization

For any template:

1. **Replace all `{placeholders}`** with actual values
2. **Update name** to follow gerund convention (processing-, generating-, analyzing-)
3. **Write description** in third person with "Use when" trigger
4. **Remove sections** that don't apply to your use case
5. **Add sections** specific to your domain
6. **Update examples** with realistic scenarios from actual usage
7. **Adjust degrees of freedom** based on task fragility
8. **Add reference files** if SKILL.md exceeds 500 lines

## Validation Checklist

After creating a skill from a template:

- [ ] Name follows spec (max 64 chars, lowercase/numbers/hyphens, no --,  no start/end -)
- [ ] Name uses gerund form where applicable
- [ ] Description is third person (not "I" or "You")
- [ ] Description includes both what AND when
- [ ] Description under 1024 characters
- [ ] SKILL.md under 500 lines (or split to references/)
- [ ] Includes "Your Task" section with clear steps
- [ ] Includes Task Progress Checklist for tracking
- [ ] Examples are realistic and tested
- [ ] Error handling covers likely scenarios
- [ ] Validation loop pattern included where applicable
- [ ] Reference files have table of contents if 100+ lines
- [ ] Run `/skill-validate` to verify
