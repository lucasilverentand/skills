---
name: context
description: Creates and maintains LLM context files that make autonomous agents effective in a codebase. Reads project documentation in /docs, interviews the user for undocumented knowledge, and compiles the result into tool-specific context files (CLAUDE.md, .claude/rules/, .cursorrules, .github/copilot-instructions.md). Use when setting up a new project for AI-assisted development, creating CLAUDE.md, generating .cursorrules, syncing context files after docs changed, auditing whether context files match the current codebase, or when someone says "set up this project for Claude" or "create AI context".
allowed-tools: Read Write Edit Glob Grep Bash AskUserQuestion
---

# Project Context for LLMs

Compile project knowledge into context files that shape how LLMs behave in a codebase. The source of truth is human-readable documentation in `/docs` — context files are derived artifacts tailored to each tool's format.

> **Behavioral rule:** Never assume you know the answer. You can scan the codebase for signals, but always confirm with the user via AskUserQuestion before writing anything. The user's mental model, preferences, and unwritten rules are more valuable than anything you can infer from code. Be inquisitive, be guiding — ask good questions with well-structured options, but let the user drive every decision.

## Current context

- Project root: !`pwd`
- Has docs/: !`test -d docs && echo "yes — $(ls docs/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`
- Has CLAUDE.md: !`test -f CLAUDE.md && echo "yes — $(wc -l < CLAUDE.md | tr -d ' ') lines" || echo no`
- Has .claude/rules/: !`test -d .claude/rules && echo "yes — $(ls .claude/rules/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`
- Has .cursorrules: !`test -f .cursorrules && echo yes || echo no`

## Decision tree

- What is the user doing?
  - **"Set up this project for Claude/AI"** → follow "Full context generation" below
  - **"Organize existing context" / project has CLAUDE.md or .cursorrules but no /docs** → follow "Restructure existing context" below
  - **"Create CLAUDE.md"** → follow "Generate CLAUDE.md" below
  - **"Create .cursorrules"** → follow "Generate .cursorrules" below
  - **"Sync context files" / docs changed** → follow "Sync from docs" below
  - **"Audit context files"** → follow "Audit" below
  - **No context exists anywhere (no /docs, no CLAUDE.md, nothing)** → follow "Bootstrap from scratch" below

---

## Restructure existing context

For projects that already have context scattered across CLAUDE.md, .claude/rules/, .cursorrules, README sections, or inline comments — but no proper `/docs` structure. The goal: extract the knowledge into `/docs` as the source of truth, then re-derive clean context files from it.

### Step 1: Inventory existing context

Scan for all sources of project knowledge:

- `CLAUDE.md` at project root
- `.claude/rules/*.md`
- `.cursorrules`
- `.github/copilot-instructions.md`
- `README.md` (architecture, setup, contributing sections)
- `CONTRIBUTING.md`
- `.env.example` (documents required config)
- Inline `@doc` or `/** */` comments in entry points

Use AskUserQuestion to present what you found: "I found context in these locations — are there other places where project knowledge lives that I should pull from?"

### Step 2: Extract and classify

Read all discovered sources. Classify each piece of content by doc type:

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

Now that `/docs` is the source of truth, follow "Full context generation" Phase 3 onwards to interview for any remaining gaps and generate fresh context files. Use AskUserQuestion to ask: "Should I replace the existing CLAUDE.md/.cursorrules with versions derived from the new /docs, or keep them as-is?"

---

## Bootstrap from scratch

For projects with no documentation and no context files — start from zero.

### Step 1: Scan the codebase

Silently gather signals:
- Package files (`package.json`, `Cargo.toml`, `Package.swift`, `go.mod`)
- Build config (`.github/workflows/*.yml`, `Dockerfile`, `wrangler.toml`, `process-compose.yml`, `mise.toml`)
- Entry points and directory structure
- `.env.example` or `.env.local`
- README.md if it exists

### Step 2: Present findings and interview

Use AskUserQuestion: "I scanned the project. Here's what I found — [brief summary]. Before I start writing docs, I need to understand the project from your perspective."

Then run through the same 5 interview rounds as "Full context generation" Phase 3 — commands, architecture, conventions, anti-patterns, workflow. But since there are no existing docs to reference, every round starts from the user's answers, not from discovered content.

### Step 3: Choose scope

Use AskUserQuestion: "Based on what you've told me, which docs should we create?" Present the doc types table and recommend a starting set based on what the project needs. Let the user pick.

### Step 4: Write docs and context files

For each selected doc type, write to `docs/<name>.md`, present for review. After docs are written, follow "Full context generation" Phase 4 to generate context files.

---

## Full context generation

### Phase 1: Gather sources

1. Read all files in `docs/` — this is the primary source of truth
2. Read `CLAUDE.md` if it exists (may have manually-written content to preserve)
3. Read `.claude/rules/*.md` if they exist
4. Scan codebase for signals not in docs:
   - `package.json` / `Cargo.toml` / `Package.swift` for stack info
   - `.github/workflows/*.yml` for CI commands
   - `wrangler.toml`, `Dockerfile`, `process-compose.yml` for infra
   - `.env.example` for required config

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

Use AskUserQuestion to ask which AI tools the user works with and which formats to generate. Don't assume — present the options:

- `CLAUDE.md` — Claude Code
- `.claude/rules/*.md` — Claude Code (large projects)
- `.cursorrules` — Cursor
- `.github/copilot-instructions.md` — GitHub Copilot

For each selected format, draft the content, write it to the file, share the path, and ask the user to review before moving to the next format. Never generate all files silently — present each one for feedback.

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

## Generate .cursorrules

Read the same sources and write `.cursorrules` following the format in `references/cursorrules.md`. Cursor's format is a single file with a different tone — more concise, instruction-style.

---

## Sync from docs

When `/docs` has been updated and context files need to match:

1. Read the current context files (CLAUDE.md, .claude/rules/, .cursorrules)
2. Read the updated docs
3. Identify what changed in docs that isn't reflected in context files
4. Use AskUserQuestion to present each discrepancy: "I found these differences between /docs and your context files — which should I update?" Don't silently edit — the user may have intentionally diverged.
5. For approved changes, edit context files surgically using Edit — don't rewrite from scratch
6. Present the final result for review

---

## Audit

Check if context files are accurate and complete:

1. Read all context files
2. Read `/docs` and scan the codebase
3. Report:
   - **Stale** — context files reference things that no longer exist (renamed files, removed commands, changed patterns)
   - **Missing** — important project knowledge not in any context file (new packages, changed architecture, new commands)
   - **Contradictions** — context files disagree with each other or with docs
   - **Generic filler** — content that applies to any project and wastes tokens
4. Present findings via AskUserQuestion and offer to fix

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
| `references/cursorrules.md` | .cursorrules format and conversion guidance |
| `references/compilation.md` | How to derive context files from /docs source material |
