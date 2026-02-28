# GitHub Templates Reference

PR templates, issue templates, and config files for GitHub repositories.

## PR Template

Place at `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What

<!-- Brief description of the change -->

## Why

<!-- Link to issue or explain motivation -->
Closes #

## How

<!-- Implementation approach, key decisions -->

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project conventions
- [ ] Self-reviewed the diff
- [ ] Documentation updated (if public API changed)
```

### Minimal PR template (small teams)

```markdown
## Summary

<!-- What and why -->

Closes #

## Test plan

<!-- How was this tested? -->
```

## Issue Templates

### Bug report

Place at `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug or unexpected behavior
labels: bug
---

## Describe the bug

<!-- Clear, concise description -->

## Steps to reproduce

1.
2.
3.

## Expected behavior

<!-- What should happen -->

## Actual behavior

<!-- What actually happens -->

## Environment

- OS:
- Runtime version:
- Project version/commit:

## Additional context

<!-- Screenshots, logs, error messages -->
```

### Feature request

Place at `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest a new feature or improvement
labels: enhancement
---

## Problem

<!-- What problem does this solve? -->

## Proposed solution

<!-- How should it work? -->

## Alternatives considered

<!-- Other approaches you thought about -->

## Additional context

<!-- Mockups, examples from other projects, etc. -->
```

### Question / discussion redirect

Place at `.github/ISSUE_TEMPLATE/question.md`:

```markdown
---
name: Question
about: Ask a question about the project
labels: question
---

## Question

<!-- Your question here -->

## Context

<!-- What are you trying to achieve? What have you already tried? -->

> **Note**: For general questions, consider using [Discussions](https://github.com/org/repo/discussions) instead.
```

### Config file

Place at `.github/ISSUE_TEMPLATE/config.yml` to add external links and disable blank issues:

```yaml
blank_issues_enabled: false
contact_links:
  - name: Questions & Discussion
    url: https://github.com/org/repo/discussions
    about: Ask questions or discuss ideas here
  - name: Security Vulnerabilities
    url: https://github.com/org/repo/security/advisories/new
    about: Report security vulnerabilities privately
```

## CODEOWNERS

Place at `.github/CODEOWNERS` or `CODEOWNERS` at repo root. Assigns automatic reviewers based on file paths.

```
# Default owners for everything
* @org/core-team

# Frontend
/packages/web/**    @org/frontend-team
/packages/app/**    @org/mobile-team
*.css               @org/frontend-team
*.tsx               @org/frontend-team

# Backend / API
/packages/api/**    @org/backend-team
/packages/db/**     @org/backend-team

# Infrastructure
/infra/**           @org/platform-team
Dockerfile          @org/platform-team
*.yml               @org/platform-team

# Documentation
/docs/**            @org/docs-team
*.md                @org/docs-team

# Config files — require core team review
biome.json          @org/core-team
tsconfig*.json      @org/core-team
package.json        @org/core-team
```

### Rules

- Later rules override earlier ones (last match wins)
- Use `@org/team-name` for team mentions, `@username` for individuals
- Glob patterns match files: `*.ts`, `packages/api/**`
- CODEOWNERS requires branch protection with "Require review from Code Owners" enabled

## Security Policy

Place at `SECURITY.md` or `.github/SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Report vulnerabilities via [GitHub Security Advisories](https://github.com/org/repo/security/advisories/new) or email security@example.com.

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: within 48 hours
- **Initial assessment**: within 5 business days
- **Fix timeline**: depends on severity, communicated after assessment

### Disclosure

We follow coordinated disclosure. We will credit reporters in the release notes unless they prefer anonymity.
```

## Funding

Place at `.github/FUNDING.yml` to add sponsor buttons:

```yaml
github: [username]
# or
custom: ["https://buymeacoffee.com/username"]
```
