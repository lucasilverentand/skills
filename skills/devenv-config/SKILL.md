---
name: devenv-config
description: Configure devenv projects by adding languages, packages, scripts, git hooks, and other options. Use when the user wants to modify devenv.nix, add packages, configure languages, set up scripts, or customize their devenv environment.
argument-hint: [config-type]
allowed-tools: [Bash, Read, Edit, Glob, Grep, mcp__mcp_devenv_sh__search_packages, mcp__mcp_devenv_sh__search_options]
---

# Devenv Configuration Management

Help users configure and customize their existing devenv setup.

## Your Task

1. **Read the current configuration:**
   - Locate `devenv.nix` or `devenv.yaml`
   - Understand existing setup before making changes

2. **Identify what needs to be configured:**
   - From $ARGUMENTS if provided
   - From the user's request
   - Use MCP search tools to find packages or options

3. **Make the configuration changes:**
   - Edit the appropriate file(s)
   - Follow existing patterns and style
   - Preserve comments and structure

4. **Verify and guide next steps:**
   - Explain what was changed
   - Mention if the environment needs to be reloaded
   - Suggest related configurations if helpful

## Configuration Areas

### 1. Languages (languages.*)

Enable and configure programming language support:

```nix
languages = {
  # JavaScript/Node.js
  javascript = {
    enable = true;
    npm.enable = true;
    bun.enable = true;      # Alternative to npm
    pnpm.enable = true;     # Alternative to npm
  };

  # Python
  python = {
    enable = true;
    version = "3.11";       # Specify version
    venv.enable = true;     # Virtual environment
    poetry.enable = true;   # Poetry support
  };

  # Rust
  rust = {
    enable = true;
    channel = "stable";     # or "nightly", "beta"
  };

  # Go
  go = {
    enable = true;
  };

  # Ruby
  ruby = {
    enable = true;
    version = "3.2";
  };

  # PHP
  php = {
    enable = true;
    version = "8.2";
  };

  # C/C++
  c = {
    enable = true;
  };
};
```

### 2. Packages

Add additional tools and packages:

```nix
packages = with pkgs; [
  # Version control
  gh              # GitHub CLI
  git-lfs         # Git Large File Storage

  # Utilities
  jq              # JSON processor
  yq              # YAML processor
  curl
  wget

  # Databases
  postgresql
  redis
  sqlite

  # Cloud tools
  awscli2
  google-cloud-sdk
  terraform

  # Container tools
  docker
  kubectl
  docker-compose
];
```

Use MCP search to find packages: `mcp__mcp_devenv_sh__search_packages`

### 3. Scripts

Create convenient development commands:

```nix
scripts = {
  # Simple script
  hello.exec = "echo Hello, World!";

  # Development server
  dev.exec = "npm run dev";

  # Testing
  test.exec = "pytest tests/";
  test-watch.exec = "pytest-watch";

  # Build
  build.exec = "npm run build";

  # Database operations
  db-setup.exec = ''
    createdb myapp_dev
    psql myapp_dev < schema.sql
  '';

  # Multi-line script with description
  deploy = {
    exec = ''
      npm run build
      npm run test
      gh release create
    '';
    description = "Build, test, and deploy";
  };
};
```

Scripts are available as commands in the devenv shell.

### 4. Git Hooks (git-hooks.hooks)

Automate quality checks:

```nix
git-hooks.hooks = {
  # Pre-commit hooks
  pre-commit = {
    enable = true;
  };

  # Formatters
  prettier = {
    enable = true;
    types_or = [ "javascript" "typescript" "json" "yaml" ];
  };
  black.enable = true;        # Python formatter
  rustfmt.enable = true;      # Rust formatter

  # Linters
  eslint.enable = true;       # JavaScript/TypeScript
  shellcheck.enable = true;   # Shell scripts
  yamllint.enable = true;     # YAML files

  # Security
  gitleaks.enable = true;     # Detect secrets

  # Custom hook
  validate-skills = {
    enable = true;
    name = "validate-skills";
    entry = "./scripts/validate-skills.sh";
    pass_filenames = false;
  };

  # General
  end-of-file-fixer.enable = true;
  trim-trailing-whitespace.enable = true;
  check-merge-conflict.enable = true;
};
```

### 5. Processes (processes)

Run background services:

