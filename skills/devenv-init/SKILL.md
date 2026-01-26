---
name: devenv-init
description: Initialize devenv in a new project. Use when the user wants to set up devenv, create devenv.nix or devenv.yaml, or start using devenv in their project.
argument-hint: [project-type]
allowed-tools: [Bash, Read, Write, Glob, Grep, mcp__mcp_devenv_sh__search_packages, mcp__mcp_devenv_sh__search_options]
---

# Devenv Project Initialization

Guide users through setting up devenv in a new or existing project.

## Your Task

Help the user initialize devenv for their project by:

1. **Check if devenv is already set up:**
   - Look for `devenv.nix` or `devenv.yaml` in the working directory
   - Check for `.envrc` (direnv integration)
   - If already exists, offer to help configure instead

2. **Check if devenv is installed:**
   - Run `devenv version` to verify installation
   - If not installed, provide installation instructions

3. **Determine project type:**
   - From $ARGUMENTS if provided (e.g., "python", "nodejs", "rust", "fullstack", "ci/cd")
   - By examining existing files in the directory:
     - `package.json` → Node.js
     - `requirements.txt` or `pyproject.toml` → Python
     - `Cargo.toml` → Rust
     - `go.mod` → Go
     - Frontend + Backend directories → Full-stack
     - `.github/workflows/` or `Dockerfile` → CI/CD needs
   - Ask the user if unclear

   **Template Selection Guide:**
   - **Single language project:** Use language-specific template
   - **Full-stack project (frontend + backend):** Use Full-Stack template with processes
   - **Microservices or multi-service:** Use Full-Stack template with services + processes
   - **CI/CD requirements:** Use CI/CD Optimized or Full-Stack with Docker template
   - **Container-based workflow:** Use Full-Stack with Docker template
   - **Local development focus:** Use regular Full-Stack template with services

4. **Create initial configuration:**
   - Create `devenv.nix` with appropriate settings for the project type
   - Optionally create `devenv.yaml` for simpler projects
   - Create or update `.envrc` for direnv integration
   - Create `.gitignore` entries for devenv files

5. **Guide next steps:**
   - Explain how to enter the environment (`direnv allow` or `devenv shell`)
   - Show how to add more packages or languages
   - Mention available scripts and hooks

## Installation Check

If devenv is not installed, provide these instructions:

```bash
# Install devenv
curl -L https://get.devenv.sh | sh
```

For more details, refer to: https://devenv.sh/getting-started/

## Configuration Templates

### Python Project
```nix
{ pkgs, ... }:

{
  languages.python = {
    enable = true;
    version = "3.11";
  };

  packages = with pkgs; [
    # Add additional tools here
  ];

  scripts = {
    test.exec = "pytest";
  };
}
```

### Node.js Project
```nix
{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  scripts = {
    dev.exec = "npm run dev";
    test.exec = "npm test";
  };
}
```

### Rust Project
```nix
{ pkgs, ... }:

{
  languages.rust = {
    enable = true;
  };

  packages = with pkgs; [
    cargo-watch
  ];

  scripts = {
    dev.exec = "cargo watch -x run";
    test.exec = "cargo test";
  };
}
```

### Go Project
```nix
{ pkgs, ... }:

{
  languages.go = {
    enable = true;
  };

  scripts = {
    dev.exec = "go run .";
    test.exec = "go test ./...";
  };
}
```

### Multi-Language Project
```nix
{ pkgs, ... }:

{
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
    python = {
      enable = true;
      version = "3.11";
    };
  };

  packages = with pkgs; [
    # Shared tools
    gh
    jq
  ];

  scripts = {
    dev.exec = "npm run dev";
  };
}
```

