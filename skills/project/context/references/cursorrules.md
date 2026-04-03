# .cursorrules Format

Cursor reads `.cursorrules` from the project root. It's a single file with no frontmatter — just plain text or markdown that's injected into every Cursor AI request.

## Key differences from CLAUDE.md

| Aspect | CLAUDE.md | .cursorrules |
|---|---|---|
| Loaded by | Claude Code | Cursor AI |
| Format | Markdown with sections | Plain text or markdown |
| Split files | `.claude/rules/*.md` | Single file only |
| String substitution | `!` backtick commands | Not supported |
| Length | 50-300 lines | Keep under 200 lines |

## Converting from CLAUDE.md

When generating `.cursorrules` from a CLAUDE.md:

1. **Drop string substitutions** — `!` backtick commands don't work in Cursor. Replace with static text or omit.
2. **Flatten structure** — no `.claude/rules/` equivalent. Merge all rules into one file.
3. **Condense** — Cursor's context window is shared with the conversation. Keep it tighter than CLAUDE.md.
4. **Keep commands** — build/test commands are just as critical in Cursor.
5. **Skip workflow instructions** — Cursor doesn't commit, create PRs, or run CI. Focus on code patterns and conventions.

## Structure

```
You are working in [project name], a [description].

## Tech Stack
[brief list]

## Commands
[build, test, lint commands]

## Architecture
[brief structure and flow]

## Conventions
[rules as bullet points]

## Do NOT
[anti-patterns specific to this project]
```

## Tone

Cursor's convention is second-person imperative ("You are working in..."). CLAUDE.md uses headers and sections. When converting:

- CLAUDE.md: `## Conventions` → `.cursorrules`: direct instructions
- CLAUDE.md: `Return { ok, error } result types` → `.cursorrules`: `Always return { ok, error } result types instead of throwing`

## Example

```
You are working in Ellie, an AI-powered language learning app.

Tech stack: Expo (React Native), Hono on Cloudflare Workers, D1, Better Auth, TypeScript.

Monorepo layout:
- apps/app/ — Expo mobile app
- apis/ — Cloudflare Workers (auth, user, content, admin)
- packages/ — shared libs (database, auth, ui)

Commands:
- mise dev — start all services
- bun test — run tests
- bunx biome check --write . — lint and format

Conventions:
- Return { ok, error } result types, throw only at system boundaries
- Use @scope/package imports, never relative cross-package imports
- Zod schemas at API boundaries, derive TS types from schemas
- Conventional commits (feat:, fix:, refactor:)
- Tests use real D1 databases, no mocks for the data layer

Do NOT:
- Use npm/npx — this project uses bun exclusively
- Read process.env directly — use @scope/config
- Store secrets in files — Doppler injects them at runtime
- Edit generated files (routeTree.gen.ts, drizzle migrations)
```
