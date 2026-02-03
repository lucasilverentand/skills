---
name: secrets-audit
description: Audits repository for exposed secrets and configures secret scanning. Use when checking for leaked credentials, setting up secret protection, rotating exposed secrets, or security auditing.
argument-hint: [action]
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Audit Secrets

Scans for exposed secrets and configures protection.

## Your Task

<!-- TODO: Implement skill logic -->

1. Scan repository for potential secrets:
   - API keys, tokens
   - Passwords, credentials
   - Private keys
   - Connection strings
2. Check git history for past exposures
3. Review GitHub secret scanning alerts via `gh api`
4. Configure secret scanning settings
5. Set up push protection
6. Provide rotation guidance for exposed secrets

## Examples

```bash
# Scan for secrets
/secrets-audit scan

# Check GitHub alerts
/secrets-audit alerts

# Configure protection
/secrets-audit protect
```

## Secret Patterns

<!-- TODO: Add detection patterns -->

- **AWS**: `AKIA[0-9A-Z]{16}`
- **GitHub**: `ghp_[a-zA-Z0-9]{36}`
- **Generic API Key**: `api[_-]?key.*['\"][a-zA-Z0-9]{20,}`
- **Private Key**: `-----BEGIN.*PRIVATE KEY-----`

## Validation Checklist

- [ ] Full history scanned
- [ ] All alerts reviewed
- [ ] Exposed secrets rotated
- [ ] Push protection enabled
