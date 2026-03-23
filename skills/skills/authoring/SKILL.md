---
name: authoring
description: Creates, tests, publishes, and maintains agent skills — scaffolds directories, writes SKILL.md with frontmatter and decision trees, adds tools and references, validates structure and token budgets, runs test evaluations with grading and benchmarking, optimizes descriptions for triggering, publishes skills to the marketplace, and manages versioning and catalog integrity. Use when creating a new skill from scratch, improving an existing skill, testing a skill, adding tools or references, optimizing a skill description, validating a skill, running evals to measure skill performance, publishing a skill to the marketplace, updating or removing a published skill, validating marketplace.json, or regenerating the catalog.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Skill Lifecycle

## Decision Tree

- What are you doing?
  - **Creating a new skill from scratch** -> follow "Creating a skill" below
  - **Improving an existing skill** -> what needs work?
    - **Decision tree is missing or shallow** -> see "Improving a decision tree" below
    - **SKILL.md is bloated (over ~5000 tokens)** -> run `tools/token-estimate.ts <path>/SKILL.md`, then extract sections over ~10 lines to `references/`, link from SKILL.md
    - **Skill instructions are too rigid or verbose** -> see `references/writing-philosophy.md` and rewrite: explain the why, drop heavy-handed MUSTs, remove lines that aren't pulling their weight
    - **Responsibilities exist without matching tools** -> follow "Adding a tool" below
    - **Missing references for detailed content** -> follow "Adding a reference" below
    - **Frontmatter is wrong or incomplete** -> see `references/skill-format.md` for all fields and fix
    - **Description is vague or undertriggering** -> rewrite per `references/writing-philosophy.md` "Description writing", or run the full description optimization workflow
    - **Not sure what's wrong** -> run `tools/coverage-gap.ts <path>` and `tools/skill-validate.ts <path>`, fix reported issues
  - **Testing a skill** -> follow "Testing a skill" below
  - **Optimizing a skill description** -> follow "Optimizing a description" below
  - **Adding a tool to a skill** -> follow "Adding a tool" below
  - **Adding a reference to a skill** -> follow "Adding a reference" below
  - **Validating a skill** -> follow "Validating" below
  - **Publishing a skill to the marketplace** -> follow "Publishing a skill" below
  - **Updating a published skill** -> what changed?
    - **Bug fix or wording tweak** -> bump patch version in `metadata.version` of marketplace.json
    - **New skills, new tools, or backwards-compatible additions** -> bump minor version
    - **Breaking changes (removed skills, renamed categories, restructured)** -> bump major version
  - **Removing a skill from the marketplace** -> follow "Removing a skill" below
  - **Moving a skill to a different category** -> remove the path from the old plugin's `skills` array, add it to the new one (create a new plugin entry if needed — see `references/marketplace-schema.md` "Plugin entry fields"), then run `tools/marketplace-lint.ts`
  - **Validating marketplace.json** -> run `tools/marketplace-lint.ts`, fix any errors per `references/marketplace-errors.md`
  - **Regenerating marketplace.json from disk** -> follow "Regenerating from disk" below
  - **Refactoring or splitting a skill** -> is the SKILL.md over 500 lines or covering unrelated concerns?
    - **Yes, covers multiple unrelated concerns** -> split into separate skill directories, one per concern
    - **Yes, just too long** -> extract to references, don't split
    - **No** -> the skill is fine, focus on content quality instead
  - **Extracting a reusable piece from a skill** -> see `references/skill-taxonomy.md` "Extracting skills downward". Check: could someone invoke this piece on its own and get useful output? If yes, extract it as its own lower-tier skill (atomic from workflow, workflow from agent)

## Creating a skill

### 1. Capture intent

Start by understanding what the skill should do. If the conversation already contains a workflow to capture (e.g., "turn this into a skill"), extract answers from it — tools used, sequence of steps, corrections made, input/output formats. Otherwise, ask:

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. What tier is this skill? See `references/skill-taxonomy.md` — atomic (does one thing), workflow (chains atomics in a known sequence), or agent (goal-driven, decides its own path). The tier shapes the decision tree, allowed-tools, and composition strategy.
5. Should we set up test cases? Skills with objectively verifiable outputs (file transforms, data extraction, code generation) benefit from them. Skills with subjective outputs (writing style, design) often don't.

