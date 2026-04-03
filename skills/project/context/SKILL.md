---
name: context
description: Creates and maintains CLAUDE.md and .claude/rules/ files that make Claude Code effective in a codebase. Reads project documentation in /docs, interviews the user for undocumented knowledge, and compiles the result into context files. Use when setting up a new project for Claude, creating CLAUDE.md, syncing context files after docs changed, auditing whether context files match the current codebase, or when someone says "set up this project for Claude" or "create AI context".
allowed-tools: Read Write Edit Glob Grep Bash AskUserQuestion Agent
---

# Project Context for Claude

Compile project knowledge into context files that shape how Claude Code behaves in a codebase. The source of truth is human-readable documentation in `/docs` — CLAUDE.md and .claude/rules/ are derived artifacts.

> **Behavioral rule:** Never assume you know the answer. You can scan the codebase for signals, but always confirm with the user via AskUserQuestion before writing anything. The user's mental model, preferences, and unwritten rules are more valuable than anything you can infer from code. Be inquisitive, be guiding — ask good questions with well-structured options, but let the user drive every decision.

## Current context

- Project root: !`pwd`
- Has docs/: !`test -d docs && echo "yes — $(ls docs/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`
- Has CLAUDE.md: !`test -f CLAUDE.md && echo "yes — $(wc -l < CLAUDE.md | tr -d ' ') lines" || echo no`
- Has .claude/rules/: !`test -d .claude/rules && echo "yes — $(ls .claude/rules/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`

## Decision tree

- What is the user doing?
  - **"Set up this project for Claude/AI"** → follow "Full context generation" below
  - **"Organize existing context" / project has CLAUDE.md but no /docs** → follow "Restructure existing context" below
  - **"Create CLAUDE.md"** → follow "Generate CLAUDE.md" below
  - **"Sync context files" / docs changed** → follow "Sync from docs" below
  - **"Audit context files"** → follow "Audit" below
  - **No context exists anywhere (no /docs, no CLAUDE.md, nothing)** → follow "Bootstrap from scratch" below

---

## Restructure existing context

For projects that already have context scattered across CLAUDE.md, .claude/rules/, README sections, or inline comments — but no proper `/docs` structure. The goal: extract the knowledge into `/docs` as the source of truth, then re-derive clean context files from it.

### Step 1: Catalog all project knowledge

Use the catalog workflow described in "Building the catalog" below. This produces a structured inventory of every knowledge source in the project with summaries and classifications.

### Step 2: Present catalog and classify

Present the catalog to the user via AskUserQuestion: "I cataloged [N] files across the project. Here's what I found — [catalog summary grouped by type]. Which of these should feed into the project context? Are there sources I missed?"

Then classify the user-approved sources by doc type:

| Content about... | Belongs in |
|---|---|
| What the project is, who it's for | `docs/overview.md` |
| Stack, structure, modules, data flow | `docs/architecture.md` |
| Install, setup, commands, dev environment | `docs/getting-started.md` |
| Commit style, naming, code patterns, PR process | `docs/contributing.md` |
| Env vars, secrets, feature flags | `docs/configuration.md` |
| Deploy targets, CI, rollback | `docs/deployment.md` |
| DB schema, entities, migrations | `docs/data-model.md` |
| Endpoints, auth, request/response | `docs/api.md` |

Use AskUserQuestion to present the proposed mapping: "Here's how I'd organize the existing content into /docs — does this split make sense? Should anything move?"

### Step 3: Interview for gaps

The existing context files were likely written ad-hoc and may have gaps. Work through each doc type that has content and use AskUserQuestion to ask: "For [doc type], I extracted [summary]. Is this complete, or is there more you'd want captured here?"

Also ask about doc types that have no content yet: "I didn't find anything about [deployment/testing/data model]. Should we create a doc for that, or is it not relevant for this project?"

### Step 4: Write /docs

For each doc type with content, write the file to `docs/<name>.md` following the structure from `references/compilation.md` (but in reverse — expanding terse context-file content into proper human-readable documentation). Present each file for review via AskUserQuestion before moving to the next.

### Step 5: Re-derive context files

Now that `/docs` is the source of truth, follow "Full context generation" Phase 3 onwards to interview for any remaining gaps and generate fresh context files. Use AskUserQuestion to ask: "Should I replace the existing CLAUDE.md with a version derived from the new /docs, or keep it as-is?"

---

## Bootstrap from scratch

For projects with no documentation and no context files — start from zero.

### Step 1: Catalog the project

Use the catalog workflow described in "Building the catalog" below. Even in a "no docs" project, the catalog finds README files, config, CI workflows, and code structure.

### Step 2: Present findings and interview

Use AskUserQuestion to present the catalog: "I scanned the project and cataloged [N] files. Here's what I found — [catalog summary]. Before I start writing docs, I need to understand the project from your perspective."

Then run through the same 5 interview rounds as "Full context generation" Phase 3 — commands, architecture, conventions, anti-patterns, workflow. But since there are no existing docs to reference, every round starts from the user's answers, not from discovered content.

### Step 3: Choose scope

