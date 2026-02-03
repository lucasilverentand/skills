---
name: actions-debug
description: Debugs failing GitHub Actions workflows by analyzing logs and configurations. Use when CI is failing, workflows timeout, actions produce unexpected results, or debugging workflow errors.
argument-hint: [run-id or workflow-name]
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Debug GitHub Actions

Analyzes failing workflows and provides actionable fixes.

## Your Task

<!-- TODO: Implement skill logic -->

1. Fetch recent workflow runs via `gh run list`
2. Get failure details via `gh run view`
3. Download and analyze logs
4. Identify failure patterns:
   - Permission errors
   - Secret issues
   - Timeout problems
   - Dependency failures
   - Test failures
5. Cross-reference with workflow YAML
6. Provide specific fix recommendations

## Examples

```bash
# Debug most recent failure
/actions-debug

# Debug specific run
/actions-debug 12345678

# Debug specific workflow
/actions-debug ci.yml
```

## Common Failure Patterns

<!-- TODO: Add pattern detection logic -->

- **Permission denied**: Token scope, GITHUB_TOKEN permissions
- **Secret not found**: Missing or misconfigured secrets
- **Timeout**: Long-running steps, infinite loops
- **Cache miss**: Cache key mismatch, expired cache

## Validation Checklist

- [ ] Root cause identified
- [ ] Fix verified in workflow YAML
- [ ] Related issues documented
