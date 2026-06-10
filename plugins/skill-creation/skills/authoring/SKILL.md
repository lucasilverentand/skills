---
name: authoring
description: Use when the user asks to create, update, review, or refactor an agent skill, including requests like "turn this workflow into a skill", "fix this SKILL.md", "add references to this skill", "make this skill work in Codex and Claude", or "split this bloated skill". Creates skill directories, writes portable SKILL.md frontmatter and workflows, adds references, validates structure and token budgets. For adding executable helpers, use the tooling skill.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Skill Authoring

## Decision Tree
- What are you doing?
  - **Creating a new skill from scratch** -> follow "Creating a skill" below
  - **Improving an existing skill** -> what needs work?
    - **Decision tree is missing or shallow** -> see "Improving a decision tree" below
    - **SKILL.md is bloated (over ~5000 tokens)** -> run `tools/token-estimate.ts <path>/SKILL.md`, then extract sections over ~10 lines to `references/`, link from SKILL.md
    - **Skill instructions are too rigid or verbose** -> see `references/writing-philosophy.md` and rewrite: explain the why, drop heavy-handed MUSTs, remove lines that aren't pulling their weight
    - **Automatable tasks would benefit from a tool** -> use the `tooling` skill
    - **Missing references for detailed content** -> follow "Adding a reference" below
    - **Frontmatter is wrong or incomplete** -> see `references/skill-format.md` for portable fields and product-specific extensions, then fix
    - **Description is vague or undertriggering** -> rewrite per `references/writing-philosophy.md` "Description writing"
    - **Not sure what's wrong** -> run `tools/coverage-gap.ts <path>` and `tools/skill-validate.ts <path>`, fix reported issues
  - **Adding a tool to a skill** -> use the `tooling` skill
  - **Adding a reference to a skill** -> follow "Adding a reference" below
  - **Validating a skill** -> follow "Validating" below
  - **Refactoring or splitting a skill** -> is the SKILL.md over 500 lines or covering unrelated concerns?
    - **Yes, covers multiple unrelated concerns** -> split into separate skill directories, one per concern
    - **Yes, just too long** -> extract to references, don't split
    - **No** -> the skill is fine, focus on content quality instead
  - **Extracting a reusable piece from a skill** -> see `references/skill-taxonomy.md` "Extracting skills downward". Check: could someone invoke this piece on its own and get useful output? If yes, extract it as its own lower-tier skill (atomic from workflow, workflow from agent)
  - **Publishing a skill to the marketplace** -> use the `publishing` skill

## Creating a skill

### 1. Capture intent
Start by understanding what the skill should do. If the conversation already contains a workflow to capture (e.g., "turn this into a skill"), extract answers from it — tools used, sequence of steps, corrections made, input/output formats. Otherwise, ask:

1. What should this skill enable an agent to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. What tier is this skill? See `references/skill-taxonomy.md` — atomic (does one thing), workflow (chains atomics in a known sequence), or agent (goal-driven, decides its own path). The tier shapes the decision tree, supporting resources, validation, and composition strategy.
Proactively ask about edge cases, example files, success criteria, and dependencies. Check available MCPs for research and the codebase for similar existing skills to avoid overlap. Come prepared with context.

### Agent workflow (optional)
For workflow or agent-tier skills with multiple references or unfamiliar domains, offer a research-write-validate pipeline using specialized agents. See `references/agent-workflow.md` for roles, flow, and the research brief format. Skip this for atomic skills or small improvements — it's overhead without quality gain. Always let the user decide.

### 2. Write the skill
1. Pick the owning plugin and create the directory: `plugins/<plugin>/skills/<skill-name>/`
2. Write `SKILL.md` with portable YAML frontmatter — include `name` and `description` first, then add client-specific fields only when the target client supports them (see `references/skill-format.md`)
3. Write the decision tree — use the **decision-trees** skill for this
4. Write conventions — the rules the agent must follow every time
5. Optionally add executable helpers if the skill has automatable tasks — use the `tooling` skill for this. Many skills work fine without any helpers.
6. Add references in `references/` for any detailed content over ~10 lines

Follow the writing principles in `references/writing-philosophy.md` — explain reasoning over rigid rules, keep the prompt lean, generalize rather than overfit to test cases.

#### Skill writing patterns
Keep SKILL.md under 5000 tokens (use `tools/token-estimate.ts` to check — line count is a rough proxy but tokens are the real constraint). If approaching this limit, add hierarchy with clear pointers to reference files. Reference files clearly from SKILL.md with guidance on when to read them. For large reference files (>300 lines), include a table of contents.

When a skill supports multiple domains/frameworks, organize by variant:

```text
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

### 3. Validate
1. Run `tools/skill-validate.ts <path>` to check structure
2. Run `tools/token-estimate.ts <path>/SKILL.md` to verify under 5000 tokens

## Improving a decision tree
Read SKILL.md to get the skill's responsibilities, then ensure each one has a decision tree branch leading to it. Use the **decision-trees** skill for format and writing guidelines.

## Adding a reference
1. Create `references/<topic>.md` — one topic per file, one level deep (no reference-to-reference chains)
2. Link from SKILL.md: "See `references/<topic>.md`"
3. Add to the key references table in SKILL.md

## Validating
1. Run `tools/skill-validate.ts <path>` — checks files, frontmatter, naming, line count
2. Run `tools/token-estimate.ts <path>/SKILL.md` — must be under 5000 tokens
3. Run `tools/coverage-gap.ts <path>` — compares responsibilities against content and tools

## Key references
|File|What it covers|
|---|---|
|`references/skill-taxonomy.md`|Skill tiers (atomic, workflow, agent), choosing a tier, extracting skills downward|
|`references/skill-structure.md`|Directory layout, SKILL.md structure, progressive disclosure|
|`references/skill-format.md`|Portable frontmatter, Codex metadata, Claude Code extensions, naming rules, string substitutions|
|`references/writing-philosophy.md`|Explain the why, keep prompts lean, generalize, description writing|
|`references/best-practices.md`|Anti-patterns, keeping SKILL.md lean|
|`references/agent-workflow.md`|Optional research-write-validate agent pipeline for complex skills|
|`references/advanced-features.md`|Agent-specific advanced features: Codex metadata, Claude Code dynamic context, invocation control, forked execution, hooks, permissions|

## Official spec vs. repo conventions
The skill format and structure references separate the portable Agent Skills baseline from Codex and Claude Code extensions. Check `references/skill-format.md` before adding client-specific frontmatter. The following are conventions specific to this repository — useful for organizing a skill library, but not required by the spec:

- **Skill taxonomy** (`references/skill-taxonomy.md`) — atomic/workflow/agent tiers
- **Decision trees** (via the **decision-trees** skill) — prescribed SKILL.md structure
