---
name: pr-update
description: Updates pull request titles, descriptions, labels, and metadata to match repository standards and improve reviewability. Use when cleaning up PRs, adding missing context, improving PR descriptions, fixing formatting, or updating PR metadata after changes.
argument-hint: [pr-number]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Update Pull Request

Improves existing PR descriptions, titles, and metadata for better reviewability and consistency with repository standards.

## Your Task

Enhance an existing pull request by:

1. **Fetch current state** - Get PR details and repository context
2. **Analyze gaps** - Identify missing or incomplete information
3. **Detect standards** - Find repository conventions and templates
4. **Plan improvements** - Determine what to update
5. **Apply updates** - Use `gh pr edit` to make changes
6. **Verify updates** - Confirm changes were applied

## Task Progress Checklist

Copy and track progress:

```
PR Update Progress:
==================

Phase 1: Fetch Current State
- [ ] Get PR metadata (title, body, labels, etc.)
- [ ] Review current description
- [ ] Check linked issues
- [ ] List current labels and reviewers

Phase 2: Analyze Gaps
- [ ] Title follows conventions?
- [ ] Description has required sections?
- [ ] Issues properly linked?
- [ ] Labels appropriate?
- [ ] Reviewers assigned?

Phase 3: Detect Standards
- [ ] Check for PR template
- [ ] Review repository conventions
- [ ] Check label scheme
- [ ] Identify required reviewers (CODEOWNERS)

Phase 4: Plan Improvements
- [ ] Draft improved title
- [ ] Draft improved description
- [ ] Suggest label changes
- [ ] Suggest reviewer changes

Phase 5: Apply Updates
- [ ] Update title (if needed)
- [ ] Update description (if needed)
- [ ] Add/remove labels (if needed)
- [ ] Add reviewers (if needed)
- [ ] Verify changes applied
```

## Phase 1: Fetch Current State

### Get PR Details

```bash
# Get complete PR information
gh pr view <number> --json number,title,body,state,author,labels,assignees,reviewRequests,milestone,baseRefName,headRefName,additions,deletions,changedFiles,files

# View current description in readable format
gh pr view <number>

# Get just specific fields
gh pr view <number> --json title,body,labels -q '.title, .body, .labels[].name'
```

### Key Fields to Examine

| Field | What to Check |
|-------|---------------|
| `title` | Follows conventional commit format |
| `body` | Has required sections (summary, changes, testing) |
| `labels` | Matches change type and priority |
| `assignees` | Author or team lead assigned |
| `reviewRequests` | Appropriate reviewers requested |
| `milestone` | Added to current sprint/release |
| `files` | Understanding of what changed |

## Phase 2: Analyze Gaps

### Title Analysis

**Check for:**

| Issue | Example | Fix |
|-------|---------|-----|
| No type prefix | "Add login feature" | "feat: add login feature" |
| Wrong tense | "Added login" | "feat: add login" |
| Too long | 100+ characters | Shorten to < 72 characters |
| Too vague | "Fix bug" | "fix: resolve null pointer in auth" |
| Has period | "feat: add login." | "feat: add login" |

### Description Analysis

**Required sections:**

| Section | Purpose | Check |
|---------|---------|-------|
| Summary | Brief overview | Present and clear? |
| Changes | List of modifications | Matches actual diff? |
| Testing | How it was tested | Exists for code changes? |
| Related Issues | Linked issues | Uses Closes/Fixes keywords? |

**Common gaps:**

- Missing summary (just a list of changes)
- No testing section
- Issues referenced but not linked properly
- Missing context for reviewers
- No type of change indicated

### Label Analysis

**Check for:**

- Type label (bug, feature, docs, etc.)
- Priority label if applicable
- Status label if workflow requires
- Missing labels for the change type

### Reviewer Analysis

**Check for:**

- CODEOWNERS requirements met
- Team reviewers for shared code
- Security review for sensitive changes
- No reviewers assigned

## Phase 3: Detect Standards

### Find PR Template

```bash
# Check for PR templates in order of precedence
cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null || \
cat .github/pull_request_template.md 2>/dev/null || \
cat docs/pull_request_template.md 2>/dev/null || \
cat PULL_REQUEST_TEMPLATE.md 2>/dev/null
```

If template exists, use its structure for the updated description.

### Check Repository Conventions

```bash
# Check contributing guide
cat CONTRIBUTING.md 2>/dev/null | head -100

# Check for label definitions
gh label list --limit 50

# Check for CODEOWNERS
cat .github/CODEOWNERS 2>/dev/null
```

### Analyze Existing PRs

```bash
# Look at recent merged PRs for patterns
gh pr list --state merged --limit 5 --json title,labels
```

## Phase 4: Plan Improvements

### Title Improvement

Transform title to conventional format:

```
Current: "Login feature"
Improved: "feat(auth): add user login with session management"

Current: "Fixed the bug"
Improved: "fix: resolve race condition in data sync"

Current: "Update docs and fix typos"
Improved: "docs: update API reference and fix typos"
```

### Description Improvement

If description is minimal or missing sections:

