# Compiling /docs into Context Files

The `/docs` directory is the human-readable source of truth. Context files (CLAUDE.md, .cursorrules, etc.) are derived from it — condensed, restructured, and optimized for LLM consumption.

## The compilation mindset

Documentation explains. Context files instruct.

| /docs says | Context file says |
|---|---|
| "The project uses Bun as its JavaScript runtime..." | `bun test --bail` |
| "Our error handling follows the Result type pattern where functions return..." | `Return { ok, error } — throw only at system boundaries` |
| "To set up the development environment, first ensure..." | `bun install && bun run dev` |
| "The architecture consists of three main services..." | A 5-line directory tree with one-line descriptions |

## What to extract from each doc type

### From docs/overview.md
- **Project identity** → first 2-3 lines of CLAUDE.md
- **Key concepts** → only if they affect how code should be written

### From docs/architecture.md
- **Project structure** → directory tree with purposes
- **Component relationships** → which package owns what, request flow
- **Key design decisions** → only the ones that constrain coding choices

### From docs/getting-started.md
- **Prerequisites** → prerequisites section
- **Commands** → build/test/lint commands (the most critical extraction)
- **Verification** → how to check the setup works

### From docs/contributing.md
- **Commit style** → conventions section
- **PR process** → workflow rules
- **Code style** → conventions section
- **Testing expectations** → testing rules

### From docs/deployment.md
- **Deploy commands** → only if agents run deploys
- **Environments** → brief table
- **Migration process** → if relevant to development

### From docs/data-model.md
- **Entity names and relationships** → only the high-level model, not full schemas
- **Naming conventions** → if the DB has specific patterns

### From docs/configuration.md
- **Required env vars** → brief list with purpose
- **Secret management** → how secrets flow (Doppler, platform stores)

### From docs/operations.md
- **Skip most of it** — operations docs are for humans on-call, not for coding agents
- **Health check URLs** → if useful during development

### From docs/decisions/*.md
- **Extract active constraints** — decisions that restrict what code can do
- **Skip historical context** — the "why we chose X over Y" narrative is for humans

## Condensation rules

1. **Commands are sacred** — copy them exactly, including flags. A wrong command is worse than no command.
2. **Prose becomes bullets** — convert paragraphs into imperative statements.
3. **Examples beat explanations** — "Use `nanoid(12)` for IDs" not "IDs are generated using the nanoid library with a length of 12 characters."
4. **Omit setup narratives** — "Install Bun, then..." becomes `bun install`.
5. **Keep specifics, drop generics** — "Files in `src/modules/` are organized by feature" is useful. "Follow clean code principles" is not.
6. **One pass, not incremental** — read all docs, then write the context file. Don't append section by section.

## Multi-format generation

When generating multiple formats from the same sources:

1. **Start with CLAUDE.md** — it's the most detailed format
2. **Derive .cursorrules** from CLAUDE.md — condense, flatten, drop substitutions (see `cursorrules.md`)
3. **Derive .github/copilot-instructions.md** from CLAUDE.md — similar format, drop Claude-specific features

Never maintain formats independently — they should all trace back to the same `/docs` source material.

## Keeping context files current

Context files go stale when:
- New packages are added but not listed in the architecture section
- Commands change (new scripts, renamed tasks)
- Conventions evolve (new patterns adopted, old ones dropped)
- Dependencies change (new frameworks, version bumps with API changes)

When updating `/docs`, also update context files. When you notice a context file references something that no longer exists, fix it immediately — stale instructions actively harm agent performance.
