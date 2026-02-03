# CI/CD Configuration Reference

Complete guide for configuring CI/CD-optimized devenv environments.

## Table of Contents

- [Overview](#overview)
- [Complete CI/CD Example](#complete-cicd-example)
- [CI-Parity Scripts](#ci-parity-scripts)
- [Git Hooks](#git-hooks)
- [GitHub Actions Integration](#github-actions-integration)
- [Docker Integration](#docker-integration)
- [Troubleshooting](#troubleshooting)

## Overview

CI/CD configuration goals:

- **Same commands locally and in CI**: Scripts work identically in both environments
- **Reproducible builds**: Use `npm ci` over `npm install`
- **Local CI testing**: Use `act` to test GitHub Actions locally
- **Git hooks match CI**: Pre-commit hooks run same checks as CI

## Complete CI/CD Example

```nix
{ pkgs, ... }:

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

## CI-Parity Scripts

### Key Principles

| Principle | Implementation |
|-----------|---------------|
| Reproducible installs | Use `npm ci` not `npm install` |
| CI flags | Add `--ci`, `--coverage`, `--maxWorkers=2` |
| Check not fix | `format-check` fails if unformatted (doesn't auto-fix) |
| Same commands | Identical scripts locally and in CI |

### Essential Scripts

```nix
scripts = {
  # Must use 'ci' for reproducibility
  install.exec = "npm ci";

  # Check mode (fails if changes needed)
  format-check.exec = "npm run format -- --check";

  # CI-optimized test (limited workers, coverage)
  test-ci.exec = "npm test -- --ci --coverage --maxWorkers=2";

  # Local CI simulation
  ci-full.exec = ''
    npm ci
    npm run lint
    npm run format -- --check
    npm run typecheck
    npm test -- --ci
    npm run build
  '';
};
```

## Git Hooks

### Matching CI Checks

Enable same checks as your CI pipeline:

```nix
git-hooks.hooks = {
  # If CI runs prettier check, enable prettier hook
  prettier.enable = true;

  # If CI runs eslint, enable eslint hook
  eslint.enable = true;

  # If CI checks for secrets, enable gitleaks
  gitleaks.enable = true;
};
```

### Performance Considerations

Keep hooks fast (< 10 seconds):

```nix
git-hooks.hooks = {
  # Fast: formatting checks (run always)
  prettier.enable = true;

  # Medium: linting (run always)
  eslint.enable = true;

  # Slow: tests (move to CI only)
  # unit-tests = {
  #   enable = true;
  #   entry = "npm test";
  # };
};
```

## GitHub Actions Integration

### Example Workflow

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

### Testing Workflows Locally

```bash
# List available workflows
act -l

# Dry run (no execution)
act push --dry-run

# Run push workflow
act push

# Run PR workflow
act pull_request

# Run with secrets
act push --secret-file .secrets
```

## Docker Integration

### Building Images

```nix
scripts = {
  docker-build.exec = "docker build -t myapp:latest .";

  # Multi-platform build
  docker-build-multi.exec = ''
    docker buildx build \
      --platform linux/amd64,linux/arm64 \
      -t myapp:latest .
  '';
};
```

### Testing with Docker

```nix
scripts = {
  docker-test.exec = ''
    docker-compose -f docker-compose.test.yml up \
      --abort-on-container-exit \
      --exit-code-from test
    docker-compose -f docker-compose.test.yml down
  '';
};
```

## Troubleshooting

### "Works Locally, Fails in CI"

```bash
# Test with CI flags
npm test -- --ci --coverage --maxWorkers=2

# Test with CI environment
CI=true npm test

# Check for absolute paths
grep -r "/Users/" .
grep -r "C:\\Users" .
```

Common causes:

- Race conditions: Use `--maxWorkers=2`
- Environment differences: Check env vars
- Filesystem differences: Use relative paths
- Flaky tests: Use `--ci` flag

### Docker Build Fails

```bash
# Build with verbose output
docker build -t myapp:latest . --progress=plain

# Check build context
docker build -t myapp:latest . --no-cache

# Test stages independently
docker build --target builder -t myapp:builder .
```

### Git Hooks Too Slow

```bash
# Time individual hooks
time prettier --check .
time eslint .

# Check what's enabled
ls -la .git/hooks/
```

Solutions:

- Move slow tests to CI only
- Use caching (prettier/eslint caches)
- Limit to staged files only
- Disable expensive hooks in pre-commit

### Act Fails

```bash
# Check workflow syntax
act -l

# Run with verbose output
act push -v

# Check for unsupported features
# (act doesn't support all GitHub Actions features)
```