Proactively ask about edge cases, example files, success criteria, and dependencies. Check available MCPs for research and the codebase for similar existing skills to avoid overlap. Come prepared with context.

### 2. Write the skill

1. Create the directory: `skills/<category>/<skill-name>/`
2. Write `SKILL.md` with YAML frontmatter — `description` is recommended for discovery (see `references/skill-format.md`)
4. Write the decision tree — see `references/decision-trees.md`
5. Write conventions — the rules the agent must follow every time
6. Add tools in `tools/` if the skill has automatable tasks (see "Adding a tool")
7. Add references in `references/` for any detailed content over ~10 lines

Follow the writing principles in `references/writing-philosophy.md` — explain reasoning over rigid rules, keep the prompt lean, generalize rather than overfit to test cases.

#### Skill writing patterns

Keep SKILL.md under 500 lines. If approaching this limit, add hierarchy with clear pointers to reference files. Reference files clearly from SKILL.md with guidance on when to read them. For large reference files (>300 lines), include a table of contents.

When a skill supports multiple domains/frameworks, organize by variant:
```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

### 3. Test cases

After writing the draft, come up with 2-3 realistic test prompts. Share them with the user for confirmation, then run them.

Save test cases to `evals/evals.json`. Don't write assertions yet — just the prompts. You'll draft assertions while runs are in progress.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": []
    }
  ]
}
```

### 4. Validate and test

1. Run `tools/skill-validate.ts <path>` to check structure
2. Run `tools/token-estimate.ts <path>/SKILL.md` to verify under 5000 tokens
3. Run the eval workflow — see "Testing a skill" below

## Testing a skill

This is the full test/eval/improve loop. See `references/eval-workflow.md` for the complete step-by-step protocol. The high-level flow:

1. **Validate first** — run `tools/skill-validate.ts` and `tools/token-estimate.ts` before testing
2. **Spawn all runs** — with-skill AND baseline runs for each test case, all in the same turn
3. **Draft assertions** while runs are in progress
4. **Capture timing** from subagent notifications as they complete
5. **Grade, aggregate, launch viewer** — use `agents/grader.md` for grading, `scripts/aggregate-benchmark.ts` for stats, `eval-viewer/generate_review.py` for the interactive viewer
6. **Read feedback** from the user's review
7. **Improve and iterate** — see `references/improvement-guide.md` for how to think about improvements

After each iteration, re-validate structure per `references/testing-guide.md`.

For blind A/B comparison between skill versions, see `references/blind-comparison.md`.

For platform-specific adaptations (Claude.ai, Cowork), see `references/platform-notes.md`.

## Optimizing a description

The `description` field determines whether Claude invokes a skill. See `references/description-optimization.md` for the full workflow:

1. Generate 20 trigger eval queries (mix of should-trigger and should-not-trigger)
2. Review with user via the HTML template in `assets/eval_review.html`
3. Run `scripts/run-loop.ts` optimization (requires Claude Code CLI)
4. Apply the best description to SKILL.md frontmatter

## Improving a decision tree

Read SKILL.md to get the skill's responsibilities, then ensure each one has a decision tree branch leading to it. See `references/decision-trees.md` for format and writing guidelines.

## Adding a tool

Only create a tool when it earns its place. A tool should do at least one of:
- **Compose multiple commands** into a workflow (e.g. fetch + merge + push for fork sync)
- **Contain real logic** — validation rules, categorization, threshold detection, conflict analysis
- **Automate an error-prone sequence** that's easy to get wrong by hand (e.g. cherry-pick across branches with worktree management)

If the task is a single command with flags, put it inline in SKILL.md instead. Don't create tools to hit a target count — a skill with one good tool and clear inline commands is better than a skill with three thin wrappers.

Steps:
1. Create `tools/<tool-name>.ts` using `references/tool-template.md` as a starting point
2. Reference the tool from SKILL.md decision tree where appropriate

## Adding a reference

1. Create `references/<topic>.md` — one topic per file, one level deep (no reference-to-reference chains)
2. Link from SKILL.md: "See `references/<topic>.md`"
3. Add to the key references table in SKILL.md

## Validating

1. Run `tools/skill-validate.ts <path>` — checks files, frontmatter, naming, line count
2. Run `tools/token-estimate.ts <path>/SKILL.md` — must be under 5000 tokens
3. Run `tools/coverage-gap.ts <path>` — compares responsibilities against content and tools

