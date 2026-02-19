# Skill Authoring Best Practices

## Core principle

Claude is already very smart. Only add context it doesn't already have. Challenge each line: "Does Claude really need this?"

## Degrees of freedom

Match the instruction style to how much flexibility the agent should have:

- **High freedom** (text instructions) — multiple valid approaches, context-dependent. Example: "Analyze the codebase architecture and suggest improvements."
- **Medium freedom** (pseudocode or parameterized scripts) — preferred pattern exists, some variation okay. Example: step-by-step workflow with decision points.
- **Low freedom** (exact scripts) — fragile operations, consistency critical. Example: migration generation commands, deployment scripts.

## Writing descriptions

The `description` field in frontmatter is the most important line in a skill. It's loaded into context for ALL conversations and determines whether Claude activates the skill.

Do:
- Write in third person: "Generates migration files from schema changes"
- Include what it does AND when to use it: "... Use when the user modifies Drizzle schema files or asks to create a migration."
- Use specific terms the user would mention

Don't:
- First person: "I help with migrations"
- Vague: "Helps with database stuff"
- Too long: keep under 1024 characters

## Anti-patterns

- **Explaining common knowledge** — don't describe what a PDF is, what git does, etc.
- **Duplicating content** — information lives in EITHER SKILL.md OR references, not both
- **Vague names** — `helper`, `utils`, `tools` tell Claude nothing
- **Deep reference chains** — references should not reference other references
- **Offering too many options** — provide a default approach with an escape hatch, not a menu
- **Time-sensitive information** — don't include dates, versions that will go stale
- **Extraneous files** — no README.md, CHANGELOG.md, or other docs that aren't references

## Keeping SKILL.md lean

Move to references/ when:
- A section is over ~10 lines of detailed documentation
- Content is domain-specific knowledge (API schemas, field descriptions)
- Content is a template or example that's referenced but not always needed
- A decision tree exceeds ~20 lines

Keep in SKILL.md:
- The workflow (numbered steps)
- Short decision trees
- A reference table linking to detailed docs
- Critical rules that apply every time