```markdown
## Summary

{Generated from commit messages or user description}

## Changes

{List extracted from diff analysis}
- Change 1
- Change 2
- Change 3

## Type of Change

- [ ] Bug fix
- [x] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing

{Ask user or infer from test files in diff}

## Related Issues

{Extract from branch name or commits}
Closes #123

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Label Recommendations

| Change Type | Suggested Labels |
|-------------|------------------|
| Bug fix | `bug`, `fix` |
| New feature | `feature`, `enhancement` |
| Documentation | `documentation`, `docs` |
| Refactoring | `refactor`, `tech-debt` |
| Dependencies | `dependencies`, `chore` |
| Breaking change | `breaking-change`, `major` |
| Security fix | `security`, `priority:high` |

## Phase 5: Apply Updates

### Update Title

```bash
gh pr edit <number> --title "feat: improved title here"
```

### Update Description

```bash
# Update body with heredoc for multi-line
gh pr edit <number> --body "$(cat <<'EOF'
## Summary

New description here...

## Changes

- Change 1
- Change 2

## Testing

Tested by...

Closes #123
EOF
)"
```

### Update Labels

```bash
# Add labels
gh pr edit <number> --add-label "feature" --add-label "needs-review"

# Remove labels
gh pr edit <number> --remove-label "wip"

# Combined
gh pr edit <number> --add-label "feature" --remove-label "wip"
```

### Update Reviewers

```bash
# Add reviewers
gh pr edit <number> --add-reviewer "username" --add-reviewer "team-name"

# Remove reviewers
gh pr edit <number> --remove-reviewer "old-reviewer"
```

### Update Assignees

```bash
# Add assignees (supports @me)
gh pr edit <number> --add-assignee "@me"

# Remove assignees
gh pr edit <number> --remove-assignee "old-assignee"
```

### Update Milestone

```bash
# Set milestone
gh pr edit <number> --milestone "v1.0"

# Remove milestone
gh pr edit <number> --remove-milestone
```

### Update Base Branch

```bash
# Change target branch (use with caution)
gh pr edit <number> --base develop
```

## Verification

After updates:

```bash
# View updated PR
gh pr view <number>

# Check specific fields were updated
gh pr view <number> --json title,labels,assignees,reviewRequests
```

## Error Handling

| Issue | Solution |
|-------|----------|
| "PR not found" | Verify PR number and repository |
| "Label not found" | Create label first: `gh label create name` |
| "User not found" | Verify username/team name |
| "Permission denied" | Check repository access |
| "Milestone not found" | Create milestone first |

## Examples

### Quick Title Fix

```bash
# Fix a poorly formatted title
gh pr edit 123 --title "fix(auth): resolve session timeout on mobile"
```

### Complete Description Update

```bash
gh pr edit 456 --body "$(cat <<'EOF'
## Summary

This PR implements user authentication with OAuth2 support for Google and GitHub providers.

## Changes

- Add OAuth2 client configuration in `src/config/oauth.ts`
- Implement callback handlers in `src/auth/handlers.ts`
- Add session management with Redis storage
- Update login page with provider buttons

## Type of Change

- [x] New feature (non-breaking change adding functionality)

## Testing

- Unit tests added for OAuth handlers
- Integration tests for complete auth flow
- Manual testing with Google OAuth

## Screenshots

![Login page with OAuth buttons](url-to-screenshot)

## Related Issues

Closes #123
Related to #100

## Checklist

- [x] Code follows project style guidelines
- [x] Self-review performed
- [x] Tests added
- [x] Documentation updated in README
EOF
)"
```

### Label and Reviewer Update

```bash
# Add appropriate labels and request review
gh pr edit 789 \
  --add-label "feature" \
  --add-label "needs-review" \
  --remove-label "wip" \
  --add-reviewer "senior-dev" \
  --add-reviewer "security-team"
```

### Batch Updates

```bash
# Multiple updates in one command
gh pr edit 123 \
  --title "feat(api): add user profile endpoint" \
  --add-label "feature" \
  --add-label "api" \
  --add-assignee "@me" \
  --add-reviewer "api-team" \
  --milestone "Q1-2024"
```

## Common Improvement Patterns

### Minimal PR to Complete

**Before:**

```
Title: "changes"
Body: ""
Labels: none
```

**After:**

```
Title: "feat(user): add profile editing functionality"
Body: [Full description with all sections]
Labels: feature, user-experience
Reviewers: frontend-team
```

### WIP to Ready

**Updates needed:**

1. Remove "WIP" or "Draft" from title
2. Add complete description
3. Remove `wip` label, add `ready-for-review`
4. Add reviewers
5. Mark as ready: `gh pr ready <number>`

### Adding Missing Context

If reviewers are confused:

1. Add more detail to summary
2. Include motivation/background
3. Add screenshots for UI changes
4. Link to design docs or discussions
5. Explain non-obvious decisions

## Validation Checklist

Before completing updates:

- [ ] Title follows conventional commit format
- [ ] Title is under 72 characters
- [ ] Description has summary section
- [ ] Description lists specific changes
- [ ] Testing section explains verification
- [ ] Related issues use Closes/Fixes keywords
- [ ] Labels match change type
- [ ] Reviewers are assigned (if required)
- [ ] Milestone is set (if applicable)
- [ ] No sensitive information in description

## Tips

- Preserve information from the original description when updating
- Use the repository's PR template structure if one exists
- Match the label naming scheme used in the repository
- Request review from CODEOWNERS automatically touched files
- Add context that helps reviewers understand "why" not just "what"
- Include screenshots for UI changes
- Link to relevant documentation or discussions
- Keep descriptions scannable with clear sections
- Use checklists for multi-part changes
- Mark draft PRs as ready when updates are complete: `gh pr ready <number>`
