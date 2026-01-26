# Code Quality Plugin Bundle

Comprehensive code quality analysis and review tools.

## What's Included

### code-review
Thorough code review for bugs, security issues, performance problems, and best practices.

**Use when:**
- Reviewing pull requests
- Analyzing code quality
- Performing security audits
- Checking for performance issues
- Ensuring maintainability

**Review Areas:**

1. **Correctness**
   - Logic errors and edge cases
   - Off-by-one errors
   - Null/undefined handling
   - Type mismatches

2. **Security**
   - Input validation
   - SQL injection, XSS, command injection
   - Sensitive data exposure
   - Authentication/authorization issues

3. **Performance**
   - Unnecessary loops or computations
   - N+1 queries
   - Memory leaks
   - Missing caching opportunities

4. **Maintainability**
   - Code clarity and readability
   - DRY violations
   - Proper error handling
   - Appropriate abstractions

**Output Format:**
- Location (file:line)
- Severity (Critical / High / Medium / Low)
- Issue description
- Fix suggestions
- Summary by severity

## Installation

Install this bundle from the Claude Code marketplace:

```bash
# Add marketplace
lucasilverentand/skills

# Or install directly
claude-code plugins install lucasilverentand/skills/plugins/code-quality
```

## Quick Start

The code-review skill is auto-invocable:

```bash
# Review code
"Review this code for issues"
"Check for security vulnerabilities"
"Analyze performance of this function"

# Or invoke manually
/code-review src/
/code-review components/Auth.tsx
```

## Example Usage

### Pull Request Review
```bash
# Review entire PR
/code-review

# Focus on specific areas
"Review for security issues in auth.py"
"Check performance of database queries"
```

### Pre-Commit Review
```bash
# Review staged changes
"Review my changes before commit"

# Focus on changed files
/code-review $(git diff --name-only --staged)
```

### Audit Workflow
```bash
# Full codebase audit
/code-review src/

# Security-focused audit
"Security audit of payment processing code"

# Performance audit
"Find performance bottlenecks in API handlers"
```

## Review Severity Levels

**Critical:**
- Security vulnerabilities (SQL injection, XSS)
- Data loss risks
- Authentication bypasses
- Broken core functionality

**High:**
- Memory leaks
- Performance issues affecting UX
- Authorization flaws
- Data consistency issues

**Medium:**
- Code smells
- Maintainability concerns
- Missing error handling
- Suboptimal patterns

**Low:**
- Style inconsistencies
- Minor optimizations
- Documentation gaps
- Naming suggestions

## Best Practices

1. **Review Early**: Catch issues before they reach production
2. **Focus Reviews**: Target specific areas (security, performance)
3. **Automate**: Integrate into CI/CD pipelines
4. **Act on Findings**: Fix Critical and High severity issues immediately
5. **Track Improvements**: Monitor code quality trends over time

## Integration with Development Workflow

### With Git Hooks
Add to pre-commit hook:
```bash
# .git/hooks/pre-commit
claude-code /code-review $(git diff --name-only --staged)
```

### With CI/CD
Add to GitHub Actions:
```yaml
- name: Code Review
  run: claude-code /code-review src/
```

### With Pull Requests
Review PRs automatically:
```bash
gh pr checkout $PR_NUMBER
claude-code /code-review
```

## Future Additions

This bundle will expand to include:
- **test-analyzer**: Analyze test coverage and quality
- **complexity-checker**: Measure code complexity
- **dependency-auditor**: Check for vulnerable dependencies
- **performance-profiler**: Profile code performance
- **documentation-validator**: Ensure code is well-documented

## Support

- GitHub Issues: https://github.com/lucasilverentand/skills/issues
- Contribute: Submit PRs to add more quality tools

## License

MIT License - see LICENSE file for details
