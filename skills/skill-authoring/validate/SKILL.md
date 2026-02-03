---
name: skill-validate
description: Validates Claude Code SKILL.md files against official specification rules for correctness, naming conventions, progressive disclosure, and best practices. Use when checking skill quality before publishing, debugging skill loading issues, or auditing skill compliance.
argument-hint: [skill-path]
allowed-tools: Read Glob Grep Bash
---

# Skill Validation

Validates skill files against the official Agent Skills specification for correctness, completeness, and best practices compliance.

## Your Task

When validating a skill (from $ARGUMENTS or current directory):

1. **Locate the skill file** - Find and read the SKILL.md
2. **Parse and validate frontmatter** - Check all YAML fields against spec
3. **Validate content structure** - Check sections and formatting
4. **Check progressive disclosure** - Verify token budgets
5. **Validate file references** - Check bundled file organization
6. **Generate validation report** - Report all findings with fixes

## Validation Rules

### 1. Name Field Validation (CRITICAL)

The `name` field must comply with official specification:

| Rule | Regex/Check | Example Fix |
|------|-------------|-------------|
| Max 64 characters | `len(name) <= 64` | Shorten name |
| Lowercase only | `/^[a-z0-9-]+$/` | `MySkill` → `my-skill` |
| No start hyphen | `/^[^-]/` | `-my-skill` → `my-skill` |
| No end hyphen | `/[^-]$/` | `my-skill-` → `my-skill` |
| No consecutive hyphens | `/^(?!.*--)/` | `my--skill` → `my-skill` |
| Matches directory | `name == parent_dir` | Rename skill or directory |
| Gerund recommended | Ends in `-ing` pattern | `pdf-process` → `processing-pdfs` |

**Check command:**

```bash
# Extract name and validate
NAME=$(grep -m1 '^name:' SKILL.md | sed 's/name: *//')
DIR_NAME=$(basename "$(dirname "$PWD")")

# Length check
[ ${#NAME} -le 64 ] || echo "FAIL: Name exceeds 64 characters"

# Pattern check
echo "$NAME" | grep -qE '^[a-z][a-z0-9]*(-[a-z0-9]+)*$' || echo "FAIL: Invalid name format"

# Directory match check
[ "$NAME" = "$DIR_NAME" ] || echo "WARN: Name doesn't match directory"
```

### 2. Description Field Validation (CRITICAL)

The `description` field is critical for skill discovery:

| Rule | Check | Severity |
|------|-------|----------|
| Non-empty | `len(description) > 0` | CRITICAL |
| Max 1024 characters | `len(description) <= 1024` | CRITICAL |
| Third person voice | Not starting with "I " or "You " | HIGH |
| Contains action verb | Starts with verb phrase | HIGH |
| Contains trigger phrase | Has "Use when" or "when" clause | HIGH |
| Contains keywords | Has searchable terms | MEDIUM |

**Third-person check:**

```bash
DESC=$(grep -m1 '^description:' SKILL.md | sed 's/description: *//')

# Check for first/second person at start
echo "$DESC" | grep -qiE '^(I |I'"'"'|You |Your )' && echo "FAIL: Description must be third person"

# Good: "Validates skill files..."
# Bad: "I validate skill files..." or "You can validate..."
```

**Quality indicators:**

- Good: "Validates Claude Code SKILL.md files for correctness. Use when checking skill quality or debugging issues."
- Bad: "Helps with skills" (too vague)
- Bad: "I can validate your skills" (first person)

### 3. File Size Validation (HIGH)

Progressive disclosure requires size limits:

| Check | Limit | Severity | Action |
|-------|-------|----------|--------|
| SKILL.md line count | < 500 lines | HIGH | Split into reference files |
| SKILL.md approaching limit | > 400 lines | WARN | Consider splitting |
| Estimated token count | < 5000 tokens | HIGH | Move details to references |

**Check command:**

