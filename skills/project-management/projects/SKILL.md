---
name: projects-manage
description: Manages GitHub Projects boards, automations, and views. Use when organizing work, setting up project boards, configuring project automations, or creating project views.
argument-hint: [action]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Manage GitHub Projects

Creates and configures GitHub Projects for work organization.

## Your Task

<!-- TODO: Implement skill logic -->

1. List existing projects via `gh project list`
2. Based on action:
   - **create**: Set up new project with fields and views
   - **configure**: Modify existing project settings
   - **automate**: Set up workflow automations
3. Configure custom fields:
   - Status, priority, sprint
   - Dates, estimates
4. Create views (board, table, roadmap)
5. Set up automations for issue/PR status

## Examples

```bash
# Create new project
/projects-manage create "Sprint Board"

# List projects
/projects-manage list

# Configure automations
/projects-manage automate @1
```

## Project Components

<!-- TODO: Add project templates -->

- **Fields**: Status, Priority, Size, Sprint, Due Date
- **Views**: Board (Kanban), Table, Roadmap
- **Automations**: Auto-add issues, status transitions

## Validation Checklist

- [ ] Project structure matches workflow
- [ ] Fields capture needed metadata
- [ ] Views support team processes
- [ ] Automations reduce manual work