```nix
processes = {
  # Web server
  web.exec = "npm run dev";

  # API server
  api = {
    exec = "python -m uvicorn main:app --reload";
    process-compose = {
      depends_on = {
        db.condition = "process_healthy";
      };
    };
  };

  # Database
  db = {
    exec = "postgres -D $PGDATA";
    process-compose = {
      readiness_probe = {
        exec.command = "pg_isready";
        initial_delay_seconds = 2;
        period_seconds = 10;
      };
    };
  };
};
```

Processes use process-compose and start with `devenv up`.

### 6. Environment Variables (env)

Set environment variables:

```nix
env = {
  DATABASE_URL = "postgresql://localhost/myapp_dev";
  API_KEY = "dev-key-123";
  NODE_ENV = "development";
};
```

### 7. Services

Enable common services (databases, caches, etc.):

```nix
services = {
  postgres = {
    enable = true;
    initialDatabases = [{ name = "myapp_dev"; }];
  };

  redis.enable = true;

  mysql = {
    enable = true;
    initialDatabases = [{ name = "myapp"; }];
  };
};
```

### 8. Pre-commit Integration

Enable pre-commit framework:

```nix
pre-commit.hooks = {
  # Same as git-hooks.hooks
  # Alternative syntax for pre-commit users
};
```

### 9. Full-Stack Configuration

For full-stack applications (frontend + backend + database):

```nix
{
  # Multiple languages
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;  # Or bun.enable = true for Bun
    };
    python = {
      enable = true;
      version = "3.11";
      venv.enable = true;
    };
  };

  # Services for local development
  services = {
    postgres = {
      enable = true;
      initialDatabases = [{ name = "myapp_dev"; }];
      listen_addresses = "127.0.0.1";
    };

    redis = {
      enable = true;
      bind = "127.0.0.1";
    };
  };

  # Environment variables for different services
  env = {
    # Database
    DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
    REDIS_URL = "redis://localhost:6379";

    # API configuration
    API_HOST = "0.0.0.0";
    API_PORT = "8000";
    API_URL = "http://localhost:8000";

    # Frontend configuration
    VITE_API_URL = "http://localhost:8000";  # For Vite
    NEXT_PUBLIC_API_URL = "http://localhost:8000";  # For Next.js
    FRONTEND_PORT = "5173";
  };

  # Run entire stack together
  processes = {
    # Backend API server
    backend = {
      exec = "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000";
      process-compose = {
        depends_on = {
          postgres.condition = "process_healthy";
          redis.condition = "process_healthy";
        };
        readiness_probe = {
          http_get = {
            host = "localhost";
            port = 8000;
            path = "/health";
          };
          initial_delay_seconds = 2;
          period_seconds = 10;
        };
      };
    };

    # Frontend dev server
    frontend = {
      exec = "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173";
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

    # Worker processes (optional)
    worker = {
      exec = "cd backend && celery -A tasks worker --loglevel=info";
      process-compose = {
        depends_on = {
          redis.condition = "process_healthy";
        };
      };
    };
  };

  # Scripts for full-stack operations
  scripts = {
    # Start entire stack
    dev.exec = "devenv up";

    # Individual services
    backend-only.exec = "cd backend && uvicorn main:app --reload";
    frontend-only.exec = "cd frontend && npm run dev";

    # Database operations
    db-reset.exec = ''
      dropdb myapp_dev --if-exists
      createdb myapp_dev
      cd backend && alembic upgrade head
    '';
    db-migrate.exec = "cd backend && alembic upgrade head";
    db-seed.exec = "cd backend && python scripts/seed.py";

    # Testing full stack
    test-all.exec = ''
      cd backend && pytest
      cd frontend && npm test
    '';
    test-e2e.exec = "cd e2e && playwright test";

    # Build for production
    build-all.exec = ''
      cd frontend && npm run build
      cd backend && python -m build
    '';
  };
}
```

**Key considerations for full-stack:**
- Use `services` for databases/caches (auto-configured for local dev)
- Use `processes` to run all services together with `devenv up`
- Set up proper dependencies between processes
- Configure health checks for reliability
- Use environment variables for service URLs
- Create scripts for common operations (db reset, testing, building)

### 10. CI/CD Configuration

For CI/CD optimization (same environment locally and in CI):

