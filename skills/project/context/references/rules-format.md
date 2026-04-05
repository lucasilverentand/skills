# .claude/rules/ Format

For projects too large for a single CLAUDE.md, split context into topic-specific rule files under `.claude/rules/`.

## File naming

```
.claude/rules/
  architecture.md
  development.md
  conventions.md
  testing.md
  deployment.md
```

Use lowercase kebab-case. One concern per file. Don't create files that are mostly empty — only split when there's enough content to warrant its own file.

## architecture.md

```markdown
# Architecture & Patterns

## Tech Stack
- [runtime] with [framework]
- [database] via [ORM]
- [auth solution]
- [deployment targets]

## Project Structure

### [Layout type] Layout
\```
[directory tree with one-line descriptions]
\```

### Module Responsibilities
| Module | Owns |
|---|---|
| `packages/auth` | Session management, OAuth, RBAC |
| `packages/schema` | DB schema, migrations, seed data |
| ... | ... |

## Key Patterns
- [Pattern]: [how it works in this project]
- [Pattern]: [specifics]

## Data Flow
[Describe how a request flows through the system]
```

## development.md

```markdown
# Dev Environment

## Prerequisites
- [tool versions and install commands]

## Starting the Dev Environment
\```bash
[primary dev command]
\```

### What it does
[Explain what services start, on which ports]

### Running specific services
\```bash
[commands for partial startup]
\```

## Database
\```bash
[migration commands]
[seed commands]
[reset commands]
\```

## Secrets
[How secrets are managed — Doppler, env vars, etc.]

## Ports
| Service | Port |
|---|---|
| [name] | [port] |
```

## conventions.md

```markdown
# Conventions

## File Organization
- [rule with example]

## Naming
| Context | Convention | Example |
|---|---|---|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserById` |
| DB columns | snake_case | `created_at` |

## Error Handling
[Pattern with code example]

## Imports
[Import ordering and path rules]

## Commits
[Commit message format]

## Code Review Standards
[What would fail review]
```

## testing.md

```markdown
# Testing

## Commands
\```bash
[test commands with common flags]
\```

## Strategy
- Unit: [what to unit test, what framework]
- Integration: [approach, real DB or mock]
- E2E: [tool, what flows to cover]

## Writing Tests
[Key patterns — fixtures, factories, assertions]

## What NOT to Mock
[Boundaries where real implementations are expected]
```

## deployment.md

```markdown
# Deployment

## Environments
| Environment | URL | Deploy trigger |
|---|---|---|
| Production | [url] | push to main |
| Staging | [url] | push to staging |

## How to Deploy
\```bash
[deploy commands]
\```

## CI Pipeline
[What CI runs — lint, test, build, deploy]

## Database Migrations
[How migrations run in CI/deploy]

## Rollback
[How to roll back a bad deploy]
```

## When to use rules/ vs single CLAUDE.md

Split into rules/ when:
- Total context exceeds 300 lines
- The project spans multiple languages or runtimes
- Different concerns are maintained by different people
- Topic-specific context is deep enough to warrant its own file (50+ lines each)

Keep a single CLAUDE.md when:
- Total context is under 200 lines
- The project is a single package with one language
- One person maintains everything
