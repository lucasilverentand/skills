# Skills Library

A collection of agent skills for Claude Code. Each skill teaches Claude how to handle a specific domain.

## Validation

Before committing, run all three:

```bash
bun run generate -- --check   # marketplace.json is up to date
bun run validate:marketplace  # no errors (warnings are OK)
bun run validate              # all skills pass structure checks
```

If `generate -- --check` fails, run `bun run generate` to regenerate marketplace.json and commit the result.

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