```bash
LINE_COUNT=$(wc -l < SKILL.md)
[ "$LINE_COUNT" -lt 500 ] || echo "FAIL: SKILL.md exceeds 500 lines ($LINE_COUNT)"
[ "$LINE_COUNT" -lt 400 ] || echo "WARN: SKILL.md approaching line limit ($LINE_COUNT)"

# Rough token estimate (words / 0.75)
WORD_COUNT=$(wc -w < SKILL.md)
TOKEN_EST=$((WORD_COUNT * 4 / 3))
[ "$TOKEN_EST" -lt 5000 ] || echo "WARN: Estimated $TOKEN_EST tokens exceeds 5000 recommendation"
```

### 4. File Reference Validation (MEDIUM)

Bundled files should follow organization rules:

| Rule | Check | Fix |
|------|-------|-----|
| One level deep | References from SKILL.md only | Flatten reference chain |
| No deep nesting | No reference-to-reference chains | Move to direct reference |
| Large files have TOC | Files > 100 lines have navigation | Add table of contents |
| Valid paths | All referenced files exist | Fix paths or create files |

**Check for reference files:**

```bash
# Find file references in SKILL.md
grep -oE '\[.*\]\([^)]+\.(md|txt|json|yaml)\)' SKILL.md | while read -r ref; do
  FILE=$(echo "$ref" | sed 's/.*(\([^)]*\))/\1/')
  [ -f "$FILE" ] || echo "FAIL: Referenced file not found: $FILE"

  # Check if reference file itself has references (nesting)
  if [ -f "$FILE" ]; then
    NESTED=$(grep -c '\[.*\]([^)]*\.md)' "$FILE" 2>/dev/null || echo 0)
    [ "$NESTED" -gt 0 ] && echo "WARN: Nested reference in $FILE (depth > 1)"
  fi
done
```

**For files over 100 lines:**

```bash
# Check reference files for TOC
find . -name "*.md" -not -name "SKILL.md" | while read -r file; do
  LINES=$(wc -l < "$file")
  if [ "$LINES" -gt 100 ]; then
    grep -q '## Table of Contents\|## Contents\|## TOC' "$file" || \
      echo "WARN: $file ($LINES lines) should have table of contents"
  fi
done
```

### 5. Progressive Disclosure Validation (MEDIUM)

Check token budgets at each level:

| Level | Content | Token Budget | Check |
|-------|---------|--------------|-------|
| Metadata | name + description | ~100 tokens | Combined < 150 words |
| Instructions | SKILL.md body | < 5000 tokens | Word count < 3750 |
| Resources | Reference files | Unlimited | Loaded on-demand only |

**Validation:**

```bash
# Level 1: Metadata (~100 tokens)
NAME=$(grep -m1 '^name:' SKILL.md | sed 's/name: *//')
DESC=$(grep -m1 '^description:' SKILL.md | sed 's/description: *//')
META_WORDS=$(echo "$NAME $DESC" | wc -w)
[ "$META_WORDS" -lt 150 ] || echo "WARN: Metadata too long ($META_WORDS words, target ~75)"

# Level 2: Body (< 5000 tokens)
BODY_WORDS=$(sed -n '/^---$/,/^---$/!p' SKILL.md | wc -w)
[ "$BODY_WORDS" -lt 3750 ] || echo "WARN: Body too long ($BODY_WORDS words, target < 3750)"
```

### 6. Allowed-Tools Validation (MEDIUM)

The `allowed-tools` field restricts which tools the skill can use:

| Format | Check | Fix |
|--------|-------|-----|
| Space-delimited string | Single line, space-separated | `allowed-tools: Read Glob Grep` |
| YAML array | List format with `-` | Convert to space-delimited |
| Valid tool names | Known tool identifiers | Check tool name spelling |

**Valid tool names:**

- `Read`, `Write`, `Edit` - File operations
- `Glob`, `Grep` - Search operations
- `Bash` - Command execution
- `WebFetch`, `WebSearch` - Web operations
- `Task` - Agent task delegation
- `mcp__*` - MCP tool patterns

**Check command:**

```bash
# Check if allowed-tools is present and valid format
TOOLS=$(grep -A1 '^allowed-tools:' SKILL.md | tail -1)
if echo "$TOOLS" | grep -q '^ *-'; then
  echo "WARN: allowed-tools uses array format, prefer space-delimited string"
fi
```

### 6b. Context Field Validation (LOW)

The `context` field controls skill execution context:

| Value | Description |
|-------|-------------|
| `main` | Runs in shared conversation context (default) |
| `fork` | Runs in isolated forked context |

**Check command:**

```bash
CONTEXT=$(grep -m1 '^context:' SKILL.md | sed 's/context: *//')
if [ -n "$CONTEXT" ] && [ "$CONTEXT" != "main" ] && [ "$CONTEXT" != "fork" ]; then
  echo "FAIL: Invalid context value '$CONTEXT' (must be 'main' or 'fork')"
fi
```

### 6c. Agent Field Validation (LOW)

The `agent` field specifies which agent type executes the skill:

| Value | Use Case |
|-------|----------|
| `general-purpose` | Complex multi-step tasks requiring all tools |
| `Explore` | Codebase exploration and research |
| `Bash` | Command execution focused tasks |
| `Plan` | Architecture and implementation planning |

**Check command:**

```bash
AGENT=$(grep -m1 '^agent:' SKILL.md | sed 's/agent: *//')
VALID_AGENTS="general-purpose Explore Bash Plan"
if [ -n "$AGENT" ] && ! echo "$VALID_AGENTS" | grep -qw "$AGENT"; then
  echo "FAIL: Invalid agent value '$AGENT' (must be one of: $VALID_AGENTS)"
fi
```

### 7. Content Structure Validation (HIGH)

Required and recommended sections:

| Section | Required | Check |
|---------|----------|-------|
| `# Title` | Yes | Has H1 heading |
| `## Your Task` | Yes | Explains what skill does |
| `## Examples` | Recommended | Has usage examples |
| `## Error Handling` | Recommended | Covers failure cases |
| `## Validation Checklist` | Recommended | Has checkbox items |

**Check command:**

```bash
grep -q '^# ' SKILL.md || echo "FAIL: Missing H1 title"
grep -q '^## Your Task' SKILL.md || echo "FAIL: Missing '## Your Task' section"
grep -q '^## Example' SKILL.md || echo "WARN: Missing examples section"
grep -q '^## Error\|^## Validation' SKILL.md || echo "WARN: Missing error handling section"
grep -q '^\- \[ \]' SKILL.md || echo "WARN: No validation checklist found"
```

## Validation Process

### Step 1: Locate and Read SKILL.md

```bash
# If path provided
if [ -n "$1" ]; then
  SKILL_FILE="$1"
# If skill name provided (no path separators)
elif [ -n "$1" ] && [ "${1#*/}" = "$1" ]; then
  SKILL_FILE=$(find skills -path "*/$1/SKILL.md" 2>/dev/null | head -1)
# Default to current directory
else
  SKILL_FILE="./SKILL.md"
fi

[ -f "$SKILL_FILE" ] || { echo "CRITICAL: SKILL.md not found"; exit 1; }
```

### Step 2: Extract Frontmatter

```bash
# Extract YAML frontmatter
FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$SKILL_FILE" | sed '1d;$d')

# Parse fields
NAME=$(echo "$FRONTMATTER" | grep -m1 '^name:' | sed 's/name: *//')
DESC=$(echo "$FRONTMATTER" | grep -m1 '^description:' | sed 's/description: *//')
HINT=$(echo "$FRONTMATTER" | grep -m1 '^argument-hint:' | sed 's/argument-hint: *//')
TOOLS=$(echo "$FRONTMATTER" | grep -m1 '^allowed-tools:' | sed 's/allowed-tools: *//')
```

### Step 3: Run All Validations

Run each validation category and collect results:

1. Name validation (Critical)
2. Description validation (Critical)
3. File size validation (High)
4. Content structure validation (High)
5. Progressive disclosure validation (Medium)
6. File reference validation (Medium)
7. Allowed-tools validation (Medium)

### Step 4: Generate Report

## Output Format

### Validation Report Structure