```nix
{
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
  };

  # Tools available both locally and in CI
  packages = with pkgs; [
    # CI/CD tools
    gh              # GitHub CLI
    act             # Run GitHub Actions locally
    docker
    docker-compose

    # Testing
    playwright-driver
    chromium        # For headless browser tests

    # Linting & Formatting
    nodePackages.eslint
    nodePackages.prettier
    shellcheck      # Shell script linting
  ];

  # Environment variables (with CI detection)
  env = {
    NODE_ENV = "development";  # Override in CI
    CI = "false";              # Set to "true" in CI
  };

  # Scripts that work identically locally and in CI
  scripts = {
    # Installation (reproducible)
    install.exec = "npm ci";  # Use 'ci' not 'install' for consistency

    # Linting (same as CI)
    lint.exec = "npm run lint";
    format.exec = "npm run format";
    format-check.exec = "npm run format -- --check";

    # Type checking
    typecheck.exec = "npm run typecheck";

    # Testing (same as CI)
    test.exec = "npm test";
    test-ci.exec = "npm test -- --coverage --maxWorkers=2 --ci";
    test-e2e.exec = "playwright test";

    # Build (same as CI)
    build.exec = "npm run build";

    # Docker operations
    docker-build.exec = "docker build -t myapp:latest .";
    docker-test.exec = ''
      docker-compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test
      docker-compose -f docker-compose.test.yml down
    '';

    # CI simulation
    ci-local.exec = "act push";  # Run GitHub Actions locally
    ci-pr.exec = "act pull_request";
    ci-all.exec = "act --workflows .github/workflows/";

    # Full CI pipeline locally
    ci-full.exec = ''
      echo "Running full CI pipeline locally..."
      npm ci
      npm run lint
      npm run typecheck
      npm test -- --ci
      npm run build
      echo "CI pipeline completed successfully!"
    '';
  };

  # Git hooks (same checks as CI)
  git-hooks.hooks = {
    pre-commit.enable = true;

    # Formatting (fails if not formatted)
    prettier = {
      enable = true;
      types_or = [ "javascript" "typescript" "json" "yaml" "markdown" ];
    };

    # Linting
    eslint.enable = true;

    # Type checking (optional - can be slow)
    # typecheck = {
    #   enable = true;
    #   name = "typecheck";
    #   entry = "npm run typecheck";
    #   pass_filenames = false;
    # };

    # Shell scripts
    shellcheck.enable = true;

    # No secrets
    gitleaks.enable = true;

    # General
    end-of-file-fixer.enable = true;
    trim-trailing-whitespace.enable = true;
    check-merge-conflict.enable = true;
  };
}
```

