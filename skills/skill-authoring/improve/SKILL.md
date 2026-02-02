---
name: skill-improve
description: Analyzes and enhances existing Claude Code skills for better discovery, documentation, and reliability. Use when reviewing skill quality, optimizing skill descriptions for auto-invocation, adding error handling, improving examples, or refactoring skills to follow best practices.
argument-hint: [skill-path]
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Skill Improvement

Analyze and improve existing skills to increase quality, usability, and reliability using official best practices and patterns.

## Your Task

When improving a skill (from $ARGUMENTS or by selection):

1. **Read and analyze the skill:**
   - Parse SKILL.md completely
   - Identify current strengths
   - Find improvement opportunities across all dimensions

2. **Assess against improvement criteria:**
   - Progressive disclosure architecture
   - Degrees of freedom appropriateness
   - Naming conventions
   - Description quality
   - Workflow patterns
   - Documentation clarity

3. **Propose improvements:**
   - List specific changes with rationale
   - Prioritize by impact
   - Present before/after comparisons

4. **Apply improvements (with user approval):**
   - Make targeted edits
   - Preserve existing good content
   - Add new sections as needed
   - Validate changes

## Improvement Assessment Framework

### 1. Progressive Disclosure Analysis

Skills use three-level progressive disclosure for efficient context management:

**Level 1 - Metadata (~100 tokens):**

- Name and description loaded at startup
- Must be optimized for discovery from potentially 100+ skills

**Level 2 - Instructions (<5000 tokens):**

- SKILL.md body loaded when skill triggers
- Should be under 500 lines

**Level 3 - Resources (unlimited):**

- Reference files, scripts, assets loaded only as needed
- Keeps main SKILL.md focused

**Assessment Checklist:**

- [ ] SKILL.md body is under 500 lines
- [ ] Detailed reference material is in separate files
- [ ] Examples are concise (detailed examples in references/)
- [ ] No large code blocks that could be external scripts

**Improvement Actions:**

| Issue | Improvement |
|-------|-------------|
| SKILL.md over 500 lines | Split into main instructions + references/ files |
| Large code blocks | Move to scripts/ or references/ directory |
| Exhaustive examples | Keep 2-3 inline, move rest to references/EXAMPLES.md |
| Detailed API docs | Move to references/API.md |

**File Organization Pattern:**

```
skill-name/
├── SKILL.md              # Main instructions (<500 lines)
├── references/           # Additional docs loaded on-demand
│   ├── REFERENCE.md
│   └── EXAMPLES.md
├── scripts/              # Executable code
│   └── helper.py
└── assets/               # Static resources
    └── template.json
```

### 2. Degrees of Freedom Assessment

Match skill specificity to task fragility:

**High Freedom (Flexible Tasks):**

- General guidance and principles
- Multiple valid approaches
- Example: creative writing, brainstorming, exploration

```markdown
## Your Task
Explore options and recommend an approach based on the user's needs.
Consider these factors: {list of considerations}
```

**Medium Freedom (Preferred Patterns):**

- Templates with customizable parameters
- Recommended approaches with room for adaptation
- Example: code generation, configuration, documentation

```markdown
## Your Task
Use this template, adjusting parameters for the specific case:
{template with {{PLACEHOLDERS}}}
```

**Low Freedom (Fragile Operations):**

- Exact scripts with no deviation
- Critical operations where mistakes are costly
- Example: database migrations, deployments, security configs

```markdown
## Your Task
Execute these steps EXACTLY as written:
1. Run: `{exact command}`
2. Verify output matches: `{expected output}`
3. If mismatch, STOP and report error
```

**Assessment Questions:**

- [ ] What happens if Claude deviates from instructions?
- [ ] Are there multiple valid approaches, or one correct way?
- [ ] What is the cost of mistakes?
- [ ] Does the current freedom level match the task fragility?

### 3. Naming Improvements

**Specification Requirements:**

- Max 64 characters
- Lowercase letters, numbers, hyphens only
- Cannot start or end with hyphen
- No consecutive hyphens

**Gerund Form Recommendation:**

Prefer action-oriented gerund names (verb + ing) for clarity:

| Before | After |
|--------|-------|
| `pdf-processor` | `processing-pdfs` |
| `spreadsheet-analysis` | `analyzing-spreadsheets` |
| `code-review` | `reviewing-code` |
| `git-commit` | `committing-changes` |

**Assessment Checklist:**

- [ ] Name follows spec constraints
- [ ] Name uses gerund form where appropriate
- [ ] Name clearly indicates the skill's action

### 4. Description Improvements

The description is critical for skill discovery. It must be optimized for selection from potentially 100+ available skills.

**Requirements:**

- Third-person voice (not "I can" or "You can")
- Includes BOTH what the skill does AND when to use it
- Contains specific keywords for discovery
- Under 1024 characters