```text
================================================================================
                         SKILL VALIDATION REPORT
================================================================================

Skill: {skill-name}
Path:  {/full/path/to/SKILL.md}
Date:  {timestamp}

--------------------------------------------------------------------------------
                              SUMMARY
--------------------------------------------------------------------------------

Overall Status: {PASS | FAIL | WARN}

  CRITICAL:  {count} issue(s)
  HIGH:      {count} issue(s)
  MEDIUM:    {count} issue(s)
  LOW:       {count} issue(s)

--------------------------------------------------------------------------------
                              ISSUES
--------------------------------------------------------------------------------

[CRITICAL] name-format-invalid
  Line:     2
  Found:    name: My-Skill-
  Issue:    Name ends with hyphen and contains uppercase
  Fix:      name: my-skill

[CRITICAL] description-empty
  Line:     3
  Found:    description: ""
  Issue:    Description cannot be empty
  Fix:      description: "Descriptive text about what this skill does. Use when..."

[HIGH] description-first-person
  Line:     3
  Found:    description: I help you validate skills...
  Issue:    Description must be third person (no "I" or "You" at start)
  Fix:      description: Validates skill files for correctness...

[HIGH] missing-your-task-section
  Line:     N/A
  Issue:    No "## Your Task" section found
  Fix:      Add section:
            ## Your Task

            When invoked, this skill should...

[MEDIUM] file-size-warning
  Line:     N/A
  Found:    487 lines
  Issue:    SKILL.md approaching 500 line limit
  Fix:      Consider moving detailed content to reference files

[MEDIUM] allowed-tools-array-format
  Line:     5-8
  Found:    allowed-tools:
              - Read
              - Glob
  Issue:    Array format detected, prefer space-delimited
  Fix:      allowed-tools: Read Glob

[LOW] missing-argument-hint
  Line:     N/A
  Issue:    No argument-hint specified for skill that accepts arguments
  Fix:      argument-hint: [skill-path]

--------------------------------------------------------------------------------
                           COPY-PASTE FIXES
--------------------------------------------------------------------------------

Replace lines 2-3 with:
```yaml
name: my-skill
description: Validates skill files for correctness and best practices compliance. Use when checking skill quality before publishing or debugging skill issues.
```

Add after frontmatter:

```markdown
## Your Task

When validating a skill:
1. Locate and read the SKILL.md file
2. Validate all frontmatter fields
3. Check content structure
4. Report findings
```

--------------------------------------------------------------------------------
                          RECOMMENDATIONS
--------------------------------------------------------------------------------

1. Add gerund-form name for better discoverability: "validating-skills"
2. Include more specific keywords in description for discovery
3. Add examples section with sample validation runs
4. Consider adding a validation checklist with checkbox items

================================================================================

```

## Example Validation Run

```text
User: /skill-validate ./skills/skill-authoring/validate

================================================================================
                         SKILL VALIDATION REPORT
================================================================================

Skill: skill-validate
Path:  /Users/dev/skills/skill-authoring/validate/SKILL.md
Date:  2024-01-15 14:30:00

--------------------------------------------------------------------------------
                              SUMMARY
--------------------------------------------------------------------------------

Overall Status: PASS

  CRITICAL:  0 issue(s)
  HIGH:      0 issue(s)
  MEDIUM:    1 issue(s)
  LOW:       1 issue(s)

--------------------------------------------------------------------------------
                              ISSUES
--------------------------------------------------------------------------------

[MEDIUM] name-not-gerund
  Line:     2
  Found:    name: skill-validate
  Issue:    Name not in gerund form (recommended pattern)
  Fix:      Consider: validating-skills

[LOW] high-token-estimate
  Line:     N/A
  Found:    ~4200 estimated tokens
  Issue:    Body approaching 5000 token recommendation
  Fix:      Consider moving detailed examples to reference file

--------------------------------------------------------------------------------
                          RECOMMENDATIONS
--------------------------------------------------------------------------------

1. Skill passes all critical and high-severity checks
2. Consider gerund naming for consistency: validating-skills
3. Good use of progressive disclosure pattern

================================================================================
```

## Batch Validation

To validate all skills in a marketplace:

```bash
# Find and validate all skills
find skills -name "SKILL.md" -type f | while read -r skill; do
  echo "Validating: $skill"
  # Run validation (implementation depends on how skill is invoked)
done
```

### Batch Output Format

