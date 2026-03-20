# Skill Structure

## Directory layout

```
skills/<category>/<skill-name>/
├── SKILL.md                # how: lean instructions, frontmatter, short decision trees
├── tools/                  # bun scripts the agent can run
│   └── *.ts
└── references/             # detailed docs, long decision trees, domain knowledge
    └── *.md
```

## SKILL.md

Rules:
- Must have YAML frontmatter with at least `name` and `description`
- Keep under 5000 tokens (~500 lines)
- Lead with the workflow — what does the agent do, in what order?
- Link to references/ for anything needing more than a few lines

## references/

Detailed documentation loaded on demand. Claude reads these when the SKILL.md points to them.

Rules:
- SKILL.md must explicitly reference these files: "See `references/foo.md`"
- Keep each file focused on one topic
- One level deep from SKILL.md — don't reference files from within references

## Progressive disclosure

Claude Code loads skills in three phases:

1. **Metadata** (~100 tokens) — `name` and `description` from frontmatter. Loaded at startup for ALL skills. This is how Claude decides which skill to activate.
2. **Instructions** (<5000 tokens) — full SKILL.md body. Loaded when the skill is activated.
3. **Resources** (as needed) — files in references/ and tools/. Loaded only when the SKILL.md tells the agent to read them.

Token budget for skill descriptions: ~2% of context window (~16,000 characters across all skills). Keep individual descriptions concise so they don't crowd out other skills.
