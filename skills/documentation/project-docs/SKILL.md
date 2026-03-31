---
name: project-docs
description: Guides users through creating comprehensive project documentation that lives alongside the code. Interviews the user to capture purpose, architecture, setup, deployment, data model, API surface, configuration, operations, and decision records. Use when asked to document a project, create project docs, set up a docs folder, write developer documentation, or when someone says "document this project".
allowed-tools: Read Write Edit Glob Grep Bash AskUserQuestion
---

# Project Documentation

An interactive workflow that interviews the user to produce structured documentation files inside the repository. Every doc lives in `docs/` so it stays versioned with the code.

## Current context

- Project root: !`pwd`
- Has docs/: !`test -d docs && echo "yes — $(ls docs/ 2>/dev/null | wc -l | tr -d ' ') files" || echo no`
- Has README: !`test -f README.md && echo yes || echo no`
- Package manager: !`test -f bun.lockb && echo bun || (test -f pnpm-lock.yaml && echo pnpm || (test -f yarn.lock && echo yarn || (test -f package-lock.json && echo npm || (test -f Cargo.lock && echo cargo || (test -f go.sum && echo go || echo unknown)))))`

## Decision tree

- What is the user doing?
  - **Starting fresh — "document this project"** → follow "Full documentation workflow" below
  - **Adding a specific doc type** → skip to "Guided creation" for that type
  - **Updating existing docs** → read the existing doc, interview for what changed, edit surgically
  - **Auditing existing docs for gaps** → follow "Documentation audit" below

---

## Full documentation workflow

### Phase 1: Discovery

1. Scan the project to build context silently:
   - Read `package.json`, `Cargo.toml`, `go.mod`, or equivalent for name/description/deps
   - Glob for `docs/**/*.md` to see what already exists
   - Check for README.md, CONTRIBUTING.md, CHANGELOG.md
   - Glob for `.github/workflows/*.yml`, `Dockerfile`, `docker-compose.yml`, `wrangler.toml`
   - Check for `.env.example` or `.env.local`
2. Use AskUserQuestion to present findings and ask:
   - "Here's what I found — is this accurate? What's missing from my understanding?"
   - One-liner: what is this project and who is it for?
   - Is this a solo project, small team, or open source?
   - What's the current pain point — onboarding new devs, ops knowledge, or general context?

### Phase 2: Doc menu

Present the documentation types as a checklist using AskUserQuestion. Recommend a starting set based on what the project already has.

| Doc | File | When to recommend |
|---|---|---|
| Project overview | `docs/overview.md` | Always — every project needs this |
| Architecture | `docs/architecture.md` | Multi-service, monorepo, or non-trivial system design |
| Getting started | `docs/getting-started.md` | Always — anyone cloning the repo needs this |
| Contributing | `docs/contributing.md` | Team projects or open source |
| Deployment | `docs/deployment.md` | Anything that gets deployed |
| Data model | `docs/data-model.md` | Projects with a database |
| API reference | `docs/api.md` | Projects exposing HTTP/gRPC/WebSocket APIs |
| Configuration | `docs/configuration.md` | Projects with env vars, feature flags, or config files |
| Operations | `docs/operations.md` | Production services with monitoring/alerting |
| Decision records | `docs/decisions/` | Teams that want to track architectural decisions |

Ask the user to pick which docs to create and in what order. Suggest a sensible default order based on their stated pain point.

### Phase 3: Guided creation

For each selected doc type, follow this loop:

1. **Interview** — Use AskUserQuestion to walk through the question set for that doc type. See `references/interview-guides.md` for the full question sets. Ask 3-5 questions at a time, not all at once.
2. **Draft** — Write the doc to `docs/<filename>.md` using the structure from `references/doc-types.md`. Include only what the user confirmed — don't invent details.
3. **Review** — Share the file path and ask the user to review. Accept freeform feedback or direct file edits.
4. **Refine** — Use Edit to make surgical changes based on feedback. Iterate until the user is satisfied.
5. **Next** — Move to the next doc in the queue.

### Phase 4: Cross-reference check

After all docs are written:

1. Read all generated docs
2. Check for contradictions, stale references, or gaps between docs
3. Add cross-links between related docs (e.g., "See [Configuration](configuration.md) for environment setup")
4. Present findings to user via AskUserQuestion — fix or dismiss each

---

## Documentation audit

For existing docs:

1. Read all files in `docs/`
2. Scan the codebase for things that should be documented but aren't
3. Check each doc against the structure in `references/doc-types.md` — what sections are missing?
4. Present a gap report using AskUserQuestion:
   - Missing doc types the project would benefit from
   - Existing docs with incomplete sections
   - Stale information (references to things that no longer exist in code)
5. Offer to fill the gaps using the guided creation workflow

---

## Writing guidelines

- **Be specific, not generic** — "Run `bun install`" not "Install dependencies using your package manager"
- **No filler** — every sentence should carry information the reader needs
- **Code examples over prose** — show the command, the config, the snippet
- **Keep it current** — docs that reference actual files, actual commands, actual env vars
- **One source of truth** — if something is documented in code comments or README, reference it instead of duplicating

## File conventions

- All docs go in `docs/` at the project root
- Filenames: `kebab-case.md`
- Decision records: `docs/decisions/NNNN-title.md` (zero-padded sequence number)
- Use relative links between docs
- Include a `docs/README.md` index only if there are 4+ doc files

## Key references

| File | What it covers |
|---|---|
| `references/doc-types.md` | Structure templates and section guidance for each doc type |
| `references/interview-guides.md` | Question sets used during guided creation for each doc type |
