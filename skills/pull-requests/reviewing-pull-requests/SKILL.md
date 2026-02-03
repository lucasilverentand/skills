---
name: reviewing-pull-requests
description: Reviews pull request diffs for bugs, security vulnerabilities, performance issues, and best practices. Provides structured feedback with severity levels and actionable suggestions. Use when reviewing PRs, providing code feedback, checking quality before merge, conducting code reviews, or auditing changes.
argument-hint: [pr-number or pr-url]
allowed-tools: Bash Read Glob Grep
---

# Review Pull Request

Analyzes PR diffs and provides comprehensive code review feedback across correctness, security, performance, and maintainability dimensions.

## Your Task

Perform a thorough review of the specified pull request:

1. **Fetch PR details** - Get PR info, diff, and context
2. **Understand changes** - Analyze scope and purpose
3. **Review for issues** - Check all review categories
4. **Check related code** - Examine files not in diff that may be affected
5. **Generate feedback** - Create structured review with severity levels
6. **Submit review** - Optionally submit via `gh pr review`

## Task Progress Checklist

Copy and track progress:

```
PR Review Progress:
==================

Phase 1: Fetch PR Details
- [ ] Get PR metadata (title, description, author)
- [ ] Fetch PR diff
- [ ] List changed files
- [ ] Check PR status and existing reviews

Phase 2: Understand Changes
- [ ] Read PR description and linked issues
- [ ] Understand the purpose and scope
- [ ] Identify high-risk areas (auth, data, config)

Phase 3: Code Review
- [ ] Review for correctness issues
- [ ] Review for security vulnerabilities
- [ ] Review for performance issues
- [ ] Review for maintainability concerns
- [ ] Check test coverage

Phase 4: Context Review
- [ ] Examine related files not in diff
- [ ] Check for breaking changes
- [ ] Verify documentation updates if needed

Phase 5: Generate Feedback
- [ ] Categorize findings by severity
- [ ] Write actionable suggestions
- [ ] Summarize review decision
```

## Phase 1: Fetch PR Details

### Get PR Information

```bash
# Get PR metadata as JSON
gh pr view <number> --json number,title,body,author,state,baseRefName,headRefName,files,additions,deletions,changedFiles,labels,reviewDecision,reviews

# Get PR diff
gh pr diff <number>

# List changed files only
gh pr diff <number> --name-only

# Check PR CI status
gh pr checks <number>
```

### Key Fields from PR View

| Field | Purpose |
|-------|---------|
| `title`, `body` | Understand intent |
| `author` | Context on experience level |
| `files` | List of changed files with stats |
| `additions`, `deletions` | Scope of changes |
| `baseRefName` | Target branch (main, develop, etc.) |
| `reviewDecision` | Current review status |
| `reviews` | Previous review comments |

## Phase 2: Understand Changes

### Scope Assessment

Categorize the PR:

| Scope | Characteristics | Review Depth |
|-------|-----------------|--------------|
| Small | < 100 lines, 1-3 files | Standard review |
| Medium | 100-500 lines, 4-10 files | Thorough review |
| Large | > 500 lines, 10+ files | Deep review, suggest splitting |

### Risk Assessment

Identify high-risk changes in:

- **Authentication/Authorization** - Login, tokens, permissions
- **Data handling** - Database, APIs, user input
- **Configuration** - Env vars, secrets, feature flags
- **Financial/Payment** - Transactions, pricing
- **Security-sensitive** - Crypto, hashing, validation

## Phase 3: Code Review

### Review Categories

#### 1. Correctness

| Check | What to Look For |
|-------|------------------|
| Logic errors | Incorrect conditionals, wrong operators, inverted logic |
| Edge cases | Empty inputs, null values, boundary conditions |
| Off-by-one | Array bounds, loop conditions, string indices |
| Type safety | Implicit conversions, type mismatches, null coercion |
| Async issues | Race conditions, missing await, unhandled promises |
| Error handling | Uncaught exceptions, missing error handlers |
| State management | Stale state, incorrect updates, memory leaks |

