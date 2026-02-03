---
name: pre-commit-hooks
description: Configures Git pre-commit hooks for code quality. Use when setting up husky, lint-staged, or automated formatting on commit.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Pre-commit Hooks

Sets up Git hooks for automated code quality checks.

## Your Task

1. **Choose tools**: Husky + lint-staged is most common
2. **Install dependencies**: Add husky and lint-staged
3. **Configure hooks**: Set up pre-commit checks
4. **Test**: Verify hooks run on commit
5. **Document**: Update contributing guide

## Quick Setup

```bash
npm install -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## Lint-staged Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ],
    "*.css": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

## Alternative: Simple Hook

```bash
# .husky/pre-commit
npm run lint
npm run typecheck
```

## Commit Message Hook

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

```javascript
// commitlint.config.js
export default { extends: ['@commitlint/config-conventional'] };
```

## Common Hooks

| Hook | Purpose |
|------|---------|
| `pre-commit` | Lint, format, test |
| `commit-msg` | Validate commit message |
| `pre-push` | Run full test suite |

## Tips

- Use lint-staged to only check changed files
- Keep hooks fast (<10s) for good DX
- Allow bypass with `git commit --no-verify` for emergencies
- Run full checks in CI as backup
