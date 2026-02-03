---
name: devenv-init
description: Initializes devenv in a new or existing project with appropriate configuration templates. Use when setting up devenv, creating devenv.nix, starting a new development environment, or adding devenv to an existing project.
argument-hint: [project-type]
allowed-tools:
  [Bash, Read, Write, Glob, Grep, mcp__mcp_devenv_sh__search_packages, mcp__mcp_devenv_sh__search_options]
---

# Devenv Project Initialization

Initializes devenv for new or existing projects.

## Your Task

1. **Check if devenv is already set up:**
   - Look for `devenv.nix` or `devenv.yaml`
   - If exists, offer to use devenv-config instead

2. **Check if devenv is installed:** Run `devenv version`. If not installed, provide installation instructions.

3. **Determine project type** from $ARGUMENTS or by examining files:
   - `package.json` → Node.js
   - `pyproject.toml` or `requirements.txt` → Python
   - `Cargo.toml` → Rust
   - `go.mod` → Go
   - Multiple languages → Full-stack
   - Ask if unclear

4. **Create configuration files:**
   - `devenv.nix` with appropriate template
   - `.envrc` for direnv integration
   - Update `.gitignore`

5. **Guide next steps**

## Installation Check

If devenv is not installed:

```bash
curl -L https://get.devenv.sh | sh
```

More details: https://devenv.sh/getting-started/

## Quick Templates

### Python

```nix
{ pkgs, ... }:

{
  languages.python = {
    enable = true;
    version = "3.11";
    venv.enable = true;
  };

  scripts = {
    test.exec = "pytest";
  };
}
```

### Node.js

```nix
{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;  # or bun.enable
  };

  scripts = {
    dev.exec = "npm run dev";
    test.exec = "npm test";
  };
}
```

### Rust

```nix
{ pkgs, ... }:

{
  languages.rust = {
    enable = true;
  };

  packages = with pkgs; [ cargo-watch ];

  scripts = {
    dev.exec = "cargo watch -x run";
    test.exec = "cargo test";
  };
}
```

### Go

```nix
{ pkgs, ... }:

{
  languages.go.enable = true;

  scripts = {
    dev.exec = "go run .";
    test.exec = "go test ./...";
  };
}
```

For full-stack, CI/CD, and advanced templates, see [references/TEMPLATES.md](references/TEMPLATES.md).

## Template Selection Guide

| Project Type | Template |
|--------------|----------|
| Single language | Language-specific template |
| Frontend + Backend | Full-Stack template |
| Need CI/CD parity | CI/CD Optimized template |
| Container workflow | Full-Stack with Docker template |

## Direnv Integration

Create `.envrc`:

```bash
use devenv
```

Then run:

```bash
direnv allow
```

## Gitignore Entries

Add to `.gitignore`:

```
# Devenv
.devenv*
devenv.lock
.direnv
```

## Validation

After creating files:

```bash
# Verify syntax
nix-instantiate --parse devenv.nix

# Test configuration
devenv info

# Activate environment
direnv allow  # or: devenv shell
```

## Next Steps

1. **Activate environment:** Run `direnv allow` or `devenv shell`

2. **Test setup:** Run `devenv info`

3. **Add more packages:** Use devenv-search or devenv-config skills

## Common Issues

| Issue | Solution |
|-------|----------|
| devenv not found | Install with `curl -L https://get.devenv.sh \| sh` |
| Syntax error | `nix-instantiate --parse devenv.nix` to diagnose |
| direnv not loading | Add hook to shell rc, run `direnv allow` |
| Permission denied | Check directory permissions |

## Tips

- Prefer `devenv.nix` over `devenv.yaml` (more flexible)
- Always set up direnv integration
- Add git hooks early
- Create useful scripts for common tasks
- Test setup before finishing
