---
name: code-review
description: Reviews code for bugs, security vulnerabilities, performance issues, and best practices violations. Use when reviewing pull requests, analyzing code quality, performing security audits, checking for OWASP vulnerabilities, or evaluating code before merging.
argument-hint: [file-or-directory]
allowed-tools: [Read, Glob, Grep, Task]
---

# Code Review

Performs thorough code review to identify issues across correctness, security, performance, and maintainability dimensions.

## Your Task

When reviewing code (from $ARGUMENTS or user-specified files):

1. **Identify scope**: Determine which files to review
   - If path provided: Review that file/directory
   - If PR context: Focus on changed files
   - If no path: Ask user what to review

2. **Read and understand the code**: Use Read tool to examine each file
   - Understand the purpose and context
   - Note the programming language and framework
   - Identify entry points and data flow

3. **Analyze for issues**: Check each category below
4. **Report findings**: Use the output format specified

## Review Categories

### 1. Correctness

| Check | What to Look For |
|-------|------------------|
| Logic errors | Incorrect conditionals, wrong operators, inverted logic |
| Edge cases | Empty inputs, null values, boundary conditions |
| Off-by-one | Array bounds, loop conditions, string indices |
| Type safety | Implicit conversions, type mismatches, null coercion |
| Async issues | Race conditions, missing await, unhandled promises |
| Error paths | Uncaught exceptions, missing error handlers |

### 2. Security (OWASP Top 10)

| Vulnerability | Patterns to Check |
|--------------|-------------------|
| Injection (SQL, Command, XSS) | User input in queries/commands without sanitization |
| Broken Authentication | Weak password handling, session issues, missing MFA |
| Sensitive Data Exposure | Hardcoded secrets, unencrypted storage, logging PII |
| XXE | XML parsing with external entities enabled |
| Broken Access Control | Missing authorization checks, IDOR vulnerabilities |
| Security Misconfiguration | Debug mode, default credentials, verbose errors |
| Insecure Deserialization | Untrusted data deserialization |
| Vulnerable Dependencies | Known CVEs in imported packages |
| Insufficient Logging | Missing audit trails, no security event logging |

### 3. Performance

| Issue | Signs |
|-------|-------|
| N+1 queries | Database calls inside loops |
| Unnecessary computation | Repeated calculations, missing memoization |
| Memory leaks | Unclosed resources, growing collections, event listeners |
| Blocking operations | Sync I/O in async context, long-running tasks |
| Missing indexes | Queries on unindexed fields |
| Large payloads | Fetching unused data, missing pagination |

### 4. Maintainability

| Concern | Indicators |
|---------|------------|
| Readability | Unclear names, magic numbers, complex nesting |
| DRY violations | Duplicated logic, copy-pasted code |
| Error handling | Swallowed exceptions, generic catch blocks |
| Abstractions | God classes, feature envy, inappropriate intimacy |
| Testing gaps | Untestable code, missing test hooks |
| Documentation | Missing context for complex logic |

## Review Process

### Phase 1: Discovery

```bash
# If reviewing a directory, first list files
# Prioritize: entry points, API handlers, data access, auth code
```

1. Read entry point files first
2. Trace data flow through the codebase
3. Note areas that handle sensitive operations

### Phase 2: Analysis

For each file:

1. Read the complete file
2. Check against all categories above
3. Note potential issues with line numbers
4. Consider context before flagging

### Phase 3: Validation

Before reporting an issue, verify:

- [ ] Is this actually a bug, not intentional behavior?
- [ ] Does the surrounding context justify this pattern?
- [ ] Is this a real security risk or theoretical?
- [ ] Would fixing this provide meaningful benefit?

## Output Format

### Issue Report Structure

For each issue found:

```markdown
### [{SEVERITY}] {Brief Title}

**Location:** `{file}:{line}`
**Category:** {Correctness|Security|Performance|Maintainability}

**Issue:**
{Clear description of what's wrong}

**Evidence:**
(code block with the problematic code)

**Suggestion:**
(code block with the proposed fix)

**Impact:** {What could go wrong if unfixed}
```

### Severity Definitions

| Severity | Criteria | Action |
|----------|----------|--------|
| **Critical** | Security vulnerability, data loss risk, production crash | Must fix before merge |
| **High** | Significant bug, performance issue, security concern | Should fix before merge |
| **Medium** | Code quality issue, potential future bug | Recommended to fix |
| **Low** | Style issue, minor improvement | Optional, nice to have |

### Summary Report

End with:

```markdown
## Review Summary

**Files Reviewed:** {count}
**Issues Found:** {total}

| Severity | Count |
|----------|-------|
| Critical | {n} |
| High | {n} |
| Medium | {n} |
| Low | {n} |

### Key Findings
- {Most important issue 1}
- {Most important issue 2}

### Recommendations
- {Overall recommendation based on review}
```

## Language-Specific Checks

### JavaScript/TypeScript

- Prototype pollution
- eval() usage
- Regex ReDoS
- Missing error boundaries (React)

### Python

- Pickle deserialization
- Shell=True in subprocess
- Format string vulnerabilities
- Missing input validation

### Go

- Unchecked error returns
- Race conditions (missing mutex)
- Nil pointer dereference
- Context cancellation handling

### SQL

- Raw query concatenation
- Missing parameterization
- Privilege escalation paths

## Common False Positives

Avoid flagging these as issues:

- Intentional any/unknown types with explanation
- Test files with mock/stub implementations
- Generated code (check for generator comments)
- Vendor/third-party code (note but don't fix)
- Feature flags for gradual rollout

## Tips

- Focus on high-impact issues first
- Provide actionable suggestions, not just criticism
- Consider the code's purpose and constraints
- Note positive patterns you observe
- Keep security findings confidential if reporting publicly
- Use the file:line format for easy navigation
- For large codebases, use Task tool with Explore agent to understand structure first
