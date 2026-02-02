# Devenv Skills

Skills for working with [devenv](https://devenv.sh) - declarative, reproducible development environments.

## Skills

| Skill | Description |
|-------|-------------|
| [search](./search/) | Search for devenv packages, languages, and configuration options |
| [init](./init/) | Initialize devenv in a new project with language and service support |
| [config](./config/) | Configure devenv projects with languages, packages, scripts, and services |

## Usage

```
/devenv-search python          # Find Python-related packages and options
/devenv-init                   # Initialize devenv in current project
/devenv-config add postgres    # Add PostgreSQL service to devenv.nix
```

## Requirements

- [devenv](https://devenv.sh) installed
- Nix package manager

## MCP Server

This plugin includes the `mcp.devenv.sh` MCP server for searching packages and options.
