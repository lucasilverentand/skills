# Skill Structure

## Directory layout

```
skills/<category>/<skill-name>/
├── PURPOSE.md              # what: responsibilities + tools list
├── SKILL.md                # how: lean instructions, frontmatter, short decision trees
├── tools/                  # bun scripts the agent can run
│   └── *.ts
└── references/             # detailed docs, long decision trees, domain knowledge
    └── *.md
```

## PURPOSE.md

Defines scope — what the skill is responsible for and what tools it has. Not loaded at runtime by Claude Code. Used for project organization and by the authoring skill itself.

Format:

```markdown
# Skill Name

One-liner description.

## Responsibilities

- What this skill does (action-oriented bullets)

## Tools

- `tools/name.ts` — what it does
```

Rules:
- No instructions — that's SKILL.md's job
- No decision trees — those go in SKILL.md or references/
- Keep responsibilities concrete and verifiable

## SKILL.md

The runtime document Claude reads when the skill activates. This is what matters.

Rules:
- Must have YAML frontmatter with at least `name` and `description`
- Keep under 5000 tokens (~500 lines) — this is the progressive disclosure sweet spot
- Lead with the workflow — what does the agent do, in what order?
- Link to references/ for anything needing more than a few lines
- Don't duplicate PURPOSE.md content
- Don't explain things Claude already knows

## references/

Detailed documentation loaded on demand. Claude reads these when the SKILL.md points to them.

Good candidates for references:
- Long decision trees (over ~20 lines)
- Domain-specific documentation
- API schemas and field descriptions
- Templates and examples
- Convention docs shared across skills

Rules:
- SKILL.md must explicitly reference these files: "See `references/foo.md`"
- Keep each file focused on one topic
- One level deep from SKILL.md — don't reference files from within references

## tools/

Bun scripts the agent can run. See `tool-conventions.md` for details.

## Progressive disclosure

Claude Code loads skills in three phases:

1. **Metadata** (~100 tokens) — `name` and `description` from frontmatter. Loaded at startup for ALL skills. This is how Claude decides which skill to activate.
2. **Instructions** (<5000 tokens) — full SKILL.md body. Loaded when the skill is activated.
3. **Resources** (as needed) — files in references/ and tools/. Loaded only when the SKILL.md tells the agent to read them.

Token budget for skill descriptions: ~2% of context window (~16,000 characters across all skills). Keep individual descriptions concise so they don't crowd out other skills.
