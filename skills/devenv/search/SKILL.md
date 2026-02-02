---
name: devenv-search
description: Searches devenv packages, languages, and configuration options. Use when finding or discovering available devenv packages, searching for specific tools, or exploring configuration options.
argument-hint: [query]
allowed-tools:
  - Bash
  - Read
---

# Devenv Package and Option Search

Helps users discover available devenv packages and configuration options using the devenv CLI.

## Your Task

When the user provides a search query in $ARGUMENTS or asks to find packages/options:

1. **Search using the devenv CLI:**

   ```bash
   devenv search <query>
   ```

   This searches both packages and configuration options.

2. **Present results clearly:**
   - Show relevant packages with their names and descriptions
   - Highlight the most commonly used or recommended options
   - For configuration options, explain what they configure
   - Provide examples of how to use them in devenv.nix or devenv.yaml

3. **Common searches to help with:**
   - **Languages**: "python", "nodejs", "rust", "go", "java", "ruby", "php"
   - **Databases**: "postgres", "mysql", "redis", "mongodb", "sqlite"
   - **Tools**: "docker", "kubectl", "terraform", "git", "gh"
   - **Build tools**: "cmake", "make", "gradle", "maven", "vite", "webpack"
   - **Configuration options**: "languages.python", "scripts", "processes", "git-hooks", "services"

## Examples

### Package Search Example

```text
User: /devenv-search python
You: [Run: devenv search python]
     [Present results showing python-related packages and options]

     The main Python packages and options available include:

     **Packages:**
     - python3 - Python 3 interpreter
     - python311 - Python 3.11 specifically

     **Configuration Options:**
     - languages.python.enable - Enable Python support
     - languages.python.version - Specify Python version
     - languages.python.poetry.enable - Enable Poetry
```

### Option Search Example

```text
User: /devenv-search postgres
You: [Run: devenv search postgres]
     [Present configuration options for PostgreSQL]

     PostgreSQL can be configured with:
     - services.postgres.enable - Enable PostgreSQL service
     - services.postgres.port - Configure port (default 5432)
     - services.postgres.initialDatabases - Create initial databases
```

## Full-Stack and CI/CD Searches

### Full-Stack Project Searches

When users are setting up full-stack applications, they often need:

**Frontend Development:**

- Search for: "vite", "webpack", "nodejs", "bun"
- Explain: Frontend typically needs Node.js/Bun + build tools

**Backend Development:**

- Search for language-specific tools based on their stack:
  - Python: "python", "uvicorn", "gunicorn"
  - Node.js: "nodejs", "pm2"
  - Go: "go", "air" (for hot reload)
  - Rust: "rust", "cargo-watch"

**Databases:**

- Search for: "postgres", "mysql", "redis", "mongodb"
- Explain: Services options auto-configure databases for local development

### CI/CD Searches

When users need CI/CD support:

**GitHub Actions:**

- Search for: "act" (run actions locally), "gh"
- Explain: Scripts can be reused in CI and locally

**Container/Docker:**

- Search for: "docker", "podman", "docker-compose", "buildah", "skopeo"
- Explain: Same containers locally and in CI

**Testing Tools:**

- Search for language-specific test runners:
  - Python: "pytest", "coverage"
  - JavaScript: "playwright", "cypress"
  - Go: built-in, but search "gotestsum"

## Error Handling

### No Results

If a search returns no results:

- Suggest alternative search terms (e.g., "node" → "nodejs", "pg" → "postgres")
- Try a broader search (e.g., if "python3.11" fails, try "python")
- Check for common typos or abbreviations

### Common Naming Issues

Proactively correct these common search mistakes:

- "node" or "npm" → should search "nodejs"
- "pg" or "postgresql" → try "postgres"
- "k8s" → should search "kubectl" or "kubernetes"
- "python3" → better to search "python"

## Tips

- If the search returns many results, prioritize the most relevant ones
- Suggest related searches if the user might find them helpful
- Explain the difference between adding packages directly vs using language options
- For popular languages, mention both the language option (e.g., `languages.python`) and related packages
