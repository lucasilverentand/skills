---
name: authoring
description: Creates and improves agent skills — scaffolds directories, writes SKILL.md with frontmatter and decision trees, adds tools and references, validates structure and token budgets. Use when creating a new skill from scratch, improving an existing skill, adding tools or references, or validating a skill before publishing.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Skill Authoring

## Decision Tree

- What are you doing?
  - **Creating a new skill from scratch** → follow "Creating a skill" below
  - **Improving an existing skill** → what needs work?
    - **Decision tree is missing or shallow** → see "Improving a decision tree" below
    - **SKILL.md is bloated (over ~5000 tokens)** → run `tools/token-estimate.ts <path>/SKILL.md`, then extract sections over ~10 lines to `references/`, link from SKILL.md
    - **Responsibilities exist without matching tools** → follow "Adding a tool" below
    - **Missing references for detailed content** → follow "Adding a reference" below
    - **Frontmatter is wrong or incomplete** → see `references/skill-format.md` for all fields and fix
    - **Description is vague or first-person** → rewrite per "Description guidelines" below
    - **Not sure what's wrong** → run `tools/coverage-gap.ts <path>` and `tools/skill-validate.ts <path>`, fix reported issues
  - **Adding a tool to a skill** → follow "Adding a tool" below
  - **Adding a reference to a skill** → follow "Adding a reference" below
  - **Validating a skill** → follow "Validating" below
  - **Refactoring or splitting a skill** → is the SKILL.md over 500 lines or covering unrelated concerns?
    - **Yes, covers multiple unrelated concerns** → split into separate skill directories, one per concern
    - **Yes, just too long** → extract to references, don't split
    - **No** → the skill is fine, focus on content quality instead

## Creating a skill

1. Create the directory: `skills/<category>/<skill-name>/`
2. Write `PURPOSE.md` — scope and responsibilities (see `references/skill-structure.md`)
3. Write `SKILL.md` with YAML frontmatter — at minimum `name` and `description` (see `references/skill-format.md`)
4. Write the decision tree — see "Decision tree format" and `references/decision-trees.md`
5. Write conventions — the rules the agent must follow every time
6. Add tools in `tools/` if the skill has automatable tasks (see "Adding a tool")
7. Add references in `references/` for any detailed content over ~10 lines
8. Run `tools/skill-validate.ts <path>` to check structure
9. Run `tools/token-estimate.ts <path>/SKILL.md` to verify under 5000 tokens

## Improving a decision tree

1. Read the current SKILL.md and PURPOSE.md
2. List the skill's core tasks from the responsibilities
3. For each task, ensure a decision tree branch exists that leads to it
4. Check that every leaf node is an action (run a tool, follow a workflow, see a reference)
5. Check depth — 3-4 levels is ideal, 5 is the max
6. Check conditions are concrete: "Does the file have a default export?" not "Is the file structured well?"
7. Add branches for common follow-up questions the agent would face

## Conventions

### Directory layout

```
skills/<category>/<skill-name>/
├── PURPOSE.md          # what: responsibilities + tools list (not loaded at runtime)
├── SKILL.md            # how: frontmatter, decision tree, conventions
├── tools/              # bun scripts the agent can run
│   └── *.ts
└── references/         # detailed docs loaded on demand
    └── *.md
```

### SKILL.md rules

- YAML frontmatter with at least `name` and `description`
- `name` must match the parent directory name (lowercase, hyphens, 1-64 chars)
- `description` in third person: what it does AND when to use it (max 1024 chars)
- Body under 5000 tokens (~500 lines) — move detail to `references/`
- Lead with a decision tree, then workflows, then conventions
- Link to `references/` for anything needing more than a few lines
- No README.md, CHANGELOG.md, or other non-reference docs

### Decision tree format

Indented markdown bullets. Questions are plain text, conditions are **bold**, outcomes use arrows:

```markdown
- What is the situation?
  - **Condition A** → take action A
  - **Condition B** → follow up question
    - **Sub-condition X** → take action X
```

The agent must walk through every node explicitly — state the question, evaluate, commit to a branch. See `references/decision-trees.md` for full conventions.

### Description guidelines

- Third person: "Generates migration files" not "I help with migrations"
- Include BOTH what it does AND when to use it
- Be specific: "Generates Drizzle ORM migrations from schema changes" not "Helps with databases"
- Max 1024 characters — loaded for ALL conversations

### Progressive disclosure

1. **Metadata** (~100 tokens) — `name` + `description` from frontmatter, loaded at startup for all skills
2. **Instructions** (<5000 tokens) — full SKILL.md body, loaded when skill activates
3. **Resources** (as needed) — `references/` and `tools/`, loaded when SKILL.md points to them

### Anti-patterns

- Explaining things Claude already knows (what git is, what a PDF is)
- Duplicating content between SKILL.md and references
- Deep reference chains (references should not reference other references)
- Vague names (`helper`, `utils`)
- README.md or CHANGELOG.md files (use PURPOSE.md + references/ instead)
- Offering too many options — provide a default approach with an escape hatch, not a menu

## Adding a tool

1. Create `tools/<tool-name>.ts` using the template from `references/tool-template.md`
2. Tools are zero-dependency — only bun built-ins and node stdlib
3. Support `--help` (usage banner) and `--json` (structured output)
4. Errors to stderr, success to stdout, exit non-zero on failure
5. Update PURPOSE.md to list the new tool
6. Reference the tool from SKILL.md decision tree where appropriate

## Adding a reference

1. Create `references/<topic>.md` — one topic per file
2. SKILL.md must explicitly link to it: "See `references/<topic>.md`"
3. Keep each file focused — don't create catch-all references
4. References must not reference other references (one level deep only)
5. Add the reference to the "Key references" table in SKILL.md

## Validating

1. Run `tools/skill-validate.ts <path>` — checks required files, frontmatter, naming, line count
2. Run `tools/token-estimate.ts <path>/SKILL.md` — must be under 5000 tokens
3. Run `tools/coverage-gap.ts <path>` — compares responsibilities against content and tools
4. Check manually: does the decision tree cover the skill's core tasks?
5. Check manually: is the description specific enough for Claude to match intent?

## Key references

| File | What it covers |
|---|---|
| `references/skill-format.md` | SKILL.md frontmatter fields, naming rules, Claude Code extensions, string substitutions |
| `references/skill-structure.md` | Directory layout, PURPOSE.md vs SKILL.md, progressive disclosure phases |
| `references/best-practices.md` | Writing descriptions, degrees of freedom, anti-patterns, keeping SKILL.md lean |
| `references/decision-trees.md` | Decision tree format, agent usage rules, writing guidelines, placement |
| `references/tool-conventions.md` | Tool arguments, output, errors, help banners, zero-dependency rule |
| `references/tool-template.md` | Copy-paste starter script for new tools |
| `references/marketplace.md` | marketplace.json schema, plugin.json schema, source types, external distribution |
| `tools/skill-validate.ts` | Check a skill for required files, valid frontmatter, naming rules |
| `tools/coverage-gap.ts` | Compare responsibilities against tools and decision tree branches |
| `tools/token-estimate.ts` | Estimate token count of a SKILL.md |
