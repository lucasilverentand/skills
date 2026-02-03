---
name: devenv-search
description: Searches devenv packages, languages, and configuration options using the devenv CLI. Use when finding available devenv packages, searching for specific tools, exploring configuration options, or looking up how to add something to devenv.nix.
argument-hint: [query]
allowed-tools: [Bash, Read]
---

# Devenv Package and Option Search

Searches and discovers available devenv packages and configuration options.

## Your Task

When the user provides a search query in $ARGUMENTS or asks to find packages/options:

1. **Run the search:**

   ```bash
   devenv search <query>
   ```

2. **Present results** organized by type (packages vs options)

3. **Show usage examples** for the most relevant results

## Search Categories

| Category | Example Queries | What You'll Find |
|----------|----------------|------------------|
| Languages | python, nodejs, rust, go | `languages.*` options |
| Databases | postgres, mysql, redis | `services.*` options |
| Tools | docker, kubectl, gh | Package names |
| Build tools | cmake, vite, webpack | Package names |
| Options | scripts, processes, hooks | Configuration options |

## Output Format

Present results like this:

```markdown
## Search Results for "{query}"

### Configuration Options

| Option | Description |
|--------|-------------|
| `languages.python.enable` | Enable Python support |
| `languages.python.version` | Specify version (e.g., "3.11") |

### Packages

| Package | Description |
|---------|-------------|
| `python311` | Python 3.11 interpreter |

### Usage Example

(nix code block showing: languages.python = { enable = true; version = "3.11"; };)
```

## Common Query Corrections

Automatically correct these common searches:

| User Types | Search For | Reason |
|------------|------------|--------|
| node, npm | nodejs | Package name is "nodejs" |
| pg, postgresql | postgres | Shorter name in nixpkgs |
| k8s | kubectl | Search the CLI tool name |
| python3 | python | Generic term has more results |
| mongo | mongodb | Full name required |

## Result Prioritization

When presenting results:

1. **Most relevant first**: Exact matches over partial matches
2. **Options over packages**: For languages, show `languages.*` options first
3. **Services for databases**: Show `services.*` options for postgres, redis, mysql
4. **Include usage**: Always show a quick usage example

## Related Searches

Suggest related searches when helpful:

| If Searching | Also Suggest |
|--------------|--------------|
| python | poetry, pip, venv |
| nodejs | npm, pnpm, bun |
| postgres | redis, mysql (other DBs) |
| docker | docker-compose, podman |
| git | gh (GitHub CLI), git-lfs |

## Tips

- Prefer `languages.*` options over adding interpreter packages directly
- Use `services.*` for databases (auto-configured for local dev)
- If no results, try shorter or alternative terms
- Explain packages vs options distinction when relevant
