---
name: release-automation
description: Sets up automated versioning and changelog generation. Use when configuring semantic release, conventional commits, or automated publishing.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Release Automation

Sets up automated versioning, changelogs, and publishing.

## Your Task

1. **Choose strategy**: Semantic release or manual versioning
2. **Configure commits**: Set up conventional commits
3. **Set up changelog**: Configure changelog generation
4. **Automate release**: Create release workflow
5. **Test**: Verify release process works

## Semantic Release Setup

```bash
npm install -D semantic-release @semantic-release/changelog @semantic-release/git
```

### Release Configuration

```json
// package.json or .releaserc.json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git",
      "@semantic-release/github"
    ]
  }
}
```

### GitHub Actions Workflow

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Conventional Commits

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat:` | New feature | Minor |
| `fix:` | Bug fix | Patch |
| `feat!:` or `BREAKING CHANGE:` | Breaking change | Major |
| `docs:` | Documentation | None |
| `chore:` | Maintenance | None |

## Tips

- Use commitlint to enforce commit conventions
- Configure protected branches for release
- Test with `--dry-run` first
