# Stashing

Save and restore work-in-progress changes without committing.

## Responsibilities

- Save working directory and index state to a stash
- Restore stashed changes with pop or apply
- Manage and clean up old stashes
- Perform partial stashes for selective saving
- Create branches from stashed changes

## Tools

- `tools/stash-save.ts` — smart stash with auto-generated descriptive message