**CI/CD best practices:**
- Use `npm ci` instead of `npm install` for reproducibility
- Add `format-check` script (CI fails if not formatted, doesn't auto-fix)
- Use `--ci` flag in test scripts for CI-optimized behavior
- Limit `maxWorkers` for consistent CI performance
- Use `act` tool to test GitHub Actions locally
- Enable same git hooks as CI checks (catch issues before push)
- Use Docker for consistency between environments
- Set `CI=true` environment variable in CI workflows

**Example GitHub Actions workflow using devenv:**
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: cachix/install-nix-action@v24

      - uses: cachix/cachix-action@v14
        with:
          name: devenv

      - name: Install devenv
        run: |
          nix profile install --accept-flake-config github:cachix/devenv/latest

      - name: Install dependencies
        run: devenv shell install

      - name: Lint
        run: devenv shell lint

      - name: Type check
        run: devenv shell typecheck

      - name: Test
        run: devenv shell test-ci
        env:
          CI: true

      - name: Build
        run: devenv shell build
```

## Common Configuration Tasks

### Adding a Language

1. Use MCP search to find language options: `mcp__mcp_devenv_sh__search_options` with query like "languages.python"
2. Read the devenv.nix file
3. Add or modify the languages section
4. Reload the environment

### Adding Packages

1. Use MCP search to find packages: `mcp__mcp_devenv_sh__search_packages` with the tool name
2. Read the devenv.nix file
3. Add to the packages list
4. Reload the environment

### Creating Scripts

1. Identify the command to run
2. Add to scripts section with descriptive name
3. Use multi-line strings for complex scripts
4. Test the script after reloading

### Setting Up Git Hooks

1. Identify which hooks are needed (linting, formatting, testing)
2. Enable relevant hooks in git-hooks.hooks
3. Install hooks: they activate automatically on next shell entry

## Real-World Example

Here's an example from this repository's devenv.nix:

```nix
{ pkgs, ... }:

{
  # Enable JavaScript with Bun
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };

  # Additional tools
  packages = with pkgs; [
    gh          # GitHub CLI
    jq          # JSON processing
  ];

  # Convenient scripts
  scripts = {
    validate.exec = "./scripts/validate-skills.sh";
    new-skill.exec = ''
      if [ -z "$1" ]; then
        echo "Usage: new-skill <name>"
        exit 1
      fi
      mkdir -p "skills/$1"
      cat > "skills/$1/SKILL.md" << 'EOF'
      ---
      name: $1
      description: TODO - describe when this skill should be used
      ---

      # $1

      TODO - add instructions
      EOF
      echo "Created skills/$1/SKILL.md"
    '';
  };

  # Quality checks via git hooks
  git-hooks.hooks = {
    # Custom validation
    validate-skills = {
      enable = true;
      name = "validate-skills";
      entry = "./scripts/validate-skills.sh";
      pass_filenames = false;
    };

    # Shell scripts
    shellcheck.enable = true;
    shfmt.enable = true;

    # YAML validation
    yamllint.enable = true;

    # Markdown linting
    markdownlint.enable = true;

    # JSON validation
    check-json.enable = true;
    prettier = {
      enable = true;
      types_or = [ "json" "yaml" ];
    };

    # GitHub Actions
    actionlint.enable = true;

    # General hygiene
    end-of-file-fixer.enable = true;
    trim-trailing-whitespace.enable = true;
  };

  claude.code.enable = true;
}
```

## Error Correction and Validation

### Pre-Configuration Checks

1. **Verify devenv.nix exists and is valid:**
   ```bash
   # Check file exists
   test -f devenv.nix || test -f devenv.yaml

   # Validate Nix syntax
   nix-instantiate --parse devenv.nix 2>&1
   ```
   - If file doesn't exist, user should run devenv-init first
   - If syntax invalid, fix errors before making changes
   - Always READ the file before editing

2. **Check current configuration state:**
   ```bash
   # Show current config
   devenv info
   ```
   - Understand what's already configured
   - Identify conflicts with planned changes
   - Check for deprecated options

3. **Validate user request:**
   - If adding a package, search for it first using MCP tools
   - Verify package name is correct (not a typo)
   - Check if package/option already exists in config
   - Warn about duplicates or conflicts

### During Configuration Checks

4. **Validate edits for correctness:**
   - Preserve Nix syntax (semicolons, braces, brackets)
   - Maintain proper indentation
   - Keep existing comments
   - Don't break existing functionality
   - Use `with pkgs;` consistently in packages list

5. **Check for common mistakes:**
   - **Missing semicolons:** Each attribute must end with `;`
   - **Unclosed braces:** Count `{` and `}` to ensure they match
   - **Wrong list syntax:** Use `[ item1 item2 ]` not `[item1, item2]`
   - **String escaping:** Use `''` for multi-line strings, `"` for single-line
   - **Package names:** Must match nixpkgs exactly (case-sensitive)
   - **Invalid options:** Use MCP search to verify option names

6. **Validate package additions:**
   ```bash
   # After editing, check if package exists
   nix-env -qaP <package-name>
   ```
   - If package not found, search for correct name using MCP
   - Suggest alternatives if package unavailable
   - Check if package requires unfree license acceptance

