---
name: code-review
description: Review code for bugs, security issues, performance problems, and best practices. Use when reviewing PRs, analyzing code quality, or performing security audits.
argument-hint: [file-or-directory]
---

# Code Review

Review the specified code thoroughly for:

## 1. Correctness
- Logic errors and edge cases
- Off-by-one errors
- Null/undefined handling
- Type mismatches

## 2. Security
- Input validation
- SQL injection, XSS, command injection
- Sensitive data exposure
- Authentication/authorization issues

## 3. Performance
- Unnecessary loops or computations
- N+1 queries
- Memory leaks
- Missing caching opportunities

## 4. Maintainability
- Code clarity and readability
- DRY violations
- Proper error handling
- Appropriate abstractions

## Output Format

For each issue found:
1. **Location**: file:line
2. **Severity**: Critical / High / Medium / Low
3. **Issue**: What's wrong
4. **Suggestion**: How to fix it

End with a summary of findings by severity.
