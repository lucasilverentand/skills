# Skill Structure

## Directory layout
Use the open Agent Skills layout unless the target client or this repository has a specific reason to diverge:

```text
skill-name/
├── SKILL.md                # required: frontmatter + instructions
├── scripts/                # optional: executable code the agent can run
├── references/             # optional: detailed docs and domain knowledge
├── assets/                 # optional: templates, images, fonts, starter files
├── examples/               # optional: expected inputs/outputs or test prompts
└── agents/
    └── openai.yaml         # optional Codex app metadata and dependencies
```

Only `SKILL.md` is required. Add supporting folders when they reduce repeated work or keep `SKILL.md` lean. The open spec allows additional folders, but standard names travel best across clients.

## Repository layout
This repository uses `plugins/<plugin-name>/skills/<skill-name>/` as the authoring tree. Each skill has one owning plugin. `plugin-groups.json` records plugin metadata and skill ownership, and `bun run marketplace:write` regenerates manifests, READMEs, and marketplace catalogs.

This repo also has historical `tools/` folders inside some skills. Treat those as repo conventions for Bun-based helper utilities. For new portable skills, prefer `scripts/` for executable code unless you are intentionally following an existing repo-local pattern.

## Skill locations
|Consumer|Path|Scope|
|---|---|---|
|Codex personal|`~/.agents/skills/<skill-name>/SKILL.md`|All projects for that user|
|Codex project|`.agents/skills/<skill-name>/SKILL.md`|Project or folder-specific skills|
|Claude Code personal|`~/.claude/skills/<skill-name>/SKILL.md`|All Claude Code projects for that user|
|Claude Code project|`.claude/skills/<skill-name>/SKILL.md`|Project or folder-specific skills|
|Plugin package|`plugins/<plugin-name>/skills/<skill-name>/SKILL.md`|Where the plugin is enabled|

Codex scans `.agents/skills` from the current working directory up to the repository root, plus user/admin/system locations. Claude Code scans `.claude/skills` at personal, project, plugin, and parent/nested project scopes. Plugin skills use `plugin-name:skill-name` namespacing in both Codex and Claude Code, preventing collisions with direct personal or project skills.

## SKILL.md
Rules:

- Include YAML frontmatter and a Markdown body.
- For portable and Codex skills, include both `name` and `description`. Claude Code can infer `name`, but keeping both fields avoids cross-client drift.
- Keep the body focused. The 5000-token guideline is a practical target, not a license to fill the file.
- Lead with the workflow: what does the agent do, in what order?
- Link to supporting files for anything that needs more than a few lines.

## scripts/
Executable code loaded or run only when needed.

Rules:

- Use scripts for deterministic checks, conversion, packaging, or other logic the agent would otherwise rewrite repeatedly.
- Prefer small scripts with clear CLI help and no hidden side effects.
- Test scripts by running them on representative inputs before finishing the skill.

## references/
Detailed documentation loaded on demand. Agents read these when `SKILL.md` points to them.

Rules:

- `SKILL.md` must explicitly reference these files: "See `references/foo.md`".
- Keep each file focused on one topic.
- Keep references one level deep from `SKILL.md`; avoid reference-to-reference chains.

## Progressive disclosure
Codex, Claude Code, and other Agent Skills clients load skills progressively:

1. Metadata - `name`, `description`, and sometimes path. This is how the agent decides which skill to activate.
2. Instructions - full `SKILL.md` body when the skill is activated.
3. Resources - supporting files such as `references/`, `scripts/`, and `assets/` only when the skill points the agent to them.

Codex caps the initial skills list at roughly 2% of the context window, or 8,000 characters when the context window is unknown. Front-load descriptions so shortening still preserves the trigger. Claude Code also keeps skill content in context after invocation and preserves the first 5,000 tokens per skill during compaction, so every line still has a recurring cost.