7. **Check for conflicts:**
   - **Language conflicts:** Don't enable multiple versions of same language
   - **Package manager conflicts:** Don't enable npm + bun + pnpm all at once (pick one)
   - **Hook conflicts:** Some hooks might conflict (e.g., multiple formatters for same file type)
   - **Process port conflicts:** Ensure processes use different ports

   **Full-Stack specific conflicts:**
   - **Port conflicts:** Check common ports aren't duplicated:
     - Frontend: 3000 (Next.js), 5173 (Vite), 8080 (Vue), 4200 (Angular)
     - Backend: 8000 (FastAPI/Django), 3000 (Express), 4000 (Apollo)
     - Databases: 5432 (Postgres), 3306 (MySQL), 6379 (Redis), 27017 (MongoDB)
   - **Service conflicts:** Don't enable both devenv services AND docker-compose for same service
   - **Environment variable conflicts:** Check for duplicate or conflicting env vars
   - **Process dependencies:** Ensure dependency chain is valid (no circular dependencies)

   **CI/CD specific conflicts:**
   - **Script naming:** Don't use reserved CI keywords (deploy, release) unless intentional
   - **Docker conflicts:** Ensure docker/podman don't conflict
   - **Git hook performance:** Too many hooks can slow down commits (warn if >5 hooks enabled)
   - **CI environment vars:** Check for hardcoded values that should be env vars

### Post-Configuration Validation

8. **Test the configuration:**
   ```bash
   # Validate Nix syntax
   nix-instantiate --parse devenv.nix

   # Test configuration loads
   devenv info
   ```
   - If syntax error, identify and fix line number from error message
   - If eval error, check for:
     - Undefined packages
     - Invalid option values
     - Missing dependencies

9. **Verify changes applied:**
   ```bash
   # Reload environment
   direnv reload  # or exit and re-enter shell

   # Check if package is available
   which <new-package>

   # Verify language version
   python --version  # or node, rust, etc.

   # List available scripts
   devenv info | grep -A 20 "Scripts:"
   ```

10. **Test new functionality:**
    - If added a language, test it works: `python --version`
    - If added a package, test it's available: `which jq`
    - If added a script, test it runs: `<script-name>`
    - If added a hook, test it triggers: make a test commit
    - If added a process, test it starts: `devenv up`

11. **For Full-Stack configurations, test stack integration:**
    ```bash
    # Test services are running
    devenv info | grep -A 20 "Services:"

    # Test database connection
    pg_isready  # Postgres
    redis-cli ping  # Redis
    mysql -h 127.0.0.1 -e "SELECT 1"  # MySQL

    # Test processes start correctly
    devenv up  # Start all processes

    # In another terminal, verify processes are healthy
    curl http://localhost:8000/health  # Backend
    curl http://localhost:5173  # Frontend
    ps aux | grep process-compose  # Check process manager

    # Test process dependencies
    # Backend should wait for database to be healthy
    # Frontend should wait for backend to be healthy

    # Check for port conflicts
    lsof -i :5432  # Postgres
    lsof -i :6379  # Redis
    lsof -i :8000  # Backend
    lsof -i :5173  # Frontend

    # Verify environment variables
    echo $DATABASE_URL
    echo $API_URL
    echo $FRONTEND_URL

    # Test database operations
    psql $DATABASE_URL -c "SELECT 1"

    # Test full stack script
    dev  # Or whatever the main dev script is called
    ```

    **Common full-stack issues:**
    - **Port already in use:** Kill existing processes or change ports
    - **Database not ready:** Check health probes and dependencies
    - **CORS errors:** Verify API_URL matches in frontend config
    - **Process won't start:** Check logs in `$DEVENV_STATE/process-compose/process-compose.log`

12. **For CI/CD configurations, test CI parity:**
    ```bash
    # Test CI tools are available
    docker --version
    docker-compose --version
    gh --version
    act --version

    # Test scripts work identically to CI
    install  # Should use 'npm ci' not 'npm install'
    lint     # Should match CI lint step exactly
    format-check  # Should fail if not formatted (not auto-fix)
    typecheck  # Should match CI typecheck
    test-ci  # Should use CI flags (--ci, --coverage, --maxWorkers)
    build    # Should match CI build

    # Test docker build works
    docker-build  # Build container
    docker images | grep myapp  # Verify image exists

    # Test GitHub Actions locally
    act -l  # List workflows
    act push --dry-run  # Dry run of push workflow
    ci-local  # Run CI locally (if script exists)

    # Test git hooks match CI
    # Make a test commit and verify hooks run
    git add test.txt
    git commit -m "test"  # Should run pre-commit hooks

    # Verify hooks match CI checks
    # If CI runs prettier, pre-commit should too
    # If CI runs eslint, pre-commit should too

    # Test reproducibility
    rm -rf node_modules
    install  # Should produce identical results
    build    # Should be reproducible
    ```

    **Common CI/CD issues:**
    - **"Works locally, fails in CI":** Check for environment differences
    - **Flaky tests:** Ensure `--maxWorkers` and `--ci` flags are used
    - **Build not reproducible:** Use `npm ci` not `npm install`
    - **Hooks don't match CI:** Enable same hooks as CI checks
    - **Docker build fails:** Test `docker build` locally before pushing
    - **Act fails:** Check workflow syntax, test with `--dry-run` first

