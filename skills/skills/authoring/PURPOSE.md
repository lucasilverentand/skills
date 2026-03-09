# Skill Authoring

Create, improve, test, and validate agent skills.

## Responsibilities

- Capture user intent before writing — understand what the skill should do and when it triggers
- Scaffold skill directories with PURPOSE.md, SKILL.md, tools/, and references/
- Write SKILL.md with correct frontmatter, decision trees, and lean instructions
- Add tools and references to support the skill's responsibilities
- Validate structure, naming, and token budgets
- Test skills with realistic prompts and iterate based on feedback
- Optimize skill descriptions for accurate triggering

## Relationship with skill-creator

Authoring is a layer on top of `skill-creator`. Skill-creator owns the test/eval/improve/optimize loop. Authoring adds structural conventions (PURPOSE.md, decision trees, token budgets, bun tools, reference organization) and validates them before and after each skill-creator iteration.

## Tools

- `tools/skill-validate.ts` — check required files, valid frontmatter, and naming rules
- `tools/coverage-gap.ts` — compare responsibilities against tools and decision tree branches
- `tools/token-estimate.ts` — estimate token count against the 5000-token guideline
