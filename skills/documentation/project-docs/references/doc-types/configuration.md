# Doc Type: Configuration (`docs/configuration.md`)

```markdown
# Configuration

## Environment variables
| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| ... | ... | ... | ... |

## Config files
List of config files, what they control, and which are committed vs. gitignored.

## Feature flags
How feature flags are managed, where they're defined, how to toggle them.

## Secrets management
How secrets are stored and accessed in each environment. What's in `.env.example` vs. what's in a vault.

## Environment setup
How to get a working `.env` file for local development. Who to ask for credentials.
```

**Guidance:**
- The env var table is the core of this doc — be thorough
- `.env.example` should exist and be referenced — this doc supplements it, not replaces it
- Never document actual secret values, only where to find them
