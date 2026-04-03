---
name: context
description: Creates and maintains LLM context files that make autonomous agents effective in a codebase. Reads project documentation in /docs, interviews the user for undocumented knowledge, and compiles the result into tool-specific context files (CLAUDE.md, .claude/rules/, .cursorrules, .github/copilot-instructions.md). Use when setting up a new project for AI-assisted development, creating CLAUDE.md, generating .cursorrules, syncing context files after docs changed, auditing whether context files match the current codebase, or when someone says "set up this project for Claude" or "create AI context".
allowed-tools: Read Write Edit Glob Grep Bash AskUserQuestion
---

# Project Context for LLMs

Compile project knowledge into context files that shape how LLMs behave in a codebase. The source of truth is human-readable documentation in `/docs` — context files are derived artifacts tailored to each tool's format.

## Current context

- Project root: !`pwd`
- Has docs/: !`test -d docs && echo "yes — $(ls docs/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`
- Has CLAUDE.md: !`test -f CLAUDE.md && echo "yes — $(wc -l < CLAUDE.md | tr -d ' ') lines" || echo no`
- Has .claude/rules/: !`test -d .claude/rules && echo "yes — $(ls .claude/rules/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`
- Has .cursorrules: !`test -f .cursorrules && echo yes || echo no`

## Decision tree

- What is the user doing?
  - **"Set up this project for Claude/AI"** → follow "Full context generation" below
  - **"Create CLAUDE.md"** → follow "Generate CLAUDE.md" below
  - **"Create .cursorrules"** → follow "Generate .cursorrules" below
  - **"Sync context files" / docs changed** → follow "Sync from docs" below
  - **"Audit context files"** → follow "Audit" below
  - **No /docs exists yet** → suggest running the `documentation/project-docs` skill first, then come back here

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

Use AskUserQuestion to confirm the assessment:

| Signal | Small project | Large project |
|---|---|---|
| Packages / crates | 1 | 3+ (monorepo) |
| Languages | 1 | 2+ |
| Deploy targets | 1 | 2+ (Workers + mobile + web) |
| Team size | solo | 2+ |

- **Small project** → single `CLAUDE.md` at root (everything in one file)
- **Large project** → thin `CLAUDE.md` at root + `.claude/rules/*.md` split by topic

### Phase 3: Interview for gaps

The docs may not cover everything an LLM needs. Interview the user for:

1. **Build & test commands** — exact commands to build, test, lint, typecheck. These are the most critical — an agent that can't run tests is useless.
2. **Architecture mental model** — how do the pieces fit together? What does a request flow through? What are the domain concepts?
3. **Conventions the codebase enforces** — naming patterns, error handling style, file organization rules, things that would fail code review.
4. **"Don't do this" rules** — anti-patterns specific to this project. Things a smart agent would try that are wrong here.
5. **Workflow preferences** — how should the agent commit, test, deploy? What decisions can it make autonomously vs what requires asking?

For each area, check if `/docs` already covers it. Only ask about gaps.

### Phase 4: Generate context files

Use AskUserQuestion to confirm which formats to generate:

- `CLAUDE.md` — always (primary target)
- `.claude/rules/*.md` — for large projects
- `.cursorrules` — if the user uses Cursor
- `.github/copilot-instructions.md` — if the user uses Copilot

Then follow the appropriate generation section below.

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
3. Diff mentally — what changed in docs that isn't reflected in context files?
4. Edit context files surgically using Edit — don't rewrite from scratch
5. Present changes to the user for review

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
