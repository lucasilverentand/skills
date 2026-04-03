# Skills Library

A collection of 39 agent skills for Codex, organized into 12 plugins and 7 intent-based bundles.

## Commands

```bash
bun run generate             # regenerate marketplace.json from disk
bun run generate -- --check  # verify marketplace.json is up to date (CI uses this)
bun run validate             # validate all skills pass structure checks
bun run validate:marketplace # validate marketplace integrity (no errors, warnings OK)
bun run validate:metadata    # validate marketplace.json schema
bun run validate:skill <dir> # validate a single skill directory
```

Run all three before committing: `generate -- --check`, `validate:marketplace`, `validate`.

## Architecture

```
skills/
  <category>/
    <skill-name>/
      SKILL.md              # entry point — frontmatter + decision tree + conventions
      references/            # detailed docs loaded on demand
      tools/                 # automation scripts (Bun/TypeScript)
scripts/                     # repo-level tooling (generator, validators)
.Codex-plugin/
  marketplace.json           # registry — maps skills to plugins and bundles
```

- **Skills** are the atomic unit — each teaches Codex one domain
- **Plugins** group related skills by category (development, security, deployment, etc.)
- **Bundles** are intent-based collections of plugins (full-stack-web, mobile-dev, api-backend, etc.)
- **marketplace.json** is the registry — auto-generated from disk by `bun run generate`
- **plugin-config.ts** defines bundle composition and category overrides

## Creating or modifying skills

Use the `skills/authoring` skill — don't write skills manually. It handles structure, validation, and marketplace registration.

Quick reference for the expected structure:
1. Create `skills/<category>/<skill-name>/` with a `SKILL.md`
2. SKILL.md has YAML frontmatter (`name`, `description` with "Use when" clause)
3. Add `references/*.md` for detailed content, `tools/*.ts` for automation
4. Run `bun run generate` to register in marketplace.json
5. Run all three validation commands

## Conventions

- **SKILL.md** is the entry point — under 500 lines, has YAML frontmatter with `name` and `description`
- **Description** must include a `Use when` clause for reliable triggering
- **References** (`references/*.md`) hold detailed content; SKILL.md links to them
- **Tools** (`tools/*.ts`) contain real logic — not thin wrappers around single commands
- **No PURPOSE.md** — the SKILL.md description and decision tree serve this role
- Pin GitHub Actions to SHA in all workflow examples (see `security/supply-chain`)

## Stack alignment

Skills should reflect the active tech stack. When adding code examples:

- **TypeScript**: Bun runtime, Hono for APIs, Biome for lint/format, Drizzle ORM, Zod for validation
- **Swift**: Swift 6.2, SwiftUI with @Observable, Swift Testing framework, zero third-party deps
- **Package manager**: Bun (`bun add`, `bunx`, `bun test`) — never npm/npx/yarn/pnpm
- **Secrets**: Doppler for local dev, platform stores for prod — never in files
- **Containers**: OrbStack locally, not Docker Desktop
- **Env access**: `@scope/config` in app code, never `process.env` directly (except build-time config files)
- **Error handling**: `{ ok, error }` result types, throw only at system boundaries

## Gotchas

- Don't create skills by hand — use the `skills/authoring` skill which handles validation and marketplace registration
- `bun run generate` overwrites marketplace.json completely — manual edits to it will be lost
- Bundle definitions live in `scripts/plugin-config.ts`, not in marketplace.json
- Empty directories (no SKILL.md) are ignored by the generator — they won't appear in marketplace.json
- The development plugin has nested platform dirs (`typescript/`, `swift/`) — other plugins are flat
