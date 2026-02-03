---
name: dependency-audit
description: Scans dependencies for known vulnerabilities. Use when auditing security, updating packages, or checking for CVEs in dependencies.
argument-hint:
allowed-tools: [Read, Bash, Glob, Grep]
---

# Dependency Audit

Scans project dependencies for known security vulnerabilities.

## Your Task

1. **Run audit**: Execute vulnerability scan
2. **Analyze results**: Review severity and impact
3. **Prioritize fixes**: Focus on critical/high severity
4. **Update packages**: Fix vulnerable dependencies
5. **Document**: Note any exceptions

## Audit Commands

```bash
# npm
npm audit
npm audit --json              # Machine-readable output
npm audit fix                 # Auto-fix where possible
npm audit fix --force         # Force major updates (careful!)

# pnpm
pnpm audit
pnpm audit --fix

# yarn
yarn audit
yarn npm audit

# Python
pip-audit
safety check
```

## Severity Levels

| Level | Action | Timeline |
|-------|--------|----------|
| Critical | Immediate fix | < 24 hours |
| High | Priority fix | < 1 week |
| Medium | Planned fix | < 1 month |
| Low | Review | Next maintenance cycle |

## Handling Vulnerabilities

### Direct Dependency

```bash
# Update to patched version
npm update package-name

# Or install specific version
npm install package-name@2.0.1
```

### Transitive Dependency

```json
// package.json - Force resolution
{
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}
```

### False Positives

```json
// .nsprc or audit config
{
  "exceptions": ["https://github.com/advisories/GHSA-xxxx-xxxx-xxxx"]
}
```

## CI Integration

```yaml
# GitHub Actions
- name: Security audit
  run: npm audit --audit-level=high
```

## Tips

- Run audits in CI pipelines
- Set up Dependabot or Renovate for auto-updates
- Review changelogs before major updates
- Document exceptions with justification
