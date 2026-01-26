# Devenv Plugin

Complete toolkit for [devenv](https://devenv.sh) - reproducible development environments using Nix.

## What's Included

This plugin bundles three complementary skills for the complete devenv workflow:

### 1. devenv-search
**Search for packages and configuration options**

- MCP integration for dynamic package lookup
- Context-aware suggestions for full-stack and CI/CD projects
- Common naming corrections (node → nodejs, pg → postgres)
- Search both packages and configuration options

### 2. devenv-init
**Initialize devenv in new projects**

- Production-ready templates (Python, Node.js, Rust, Go, Ruby, PHP)
- Full-stack templates (Frontend + Backend + Database)
- CI/CD optimized configurations
- Docker-based workflows
- Automatic project type detection
- Pre/post validation and error checking

### 3. devenv-config
**Configure existing devenv setups**

- Language and package management
- Process orchestration (frontend + backend + services)
- Git hooks and pre-commit checks
- Environment variables and secrets
- CI/CD parity (same commands locally and in CI)
- Docker and container integration

## Installation

Install from the Claude Code marketplace:

```
lucasilverentand/skills
```

Then install the **devenv** plugin.

## Quick Start

Once installed, skills are auto-invocable:

```bash
# Search for packages
"Find Python packages for devenv"

# Initialize a project
"Set up devenv for my full-stack project"

# Configure your environment
"Add PostgreSQL to my devenv setup"
```

Or invoke manually:

```bash
/devenv-search python
/devenv-init nodejs
/devenv-config
```

## Features

### 🔍 Package Discovery
- Real-time search via MCP server
- Smart suggestions for your stack
- Configuration option lookup

### 🚀 Project Templates
- **Single language**: Python, Node.js, Rust, Go, Ruby, PHP
- **Full-stack**: Frontend + Backend + Database with process orchestration
- **CI/CD optimized**: Same environment locally and in CI
- **Docker-based**: Container workflows for production parity

### ⚙️ Configuration Management
- **Languages**: Enable and configure multiple languages
- **Packages**: Add tools and utilities
- **Services**: Auto-configured databases (Postgres, Redis, MySQL)
- **Processes**: Orchestrate multiple services with health checks
- **Scripts**: Reusable commands for dev, test, build
- **Git Hooks**: Pre-commit checks matching CI

### 🛡️ Error Prevention
- Comprehensive validation (syntax, configuration, runtime)
- Port conflict detection
- Process dependency validation
- Environment variable checking
- Detailed error messages with fixes
- Rollback on failure

### 🔄 CI/CD Integration
- Scripts work identically locally and in CI
- Docker for environment parity
- GitHub Actions local testing with `act`
- Reproducible builds with `npm ci`
- Pre-commit hooks matching CI checks

## Example Workflows

### Full-Stack Development

```bash
# 1. Initialize with full-stack template
/devenv-init

# 2. Configure services
"Add PostgreSQL and Redis to devenv"

# 3. Run entire stack
devenv up  # Starts frontend, backend, database

# 4. Develop with hot reload
# All services automatically restart on changes
```

### Microservices

```bash
# 1. Set up devenv in each service
/devenv-init

# 2. Configure process orchestration
"Set up processes to run all microservices together"

# 3. Run with dependencies
devenv up  # Starts all services with health checks
```

### CI/CD Workflow

```bash
# 1. Initialize with CI/CD template
/devenv-init

# 2. Configure scripts
"Add scripts that work in CI and locally"

# 3. Test locally
act push  # Run GitHub Actions locally

# 4. Deploy with confidence
# Same environment everywhere
```

## Key Capabilities

### Process Orchestration
Run multiple services together:
- Frontend dev server (Vite, Next.js, etc.)
- Backend API server (FastAPI, Express, etc.)
- Databases (Postgres, Redis, MySQL)
- Worker processes (Celery, Sidekiq, etc.)

With features:
- Dependency management (backend waits for DB)
- Health checks (ensure services are ready)
- Port management (avoid conflicts)
- Log aggregation

### Service Auto-Configuration
Enable databases with one line:
```nix
services.postgres.enable = true;
services.redis.enable = true;
```

No manual setup needed - devenv handles:
- Installation
- Configuration
- Starting/stopping
- Data persistence

### Environment Parity
Same environment from dev to production:
- Reproducible with Nix
- Version-locked dependencies
- Documented in devenv.nix
- Works on any machine

## MCP Integration

Includes `mcp.devenv.sh` server for:
- Real-time package search
- Configuration option discovery
- Up-to-date information
- No manual maintenance

## Requirements

- [devenv](https://devenv.sh) (installed automatically if missing)
- Optional: [direnv](https://direnv.net) for automatic activation
- Optional: [act](https://github.com/nektos/act) for local CI testing

## Documentation

- [devenv docs](https://devenv.sh)
- [Skills repository](https://github.com/lucasilverentand/skills)
- [MCP server](https://mcp.devenv.sh)

## Support

- [GitHub Issues](https://github.com/lucasilverentand/skills/issues)
- [GitHub Discussions](https://github.com/lucasilverentand/skills/discussions)

## License

MIT License - see LICENSE file for details
