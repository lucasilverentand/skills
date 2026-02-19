---
name: skill-authoring
description: Create and improve agent skills — scaffold directories, write SKILL.md with frontmatter, add decision trees, tools, and references. Use when creating a new skill, improving an existing one, or adding tools and decision trees.
---

# Skill Authoring

## Decision Tree

- What are you doing?
  - **Creating a new skill** → see "Creating a skill" below
  - **Improving an existing skill** → see "Improving a skill" below
  - **Adding a tool to a skill** → see `references/tool-conventions.md` and `references/tool-template.md`
  - **Writing a decision tree** → see `references/decision-trees.md`
  - **Preparing for marketplace** → see `references/marketplace.md`

## Creating a skill

1. Create the directory: `skills/<category>/<skill-name>/`
2. Write `PURPOSE.md` — see `references/skill-structure.md` for format
3. Write `SKILL.md` with frontmatter — see `references/skill-format.md` for all fields and rules
4. Write the decision tree — see `references/decision-trees.md`
5. Add tools in `tools/` — see `references/tool-conventions.md` and `references/tool-template.md`
6. Add references in `references/` for detailed domain docs
7. Run `tools/skill-validate.ts <path>` to check structure
8. Run `tools/token-estimate.ts <path>/SKILL.md` to verify SKILL.md is under 5000 tokens

## Improving a skill

1. Read the skill's PURPOSE.md and SKILL.md
2. Run `tools/coverage-gap.ts <path>` to find unaddressed responsibilities
3. Does it have a decision tree?
   - **No** → write one (see `references/decision-trees.md`)
   - **Yes but incomplete** → expand it to cover missing branches
4. Are there responsibilities without matching tools?
   - **Yes** → add tools (see `references/tool-conventions.md`)
5. Is the SKILL.md bloated (over ~5000 tokens)?
   - **Yes** → move detailed content to `references/`, link from SKILL.md
6. Run `tools/skill-validate.ts <path>` when done

## Key references

| File | What it covers |
|---|---|
| `references/skill-format.md` | SKILL.md frontmatter fields, naming rules, Claude Code extensions, content guidelines |
| `references/skill-structure.md` | Directory layout, PURPOSE.md vs SKILL.md, progressive disclosure |
| `references/best-practices.md` | Writing descriptions, degrees of freedom, anti-patterns |
| `references/decision-trees.md` | Decision tree format, agent usage rules, writing guidelines |
| `references/tool-conventions.md` | Tool arguments, output, errors, help, dependencies |
| `references/tool-template.md` | Copy-paste starter script for new tools |
| `references/marketplace.md` | marketplace.json schema, plugin.json schema, source types |