**Assessment Checklist:**

- [ ] Written in third-person voice
- [ ] Starts with action verb
- [ ] Explains what the skill does
- [ ] Includes "Use when" trigger phrase
- [ ] Has specific keywords users might mention
- [ ] Is under 1024 characters
- [ ] Avoids false positive triggers

**Improvement Examples:**

```yaml
# Bad: First person
description: I can help you process PDF files

# Bad: Second person
description: You can use this to process PDFs

# Bad: Missing "when"
description: Processes and extracts content from PDF files

# Good: Third person + what + when + keywords
description: Extracts text, images, and metadata from PDF documents. Use when processing PDFs, converting PDF to text, extracting PDF images, or analyzing PDF structure.
```

**Voice Transformation Guide:**

| Before (Wrong Voice) | After (Third Person) |
|---------------------|---------------------|
| "I analyze code..." | "Analyzes code..." |
| "You can search..." | "Searches..." |
| "This skill helps..." | "Assists with..." or specific verb |
| "Use this to..." | "Performs X. Use when..." |

### 5. Workflow Pattern Improvements

Effective skills include workflow patterns that help Claude track progress and validate results.

**Copyable Checklists:**

Include checklists Claude can copy and mark as complete:

```markdown
## Progress Tracking

Copy this checklist and update as you proceed:

- [ ] Step 1: Gather requirements
- [ ] Step 2: Analyze current state
- [ ] Step 3: Implement changes
- [ ] Step 4: Validate results
- [ ] Step 5: Report completion
```

**Validation/Feedback Loops:**

Build in run-fix-repeat cycles:

```markdown
## Validation Loop

1. Run validation:
   ```bash
   {validation command}
   ```

2. Check results:
   - If PASS: Continue to next step
   - If FAIL: Apply fix and repeat from step 1

3. Common fixes:
   - Error X: Apply fix Y
   - Error Z: Apply fix W

```

**Sequential Steps for Complex Tasks:**

Break complex operations into clear phases:

```markdown
## Phase 1: Analysis

1. Read the input
2. Identify key elements
3. Document findings

**Checkpoint:** Confirm analysis with user before proceeding

## Phase 2: Implementation

1. Apply change A
2. Validate change A worked
3. Apply change B
4. Validate change B worked

**Checkpoint:** Run full validation

## Phase 3: Finalization

1. Clean up temporary files
2. Generate summary report
3. Present results to user
```

### 6. Evaluation-First Development Guidance

Skills should be developed with an evaluation-first approach:

**The Process:**

1. **Identify Gaps First**
   - Run Claude on target tasks WITHOUT the skill
   - Document where Claude struggles or makes mistakes
   - Note patterns in failures

2. **Create Evaluations Before Documentation**
   - Define test cases that capture the gaps
   - Include edge cases and error scenarios
   - Establish baseline performance metrics

3. **Write Minimal Instructions**
   - Start with bare minimum guidance
   - Test against evaluations
   - Add only what's needed to pass tests

4. **Iterate Based on Real Usage**
   - Measure improvement over baseline
   - Gather feedback from actual use
   - Refine instructions based on evidence

**Assessment Questions:**

- [ ] What specific failures prompted this skill?
- [ ] Are there test cases that verify the skill helps?
- [ ] Has baseline vs. improved performance been measured?
- [ ] Is there evidence the current instructions are necessary?

### 7. Model-Specific Considerations

Different Claude models may need different levels of guidance:

**Haiku:**

- May need more explicit step-by-step instructions
- Benefit from concrete examples
- Consider lower degrees of freedom

**Sonnet:**

- Balanced between guidance and flexibility
- Good with medium freedom tasks
- Responds well to templates with parameters

**Opus:**

- Works well with higher-level guidance
- Can handle more freedom effectively
- May not need exhaustive examples

**Assessment Checklist:**

- [ ] Skill tested with all target models
- [ ] Instructions work for least capable target model
- [ ] Not over-specified for more capable models
- [ ] Model-specific notes included if needed

### 8. Iterative Development Pattern (Claude A / Claude B)

Use two-Claude pattern for skill development:

**Claude A (Designer):**

- Work collaboratively to design the skill
- Refine instructions and examples
- Discuss edge cases and improvements

**Claude B (Tester):**

- Fresh context, no prior knowledge
- Test skill in realistic scenarios
- Identify gaps and confusion points

**Process:**

1. Design with Claude A
2. Test with Claude B
3. Note failures and confusion
4. Refine with Claude A
5. Re-test with Claude B
6. Repeat until stable

**Assessment Question:**

- [ ] Has this skill been tested with a fresh Claude instance?

## Standard Improvement Areas

### Description Quality

**Current State Checklist:**

