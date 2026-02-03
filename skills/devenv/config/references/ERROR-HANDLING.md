# Devenv Configuration Error Handling

Comprehensive troubleshooting guide for devenv configuration issues.

## Table of Contents

- [Pre-Configuration Checks](#pre-configuration-checks)
- [Syntax Errors](#syntax-errors)
- [Package Errors](#package-errors)
- [Environment Errors](#environment-errors)
- [Service Errors](#service-errors)
- [Hook Errors](#hook-errors)
- [Process Errors](#process-errors)
- [Validation Checklist](#validation-checklist)

## Pre-Configuration Checks

### Verify File Exists

```bash
test -f devenv.nix || test -f devenv.yaml
```

If neither exists, use devenv-init skill first.

### Validate Syntax Before Editing

```bash
nix-instantiate --parse devenv.nix 2>&1
```

Always READ the file before making changes.

### Check Current State

```bash
devenv info
```

Understand existing configuration before adding.

## Syntax Errors

### Missing Semicolons

```nix
# Wrong
languages.python = {
  enable = true    # Missing semicolon
}

# Correct
languages.python = {
  enable = true;
};
```

### Unclosed Braces

```nix
# Wrong - missing closing brace
languages = {
  python.enable = true;
# }  <- missing

# Correct
languages = {
  python.enable = true;
};
```

### Wrong List Syntax

```nix
# Wrong - Nix doesn't use commas in lists
packages = [ pkg1, pkg2 ];

# Correct
packages = [ pkg1 pkg2 ];
```

### String Escaping

```nix
# Single-line strings
name = "my-app";

# Multi-line strings
scripts.deploy.exec = ''
  echo "Deploying..."
  npm run build
'';
```

### Finding Syntax Errors

```bash
nix-instantiate --parse devenv.nix
```

Error messages show line numbers:

- `unexpected $end` → Missing closing brace
- `unexpected ;` → Extra semicolon
- `undefined variable` → Typo in variable name

## Package Errors

### Package Not Found

If `devenv info` fails with "attribute X not found":

1. Search for correct name:

   ```bash
   devenv search <package-name>
   ```

2. Check nixpkgs: https://search.nixos.org/packages

3. Common corrections:

   | User Types | Correct Name |
   |------------|--------------|
   | node | nodejs |
   | pg | postgresql |
   | k8s | kubectl |
   | python3 | python311 |

### Package Set Issues

Some packages require specific sets:

```nix
# Python packages
pkgs.python311Packages.numpy

# Node packages
pkgs.nodePackages.prettier
```

## Environment Errors

### Environment Not Updating

After editing, changes don't appear:

```bash
# Force reload
direnv reload

# Or restart shell
exit
devenv shell

# Or clean reload
devenv shell --clean
```

### Direnv Issues

```bash
# Check status
direnv status

# Re-allow
direnv allow

# Check .envrc content
cat .envrc  # Should contain "use devenv"
```

### Lock File Issues

```bash
# Remove and regenerate
rm devenv.lock
devenv shell --clean
```

## Service Errors

### Service Won't Start

```bash
# Check service configuration
devenv info | grep -A 20 "Services:"

# Check logs
cat $DEVENV_STATE/postgres/postgres.log
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5432  # Postgres
lsof -i :6379  # Redis

# Kill process
kill <PID>

# Or change port in config
services.postgres.port = 5433;
```

### Database Connection Failed

```bash
# Test connection
pg_isready
psql $DATABASE_URL -c "SELECT 1"

# Check environment variable
echo $DATABASE_URL
```

## Hook Errors

### Hooks Not Running

```bash
# Check installation
ls -la .git/hooks/

# Reinstall
devenv gc
direnv allow

# Test manually
.git/hooks/pre-commit
```

### Hook Script Fails

```bash
# Run with debug output
bash -x .git/hooks/pre-commit

# Check hook entry point
devenv info | grep -A 20 "git-hooks"
```

### Hook Conflicts

Multiple formatters for same file type may conflict:

```nix
# Problematic - both format JavaScript
git-hooks.hooks = {
  prettier.enable = true;
  eslint.enable = true;  # With --fix
};

# Better - prettier for format, eslint for lint only
```

## Process Errors

### Process Won't Start

```bash
# Check configuration
devenv info | grep -A 30 "Processes:"

# Check logs
cat $DEVENV_STATE/process-compose/process-compose.log

# Test command manually
<process-command>
```

### Dependency Chain Fails

```nix
# Check for circular dependencies
processes = {
  a.depends_on.b = "process_healthy";  # A waits for B
  b.depends_on.a = "process_healthy";  # B waits for A - CIRCULAR!
};
```

### Health Probe Fails

```bash
# Test probe endpoint manually
curl http://localhost:8000/health

# Increase delays
readiness_probe = {
  initial_delay_seconds = 5;  # Increase from 2
  period_seconds = 15;        # Increase from 10
};
```

## Validation Checklist

After any configuration change:

### Basic Checks

- [ ] Nix syntax valid: `nix-instantiate --parse devenv.nix`
- [ ] Config evaluates: `devenv info` succeeds
- [ ] Environment reloaded: `direnv reload` or restart shell
- [ ] New packages available: `which <package>`
- [ ] New scripts work: test each script
- [ ] No regressions: existing functionality works

### Full-Stack Checks

- [ ] Services start: `devenv up` works
- [ ] Database connects: `pg_isready` or equivalent
- [ ] No port conflicts: check common ports
- [ ] Process dependencies resolve
- [ ] Environment variables set correctly
- [ ] Full stack script works

### CI/CD Checks

- [ ] Docker available if needed
- [ ] CI tools installed
- [ ] Scripts match CI commands
- [ ] Git hooks match CI checks
- [ ] Reproducible builds work
- [ ] Local CI test passes

## Rollback Procedures

### Using Git

```bash
git diff devenv.nix       # See changes
git checkout devenv.nix   # Revert changes
```

### From Backup

```bash
cp devenv.nix.backup devenv.nix
```

### Manual Fix

1. Read error message for line number
2. Fix specific issue
3. Validate syntax: `nix-instantiate --parse devenv.nix`
4. Test: `devenv info`