### Common Error Scenarios

#### Syntax Error After Edit
```bash
# Check syntax
nix-instantiate --parse devenv.nix
```
Error patterns and fixes:
- `unexpected $end` → Missing closing brace `}`
- `unexpected ;` → Extra semicolon or missing value before it
- `undefined variable` → Typo in variable name or missing import
- `attribute already defined` → Duplicate key in attribute set

#### Package Not Found
If devenv info fails with "attribute X not found":
1. Use MCP search: `mcp__mcp_devenv_sh__search_packages` with package name
2. Check spelling and case sensitivity
3. Search nixpkgs: https://search.nixos.org/packages
4. Suggest similar packages if exact match doesn't exist
5. Check if package is in a different set (e.g., `pkgs.python311Packages.numpy`)

#### Language Option Invalid
If language configuration fails:
1. Use MCP search: `mcp__mcp_devenv_sh__search_options` with "languages.<lang>"
2. Check available options for that language
3. Verify option values are correct type (string, bool, etc.)
4. Check version format (e.g., "3.11" not "3.11.0")

#### Environment Not Updating
After editing, changes don't appear:
```bash
# Force reload
direnv reload    # If using direnv

# Or restart shell
exit
devenv shell

# Or use clean reload
devenv shell --clean
```
- Check if direnv is blocking updates
- Verify .envrc is allowed: `direnv status`
- Remove lock file if stuck: `rm devenv.lock`

#### Hook Not Running
If git hooks don't trigger:
```bash
# Check hook installation
ls -la .git/hooks/

# Reinstall hooks
devenv gc
direnv allow

# Test hook manually
.git/hooks/pre-commit
```
- Ensure hook script is executable
- Check hook configuration is enabled
- Verify hook entry point exists

#### Process Won't Start
If `devenv up` fails:
```bash
# Check process configuration
devenv info | grep -A 30 "Processes:"

# Check logs
cat $DEVENV_STATE/process-compose/process-compose.log

# Test command manually
<process-command>
```
- Verify command is valid
- Check for port conflicts
- Ensure dependencies are met
- Check process health probes

#### Script Fails
If custom script doesn't work:
```bash
# Test script manually
<script-name>

# Check script definition
devenv info | grep -A 5 "<script-name>"

# Run with debug output
bash -x $(which <script-name>)
```
- Verify script syntax
- Check file paths in script
- Ensure required tools are available
- Test multi-line scripts line by line

#### Full-Stack: Process Dependencies Fail
If processes won't start or dependency chain breaks:
```bash
# Check process configuration
devenv info | grep -A 50 "Processes:"

# Check process logs
cat $DEVENV_STATE/process-compose/process-compose.log

# Test individual processes
cd backend && uvicorn main:app  # Test backend alone
cd frontend && npm run dev      # Test frontend alone

# Check health probes
curl http://localhost:8000/health  # Backend health
curl http://localhost:5173         # Frontend availability

# Test service dependencies
pg_isready  # Is postgres ready?
redis-cli ping  # Is redis ready?
```

**Common fixes:**
- **Circular dependencies:** Check process-compose dependencies
- **Health probe fails:** Adjust `initial_delay_seconds` or probe path
- **Port already in use:** `lsof -i :<port>` and kill process or change port
- **Service not ready:** Increase health probe delays
- **Wrong working directory:** Use `cd` in exec command

#### Full-Stack: Database Connection Fails
```bash
# Check service is running
pg_isready
devenv info | grep -A 20 "Services:"

# Check connection string
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"

# Check ports
lsof -i :5432  # Postgres
lsof -i :3306  # MySQL
lsof -i :6379  # Redis

# Check service logs
tail -f $DEVENV_STATE/postgres/postgres.log
```

**Common fixes:**
- **Connection refused:** Service not started, run `devenv up`
- **Wrong port:** Check service configuration and env vars
- **Authentication failed:** Check database user/password in env vars
- **Database doesn't exist:** Run database initialization script

