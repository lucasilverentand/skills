---
name: commit-conventions
description: Sets up conventional commit standards. Use when standardizing commit messages, enabling automated changelogs, or improving git history.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Commit Conventions

Sets up conventional commit message standards.

## Your Task

1. **Choose format**: Conventional Commits is recommended
2. **Document**: Create commit guidelines
3. **Enforce**: Set up commitlint
4. **Automate**: Enable changelog generation
5. **Train team**: Share examples

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user registration` |
| `fix` | Bug fix | `fix: resolve login timeout` |
| `docs` | Documentation | `docs: update API reference` |
| `style` | Formatting | `style: fix indentation` |
| `refactor` | Code refactoring | `refactor: extract auth logic` |
| `perf` | Performance | `perf: optimize image loading` |
| `test` | Testing | `test: add unit tests for auth` |
| `build` | Build system | `build: update webpack config` |
| `ci` | CI/CD | `ci: add GitHub Actions workflow` |
| `chore` | Maintenance | `chore: update dependencies` |

## Examples

```bash
# Simple commit
feat: add password reset functionality

# With scope
feat(auth): implement OAuth2 login

# With body
fix: prevent race condition in data sync

The synchronization was starting before the previous
operation completed. Added mutex to ensure sequential
execution.

# Breaking change
feat!: change API response format

BREAKING CHANGE: API responses now wrap data in a
`data` property. Update all clients to access
`response.data` instead of `response`.

Closes #123
```

## Commitlint Setup

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
```

## Tips

- Use imperative mood ("add" not "added")
- Keep subject under 72 characters
- Use body for "why" not "what"
- Reference issues in footer
