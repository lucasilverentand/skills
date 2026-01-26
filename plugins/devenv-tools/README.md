# Devenv Tools Plugin Bundle

Complete workflow tools for [devenv](https://devenv.sh) - reproducible development environments.

## What's Included

This bundle includes three complementary skills for the complete devenv workflow:

### 1. devenv-search
Search for devenv packages, languages, and configuration options.

**Use when:**
- Looking for packages to install
- Finding configuration options
- Discovering available tools for your stack

**Features:**
- MCP integration for dynamic package lookup
- Context-aware suggestions for full-stack and CI/CD projects
- Common naming corrections (node → nodejs, pg → postgres, etc.)

### 2. devenv-init
Initialize devenv in new projects with production-ready templates.

**Use when:**
- Setting up devenv for the first time
- Starting a new project
- Migrating from other environment managers

**Templates:**
- Python, Node.js, Rust, Go, Ruby, PHP
- Full-stack (Frontend + Backend + Database)
- CI/CD optimized configurations
- Docker-based workflows

**Features:**
- Automatic project type detection
- Pre/post validation and error checking
- Direnv integration setup
- Database and service configuration

### 3. devenv-config
Configure and customize existing devenv setups.

**Use when:**
- Adding languages, packages, or tools
- Setting up scripts and git hooks
- Configuring processes for full-stack apps
- Optimizing for CI/CD workflows

**Capabilities:**
- Language and package management
- Process orchestration (frontend + backend + services)
- Git hooks and pre-commit checks
- Environment variables and secrets
- CI/CD parity (same commands locally and in CI)
- Docker and container integration

## Installation

Install this bundle from the Claude Code marketplace:

```bash
# Add marketplace
lucasilverentand/skills

# Or install directly
claude-code plugins install lucasilverentand/skills/plugins/devenv-tools
```

## Quick Start

Once installed, these skills are auto-invocable:

```bash
# Search for packages
"Find Python packages for devenv"
# Triggers: devenv-search

# Initialize a project
"Set up devenv for my full-stack project"
# Triggers: devenv-init

# Configure your environment
"Add PostgreSQL to my devenv setup"
# Triggers: devenv-config
```

Or invoke manually:
```bash
/devenv-search python
/devenv-init nodejs
/devenv-config
```

## Example Workflows

### Full-Stack Development
1. **Initialize**: `/devenv-init` - Choose full-stack template
2. **Configure**: Add databases, configure processes
3. **Search**: Find additional packages as needed
4. **Validate**: Built-in validation ensures everything works

### CI/CD Setup
1. **Initialize**: `/devenv-init` - Choose CI/CD optimized template
2. **Configure**: Set up scripts that work locally and in CI
3. **Test**: Use `act` to test GitHub Actions locally
4. **Deploy**: Push with confidence

### Microservices
1. **Initialize**: Set up devenv in each service
2. **Configure**: Use processes to orchestrate multiple services
3. **Develop**: Run entire stack locally with health checks
4. **Scale**: Same environment everywhere

## Key Features

### Full-Stack Support
- Frontend + Backend + Database orchestration
- Process management with dependencies and health checks
- Service auto-configuration (Postgres, Redis, MySQL)
- Environment variable management
- Port conflict detection

### CI/CD Integration
- Scripts that work identically locally and in CI
- Docker and docker-compose integration
- GitHub Actions local testing with `act`
- Reproducible builds
- Pre-commit hooks matching CI checks

### Error Prevention
- Comprehensive validation (pre, during, post)
- Syntax checking
- Configuration verification
- Process dependency validation
- Detailed error messages with fixes

### Production Ready
- Real-world templates
- Best practices built-in
- Security considerations
- Performance optimizations
- Scalability patterns

## MCP Integration

This bundle includes the `mcp.devenv.sh` MCP server for dynamic package and option lookups, providing:
- Real-time package search
- Configuration option discovery
- Up-to-date package information
- No manual package list maintenance

## Requirements

- [devenv](https://devenv.sh) installed
- Optional: [direnv](https://direnv.net) for automatic activation
- Optional: [act](https://github.com/nektos/act) for local CI testing

## Support

- GitHub Issues: https://github.com/lucasilverentand/skills/issues
- Documentation: https://devenv.sh/
- MCP Server: https://mcp.devenv.sh

## License

MIT License - see LICENSE file for details