```
================================================================================
                    MARKETPLACE VALIDATION SUMMARY
================================================================================

Total Skills Scanned: 47
  Passing:  42 (89%)
  Failing:   3 (6%)
  Warnings:  2 (4%)

--------------------------------------------------------------------------------
                           FAILED SKILLS
--------------------------------------------------------------------------------

skills/broken/my-skill/SKILL.md
  [CRITICAL] Missing required 'name' field
  [CRITICAL] Invalid YAML syntax on line 4

skills/incomplete/test-skill/SKILL.md
  [CRITICAL] Description is empty

skills/invalid/Bad-Name/SKILL.md
  [CRITICAL] Name contains uppercase characters
  [CRITICAL] Name doesn't match directory

--------------------------------------------------------------------------------
                          WARNING SKILLS
--------------------------------------------------------------------------------

skills/authoring/old-skill/SKILL.md
  [HIGH] Missing "## Your Task" section
  [MEDIUM] No examples provided

skills/utilities/helper/SKILL.md
  [MEDIUM] File exceeds 400 lines (478)
  [LOW] No argument-hint specified

================================================================================
```

## Common Issues and Fixes

### Issue: Name Format Invalid

**Symptoms:** Skill doesn't load or isn't discoverable

**Validation regex:** `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`

```yaml
# Invalid names and fixes:
name: MySkill           # → name: my-skill (lowercase)
name: my_skill          # → name: my-skill (hyphens not underscores)
name: -my-skill         # → name: my-skill (no leading hyphen)
name: my-skill-         # → name: my-skill (no trailing hyphen)
name: my--skill         # → name: my-skill (no consecutive hyphens)
name: 123-skill         # → name: skill-123 (must start with letter)
```

### Issue: Description Not Third Person

**Symptoms:** Skill may still work but doesn't follow spec

```yaml
# Bad (first/second person):
description: I validate skill files for you
description: You can use this to validate skills
description: I'll help check your skills

# Good (third person):
description: Validates skill files for correctness and best practices
description: Checks SKILL.md files against official specification
description: Analyzes skill quality and provides improvement suggestions
```

### Issue: SKILL.md Too Large

**Symptoms:** Slow loading, exceeds progressive disclosure budget

**Fix:** Split into reference files:

```
skill-name/
├── SKILL.md                  # Main file (< 500 lines)
├── references/
│   ├── DETAILED-RULES.md     # Extended documentation
│   ├── EXAMPLES.md           # Comprehensive examples
│   └── TROUBLESHOOTING.md    # Error handling details
```

In SKILL.md, reference these files:

```markdown
For detailed validation rules, see [DETAILED-RULES.md](references/DETAILED-RULES.md).
```

### Issue: Deeply Nested References

**Symptoms:** Confusing navigation, hard to maintain

```
# Bad: Chain of references
SKILL.md → refs/A.md → refs/B.md → refs/C.md

# Good: Flat structure, all from SKILL.md
SKILL.md → refs/A.md
SKILL.md → refs/B.md
SKILL.md → refs/C.md
```

## Validation Checklist

Before marking validation complete:

- [ ] SKILL.md file located and read successfully
- [ ] YAML frontmatter parsed without errors
- [ ] Name field validated against all rules (64 char, lowercase, no bad hyphens)
- [ ] Name matches parent directory name
- [ ] Description is non-empty and under 1024 characters
- [ ] Description uses third-person voice
- [ ] Description contains trigger phrase ("Use when...")
- [ ] File size under 500 lines
- [ ] Token estimate under 5000 for body
- [ ] Required sections present (# Title, ## Your Task)
- [ ] File references validated (exist, not deeply nested)
- [ ] allowed-tools format checked if present
- [ ] context field valid if present (main or fork)
- [ ] agent field valid if present (general-purpose, Explore, Bash, Plan)
- [ ] Validation report generated with all findings
- [ ] Copy-paste fixes provided for each issue
- [ ] Severity levels correctly assigned

## Tips

- Run validation before committing new skills
- Critical issues must be fixed before publishing
- High issues should be fixed for quality compliance
- Medium/Low issues are recommendations for best practices
- Good descriptions are the most important factor for skill discovery
- Test skill invocation after fixing description issues
- Use batch validation for marketplace-wide audits
- Keep validation output actionable with specific line numbers and fixes
