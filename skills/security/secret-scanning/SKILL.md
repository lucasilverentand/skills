---
name: secret-scanning
description: Detects leaked credentials and secrets in code. Use when checking for exposed API keys, passwords, or tokens before committing.
argument-hint: [path]
allowed-tools: [Read, Bash, Glob, Grep]
---

# Secret Scanning

Detects leaked credentials and secrets in code.

## Your Task

1. **Scan codebase**: Run secret detection tools
2. **Review findings**: Verify true positives
3. **Rotate secrets**: Invalidate any exposed credentials
4. **Remove secrets**: Clean history if needed
5. **Prevent**: Set up pre-commit hooks

## Detection Tools

```bash
# gitleaks
gitleaks detect --source .

# trufflehog
trufflehog git file://.

# detect-secrets
detect-secrets scan > .secrets.baseline
```

## Common Secret Patterns

| Type | Pattern Example |
|------|-----------------|
| AWS Key | `AKIA[0-9A-Z]{16}` |
| GitHub Token | `ghp_[a-zA-Z0-9]{36}` |
| Private Key | `-----BEGIN RSA PRIVATE KEY-----` |
| Generic API Key | `api[_-]?key.*['"][a-zA-Z0-9]{20,}['"]` |
| JWT | `eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*` |

## If Secrets Are Found

1. **Rotate immediately**: Generate new credentials
2. **Revoke old credentials**: Invalidate exposed secrets
3. **Check for misuse**: Review access logs
4. **Clean git history** (if committed):

```bash
# Using git-filter-repo
git filter-repo --path secrets.json --invert-paths

# Or BFG
bfg --delete-files secrets.json
```

## Prevention

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

### .gitignore

```gitignore
.env
.env.*
*.pem
*.key
secrets.json
credentials.json
```

## Tips

- Use environment variables for secrets
- Use secret managers (Vault, AWS Secrets Manager)
- Enable GitHub secret scanning
- Train team on secret handling
