# skill-creation

End-to-end toolkit for authoring, publishing, and continuously improving Claude Code skills.

## Skills

### authoring
Scaffolds skill directories, writes SKILL.md files with frontmatter and decision trees, adds references, and validates structure and token budgets. Also handles refactoring bloated skills into smaller pieces.

### publishing
Publishes skills to the marketplace catalog — bumps versions, removes entries, packages skills for distribution, regenerates marketplace.json from disk, and validates catalog integrity.

### retrospecting
Mines recent Claude Code conversations and git history for struggles, repeated corrections, rework patterns, and taste signals — then turns findings into new skills or improvements to existing ones.

### taste-encoding
Interviews the user to extract design taste and preferences for a domain, then encodes those into skill reference files, decision rules, conventions, comparison tables, and anti-patterns.

### tooling
Creates and improves bun-based tools for skills — decides when a tool earns its place, scaffolds zero-dependency scripts with dual output, validates tool quality, and wires tools into SKILL.md decision trees.

## Installation

Add this plugin to your Claude Code configuration:

```json
{
  "plugins": ["plugins/skill-creation"]
}
```

## Author

Luca Silverentand (<dev@lucasilverentand.com>)
