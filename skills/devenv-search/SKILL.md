---
name: devenv-search
description: Search for devenv packages, languages, and configuration options. Use when the user wants to find or discover available devenv packages, search for specific tools, or explore configuration options.
argument-hint: [query]
allowed-tools: [mcp__mcp_devenv_sh__search_packages, mcp__mcp_devenv_sh__search_options]
---

# Devenv Package and Option Search

Help users discover available devenv packages and configuration options using the MCP server.

## Your Task

When the user provides a search query in $ARGUMENTS or asks to find packages/options:

1. **Determine what to search for:**
   - If looking for packages, languages, or tools → use `mcp__mcp_devenv_sh__search_packages`
   - If looking for configuration options, settings, or language configs → use `mcp__mcp_devenv_sh__search_options`
   - When in doubt, search both

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
   - **Frontend tools**: "vite", "webpack", "parcel", "esbuild", "tailwindcss"
   - **Backend frameworks**: Search for language-specific packages (fastapi, express, rails, django)
   - **CI/CD tools**: "github-actions", "gitlab-runner", "act"
   - **Container tools**: "docker", "podman", "docker-compose", "skopeo"
   - **Process management**: Search "processes" or "process-compose" in options

## Examples

### Package Search Example:
```
User: /devenv-search python
You: [Search using mcp__mcp_devenv_sh__search_packages with query "python"]
     [Present results showing python-related packages]
     The main Python packages available include:
     - python3 - Python 3 interpreter
     - python311 - Python 3.11 specifically
     - python-packages.pip - Python package manager
     ...
```

### Option Search Example:
```
User: /devenv-search languages.python
You: [Search using mcp__mcp_devenv_sh__search_options with query "languages.python"]
     [Present configuration options for Python language support]
     Python can be configured with these options:
     - languages.python.enable - Enable Python support
     - languages.python.version - Specify Python version
     - languages.python.poetry.enable - Enable Poetry
     ...
```

## Full-Stack and CI/CD Searches

### Full-Stack Project Searches

When users are setting up full-stack applications, they often need:

**Frontend Development:**
- Search for: "vite", "webpack", "nodejs", "bun"
- Options to search: "languages.javascript", "languages.typescript"
- Explain: Frontend typically needs Node.js/Bun + build tools

**Backend Development:**
- Search for language-specific tools based on their stack:
  - Python: "python", "uvicorn", "gunicorn"
  - Node.js: "nodejs", "pm2"
  - Go: "go", "air" (for hot reload)
  - Rust: "rust", "cargo-watch"
- Options: "languages.python", "languages.go", etc.

**Databases:**
- Search for: "postgres", "mysql", "redis", "mongodb"
- Options: "services.postgres", "services.mysql", "services.redis"
- Explain: Services options auto-configure databases for local development

**Full Stack Together:**
- Search for "processes" in options to run multiple services
- Search for "docker" or "docker-compose" if containerization needed
- Search for tools like "overmind", "foreman", "honcho" for process management

### CI/CD Searches

When users need CI/CD support:

**GitHub Actions:**
- Search for: "act" (run actions locally), "github-cli" or "gh"
- Options: "scripts" for CI commands
- Explain: Scripts can be reused in CI and locally

**Container/Docker:**
- Search for: "docker", "podman", "docker-compose", "buildah", "skopeo"
- Explain: Same containers locally and in CI

**Testing Tools:**
- Search for language-specific test runners:
  - Python: "pytest", "coverage"
  - JavaScript: "playwright", "cypress"
  - Go: built-in, but search "gotestsum"
  - Rust: built-in with cargo

**Linting and Formatting (for CI):**
- Search in options: "git-hooks" (runs same checks locally and CI)
- Search packages: "prettier", "eslint", "black", "ruff", "shellcheck"

**Build Tools (for CI):**
- Search for: "make", "just", "task"
- Options: "scripts" - same scripts locally and in CI

### Context-Aware Suggestions

When searching, provide context based on the user's likely setup:

**If they mention "frontend":**
- Suggest: Node.js/Bun + Vite/Webpack
- Mention: processes for dev server
- Note: Port 3000 (Next.js), 5173 (Vite), 8080 (Vue)

**If they mention "backend":**
- Suggest: Language + framework packages
- Mention: services for databases
- Note: Process management for API server + dependencies

**If they mention "full-stack":**
- Suggest: Both frontend and backend tools
- Mention: processes to run all services together
- Note: Environment variables for different environments

**If they mention "CI/CD" or "GitHub Actions":**
- Suggest: Scripts (reusable in CI)
- Mention: Docker/containers for consistency
- Note: act tool for testing Actions locally

## Error Correction and Validation

### 1. Check for Empty or No Results
If a search returns no results or is empty:
- Suggest alternative search terms (e.g., "node" → "nodejs", "pg" → "postgres", "docker" → "docker or podman")
- Try a broader search (e.g., if "python3.11" fails, try "python")
- Check for common typos or abbreviations
- Suggest searching both packages AND options

### 2. Validate Search Quality
- If results are overwhelming (>20 items), help filter to most relevant
- Warn if searching for very generic terms that might have too many results
- Identify if user might be looking for a language option instead of a package

### 3. Common Naming Issues to Watch For
Proactively correct these common search mistakes:
- "node" or "npm" → should search "nodejs"
- "pg" or "postgresql" → both work but "postgres" is more common
- "k8s" → should search "kubectl" or "kubernetes"
- "docker-compose" → might be "docker-compose" or part of docker
- "python3" → better to search "python" and see version options
- "gcc" or "g++" → search for "gcc" or check "languages.c"

### 4. Verify Configuration Context
When users search for configuration options:
- Check if they have a devenv.nix file (read the file if it exists)
- See if they're searching for something already configured
- Warn if an option conflicts with existing setup
- Provide context about where the option should be placed

### 5. MCP Server Health Check
If searches are failing:
- Note that the MCP server might not be available
- Suggest checking the MCP connection: verify .mcp.json exists
- Provide fallback suggestions based on common packages

## Tips

- If the search returns many results, prioritize the most relevant ones
- Suggest related searches if the user might find them helpful
- Explain the difference between adding packages directly vs using language options
- For popular languages, mention both the language option (e.g., `languages.python`) and related packages
- Always validate search results before presenting them
- If search fails or returns nothing, provide helpful alternatives
- Check for existing devenv.nix to understand current configuration context
