# Skill Authoring

Create, validate, and improve agent skills — scaffold structure, write SKILL.md with proper frontmatter, add decision trees, tools, and references.

## Responsibilities

- Scaffold new skill directories with PURPOSE.md, SKILL.md, tools/, and references/
- Write SKILL.md files with correct frontmatter (name, description, allowed-tools, etc.)
- Write decision trees that force step-by-step reasoning through the skill's workflow
- Add bun-based tools that support the skill's responsibilities
- Add reference files for detailed domain knowledge and long decision trees
- Validate skill structure, frontmatter fields, and naming conventions
- Refine and improve existing skill prompts and content
- Identify gaps in skill coverage and suggest new responsibilities
- Apply progressive disclosure — keep SKILL.md lean, move detail to references/
- Prepare skills for marketplace submission via plugin.json and marketplace.json

## Tools

- `tools/skill-scaffold.ts` — create a new skill directory with all boilerplate files
- `tools/skill-validate.ts` — check a skill for required files, valid frontmatter, and naming rules
- `tools/frontmatter-lint.ts` — validate SKILL.md frontmatter fields against the agent skills spec
- `tools/tool-stub.ts` — generate a tool script from the standard template
- `tools/coverage-gap.ts` — compare responsibilities against tools and decision tree branches to find gaps
- `tools/token-estimate.ts` — estimate token count of a SKILL.md to check against the 5000-token guideline