## Publishing a skill

1. Ensure the skill directory has a valid `SKILL.md` with frontmatter (`description` recommended)
2. Run the validator: `bun run tools/skill-validate.ts <path>`
3. Add the skill path to `.claude-plugin/marketplace.json`:
   - Find the plugin entry matching the skill's category directory
   - Add `"./skills/<category>/<skill-name>"` to the plugin's `skills` array
   - If no matching plugin exists, create a new plugin entry (see `references/marketplace-schema.md` "Plugin entry fields")
4. Run `tools/marketplace-lint.ts` to validate — fix any errors before committing

For bulk additions, use "Regenerating from disk" below instead.

## Removing a skill

1. Remove the skill path from the plugin's `skills` array in marketplace.json
2. If the plugin has no remaining skills, remove the entire plugin entry
3. Run `tools/marketplace-lint.ts` to validate
4. Bump the marketplace version — minor if backwards-compatible, major if consumers depended on it

## Regenerating from disk

1. Run `bun run scripts/generate-marketplace.ts` from the repo root
2. Run `tools/marketplace-lint.ts` to validate the generated file
3. Review the diff — generation may add skills you didn't intend or lose manual edits

## Marketplace conventions

See `references/marketplace-schema.md` for the full schema. Key conventions:

- **Category mapping**: `communication`, `data`, `deployment`, `development`, `documentation`, `git`, `infrastructure`, `research`, `security`, `skills` -> `devtools` | `editors` -> `editor` | `project` -> `web-development`
- **Naming**: lowercase alphanumeric + hyphens, 1-64 characters
- **Versioning**: `metadata.version` tracks overall marketplace version using semver
- **`strict: false`**: this repo uses `strict: false` for all plugins — marketplace entry IS the full definition, no separate `plugin.json` needed

## Key references

| File | What it covers |
|---|---|
| `references/skill-taxonomy.md` | Skill tiers (atomic, workflow, agent), choosing a tier, extracting skills downward |
| `references/skill-structure.md` | Directory layout, SKILL.md structure, progressive disclosure |
| `references/skill-format.md` | Frontmatter fields, naming rules, Claude Code extensions, string substitutions |
| `references/decision-trees.md` | Decision tree format, writing guidelines, agent usage |
| `references/writing-philosophy.md` | Explain the why, keep prompts lean, generalize, description writing |
| `references/best-practices.md` | Anti-patterns, keeping SKILL.md lean |
| `references/tool-template.md` | Starter script for new tools |
| `references/testing-guide.md` | Validation before/after testing, eval query quality, assertion quality |
| `references/eval-workflow.md` | Full eval running/grading/viewer protocol |
| `references/improvement-guide.md` | How to think about improvements, iteration loop |
| `references/description-optimization.md` | Trigger eval queries, optimization loop, applying results |
| `references/blind-comparison.md` | Blind A/B comparison between skill versions |
| `references/platform-notes.md` | Claude.ai and Cowork adaptations |
| `references/schemas.md` | JSON structures for evals, grading, benchmark, timing |
| `references/marketplace-schema.md` | marketplace.json schema, plugin.json, source types, skill discovery |
| `references/marketplace-errors.md` | Validation error codes and fixes |
| `references/advanced-features.md` | Extended thinking, legacy commands, bundled skills, subagent preloading, hooks, permission control |

## Official spec vs. repo conventions

The skill format, structure, locations, and advanced features documented in the references above reflect the official [Claude Code Agent Skills specification](https://agentskills.io). The following are conventions specific to this repository — useful for organizing a skill library, but not required by the spec:

- **Skill taxonomy** (`references/skill-taxonomy.md`) — atomic/workflow/agent tiers
- **Decision trees** (`references/decision-trees.md`) — prescribed SKILL.md structure
- **Eval framework** — testing, grading, benchmarking, blind comparison, description optimization
- **Marketplace** — marketplace.json schema, plugin entries, catalog generation

## Subagent instructions

| File | When to read |
|---|---|
| `agents/grader.md` | Spawning a grader to evaluate assertions against outputs |
| `agents/comparator.md` | Running a blind A/B comparison between two outputs |
| `agents/analyzer.md` | Analyzing why one version beat another, or analyzing benchmark patterns |