### Full-Stack Project (Frontend + Backend + Database)
```nix
{ pkgs, ... }:

{
  # Languages for full stack
  languages = {
    # Frontend - React/Vue/Svelte with Vite
    javascript = {
      enable = true;
      npm.enable = true;
    };

    # Backend - Python/FastAPI or Node.js/Express
    python = {
      enable = true;
      version = "3.11";
      venv.enable = true;
    };
  };

  # Additional packages
  packages = with pkgs; [
    # Development tools
    gh
    jq
    curl

    # Database clients (if not using services)
    postgresql  # psql client
  ];

  # Environment variables
  env = {
    DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
    API_URL = "http://localhost:8000";
    FRONTEND_URL = "http://localhost:5173";
  };

  # Services - Auto-configured databases
  services.postgres = {
    enable = true;
    initialDatabases = [{ name = "myapp_dev"; }];
    listen_addresses = "127.0.0.1";
  };

  # Processes - Run entire stack together
  processes = {
    # Database (if using services, this is automatic)
    # Backend API
    backend = {
      exec = "cd backend && uvicorn main:app --reload --port 8000";
      process-compose = {
        depends_on = {
          postgres.condition = "process_healthy";
        };
      };
    };

    # Frontend dev server
    frontend = {
      exec = "cd frontend && npm run dev";
      process-compose = {
        depends_on = {
          backend.condition = "process_healthy";
        };
        readiness_probe = {
          http_get = {
            host = "localhost";
            port = 5173;
          };
          initial_delay_seconds = 3;
          period_seconds = 10;
        };
      };
    };
  };

  # Scripts for common tasks
  scripts = {
    # Start entire stack
    dev.exec = "devenv up";

    # Backend only
    backend.exec = "cd backend && uvicorn main:app --reload";

    # Frontend only
    frontend.exec = "cd frontend && npm run dev";

    # Database operations
    db-reset.exec = ''
      dropdb myapp_dev --if-exists
      createdb myapp_dev
      psql myapp_dev < schema.sql
    '';

    # Testing
    test.exec = ''
      cd backend && pytest
      cd frontend && npm test
    '';

    # Build for production
    build.exec = ''
      cd frontend && npm run build
      cd backend && python -m build
    '';
  };

  # Git hooks for quality
  git-hooks.hooks = {
    pre-commit.enable = true;
    prettier.enable = true;
    eslint.enable = true;
  };
}
```

### Full-Stack with Docker (for CI/CD consistency)
```nix
{ pkgs, ... }:

{
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
    python = {
      enable = true;
      version = "3.11";
    };
  };

  packages = with pkgs; [
    # Container tools - same locally and CI
    docker
    docker-compose

    # CI/CD tools
    gh              # GitHub CLI
    act             # Run GitHub Actions locally

    # Testing
    playwright-driver
  ];

  env = {
    # Environment for local development
    NODE_ENV = "development";
    DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
  };

  # Use docker-compose for services
  # (Alternative to devenv services for CI/CD parity)
  processes = {
    docker-services = {
      exec = "docker-compose up";
    };

    backend = {
      exec = "cd backend && npm run dev";
      process-compose = {
        depends_on = {
          docker-services.condition = "process_started";
        };
      };
    };

    frontend = {
      exec = "cd frontend && npm run dev";
    };
  };

  scripts = {
    # Development
    dev.exec = "devenv up";

    # Testing (same commands as CI)
    test.exec = ''
      npm run test:backend
      npm run test:frontend
      npm run test:e2e
    '';

    # Build (same as CI)
    build.exec = ''
      docker build -t myapp:latest .
    '';

    # CI simulation
    ci-local.exec = "act push";  # Run GitHub Actions locally

    # Cleanup
    clean.exec = ''
      docker-compose down -v
      rm -rf node_modules
    '';
  };

  git-hooks.hooks = {
    # Same checks as CI
    pre-commit.enable = true;
    prettier.enable = true;
    eslint.enable = true;
    shellcheck.enable = true;
  };
}
```

### CI/CD Optimized Project
```nix
{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  packages = with pkgs; [
    # CI/CD tools
    gh              # GitHub CLI
    act             # Test GitHub Actions locally
    docker
    docker-compose

    # Testing tools
    playwright-driver

    # Linting (same as CI)
    nodePackages.eslint
    nodePackages.prettier
  ];

  # Scripts that work both locally and in CI
  scripts = {
    # Install dependencies
    install.exec = "npm ci";  # ci for reproducible installs

    # Linting
    lint.exec = "npm run lint";
    format.exec = "npm run format";
    format-check.exec = "npm run format -- --check";

    # Testing
    test.exec = "npm test";
    test-ci.exec = "npm test -- --coverage --maxWorkers=2";

    # Build
    build.exec = "npm run build";

    # Docker
    docker-build.exec = "docker build -t myapp:latest .";
    docker-test.exec = ''
      docker-compose -f docker-compose.test.yml up --abort-on-container-exit
      docker-compose -f docker-compose.test.yml down
    '';

    # CI simulation
    ci-local.exec = "act push";
    ci-pr.exec = "act pull_request";

    # Release
    release.exec = ''
      npm run build
      npm run test
      gh release create
    '';
  };

  # Pre-commit hooks (same checks as CI)
  git-hooks.hooks = {
    pre-commit.enable = true;

    # Formatting
    prettier = {
      enable = true;
      types_or = [ "javascript" "typescript" "json" "yaml" "markdown" ];
    };

    # Linting
    eslint.enable = true;

    # Testing (optional - can be slow)
    # Uncomment if you want tests to run pre-commit
    # unit-tests = {
    #   enable = true;
    #   name = "unit-tests";
    #   entry = "npm test";
    #   pass_filenames = false;
    # };
  };

  # Environment variables
  env = {
    CI = "false";  # Set to true in CI
    NODE_ENV = "development";
  };
}
```

