---
name: cleanup-issue
description: Format and organize issues to match repository templates, apply appropriate labels, and update project fields. Use when standardizing issues or managing GitHub/GitLab Projects.
argument-hint: [issue-number or URL]
allowed-tools: [Bash, Read, Glob, Grep]
---

# Cleanup Issue

Format and organize issues to match repository standards, apply appropriate labels, and update project fields.

## 1. Fetch Current Issue State

**GitHub:**

```bash
gh issue view <number> --json title,body,labels,assignees,milestone,projectItems
```

**GitLab:**

```bash
glab issue view <number>
```

## 2. Template Detection

Check for existing issue templates:

**GitHub:**

- `.github/ISSUE_TEMPLATE/*.md`
- `.github/ISSUE_TEMPLATE/*.yml` (form-based)
- `.github/ISSUE_TEMPLATE.md` (single template)

**GitLab:**

- `.gitlab/issue_templates/*.md`

**Custom:**

- `docs/templates/`
- `ISSUE_TEMPLATE.md` in root

Parse template structure to understand required sections.

## 3. Body Reformatting

Match the issue body to the detected template:

### Section Mapping

- Map existing content to template sections
- Preserve information while restructuring
- Add missing section headers
- Remove duplicate information

### Content Enhancement

- Convert inline code to code blocks where appropriate
- Format lists consistently (numbered for steps, bullets for items)
- Ensure code references use `file:line` format
- Add markdown formatting for readability

### Before/After Preview

Show the user what changes will be made before applying.

## 4. Label Management

### Automatic Label Detection

Analyze issue content to suggest labels:

| Content Pattern          | Suggested Label         |
| ------------------------ | ----------------------- |
| Error, crash, broken     | `bug`                   |
| Add, implement, new      | `enhancement`, `feature`|
| Urgent, critical, blocker| `priority: high`        |
| Docs, documentation      | `documentation`         |
| Test, testing            | `testing`               |
| Security, vulnerability  | `security`              |
| Performance, slow        | `performance`           |

### Platform Commands

**GitHub:**

```bash
# Add labels
gh issue edit <number> --add-label "bug,priority:high"

# Remove labels
gh issue edit <number> --remove-label "needs-triage"
```

**GitLab:**

```bash
glab issue update <number> --label "bug" --unlabel "needs-triage"
```

### Label Suggestions

- List available labels in the repository
- Suggest matching labels based on content
- Warn about missing commonly-used labels

## 5. Project Integration

### GitHub Projects

**Add to Project:**

```bash
# List projects
gh project list

# Add issue to project
gh project item-add <project-number> --owner <owner> --url <issue-url>
```

**Update Project Fields:**

```bash
# Get item ID
gh project item-list <project-number> --owner <owner> --format json

# Update fields (Status, Priority, Sprint, etc.)
gh project item-edit --project-id <id> --id <item-id> --field-id <field-id> --single-select-option-id <option-id>
```

### GitLab Boards

- Check board configuration
- Suggest appropriate list/column based on labels

## 6. Assignee and Milestone

### Assignee Suggestions

Based on:

- Code ownership (who recently modified related files)
- Past issue assignment patterns
- Team availability (if known)

```bash
# GitHub
gh issue edit <number> --add-assignee "@me"

# GitLab
glab issue update <number> --assignee "username"
```

### Milestone Suggestions

- List open milestones
- Suggest based on issue priority and milestone dates

```bash
# GitHub
gh issue edit <number> --milestone "v1.2.0"

# GitLab
glab issue update <number> --milestone "v1.2.0"
```

## 7. Output Summary

### Dry Run Mode (default)

Show planned changes without applying:

```markdown
## Proposed Changes for Issue #123

### Body Changes
- Added "Environment" section from template
- Reformatted reproduction steps as numbered list
- Added code block formatting to error message

### Labels
- Add: `bug`, `priority: medium`, `area: auth`
- Remove: `needs-triage`

### Project
- Add to: "Q1 Sprint Board"
- Set Status: "Ready"
- Set Priority: "Medium"

### Other
- Suggested assignee: @username (owns related code)
- Suggested milestone: v1.3.0 (next patch release)

Run with --apply to make these changes.
```

### Apply Mode

Execute changes and report results:

```markdown
## Changes Applied to Issue #123

- [x] Body reformatted to match bug template
- [x] Labels updated: +bug, +priority:medium, -needs-triage
- [x] Added to project "Q1 Sprint"
- [x] Assigned to @username
- [ ] Milestone not set (requires maintainer permissions)

View issue: https://github.com/org/repo/issues/123
```

## 8. Batch Operations

For cleaning up multiple issues:

```bash
# GitHub: List issues needing triage
gh issue list --label "needs-triage" --json number,title

# Process each issue
for issue in $(gh issue list --label "needs-triage" --json number -q '.[].number'); do
  # Apply cleanup
done
```

Provide summary of batch operations with success/failure counts.