#### Full-Stack: CORS or API Connection Issues
```bash
# Check environment variables
echo $API_URL
echo $VITE_API_URL  # For Vite
echo $NEXT_PUBLIC_API_URL  # For Next.js

# Test API directly
curl http://localhost:8000/api/test

# Check frontend config
cat frontend/vite.config.js  # Vite proxy config
cat frontend/.env.local      # Local environment overrides
```

**Common fixes:**
- **CORS errors:** Configure backend CORS to allow frontend origin
- **Wrong API URL:** Update environment variables to match backend
- **Proxy not working:** Check Vite/Next.js proxy configuration
- **Mixed content:** Ensure both use http or both use https

#### CI/CD: "Works Locally, Fails in CI"
```bash
# Test with CI flags
npm test -- --ci --coverage --maxWorkers=2

# Test with CI environment
CI=true npm test

# Check for local-only dependencies
# Look for paths like /Users/... or C:\Users\...
grep -r "/Users/" .
grep -r "C:\\Users" .

# Test reproducible build
rm -rf node_modules
npm ci
npm run build

# Test in docker (same as CI)
docker build -t test:latest .
docker run test:latest npm test
```

**Common fixes:**
- **Race conditions:** Add `--maxWorkers=2` to limit parallelism
- **Flaky tests:** Use `--ci` flag for stable test behavior
- **Environment differences:** Check for missing env vars in CI
- **Filesystem differences:** Use relative paths, not absolute
- **Missing dependencies:** Ensure all deps in package.json

#### CI/CD: Docker Build Fails
```bash
# Test docker build locally
docker build -t myapp:latest .

# Check docker logs
docker build -t myapp:latest . --progress=plain

# Test multi-stage builds stage by stage
docker build --target builder -t myapp:builder .
docker build --target runner -t myapp:runner .

# Check for .dockerignore
cat .dockerignore

# Test build context size
docker build -t myapp:latest . --no-cache
```

**Common fixes:**
- **Build context too large:** Add files to .dockerignore
- **Missing files:** Check .dockerignore isn't excluding needed files
- **Cache issues:** Use `--no-cache` to force fresh build
- **Multi-stage issues:** Test each stage independently
- **Platform issues:** Use `--platform linux/amd64` for CI compatibility

#### CI/CD: Git Hooks Too Slow
If pre-commit takes too long:
```bash
# Time individual hooks
time prettier --check .
time eslint .
time npm test

# Check enabled hooks
ls -la .git/hooks/
cat .git/hooks/pre-commit
```

**Common fixes:**
- **Disable expensive hooks:** Remove test hooks from pre-commit
- **Use CI for tests:** Move slow tests to CI only
- **Limit hook scope:** Configure hooks to run on staged files only
- **Cache results:** Use prettier/eslint cache
- **Parallelize:** Use tools like lint-staged for parallel checks

### Validation Checklist

After any configuration change, verify:

**Basic checks:**
- [ ] Nix syntax is valid: `nix-instantiate --parse devenv.nix` succeeds
- [ ] Configuration evaluates: `devenv info` succeeds without errors
- [ ] Environment reloaded: `direnv reload` or restart shell
- [ ] New packages available: `which <package>` finds them
- [ ] New scripts work: test each new script
- [ ] Hooks installed: check `.git/hooks/` if added git hooks
- [ ] No regressions: existing functionality still works
- [ ] User informed: explain what changed and how to use it

**Full-stack specific checks:**
- [ ] Services start correctly: `devenv up` starts all services
- [ ] Service health: `pg_isready`, `redis-cli ping` work
- [ ] Port conflicts resolved: No port conflicts with `lsof -i :<port>`
- [ ] Process dependencies work: Backend waits for DB, frontend waits for backend
- [ ] Environment variables set: All `$DATABASE_URL`, `$API_URL`, etc. are set
- [ ] Database connections work: Can connect to databases
- [ ] API accessible: `curl http://localhost:8000` succeeds
- [ ] Frontend loads: `curl http://localhost:5173` succeeds
- [ ] Full stack script works: Main dev script starts entire stack
- [ ] Logs accessible: Can read process logs from `$DEVENV_STATE`

