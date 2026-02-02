---
name: create-issue
description: Create well-structured issues with proper context, reproduction steps, and acceptance criteria. Use when creating bug reports, feature requests, or task issues on GitHub, GitLab, or other platforms.
argument-hint: [issue-type or description]
allowed-tools: [Bash, Read, Glob, Grep]
---

# Create Issue

Help create a well-structured issue for the appropriate platform.

## 1. Platform Detection

Check which platform tools are available:

- GitHub: Check for `gh` CLI and `.git/config` with github.com
- GitLab: Check for `glab` CLI and `.git/config` with gitlab
- Otherwise: Output formatted markdown for manual entry

## 2. Issue Type Detection

Determine the issue type from the user's request:

- **Bug**: Error reports, unexpected behavior, crashes
- **Feature**: New functionality, enhancements
- **Task**: Technical debt, refactoring, documentation
- **Question**: Clarification needed, discussion

## 3. Context Gathering

Collect relevant information based on issue type:

### For Bugs

- Error messages and stack traces
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, runtime versions, dependencies)
- Code references with `file:line` format

### For Features

- Use case and motivation
- Proposed solution or approach
- Alternatives considered
- Acceptance criteria

### For Tasks

- Current state and problem
- Desired outcome
- Scope and boundaries
- Dependencies on other work

## 4. Issue Templates

### Bug Report Template

```markdown
## Description

[Clear description of the bug]

## Steps to Reproduce

1. [First step]
2. [Second step]
3. [See error]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- OS: [e.g., macOS 14.0]
- Runtime: [e.g., Node.js 20.10]
- Version: [e.g., v1.2.3]

## Additional Context

[Screenshots, logs, related issues]
```

### Feature Request Template

```markdown
## Summary

[Brief description of the feature]

## Motivation

[Why is this feature needed? What problem does it solve?]

## Proposed Solution

[How should this work?]

## Alternatives Considered

[Other approaches and why they weren't chosen]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

### Task Template

```markdown
## Summary

[What needs to be done]

## Context

[Why this task is needed]

## Requirements

- [ ] [Requirement 1]
- [ ] [Requirement 2]

## Related

[Links to related issues, PRs, or documentation]
```

## 5. Platform-Specific Creation

### GitHub

```bash
gh issue create --title "Title" --body "Body" [--label "bug"] [--assignee "@me"]
```

### GitLab

```bash
glab issue create --title "Title" --description "Body" [--label "bug"]
```

### Other Platforms

Output formatted markdown that can be copied into:

- Jira
- Linear
- Azure DevOps
- Other issue trackers

## 6. Best Practices Checklist

Before creating the issue, verify:

- [ ] Title is clear and descriptive (not "Bug" or "Feature request")
- [ ] Description provides enough context for someone unfamiliar with the codebase
- [ ] Code references use `file:line` format for easy navigation
- [ ] Reproduction steps are numbered and specific
- [ ] Environment details are included for bugs
- [ ] Acceptance criteria are measurable for features
- [ ] No sensitive information (API keys, passwords, PII) is included

## 7. Output

After creating the issue:

1. Display the issue URL (if created via CLI)
2. Show a summary of what was created
3. Suggest next steps (assign, add to project, link related issues)
