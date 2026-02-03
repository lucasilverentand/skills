---
name: pr-review
description: Reviews pull request diffs for bugs, security issues, and best practices. Use when reviewing PRs, providing code feedback, checking quality before merge, or conducting code reviews.
argument-hint: [pr-number or pr-url]
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Review Pull Request

Analyzes PR diffs and provides comprehensive code review feedback.

## Your Task

<!-- TODO: Implement skill logic -->

1. Fetch PR details and diff via `gh pr view` and `gh pr diff`
2. Analyze changes for:
   - Bugs and logic errors
   - Security vulnerabilities
   - Performance issues
   - Code style consistency
   - Test coverage
3. Check related files not in diff
4. Generate review comments
5. Submit review via `gh pr review`

## Examples

```bash
# Review by PR number
/pr-review 123

# Review by URL
/pr-review https://github.com/owner/repo/pull/123

# Review current branch's PR
/pr-review
```

## Review Categories

<!-- TODO: Add detailed review criteria -->

- **Correctness**: Logic errors, edge cases, error handling
- **Security**: Injection, authentication, data exposure
- **Performance**: N+1 queries, unnecessary computation
- **Maintainability**: Readability, documentation, complexity

## Validation Checklist

- [ ] All changed files reviewed
- [ ] Security implications considered
- [ ] Test coverage assessed
- [ ] Breaking changes identified
