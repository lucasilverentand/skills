---
name: github-actions
description: Creates and debugs GitHub Actions workflows for CI/CD. Use when setting up automated testing, deployment pipelines, or GitHub automation.
argument-hint: [workflow-type]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# GitHub Actions

Creates and configures GitHub Actions workflows for CI/CD automation.

## Your Task

1. **Identify needs**: Determine what workflows are needed
2. **Check existing**: Review any existing workflows
3. **Create workflow**: Write .github/workflows/*.yml files
4. **Configure triggers**: Set up appropriate event triggers
5. **Test**: Verify workflow runs correctly

## Common Workflow Types

### Test Workflow

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

### Build and Deploy

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to production
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

### Release Workflow

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

## Tips

- Use `actions/cache` to speed up builds
- Store secrets in repository settings
- Use matrix builds for multiple Node/OS versions
- Pin action versions for reproducibility
