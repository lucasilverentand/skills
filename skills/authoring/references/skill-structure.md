# Skill Structure

## Directory layout
```text
skills/<skill-name>/
├── SKILL.md                # how: lean instructions, frontmatter, short decision trees
├── tools/                  # (optional) bun scripts the agent can run
│   └── *.ts
├── references/             # (optional) detailed docs, long decision trees, domain knowledge
│   └── *.md
└── examples/               # (optional) example outputs showing expected format
    └── *
```

Only `SKILL.md` is required. Add `tools/`, `references/`, or `examples/` when the skill needs them.

## Repository layout
This repository uses `skills/<skill-name>/` as the canonical authoring tree. The `plugins/` directory is generated from `plugin-groups.json` and exists so Codex and Claude Code can install versioned plugin packages. Edit root skills first, then run `bun run marketplace:write`.

## Skill locations
|Consumer|Path|Scope|
|---|---|---|
|Open Agent Skills / Codex personal|`~/.agents/skills/<skill-name>/SKILL.md`|All projects for that user|
|Codex project|`.agents/skills/<skill-name>/SKILL.md`|Project or folder-specific skills|
|Claude Code personal|`~/.claude/skills/<skill-name>/SKILL.md`|All Claude Code projects for that user|
|Claude Code project|`.claude/skills/<skill-name>/SKILL.md`|Project or folder-specific skills|
|Plugin package|`<plugin>/skills/<skill-name>/SKILL.md`|Where the plugin is enabled|

Plugin skills use `plugin-name:skill-name` namespacing in both Codex and Claude Code, preventing collisions with direct personal or project skills.

## SKILL.md
Rules:

- Must have YAML frontmatter. `description` is recommended for skill discovery; `name` defaults to the directory name if omitted.
- Keep under 5000 tokens (roughly 300-500 lines depending on density — tokens are the real constraint, lines are a rough proxy)
- Lead with the workflow — what does the agent do, in what order?
- Link to references/ for anything needing more than a few lines

## references/
Detailed documentation loaded on demand. Agents read these when the SKILL.md points to them.

Rules:

- SKILL.md must explicitly reference these files: "See `references/foo.md`"
- Keep each file focused on one topic
- One level deep from SKILL.md — don't reference files from within references

## Progressive disclosure
Codex, Claude Code, and other Agent Skills clients load skills progressively:

1. **Metadata** (~100 tokens) — `name` and `description` from frontmatter. Loaded at startup for all visible skills. This is how the agent decides which skill to activate.
2. **Instructions** (<5000 tokens) — full SKILL.md body. Loaded when the skill is activated.
3. **Resources** (as needed) — files in references/ and tools/. Loaded only when the SKILL.md tells the agent to read them.

Token budget for skill descriptions: ~2% of context window (~16,000 characters across all skills). Keep individual descriptions concise so they don't crowd out other skills.
