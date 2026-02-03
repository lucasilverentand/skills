---
name: milestones-track
description: Manages milestones and tracks progress toward releases. Use when planning releases, tracking milestone completion, organizing issues by version, or managing release timelines.
argument-hint: [action]
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Track Milestones

Manages milestones for release planning and progress tracking.

## Your Task

<!-- TODO: Implement skill logic -->

1. Fetch milestones via `gh api /repos/{owner}/{repo}/milestones`
2. Based on action:
   - **list**: Show milestones with progress
   - **create**: Create new milestone
   - **progress**: Show detailed progress report
   - **close**: Close completed milestone
3. Calculate completion metrics
4. Identify blockers and at-risk items
5. Generate progress reports

## Examples

```bash
# List milestones with progress
/milestones-track list

# Create new milestone
/milestones-track create "v2.0" --due 2024-03-01

# Show progress report
/milestones-track progress "v2.0"
```

## Progress Metrics

<!-- TODO: Add tracking logic -->

- **Completion**: Closed / Total issues
- **Velocity**: Issues closed per week
- **Burndown**: Remaining work over time
- **At Risk**: Open issues past due date

## Validation Checklist

- [ ] Due dates are realistic
- [ ] All relevant issues assigned
- [ ] Progress is tracked
- [ ] Blockers are identified
