---
name: labels-sync
description: Synchronizes and manages repository labels across projects. Use when standardizing labels, creating label schemes, migrating label configurations, or organizing issue categorization.
argument-hint: [action]
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Sync Repository Labels

Manages and synchronizes labels across repositories.

## Your Task

<!-- TODO: Implement skill logic -->

1. Fetch current labels via `gh label list`
2. Based on action:
   - **list**: Show current labels
   - **sync**: Apply label scheme
   - **export**: Export labels to file
   - **import**: Import labels from file
3. Apply standard label scheme:
   - Type labels (bug, feature, docs)
   - Priority labels (P0-P3)
   - Status labels (needs-triage, in-progress)
4. Handle conflicts and duplicates

## Examples

```bash
# List current labels
/labels-sync list

# Apply standard scheme
/labels-sync sync

# Export to file
/labels-sync export labels.json

# Import from file
/labels-sync import labels.json
```

## Standard Label Scheme

<!-- TODO: Add label definitions -->

| Label | Color | Description |
|-------|-------|-------------|
| bug | #d73a4a | Something isn't working |
| feature | #a2eeef | New feature request |
| docs | #0075ca | Documentation improvements |
| P0-critical | #b60205 | Critical priority |
| P1-high | #d93f0b | High priority |

## Validation Checklist

- [ ] No duplicate labels
- [ ] Colors are consistent
- [ ] Descriptions are helpful
- [ ] Scheme matches team process
