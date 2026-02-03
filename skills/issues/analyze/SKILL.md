---
name: analyze-issue
description: Performs deep analysis of issues against the codebase to validate file references, verify claims, identify missing information, find related code, and assess issue quality. Use when reviewing issues for completeness, validating bug reports, assessing work scope, or preparing to start development on an issue.
argument-hint: [issue-number, URL, or description]
allowed-tools: [Bash, Read, Glob, Grep, Task]
---

# Analyze Issue

Perform deep analysis of an issue against the codebase to validate claims, identify gaps, and find related code.

## 1. Issue Fetching

Retrieve the issue content based on input:

### GitHub

```bash
gh issue view <number> --json title,body,labels,assignees,state,comments
```

### GitLab

```bash
glab issue view <number>
```

### URL Parsing

- Extract issue number from GitHub/GitLab URLs
- Handle URLs like `https://github.com/org/repo/issues/123`

### Direct Input

- Accept pasted issue text if no issue number/URL provided
- Parse markdown structure to extract sections

## 2. Branch Detection

Determine the relevant code state:

- Check if issue mentions a specific branch
- Default to `main` or `master` branch
- Note if analyzing against a feature branch

## 3. Deep Codebase Analysis

### File and Path Validation

- Extract all file paths mentioned in the issue
- Verify each path exists in the codebase
- Check if line numbers are accurate (content matches description)
- Flag outdated or incorrect references

### Related Code Discovery

- Search for code related to the issue topic
- Find files not mentioned but likely relevant
- Identify:
  - Entry points for the affected functionality
  - Test files that cover the area
  - Configuration files that may be relevant
  - Documentation that may need updating

### Code Flow Tracing (for bugs)

- Trace the execution path described in reproduction steps
- Identify potential failure points
- Find error handling that may be relevant
- Check for recent changes in affected areas (`git log`)

### Root Cause Analysis

- Look for patterns that match the reported behavior
- Search for similar code patterns elsewhere
- Check for known anti-patterns or common bugs
- Review related error handling

### Historical Context

- Search for similar past issues (`gh issue list --search`)
- Check git history for related changes
- Look for TODO/FIXME comments in relevant code
- Find related PRs or commits

## 4. Gap Identification

Analyze the issue for missing information:

### Missing Reproduction Steps

- Are steps specific and numbered?
- Can the steps be followed without assumptions?
- Are preconditions clearly stated?

### Unclear Acceptance Criteria

- Is success clearly defined?
- Are edge cases considered?
- Is scope well-bounded?

### Missing Environment Details

- OS and version
- Runtime version (Node, Python, etc.)
- Relevant dependency versions
- Configuration settings

### Incomplete Error Information

- Full error message included?
- Stack trace provided?
- Logs available?
- Screenshots for UI issues?

### Affected Areas Not Mentioned

- Related components that may be impacted
- Tests that should be updated
- Documentation that needs changes
- Dependencies on other systems

## 5. Output Format

Generate a structured analysis report:

```markdown
## Issue Analysis: #<number> - <title>

### Validation Results

#### File References

| File                 | Status    | Notes                      |
| -------------------- | --------- | -------------------------- |
| `path/to/file.ts:42` | Valid     | Line content matches       |
| `path/to/old.ts`     | Not Found | File may have been renamed |

#### Code Claims

- [x] Claim: "Function X throws an error" - Confirmed at `file:line`
- [ ] Claim: "This happens on login" - Could not verify, needs reproduction

### Related Code (Not Mentioned in Issue)

- `src/auth/middleware.ts` - Authentication middleware that may be relevant
- `tests/auth.test.ts` - Existing tests for this area
- `docs/auth.md` - Documentation that may need updating

### Suggested Improvements

1. **Add reproduction steps**: Currently missing steps 2-4
2. **Include environment**: No Node.js version specified
3. **Clarify scope**: Does this affect API and UI or just API?

### Questions to Clarify

1. What is the expected behavior when X happens?
2. Does this occur with all users or specific roles?
3. Has this ever worked, or is it a new feature gap?

### Historical Context

- Similar issue: #45 (closed) - May be related regression
- Recent commit: `abc123` touched affected file
- TODO at `file:42`: "Handle edge case" - possibly related
```

## 6. Actionable Recommendations

Based on analysis, suggest:

1. Questions to ask the issue author
2. Areas to investigate further
3. Whether the issue is ready to work on
4. Estimated complexity based on code analysis