**CI/CD specific checks:**
- [ ] Docker available: `docker --version` works if needed
- [ ] CI tools installed: `gh`, `act`, etc. available
- [ ] Scripts match CI: Scripts use same commands as CI (npm ci, --ci flag)
- [ ] Git hooks match CI: Pre-commit hooks run same checks as CI
- [ ] Reproducible builds: `rm -rf node_modules && npm ci && npm run build` works
- [ ] CI flags work: `npm test -- --ci --coverage` succeeds
- [ ] Local CI test works: `act push --dry-run` or `ci-local` succeeds
- [ ] Docker build works: `docker build` succeeds if using containers
- [ ] No local paths: No hardcoded paths like `/Users/...` in configs
- [ ] Environment parity: Local env matches CI env (or differences documented)

### Rollback on Failure

If configuration breaks:

1. **Restore from backup:**
   ```bash
   # If you backed up
   cp devenv.nix.backup devenv.nix
   ```

2. **Or use git:**
   ```bash
   git diff devenv.nix           # See changes
   git checkout devenv.nix       # Revert changes
   ```

3. **Or manually fix:**
   - Read the error message carefully
   - Identify the line number with the error
   - Fix the specific issue
   - Test again

Always ensure the configuration is working before finishing.

## Troubleshooting Quick Reference

### Environment not updating
```bash
direnv reload    # If using direnv
# OR
exit             # Exit and re-enter the shell
devenv shell     # Manual re-entry
```

### Hook not running
```bash
devenv gc        # Clean up
direnv allow     # Reactivate direnv
```

### Package not found
- Use MCP search to find the correct package name
- Check the Nixpkgs search: https://search.nixos.org/packages
- Some packages may need unfree packages enabled

### Version conflicts
- Specify exact versions in language configuration
- Use overlays for custom package versions
- Check devenv.lock for locked versions

### Syntax error
```bash
nix-instantiate --parse devenv.nix  # Find syntax errors
```
Common fixes:
- Add missing semicolons
- Close unclosed braces
- Fix string escaping
- Remove trailing commas in lists

### Configuration won't load
```bash
devenv shell --clean  # Clean reload
rm devenv.lock        # Remove lock file
```

## Tips

**General:**
- Always read the existing configuration before making changes
- Use MCP tools to search for packages and options
- Follow the existing code style and structure
- Test changes by reloading the environment
- Enable git hooks early to maintain code quality
- Use scripts for commonly repeated commands
- Group related packages with comments for clarity
- ALWAYS validate syntax after editing: `nix-instantiate --parse devenv.nix`
- Test configuration loads: `devenv info` should succeed
- Verify changes work: test new packages, scripts, and functionality
- Create backups before major changes: `cp devenv.nix devenv.nix.backup`
- If something breaks, revert and try smaller changes

**Full-stack specific:**
- Use `services` for databases/caches (postgres, redis, mysql) - they're auto-configured
- Use `processes` to orchestrate multiple services (frontend, backend, workers)
- Set up process dependencies: backend depends on DB, frontend depends on backend
- Configure health probes for critical processes (API server, databases)
- Use environment variables for service URLs (DATABASE_URL, API_URL, etc.)
- Avoid port conflicts: check common ports (5432, 6379, 3000, 5173, 8000)
- Create scripts for common operations: db-reset, db-seed, test-all, build-all
- Test the full stack with `devenv up` before considering configuration complete
- Check process logs in `$DEVENV_STATE/process-compose/process-compose.log`
- For docker-compose integration, use processes to run docker-compose up

**CI/CD specific:**
- Use scripts that work identically locally and in CI (same commands, same flags)
- Use `npm ci` instead of `npm install` for reproducibility
- Add CI-specific flags to test scripts: `--ci`, `--coverage`, `--maxWorkers=2`
- Enable same git hooks as CI checks (catch issues before push)
- Use Docker for environment parity between local and CI
- Test GitHub Actions locally with `act` before pushing
- Create format-check script (fails if not formatted, doesn't auto-fix)
- Avoid hardcoded paths or local-only dependencies
- Set CI=true environment variable in CI workflows
- Limit git hooks to fast checks (move slow tests to CI only)
- Use docker-compose for services in CI/CD environments
- Test reproducible builds: `rm -rf node_modules && npm ci && npm run build`
- Document any differences between local and CI environments