#### 2. Security (OWASP Top 10)

| Vulnerability | Patterns to Check |
|---------------|-------------------|
| Injection | User input in queries/commands without sanitization |
| Broken Auth | Weak password handling, session issues, missing MFA |
| Data Exposure | Hardcoded secrets, unencrypted storage, logging PII |
| XXE | XML parsing with external entities enabled |
| Access Control | Missing authorization checks, IDOR vulnerabilities |
| Misconfiguration | Debug mode, default credentials, verbose errors |
| XSS | Unsanitized output in HTML/templates |
| Insecure Deserialization | Untrusted data deserialization |
| Vulnerable Deps | Known CVEs in imported packages |

#### 3. Performance

| Issue | Signs |
|-------|-------|
| N+1 queries | Database calls inside loops |
| Unnecessary computation | Repeated calculations, missing memoization |
| Memory issues | Unclosed resources, growing collections, event listeners |
| Blocking operations | Sync I/O in async context, long-running tasks |
| Missing indexes | Queries on unindexed fields |
| Large payloads | Fetching unused data, missing pagination |

#### 4. Maintainability

| Concern | Indicators |
|---------|------------|
| Readability | Unclear names, magic numbers, complex nesting |
| DRY violations | Duplicated logic, copy-pasted code |
| Error handling | Swallowed exceptions, generic catch blocks |
| Abstractions | God classes, feature envy, inappropriate intimacy |
| Testing | Untestable code, missing test hooks |
| Documentation | Missing context for complex logic |

### Reading the Diff

Analyze the diff systematically:

```bash
# Get the full diff
gh pr diff <number>

# For large PRs, review file by file
gh pr diff <number> --name-only | while read file; do
  echo "=== $file ==="
  gh pr diff <number> | grep -A 50 "^diff --git.*$file"
done
```

For each changed file:

1. Read the complete diff section
2. Understand what was added (+ lines) and removed (- lines)
3. Check surrounding context
4. Note potential issues with line references

## Phase 4: Context Review

### Related Files Analysis

Files to examine that may not be in the diff:

```bash
# Check if related files need updates
# For new functions, check if callers exist
# For API changes, check if clients are updated
# For schema changes, check migrations
```

Consider:

- **Test files** - Are tests added/updated for changes?
- **Documentation** - Does README/docs need updates?
- **Types/Interfaces** - Are type definitions consistent?
- **Configuration** - Are new env vars documented?
- **Dependencies** - Are package.json/requirements.txt updated correctly?

### Breaking Changes

Check for:

- API signature changes
- Database schema changes without migrations
- Configuration format changes
- Removed public exports
- Changed behavior without feature flags

## Phase 5: Generate Feedback

### Severity Levels

| Level | Criteria | Action |
|-------|----------|--------|
| **Critical** | Security vulnerability, data loss risk, production crash | Must fix before merge |
| **High** | Significant bug, performance issue, security concern | Should fix before merge |
| **Medium** | Code quality issue, potential future bug | Recommended to fix |
| **Low** | Style issue, minor improvement | Optional, nice to have |
| **Note** | Observation, question, or positive feedback | Informational |

### Finding Format

```markdown
### [{SEVERITY}] {Brief Title}

**Location:** `{file}:{line}`
**Category:** {Correctness|Security|Performance|Maintainability}

**Issue:**
{Clear description of what's wrong}

**Code:**
```{language}
{The problematic code snippet}
```

**Suggestion:**

```{language}
{The proposed fix}
```

**Impact:** {What could go wrong if unfixed}

### Review Summary Format

```markdown
## PR Review: #{number} - {title}

**Reviewer:** Claude
**Date:** {date}
**Overall:** {APPROVE | REQUEST_CHANGES | COMMENT}

### Summary

{1-2 sentence summary of the PR and review findings}

### Statistics

- **Files reviewed:** {count}
- **Lines changed:** +{additions} / -{deletions}
- **Issues found:** {total}

