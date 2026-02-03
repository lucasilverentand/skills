---
name: configuring-lefthook
description: Configures Lefthook git hooks for pre-commit, pre-push, and other git events. Sets up linting, formatting, testing, and validation hooks. Use when setting up lefthook, adding git hooks, configuring pre-commit hooks, or automating code quality checks.
argument-hint: [action] [hook-type]
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Lefthook Configuration

Configures Lefthook for git hook automation.

## Your Task

Determine action from $ARGUMENTS or context:

| Intent | Action |
|--------|--------|
| "init lefthook", "set up hooks" | Initialize lefthook |
| "add hook", "add pre-commit" | Add/modify hooks |
| "check", "validate" | Validate configuration |

## Progress Checklist

- [ ] Determine action
- [ ] Check current state
- [ ] Execute action
- [ ] Validate configuration
- [ ] Test hooks

---

## Initializing Lefthook

### Step 1: Check Prerequisites

```bash
# Check if lefthook is installed
which lefthook || echo "not installed"

# Check for existing config
test -f lefthook.yml && echo "exists" || echo "new"
```

### Step 2: Install Lefthook

**Via npm:**

```bash
npm install lefthook --save-dev
npx lefthook install
```

**Via Homebrew:**

```bash
brew install lefthook
lefthook install
```

**Via devenv:**

```nix
packages = [ pkgs.lefthook ];
```

### Step 3: Create Configuration

Create `lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,jsx,tsx}"
      run: npm run lint -- {staged_files}
    format:
      glob: "*.{js,ts,jsx,tsx,json,md}"
      run: prettier --check {staged_files}

pre-push:
  commands:
    test:
      run: npm test
```

### Step 4: Install Hooks

```bash
lefthook install
```

---

## Configuration Reference

### Basic Structure

```yaml
# Hook name (git hook)
pre-commit:
  # Run commands in parallel
  parallel: true

  # Commands to run
  commands:
    command-name:
      run: <command>
      glob: <file-pattern>      # Optional: filter files
      staged: true              # Optional: only staged files
      skip:                     # Optional: skip conditions
        - merge
        - rebase
```

### Available Git Hooks

| Hook | When |
|------|------|
| `pre-commit` | Before commit is created |
| `commit-msg` | After commit message is entered |
| `pre-push` | Before push to remote |
| `post-checkout` | After checkout/switch |
| `post-merge` | After merge completes |

### File Filtering

```yaml
commands:
  lint-js:
    glob: "*.{js,ts,jsx,tsx}"
    run: eslint {staged_files}

  lint-python:
    glob: "*.py"
    run: ruff check {staged_files}

  format-all:
    glob: "*.{js,ts,json,md,yaml}"
    run: prettier --check {staged_files}
```

### Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{staged_files}` | Staged files matching glob |
| `{all_files}` | All files matching glob |
| `{push_files}` | Files in commits being pushed |

---

## Common Configurations

### JavaScript/TypeScript Project

```yaml
pre-commit:
  parallel: true
  commands:
    eslint:
      glob: "*.{js,ts,jsx,tsx}"
      run: npx eslint {staged_files}
    prettier:
      glob: "*.{js,ts,jsx,tsx,json,md,yaml,yml}"
      run: npx prettier --check {staged_files}
    typecheck:
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit

commit-msg:
  commands:
    conventional:
      run: npx commitlint --edit {1}

pre-push:
  commands:
    test:
      run: npm test
```

### Python Project

```yaml
pre-commit:
  parallel: true
  commands:
    ruff:
      glob: "*.py"
      run: ruff check {staged_files}
    black:
      glob: "*.py"
      run: black --check {staged_files}
    mypy:
      glob: "*.py"
      run: mypy {staged_files}

pre-push:
  commands:
    test:
      run: pytest
```

### Rust Project

```yaml
pre-commit:
  parallel: true
  commands:
    fmt:
      glob: "*.rs"
      run: cargo fmt -- --check
    clippy:
      run: cargo clippy -- -D warnings

pre-push:
  commands:
    test:
      run: cargo test
```

### Go Project

```yaml
pre-commit:
  parallel: true
  commands:
    fmt:
      glob: "*.go"
      run: gofmt -l {staged_files}
    vet:
      run: go vet ./...
    lint:
      run: golangci-lint run

pre-push:
  commands:
    test:
      run: go test ./...
```

### Multi-Language Project

```yaml
pre-commit:
  parallel: true
  commands:
    # JavaScript
    eslint:
      glob: "*.{js,ts,jsx,tsx}"
      run: npx eslint {staged_files}
    prettier:
      glob: "*.{js,ts,json,md}"
      run: npx prettier --check {staged_files}

    # Python
    ruff:
      glob: "*.py"
      run: ruff check {staged_files}
    black:
      glob: "*.py"
      run: black --check {staged_files}

    # Shell
    shellcheck:
      glob: "*.sh"
      run: shellcheck {staged_files}

    # General
    trailing-whitespace:
      run: git diff --check --cached
```

---

## Advanced Features

### Skip Conditions

```yaml
pre-commit:
  commands:
    lint:
      run: npm run lint
      skip:
        - merge        # Skip during merges
        - rebase       # Skip during rebases
```

### Environment Variables

```yaml
pre-commit:
  commands:
    test:
      run: npm test
      env:
        CI: "true"
        NODE_ENV: "test"
```

### Scripts (Complex Commands)

```yaml
pre-commit:
  scripts:
    "check-branch.sh":
      runner: bash
```

With `lefthook/pre-commit/check-branch.sh`:

```bash
#!/bin/bash
branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" == "main" ]]; then
  echo "Direct commits to main not allowed"
  exit 1
fi
```

### Exclude Files

```yaml
pre-commit:
  commands:
    lint:
      glob: "*.js"
      exclude: "vendor/*|node_modules/*|dist/*"
      run: eslint {staged_files}
```

### Fail Text (Custom Error Messages)

```yaml
pre-commit:
  commands:
    lint:
      run: npm run lint
      fail_text: "Linting failed. Run 'npm run lint:fix' to auto-fix."
```

---

## Validation

### Check Configuration

```bash
lefthook dump  # Show parsed config
```

### Test Hooks Manually

```bash
lefthook run pre-commit  # Run without committing
lefthook run pre-push
```

### Debug Mode

```bash
LEFTHOOK_VERBOSE=1 git commit -m "test"
```

---

## Error Handling

| Issue | Solution |
|-------|----------|
| Hooks not running | `lefthook install` to reinstall |
| Command not found | Check PATH, use full path or npx |
| Hook too slow | Add `parallel: true`, limit glob |
| Want to skip once | `git commit --no-verify` |
| YAML parse error | Check indentation, use `lefthook dump` |
| Wrong files matched | Test glob with `ls {glob-pattern}` |

---

## Integration with devenv

If using devenv, add lefthook to packages:

```nix
{ pkgs, ... }:

{
  packages = [ pkgs.lefthook ];

  enterShell = ''
    lefthook install
  '';
}
```

Or use devenv's built-in git-hooks instead:

```nix
git-hooks.hooks = {
  prettier.enable = true;
  eslint.enable = true;
};
```

---

## Tips

- Use `parallel: true` for faster hooks
- Filter with `glob` to only run on relevant files
- Use `{staged_files}` for pre-commit efficiency
- Add `skip: [merge, rebase]` to avoid conflicts
- Test hooks with `lefthook run <hook>` before committing
- Use `--no-verify` sparingly for emergency commits
