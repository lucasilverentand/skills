# Skill Authoring Improvement Plan

Based on extensive research from official Anthropic documentation and the Agent Skills open standard.

## Research Sources

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Agent Skills Open Standard](https://agentskills.io/specification)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Claude Engineering Blog: Agent Skills](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)

## Key Insights from Official Documentation

### 1. Progressive Disclosure Architecture

Skills use three-level progressive disclosure:

- **Level 1 (Metadata)**: ~100 tokens - name/description loaded at startup
- **Level 2 (Instructions)**: <5000 tokens - SKILL.md body loaded when triggered
- **Level 3 (Resources)**: Unlimited - bundled files loaded only as needed

**Key guideline**: Keep SKILL.md under 500 lines, split into reference files.

### 2. Description Field is Critical

The description drives skill discovery from potentially 100+ skills:

- Must be written in **third person** (not "I can help" or "You can use")
- Should include **both** what the skill does **and** when to use it
- Include specific **keywords** users might mention
- Max 1024 characters

### 3. Name Field Conventions

Official spec:

- Max 64 characters
- Lowercase letters, numbers, hyphens only
- Cannot start/end with hyphen
- No consecutive hyphens
- **Gerund form recommended**: `processing-pdfs`, `analyzing-spreadsheets`

### 4. Degrees of Freedom Pattern

Match specificity to task fragility:

- **High freedom**: Text instructions for flexible tasks
- **Medium freedom**: Pseudocode/scripts with parameters
- **Low freedom**: Exact scripts for fragile operations

### 5. Workflow and Feedback Loops

- Use checklists Claude can copy and track
- Implement validation loops: run → fix → repeat
- Break complex tasks into clear sequential steps

### 6. File Organization

```
skill-name/
├── SKILL.md              # Main instructions (required)
├── references/           # Additional docs loaded on-demand
│   ├── REFERENCE.md
│   └── EXAMPLES.md
├── scripts/              # Executable code
│   └── helper.py
└── assets/               # Static resources
    └── template.json
```

### 7. Testing Guidance

- Test with all models you plan to use (Haiku, Sonnet, Opus)
- Create evaluations BEFORE writing extensive docs
- Iterate collaboratively with Claude

### 8. Security Considerations

- Only use skills from trusted sources
- Audit bundled content, especially scripts
- Watch for external network calls

## Improvements to Apply

### skill-init Improvements

1. Add gerund naming convention recommendation
2. Add third-person description requirement
3. Include progressive disclosure guidance
4. Add degrees of freedom pattern
5. Include official field constraints (64 char name, 1024 char description)
6. Add testing recommendations per model
7. Add optional directories structure (scripts/, references/, assets/)
8. Add file reference guidance (one level deep)

### skill-validate Improvements

1. Validate name field per spec (no consecutive hyphens, no start/end hyphen)
2. Check description is third-person (not "I" or "You")
3. Check SKILL.md is under 500 lines
4. Validate description includes "Use when" trigger
5. Check for deeply nested file references
6. Add evaluation-based validation guidance
7. Validate allowed-tools format

### skill-improve Improvements

1. Add progressive disclosure analysis
2. Add degrees of freedom assessment
3. Recommend gerund naming
4. Check third-person description
5. Add workflow checklist pattern
6. Add feedback loop pattern
7. Add evaluation-first guidance
8. Add model-specific testing recommendations

### skill-examples Improvements

1. Update all templates with official spec fields
2. Add progressive disclosure examples
3. Add workflow checklist examples
4. Add validation/feedback loop patterns
5. Add reference file examples
6. Add script bundling examples
7. Include official best practices in each template

## Implementation Tasks

1. [ ] Update skill-init with official spec compliance
2. [ ] Update skill-validate with stricter validation rules
3. [ ] Update skill-improve with progressive disclosure analysis
4. [ ] Update skill-examples with official patterns
5. [ ] Run validation on all updated skills
6. [ ] Test skills work correctly