| Severity | Count |
|----------|-------|
| Critical | {n} |
| High | {n} |
| Medium | {n} |
| Low | {n} |

### Findings

{List each finding using the format above}

### Positive Observations

- {Something done well}
- {Good pattern or practice noticed}

### Recommendations

1. {Most important action item}
2. {Second priority item}

### Decision

{Explanation of why approving, requesting changes, or just commenting}
```

## Submitting Reviews

### Review Types

```bash
# Approve the PR
gh pr review <number> --approve --body "LGTM! Changes look good."

# Request changes
gh pr review <number> --request-changes --body "Please address the issues noted above."

# Comment without approval decision
gh pr review <number> --comment --body "Some observations for consideration."
```

### Adding Comments

```bash
# Add a general comment to the PR
gh pr comment <number> --body "Comment text here"

# For inline comments (requires API)
gh api repos/{owner}/{repo}/pulls/<number>/comments \
  -f body="Comment on specific line" \
  -f path="src/file.ts" \
  -f commit_id="$(gh pr view <number> --json headRefOid -q .headRefOid)" \
  -F line=42 \
  -f side="RIGHT"
```

## Language-Specific Checks

### JavaScript/TypeScript

- `eval()` usage - Code injection risk
- Prototype pollution - Object property injection
- Regex ReDoS - Catastrophic backtracking
- `dangerouslySetInnerHTML` - XSS risk
- Missing error boundaries (React)
- Unhandled promise rejections

### Python

- `pickle` deserialization - Arbitrary code execution
- `shell=True` in subprocess - Command injection
- Format string vulnerabilities
- SQL string concatenation
- `eval()`/`exec()` usage

### Go

- Unchecked error returns
- Race conditions (missing mutex)
- Nil pointer dereference
- Context cancellation handling
- Resource leaks (defer close)

### SQL

- Raw query string concatenation
- Missing parameterized queries
- Privilege escalation paths
- Unvalidated LIMIT/OFFSET

## Error Handling

| Issue | Response |
|-------|----------|
| PR not found | Verify PR number and repository access |
| No diff available | PR may be merged or closed |
| Large diff (>1000 lines) | Review in sections, suggest PR splitting |
| Binary files | Note presence but skip detailed review |
| Merge conflicts | Note conflicts must be resolved first |

## Examples

### Quick Review

```bash
# Fetch and review PR #123
gh pr view 123 --json title,body,files,additions,deletions
gh pr diff 123

# After analysis, approve
gh pr review 123 --approve --body "Looks good! Minor suggestions are optional."
```

### Request Changes

```bash
gh pr review 456 --request-changes --body "$(cat <<'EOF'
## Review Summary

Found a few issues that should be addressed:

### [Critical] SQL Injection Vulnerability

**Location:** `src/db/queries.ts:42`

The query uses string concatenation with user input:
```typescript
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

**Fix:** Use parameterized queries:

```typescript
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

### [Medium] Missing Error Handling

**Location:** `src/api/handler.ts:78`

The async function doesn't handle rejection.

Please address the critical issue before merge.
EOF
)"

```

## Validation Checklist

Before completing the review:

- [ ] All changed files reviewed
- [ ] Security implications considered
- [ ] Test coverage assessed
- [ ] Breaking changes identified
- [ ] Documentation needs evaluated
- [ ] Performance impact considered
- [ ] Each finding has clear severity and location
- [ ] Suggestions are actionable
- [ ] Positive aspects noted (if any)
- [ ] Review decision matches findings

## Tips

- Start with the PR description to understand intent
- Review high-risk files (auth, data, config) first
- Check for tests alongside implementation changes
- Look for patterns, not just individual issues
- Provide constructive feedback, not just criticism
- Use file:line format for easy navigation
- For large PRs, suggest splitting for easier review
- Note positive patterns to reinforce good practices
- Consider the author's experience level
- Be specific in suggestions - show code, not just describe
