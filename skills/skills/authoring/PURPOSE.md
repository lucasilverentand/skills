# Skill Authoring

Create, validate, and improve agent skills — scaffold structure, write SKILL.md with proper frontmatter, add decision trees, tools, and references.

## Responsibilities

- Scaffold new skill directories with PURPOSE.md, SKILL.md, tools/, and references/
- Write SKILL.md files with correct frontmatter (name, description, allowed-tools)
- Write decision trees that force step-by-step reasoning through the skill's workflow
- Add bun-based tools that support the skill's responsibilities
- Add reference files for detailed domain knowledge
- Validate skill structure, frontmatter fields, naming conventions, and token budgets
- Refine and improve existing skill prompts, decision trees, and content
- Identify gaps in skill coverage and suggest new responsibilities
- Apply progressive disclosure — keep SKILL.md lean, move detail to references/

## Tools

- `tools/skill-validate.ts` — check a skill for required files, valid frontmatter, and naming rules
- `tools/coverage-gap.ts` — compare responsibilities against tools and decision tree branches to find gaps
- `tools/token-estimate.ts` — estimate token count of a SKILL.md to check against the 5000-token guideline
