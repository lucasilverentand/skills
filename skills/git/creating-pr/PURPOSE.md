# Creating PR

Create high-quality pull requests with clean history, structured descriptions, and proper metadata.

## Responsibilities

- Prepare branch history for review (rebase, squash fixups, lint all commits)
- Run pre-flight checks before PR creation (worktree clean, pushed, CI green, issues linked)
- Generate structured PR descriptions (context, changes, dependencies, test plan)
- Create PRs as drafts with conventional commit titles
- Detect and format dependency changes into a bill of materials table
- Apply labels and let CODEOWNERS handle reviewer assignment
- Respect repo-specific PR templates when they exist

## Tools

- `tools/pr-preflight.ts` — pre-flight checks: clean worktree, pushed, commit lint, CI, linked issues
- `tools/dep-diff.ts` — generate a dependency diff table comparing branch to base
