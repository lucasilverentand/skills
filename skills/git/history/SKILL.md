---
name: history
description: Searches and analyzes git history using log, blame, bisect, and diff. Use when the user wants to find when a line of code was introduced, understand why something changed, trace the history of a function, find who owns a file, summarize repository activity, or perform diff analysis across commits or branches. Trigger phrases: "who wrote", "when was this added", "why did this change", "git blame", "git log", "find the commit", "history of", "ownership", "activity report".
allowed-tools: Read Grep Glob Bash
---

# History

## Decision Tree

- What are you trying to find?
  - **When/why a specific line or function was changed** → follow "Tracing a change" below
  - **Who owns a file or directory** → run `tools/ownership-map.ts <path>`
  - **Full history of a function or code block** → run `tools/code-archeology.ts <file> <pattern>`
  - **Activity summary by author or directory** → run `tools/activity-report.ts`
  - **Find which commit introduced a bug** → follow "Bisect" below
  - **Compare changes across commits or branches** → follow "Diff analysis" below

## Tracing a change

1. Find when a line was last changed: `git blame -L <start>,<end> <file>`
2. Read the commit that changed it: `git show <hash>`
3. If you need the full history of a block across renames and refactors:
   - Run `tools/code-archeology.ts <file> "<pattern>"` — traces across renames using `git log -S` and `--follow`
4. Read the surrounding commits for context: `git log --oneline -10 <hash>`

## Bisect

Use bisect to find which commit introduced a regression:

1. Start: `git bisect start`
2. Mark the known bad commit: `git bisect bad <bad-hash>` (or `HEAD`)
3. Mark the known good commit: `git bisect good <good-hash>`
4. Git checks out the midpoint — test it, then mark: `git bisect good` or `git bisect bad`
5. Repeat until git identifies the first bad commit
6. End: `git bisect reset`

For automated bisect with a test command: `git bisect run <command>`

## Diff analysis

- Changes in a commit: `git show <hash>`
- Changes between commits: `git diff <hash1>..<hash2>`
- Changes between branches: `git diff <base>...<target>` (three dots = from common ancestor)
- Changes to a specific file over time: `git log -p -- <file>`
- Stat summary only: `git diff --stat <base>...<target>`

## Log queries

Useful log filters:
- By author: `git log --author="<name>"`
- By date: `git log --since="2 weeks ago"`
- Affecting a file: `git log --oneline -- <file>`
- Message search: `git log --grep="<pattern>"`
- Code search: `git log -S "<string>"` — finds commits that added/removed a string

## Key references

| File | What it covers |
|---|---|
| `tools/ownership-map.ts` | Generate a file/directory ownership map based on blame data |
| `tools/code-archeology.ts` | Trace the full history of a specific function or code block |
| `tools/activity-report.ts` | Summarize commit activity by author and directory for a given period |
