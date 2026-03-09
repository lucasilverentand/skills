# Skill Authoring Best Practices

## Anti-patterns

- **Explaining common knowledge** — don't describe what a PDF is, what git does, etc.
- **Duplicating content** — information lives in EITHER SKILL.md OR references, not both
- **Vague names** — `helper`, `utils`, `tools` tell nothing about what the skill does
- **Deep reference chains** — references should not reference other references
- **Offering too many options** — provide a default approach with an escape hatch, not a menu
- **Time-sensitive information** — don't include dates or versions that will go stale
- **Extraneous files** — no README.md, CHANGELOG.md, or other docs that aren't references

## Keeping SKILL.md lean

Move to references/ when:
- A section is over ~10 lines of detailed documentation
- Content is domain-specific knowledge (API schemas, field descriptions)
- Content is a template or example that's referenced but not always needed
- A decision tree exceeds ~20 lines

Keep in SKILL.md:
- The decision tree and workflow steps
- A reference table linking to detailed docs
- Critical rules that apply every time
