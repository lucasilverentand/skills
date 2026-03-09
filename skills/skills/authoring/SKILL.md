---
name: authoring
description: Creates, improves, and tests agent skills — scaffolds directories, writes SKILL.md with frontmatter and decision trees, adds tools and references, validates structure and token budgets, runs test evaluations, and optimizes descriptions for triggering. Use when creating a new skill from scratch, improving an existing skill, testing a skill, adding tools or references, optimizing a skill description, or validating a skill before publishing.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Skill Authoring

## Decision Tree

- What are you doing?
  - **Creating a new skill from scratch** → follow "Creating a skill" below
  - **Improving an existing skill** → what needs work?
    - **Decision tree is missing or shallow** → see "Improving a decision tree" below
    - **SKILL.md is bloated (over ~5000 tokens)** → run `tools/token-estimate.ts <path>/SKILL.md`, then extract sections over ~10 lines to `references/`, link from SKILL.md
    - **Skill instructions are too rigid or verbose** → see `references/writing-philosophy.md` and rewrite: explain the why, drop heavy-handed MUSTs, remove lines that aren't pulling their weight
    - **Responsibilities exist without matching tools** → follow "Adding a tool" below
    - **Missing references for detailed content** → follow "Adding a reference" below
    - **Frontmatter is wrong or incomplete** → see `references/skill-format.md` for all fields and fix
    - **Description is vague or undertriggering** → rewrite per `references/writing-philosophy.md` "Description writing"
    - **Not sure what's wrong** → run `tools/coverage-gap.ts <path>` and `tools/skill-validate.ts <path>`, fix reported issues
  - **Testing a skill** → follow "Testing a skill" below, which delegates to the `skill-creator` skill
  - **Optimizing a skill description** → use the `skill-creator` skill's description optimization workflow
  - **Adding a tool to a skill** → follow "Adding a tool" below
  - **Adding a reference to a skill** → follow "Adding a reference" below
  - **Validating a skill** → follow "Validating" below
  - **Refactoring or splitting a skill** → is the SKILL.md over 500 lines or covering unrelated concerns?
    - **Yes, covers multiple unrelated concerns** → split into separate skill directories, one per concern
    - **Yes, just too long** → extract to references, don't split
    - **No** → the skill is fine, focus on content quality instead

## Creating a skill

### 1. Capture intent

Start by understanding what the skill should do. If the conversation already contains a workflow to capture, extract answers from it — tools used, sequence of steps, corrections made, input/output formats. Otherwise, ask:

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Are there automatable steps that should become tools?

Proactively ask about edge cases, example files, success criteria, and dependencies. Check the codebase for similar existing skills to avoid overlap. Come prepared with context.

### 2. Write the skill

1. Create the directory: `skills/<category>/<skill-name>/`
2. Write `PURPOSE.md` — scope and responsibilities (see `references/skill-structure.md`)
3. Write `SKILL.md` with YAML frontmatter — at minimum `name` and `description` (see `references/skill-format.md`)
4. Write the decision tree — see "Decision tree format" and `references/decision-trees.md`
5. Write conventions — the rules the agent must follow every time
6. Add tools in `tools/` if the skill has automatable tasks (see "Adding a tool")
7. Add references in `references/` for any detailed content over ~10 lines

Follow the writing principles in `references/writing-philosophy.md` — explain reasoning over rigid rules, keep the prompt lean, use examples to anchor behavior.

### 3. Validate and test

1. Run `tools/skill-validate.ts <path>` to check structure
2. Run `tools/token-estimate.ts <path>/SKILL.md` to verify under 5000 tokens
3. If the skill has objectively verifiable outputs, create test cases and run them — see `references/testing-guide.md`

## Testing a skill

Use the `skill-creator` skill for the full test/eval/improve loop. Before handing off, enforce authoring standards on the skill:

1. Run `tools/skill-validate.ts <path>` and `tools/token-estimate.ts <path>/SKILL.md` — fix any issues first
2. Hand off to skill-creator for: test case creation, running evals (with-skill + baseline), grading, eval viewer, benchmark aggregation, blind comparison, and the iteration loop
3. After each skill-creator iteration, re-validate structure — ensure improvements didn't bloat SKILL.md past the token budget, break the decision tree, or duplicate content between SKILL.md and references
4. For description optimization, use skill-creator's `run_loop.py` workflow

See `references/testing-guide.md` for conventions authoring adds on top of skill-creator (workspace layout, assertion quality, eval query guidelines).

## Improving a decision tree

Read PURPOSE.md to get the skill's responsibilities, then ensure each one has a decision tree branch leading to it. See `references/decision-trees.md` for format and writing guidelines.

## Adding a tool

1. Create `tools/<tool-name>.ts` using `references/tool-template.md` as a starting point
2. Update PURPOSE.md to list the new tool
3. Reference the tool from SKILL.md decision tree where appropriate

## Adding a reference

1. Create `references/<topic>.md` — one topic per file, one level deep (no reference-to-reference chains)
2. Link from SKILL.md: "See `references/<topic>.md`"
3. Add to the key references table in SKILL.md

## Validating

1. Run `tools/skill-validate.ts <path>` — checks required files, frontmatter, naming, line count
2. Run `tools/token-estimate.ts <path>/SKILL.md` — must be under 5000 tokens
3. Run `tools/coverage-gap.ts <path>` — compares responsibilities against content and tools

## Key references

| File | What it covers |
|---|---|
| `references/skill-structure.md` | Directory layout, PURPOSE.md vs SKILL.md, progressive disclosure |
| `references/skill-format.md` | Frontmatter fields, naming rules, Claude Code extensions, string substitutions |
| `references/decision-trees.md` | Decision tree format, writing guidelines, agent usage |
| `references/writing-philosophy.md` | Explain the why, keep prompts lean, generalize, description writing |
| `references/testing-guide.md` | Authoring conventions layered on top of skill-creator's test/eval loop |
| `references/best-practices.md` | Anti-patterns, keeping SKILL.md lean |
| `references/tool-template.md` | Starter script for new tools (includes conventions inline) |
| `references/marketplace.md` | marketplace.json schema, plugin.json, source types |