## Direnv Integration

Always create or update `.envrc`:

```bash
use devenv
```

Then instruct the user to run:
```bash
direnv allow
```

## Gitignore Entries

Add these to `.gitignore`:
```
# Devenv
.devenv*
devenv.lock
.direnv
```

## First Steps After Initialization

1. **Activate the environment:**
   ```bash
   direnv allow    # If using direnv
   # OR
   devenv shell    # Manual activation
   ```

2. **Test the setup:**
   ```bash
   devenv info    # Show environment info
   ```

3. **Add more packages if needed:**
   - Edit `devenv.nix`
   - Run searches to find packages: use the devenv-search skill

## Error Correction and Validation

### Pre-Initialization Checks

1. **Check for Existing Setup:**
   ```bash
   # Check for existing files
   ls -la devenv.nix devenv.yaml .envrc .devenv* 2>/dev/null
   ```
   - If `devenv.nix` or `devenv.yaml` already exists, READ it first
   - Ask user if they want to:
     - Keep and enhance existing config
     - Replace with new config (backup old one first)
     - Cancel and use devenv-config skill instead

2. **Verify devenv Installation:**
   ```bash
   # Check if devenv is installed
   devenv version
   ```
   - If command fails, devenv is not installed
   - Provide installation instructions
   - After installation, verify it worked: `devenv version` should succeed

3. **Check for Conflicting Tools:**
   - Look for other environment managers (.tool-versions, .nvmrc, pyenv, rbenv)
   - Warn about potential conflicts
   - Suggest migrating from other tools or keeping them separate

4. **Validate Directory:**
   - Ensure we're not in a system directory (/usr, /etc, /bin)
   - Check we have write permissions: `test -w .`
   - Warn if directory is empty (might be wrong location)

### During Creation Checks

5. **Validate Nix Syntax:**
   After creating devenv.nix, verify it's valid:
   ```bash
   nix-instantiate --parse devenv.nix >/dev/null 2>&1
   ```
   - If syntax is invalid, fix common issues:
     - Missing semicolons
     - Unclosed braces or brackets
     - Invalid attribute names
     - Incorrect string escaping

6. **Check File Permissions:**
   ```bash
   # Ensure files are readable
   chmod 644 devenv.nix .envrc .gitignore 2>/dev/null
   ```

7. **Validate .envrc Content:**
   - Must contain `use devenv` exactly
   - No extra characters or commands that might break direnv
   - Check if .envrc already exists and has other content
   - If exists, append to existing file rather than overwriting

### Post-Initialization Validation

8. **Test the Configuration:**
   ```bash
   # Try to evaluate the config
   devenv info
   ```
   - If this fails, config has errors
   - Check error message for:
     - Missing packages
     - Invalid options
     - Syntax errors
     - Network issues (unable to fetch packages)

9. **Verify Direnv Setup:**
   ```bash
   # Check if direnv is installed
   direnv version

   # Check if .envrc is allowed
   direnv status
   ```
   - If direnv not installed, provide installation instructions
   - If .envrc not allowed, remind user to run `direnv allow`
   - If direnv is blocked, check for .envrc issues

10. **Validate Gitignore:**
    - Read existing .gitignore if present
    - Check if devenv entries already exist
    - Don't duplicate entries
    - Ensure proper formatting (one pattern per line)
    - Verify no syntax errors in .gitignore

### Common Error Scenarios

#### Scenario 1: devenv.nix syntax error
```bash
# Test syntax
nix-instantiate --parse devenv.nix
```
If fails, check for:
- Missing closing braces `}`
- Missing semicolons after attribute values
- Typos in attribute names
- Invalid Nix expressions

#### Scenario 2: Package not found
If `devenv info` reports missing packages:
- Use MCP search to find correct package name
- Check spelling and case
- Some packages might be in different package sets
- Suggest alternatives if package unavailable

