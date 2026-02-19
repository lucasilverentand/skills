# History

Search history with log, blame, and bisect, and perform diff analysis.

## Responsibilities

- Search git history using log, blame, and bisect
- Perform diff analysis across commits and branches
- Identify contributors and ownership per file or directory
- Find when and why specific code was introduced or removed
- Summarize repository activity over time periods

## Tools

- `tools/ownership-map.ts` — generate a file/directory ownership map based on blame data
- `tools/code-archeology.ts` — trace the full history of a specific function or code block
- `tools/activity-report.ts` — summarize commit activity by author and directory for a given period