- [ ] Third-person voice
- [ ] Starts with action verb
- [ ] Explains what the skill does
- [ ] Has "Use when" trigger phrase
- [ ] Lists trigger conditions with keywords
- [ ] Under 1024 characters
- [ ] Avoids false positive triggers

### Example Quality

**Current State Checklist:**

- [ ] Has at least one basic example
- [ ] Has advanced/complex example
- [ ] Shows realistic usage
- [ ] Covers edge cases
- [ ] Demonstrates error scenarios

### Error Handling

**Current State Checklist:**

- [ ] Documents common errors
- [ ] Explains error causes
- [ ] Provides solutions
- [ ] Has fallback options
- [ ] Handles tool failures

### Documentation Clarity

**Current State Checklist:**

- [ ] Clear "Your Task" section
- [ ] Logical flow of steps
- [ ] Numbered steps where appropriate
- [ ] Decision points explained
- [ ] Validation checkpoints included

## Improvement Process

### Phase 1: Analysis

Read the skill and create comprehensive assessment:

```markdown
## Skill Assessment: {skill-name}

### Progressive Disclosure
- Lines in SKILL.md: {count}
- Needs splitting: Yes/No
- Reference files present: Yes/No

### Degrees of Freedom
- Current level: High/Medium/Low
- Task fragility: High/Medium/Low
- Match: Yes/No (explain if mismatch)

### Naming
- Current name: {name}
- Follows spec: Yes/No
- Gerund form: Yes/No
- Recommendation: {if any}

### Description
- Voice: First/Second/Third person
- Has "Use when": Yes/No
- Character count: {count}/1024
- Keywords present: {list}

### Workflow Patterns
- Has checklists: Yes/No
- Has validation loops: Yes/No
- Has clear phases: Yes/No

### Strengths
- {what works well}

### Improvement Opportunities
- [ ] {improvement 1} - Impact: High/Medium/Low
- [ ] {improvement 2} - Impact: High/Medium/Low

### Priority Order
1. {most impactful change}
2. {second priority}
```

### Phase 2: Proposal

Present improvements with before/after:

```markdown
## Proposed Improvements

### 1. {Improvement Title}

**Current:**
{current state}

**Proposed:**
{improved version}

**Benefit:** {why this helps}
**Impact:** High/Medium/Low
```

### Phase 3: Implementation

After user approval:

- [ ] Make targeted edits
- [ ] Preserve existing good content
- [ ] Add new sections as needed
- [ ] Split into reference files if needed

### Phase 4: Validation

After improvements:

- [ ] Re-read the skill
- [ ] Verify changes applied correctly
- [ ] Check nothing accidentally removed
- [ ] YAML frontmatter still valid
- [ ] Run: `/skill-validate {skill-name}`

## Quality Scoring

Rate skills on these dimensions (1-5):

| Dimension | Score | Notes |
|-----------|-------|-------|
| Progressive Disclosure | _/5 | Size and structure |
| Degrees of Freedom | _/5 | Matches task fragility |
| Naming | _/5 | Spec compliance, clarity |
| Description | _/5 | Discovery effectiveness |
| Workflow Patterns | _/5 | Checklists, validation loops |
| Documentation | _/5 | Clarity and completeness |
| Examples | _/5 | Coverage and realism |
| Error Handling | _/5 | Robustness and recovery |
| **Overall** | _/40 | Sum of above |

**Score Interpretation:**

- 35-40: Excellent, follows all best practices
- 28-34: Good, minor improvements possible
- 20-27: Adequate, would benefit from enhancement
- <20: Needs significant work

## Common Improvement Patterns

### Pattern: Wrong Voice -> Third Person

```yaml
# Before
description: I help you process PDFs and extract text

# After
description: Processes PDF documents and extracts text, images, and metadata. Use when converting PDFs to text, extracting embedded images, or analyzing PDF structure.
```

### Pattern: Noun Name -> Gerund Name

```yaml
# Before
name: pdf-processor

# After
name: processing-pdfs
```

### Pattern: Monolithic -> Progressive Disclosure

Before: 800-line SKILL.md with everything inline
After: 300-line SKILL.md + references/EXAMPLES.md + references/API.md

### Pattern: No Workflow -> Checklist-Based

Before: Wall of text instructions
After: Copyable checklists with validation loops

### Pattern: Implicit Freedom -> Explicit Freedom

Before: Ambiguous about how strictly to follow instructions
After: Clear indication of flexibility level for each section

## Tips

- Focus on highest-impact improvements first (description is usually highest)
- Progressive disclosure analysis catches oversized skills early
- Degrees of freedom prevents both over- and under-specification
- Third-person descriptions are required by spec
- Workflow patterns significantly improve Claude's execution
- Test with fresh Claude instance (Claude B pattern)
- Preserve existing good content
- Evaluation-first prevents unnecessary documentation
- Different models may need different guidance levels