Use AskUserQuestion: "Based on what you've told me, which docs should we create?" Present the doc types table and recommend a starting set based on what the project needs. Let the user pick.

### Step 4: Write docs and context files

For each selected doc type, write to `docs/<name>.md`, present for review. After docs are written, follow "Full context generation" Phase 4 to generate context files.

---

## Full context generation

### Phase 1: Gather sources

Use the catalog workflow described in "Building the catalog" below. Then present via AskUserQuestion: "Here's everything I found — are there sources I missed?"

The catalog covers `/docs` (primary source), all markdown files across the project, existing context files (CLAUDE.md, .claude/rules/), and codebase signals (package files, CI, infra config).

### Phase 2: Assess project complexity

Scan the project for complexity signals, then present your assessment via AskUserQuestion and let the user decide the format. Don't assume — a seemingly simple project may have hidden complexity, or a large monorepo may want a single concise file.

Use AskUserQuestion: "Based on what I see, this looks like a [small/large] project — [reasons]. I'd suggest [single CLAUDE.md / split into .claude/rules/]. Does that match your sense, or would you prefer a different approach?"

| Signal | Points to single CLAUDE.md | Points to .claude/rules/ split |
|---|---|---|
| Packages / crates | 1 | 3+ (monorepo) |
| Languages | 1 | 2+ |
| Deploy targets | 1 | 2+ |
| Team size | solo | 2+ |

### Phase 3: Interview — never assume, always ask

**Critical rule:** Do not guess or infer answers from scanning the codebase. The codebase tells you *what exists*, not *what the user wants agents to do*. Always use AskUserQuestion to confirm understanding and discover preferences.

Work through these areas one at a time. For each, first check if `/docs` already covers it — if it does, present what you found and ask the user to confirm or correct. If it doesn't, ask from scratch.

**Round 1: Commands**
Use AskUserQuestion: "What commands does a developer need daily? I found these in package.json/Makefile/mise.toml — are they complete? Which ones should agents know about?" Present what you discovered as options, let the user correct. Commands are the most critical section — get them exactly right.

**Round 2: Architecture**
Use AskUserQuestion: "How would you describe this project's architecture to a new team member in 30 seconds?" Don't present a wall of text you generated — ask the user to tell you how the pieces fit. Follow up: "What does a typical request flow through?" and "Which package/module owns which concern?"

**Round 3: Conventions**
Use AskUserQuestion: "What are the conventions that would cause you to reject a PR if violated?" Present categories (naming, error handling, file organization, imports, testing approach) and let the user fill in what matters. Don't assume conventions from the code — the code may have inconsistencies the user wants to fix, not preserve.

**Round 4: Anti-patterns**
Use AskUserQuestion: "What are the things a smart agent would try that are wrong in this project?" These are the highest-value entries in a context file — things that aren't obvious from reading the code. Give examples to prime the user: "e.g., using a certain library, accessing env vars a certain way, organizing files differently than expected."

**Round 5: Workflow**
Use AskUserQuestion: "How should an agent working in this project behave?" Ask about: commit style, when to run tests, what decisions it can make alone vs what requires asking, any CI/deploy steps it should handle or avoid.

### Phase 4: Generate context files

Based on the complexity assessment from Phase 2, generate:

- **Small project** → single `CLAUDE.md` — follow "Generate CLAUDE.md" below
- **Large project** → `CLAUDE.md` index + `.claude/rules/*.md` — follow "Generate CLAUDE.md" → "For large projects: split into rules"

Draft the content, write it to the file, share the path, and ask the user to review. Never write silently — present for feedback.

---

## Generate CLAUDE.md

Read all sources (docs, codebase signals, interview answers) and write a single `CLAUDE.md` following the structure in `references/claude-md.md`.

**Key principles:**

- **Commands first** — build, test, lint, typecheck commands at the top. This is what agents use most.
- **Architecture as mental model** — not a full design doc, but enough for an agent to understand where code lives and how pieces connect.
- **Conventions as rules** — state what to do, not what the project does. "Use `@Observable`, not `ObservableObject`" is actionable. "The project uses SwiftUI" is not.
- **Be specific** — name actual files, actual commands, actual patterns. Generic advice is worthless.
- **Omit the obvious** — don't explain what git is or how TypeScript works. Only document what's specific to this project.
- **Keep it under 300 lines** — if it's longer, split into `.claude/rules/`.

### For large projects: split into rules

When the project needs more than 300 lines of context, create `.claude/rules/*.md`:

| File | Contents |
|---|---|
| `.claude/rules/architecture.md` | Stack, structure, module responsibilities, data flow |
| `.claude/rules/development.md` | Setup, commands, ports, secrets, dev environment |
| `.claude/rules/conventions.md` | Naming, error handling, file org, code patterns |
| `.claude/rules/testing.md` | Test strategy, commands, fixtures, what to mock |
| `.claude/rules/deployment.md` | Environments, deploy commands, CI pipeline |

The root `CLAUDE.md` becomes a thin index:

