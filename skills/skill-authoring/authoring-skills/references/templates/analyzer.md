---
name: {skill-name}
description: Analyzes code for {aspect} issues. Use when reviewing, auditing, or checking {aspect} in code.
argument-hint: [path]
allowed-tools:
  - Read
  - Glob
  - Grep
---

# {Skill Title}

Analyzes code for {aspect} and reports findings.

## Your Task

1. Find files to analyze from $ARGUMENTS (or current directory)
2. Read and check for issues listed below
3. Report findings with file:line locations and fixes

## What to Check

- {Issue type 1}: {detection pattern}
- {Issue type 2}: {detection pattern}
- {Issue type 3}: {detection pattern}

## Output Format

For each issue:

**{Severity}: {Title}**
- File: `path/file.ts:42`
- Problem: {what's wrong}
- Fix: {how to fix}

End with: "Checked X files, found Y issues"

## Examples

### Analyze Directory

```
User: /{skill-name} src/
→ Checks all files
→ Reports issues by severity
→ Summarizes findings
```

## Error Handling

| Issue | Response |
|-------|----------|
| No files found | Check path, suggest alternatives |
| File unreadable | Skip with note, continue |
| No issues | Confirm clean analysis |
