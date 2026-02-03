---
name: devenv-config
description: Configures devenv projects by adding languages, packages, scripts, git hooks, services, and processes. Use when modifying devenv.nix, adding packages to devenv, configuring language options, setting up git hooks, adding scripts, or customizing the development environment.
argument-hint: [config-type]
allowed-tools:
  [Bash, Read, Edit, Glob, Grep, mcp__mcp_devenv_sh__search_packages, mcp__mcp_devenv_sh__search_options]
---

# Devenv Configuration

Configures and customizes existing devenv environments.

## Your Task

1. **Read current configuration**: Always read `devenv.nix` first
2. **Identify changes needed**: From $ARGUMENTS or user request
3. **Search if needed**: Use MCP tools to find packages/options
4. **Make changes**: Edit preserving style and structure
5. **Validate**: Test syntax and configuration
6. **Guide user**: Explain what changed, how to use it

## Configuration Quick Reference

### Languages

```nix
languages = {
  javascript = {
    enable = true;
    npm.enable = true;      # or bun.enable or pnpm.enable
  };
  python = {
    enable = true;
    version = "3.11";
    venv.enable = true;
  };
  rust.enable = true;
  go.enable = true;
};
```

### Packages

```nix
packages = with pkgs; [
  gh            # GitHub CLI
  jq            # JSON processor
  docker
  kubectl
];
```

Search for packages: `devenv search <query>`

### Scripts

```nix
scripts = {
  dev.exec = "npm run dev";
  test.exec = "pytest tests/";
  db-reset.exec = ''
    dropdb myapp --if-exists
    createdb myapp
  '';
};
```

### Git Hooks

```nix
git-hooks.hooks = {
  prettier.enable = true;
  eslint.enable = true;
  black.enable = true;       # Python
  rustfmt.enable = true;     # Rust
  shellcheck.enable = true;
  gitleaks.enable = true;    # Secret detection
};
```

### Services

```nix
services = {
  postgres = {
    enable = true;
    initialDatabases = [{ name = "myapp_dev"; }];
  };
  redis.enable = true;
  mysql.enable = true;
};
```

### Processes

```nix
processes = {
  backend.exec = "uvicorn main:app --reload";
  frontend.exec = "npm run dev";
};
```

Start all with `devenv up`.

### Environment Variables

```nix
env = {
  DATABASE_URL = "postgresql://localhost/myapp";
  API_KEY = "dev-key";
};
```

## Validation

After every edit:

```bash
# Check syntax
nix-instantiate --parse devenv.nix

# Test configuration loads
devenv info

# Reload environment
direnv reload
```

## Common Tasks

### Add a Language

1. Search options: `devenv search languages.<lang>`
2. Add to `languages` section
3. Reload environment
4. Verify: `<lang> --version`

### Add a Package

1. Search: `devenv search <package>`
2. Add to `packages` list
3. Reload environment
4. Verify: `which <package>`

### Add a Script

1. Add to `scripts` section
2. Use multi-line `''` strings for complex scripts
3. Reload environment
4. Test: run script by name

### Add Git Hooks

1. Add to `git-hooks.hooks` section
2. Hooks activate on next shell entry
3. Test with a commit

### Add a Service

1. Enable in `services` section
2. Service starts automatically
3. Test connection

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Changes not appearing | `direnv reload` or exit/re-enter shell |
| Syntax error | `nix-instantiate --parse devenv.nix` |
| Package not found | Search with MCP tools or devenv CLI |
| Hook not running | `devenv gc && direnv allow` |
| Service won't start | Check `$DEVENV_STATE` logs |

## Detailed References

For comprehensive configurations:

- **Full-Stack Apps**: See [references/FULLSTACK-CONFIG.md](references/FULLSTACK-CONFIG.md) for frontend + backend + database setups with processes and dependencies
- **CI/CD Optimization**: See [references/CICD-CONFIG.md](references/CICD-CONFIG.md) for CI-parity scripts, GitHub Actions integration, and Docker
- **Error Handling**: See [references/ERROR-HANDLING.md](references/ERROR-HANDLING.md) for detailed troubleshooting

## Tips

- Always read devenv.nix before editing
- Use MCP search tools to find correct package/option names
- Follow existing code style and structure
- Test changes by reloading the environment
- Use `services` for databases (auto-configured)
- Use `processes` to run multiple services together
- Scripts are available as commands in the shell