```markdown
# Project Name

One-line description.

## Project Guidelines
All coding guidelines, conventions, and best practices are in `.claude/rules/`:
- Architecture & patterns
- Dev environment (setup, running services, ports, secrets)
- Testing
- Conventions
- Deployment

Read the relevant rule files before starting work on any area.
```

See `references/rules-format.md` for the structure of each rules file.

---

## Sync from docs

When `/docs` has been updated and context files need to match:

1. Read the current context files (CLAUDE.md, .claude/rules/)
2. Read the updated docs
3. Identify what changed in docs that isn't reflected in context files
4. Use AskUserQuestion to present each discrepancy: "I found these differences between /docs and your context files — which should I update?" Don't silently edit — the user may have intentionally diverged.
5. For approved changes, edit context files surgically using Edit — don't rewrite from scratch
6. Present the final result for review

---

## Audit

Check if context files are accurate and complete:

1. Run the catalog workflow ("Building the catalog") to get a fresh inventory with staleness signals
2. Compare the catalog against existing context files
3. Report:
   - **Stale** — context files reference things that no longer exist (renamed files, removed commands, changed patterns)
   - **Missing** — important project knowledge not in any context file (new packages, changed architecture, new commands)
   - **Contradictions** — context files disagree with each other or with docs
   - **Generic filler** — content that applies to any project and wastes tokens
4. Present findings via AskUserQuestion and offer to fix

---

## Building the catalog

Every workflow starts by building a catalog of all project knowledge. This uses subagents to parallelize the work — a large project can have dozens of markdown files and config sources.

### Step 1: Discover files

Glob for all knowledge sources:

```
**/*.md
.env.example
.env.local
```

Also list: `package.json`, `Cargo.toml`, `Package.swift`, `go.mod`, `.github/workflows/*.yml`, `Dockerfile`, `wrangler.toml`, `process-compose.yml`, `mise.toml`.

### Step 2: Spawn catalog agents

For each discovered file (or batch of small files), spawn a subagent with:

> "Read this file and produce a catalog entry. Return:
> - **path**: the file path
> - **type**: one of: documentation, context-file, config, ci, readme, changelog, decision-record, api-spec, other
> - **summary**: 1-2 sentence description of what knowledge this file contains
> - **topics**: list of topics covered (e.g., architecture, commands, conventions, deployment, testing, data-model, auth, secrets)
> - **staleness**: any signals that the content may be outdated (references to files that don't exist, old version numbers, deprecated patterns)
> - **quality**: high (detailed, specific, current), medium (useful but incomplete), low (generic, stale, or near-empty)"

Launch subagents in parallel — batch by directory to keep the number manageable. For projects with 50+ markdown files, batch 5-10 files per agent.

### Step 3: Assemble the catalog

Collect all subagent results into a structured catalog grouped by type:

```
## Documentation (N files)
- docs/architecture.md — [summary] — topics: architecture, data-flow — quality: high
- docs/getting-started.md — [summary] — topics: commands, setup — quality: medium (missing test commands)

## Context files (N files)
- CLAUDE.md — [summary] — topics: commands, conventions — quality: high
- .claude/rules/architecture.md — [summary] — topics: architecture — quality: high

## Package READMEs (N files)
- packages/api/README.md — [summary] — topics: api, auth — quality: medium

## Config & CI (N files)
- .github/workflows/ci.yml — [summary] — topics: ci, testing
- wrangler.toml — [summary] — topics: deployment, config
```

### Step 4: Identify what's useful

From the catalog, determine:
- **Primary sources** — high-quality files with substantive content to extract
- **Supporting sources** — medium-quality files that fill gaps
- **Redundant** — files that duplicate content in primary sources
- **Stale** — files flagged by subagents as potentially outdated
- **Gaps** — topics that no file covers (comparing against the full topic list: architecture, commands, conventions, testing, deployment, configuration, data-model, auth, api)

This analysis feeds into the next step of whichever workflow invoked the catalog.

---

## Writing guidelines

### What makes context files effective

An LLM context file is good when an agent reading it can:
1. **Build and test** the project without asking how
2. **Navigate** to the right file for a given concern
3. **Follow conventions** that would pass code review
4. **Avoid pitfalls** specific to this project

### What to include

- Exact build/test/lint commands with flags
- Project structure with one-line purpose per directory
- Architecture as component relationships, not implementation details
- Naming conventions with examples
- Error handling patterns with code snippets
- "Don't do X, do Y instead" rules with reasoning
- Workflow rules (commit style, testing expectations, PR process)

### What to omit

- General programming knowledge (how async/await works, what REST is)
- Full API reference (that's what the code is for)
- Change history (that's git)
- Deployment credentials or secrets
- Long code examples (link to actual files instead)

### Tone

- Direct, imperative — "Use X" not "We recommend using X"
- Specific — "Run `bun test --bail`" not "Run the tests"
- Concise — every line should earn its place
- Explain *why* only when the reason isn't obvious

## Key references

| File | What it covers |
|---|---|
| `references/claude-md.md` | CLAUDE.md structure, section templates, examples |
| `references/rules-format.md` | .claude/rules/ file structure for large projects |
| `references/compilation.md` | How to derive context files from /docs source material |