#### Scenario 3: Direnv not loading
If environment doesn't activate:
```bash
# Check direnv status
direnv status

# Check .envrc content
cat .envrc

# Check for direnv in shell config
grep -l direnv ~/.bashrc ~/.zshrc 2>/dev/null
```
- Ensure direnv hook is in shell rc file
- Verify `use devenv` is in .envrc
- Check if .envrc is allowed
- Look for direnv error messages

#### Scenario 4: Permission denied errors
```bash
# Check directory permissions
ls -ld .

# Check file permissions
ls -la devenv.nix .envrc
```
- Ensure user owns the directory
- Check write permissions
- Verify not running in protected location

#### Scenario 5: Lock file issues
If devenv.lock causes problems:
```bash
# Remove lock and regenerate
rm -f devenv.lock
devenv shell --clean
```
- Lock file will be regenerated
- Ensures fresh dependency resolution

### Validation Checklist

Before considering initialization complete, verify:

- [ ] devenv is installed and working: `devenv version` succeeds
- [ ] devenv.nix exists and has valid syntax: `nix-instantiate --parse devenv.nix` succeeds
- [ ] Configuration evaluates: `devenv info` succeeds
- [ ] .envrc exists with correct content: `cat .envrc | grep "use devenv"`
- [ ] .gitignore includes devenv entries: `grep devenv .gitignore`
- [ ] User knows next steps: how to activate environment
- [ ] If direnv installed, remind to run `direnv allow`

### Post-Creation Testing

After initialization, guide user through testing:

1. **Test activation:**
   ```bash
   direnv allow        # If using direnv
   # OR
   devenv shell        # Manual activation
   ```

2. **Verify environment:**
   ```bash
   devenv info         # Should show configuration
   echo $DEVENV_ROOT   # Should be set
   ```

3. **Test installed tools:**
   ```bash
   # For Python project:
   python --version

   # For Node.js project:
   node --version
   npm --version
   ```

4. **Test scripts (if any):**
   ```bash
   # List available scripts
   devenv info | grep -A 20 "Scripts:"
   ```

5. **For Full-Stack projects, test the entire stack:**
   ```bash
   # Test services start
   devenv info | grep -A 20 "Services:"

   # If using services (postgres, redis, etc.)
   pg_isready  # Test postgres is running
   redis-cli ping  # Test redis is running

   # Test processes configuration
   devenv info | grep -A 30 "Processes:"

   # Start all processes
   devenv up  # Should start frontend, backend, and services

   # In another terminal, test endpoints
   curl http://localhost:8000/health  # Backend health check
   curl http://localhost:5173  # Frontend dev server

   # Check process logs
   tail -f $DEVENV_STATE/process-compose/process-compose.log
   ```

   **Port conflict check:**
   ```bash
   # Check if ports are already in use
   lsof -i :5173  # Frontend port (Vite)
   lsof -i :8000  # Backend port
   lsof -i :5432  # Postgres port
   ```

   **Environment variables check:**
   ```bash
   # Verify environment variables are set
   echo $DATABASE_URL
   echo $API_URL
   echo $FRONTEND_URL
   ```

6. **For CI/CD projects, test CI parity:**
   ```bash
   # Test docker is available
   docker --version
   docker-compose --version

   # Test GitHub CLI
   gh --version

   # Test act (GitHub Actions locally)
   act --version
   act -l  # List workflows

   # Test same commands as CI
   npm run lint    # Should match CI lint step
   npm run test    # Should match CI test step
   npm run build   # Should match CI build step

   # Test docker build (if using containers)
   docker build -t test:latest .

   # Test CI locally (if using act)
   act push --dry-run  # Dry run of CI workflow
   ```

   **CI script validation:**
   ```bash
   # Ensure scripts work both locally and CI
   # Check that scripts don't rely on local-only tools
   # Verify environment variables have defaults or are documented
   ```

If any test fails, diagnose and fix before moving on.

## Tips

- Prefer `devenv.nix` for most projects (more flexible)
- Use `devenv.yaml` for simpler configurations
- Always set up direnv integration for automatic activation
- Add git hooks early (before first commit)
- Create useful scripts for common development tasks
- Use MCP search tools to find packages and options when users ask for specific tools
- ALWAYS validate the configuration after creation
- Test the setup before considering initialization complete
- Provide clear error messages and fixes if validation fails
- Back up existing configs before overwriting
