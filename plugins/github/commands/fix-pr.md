---
description: Gets an existing pull request ready to merge
allowed-tools: Read Bash Glob Grep Edit Agent AskUserQuestion
---

Get the pull request ready to merge.

The user invoked this command with: $ARGUMENTS

## Current state
- Repository: !`git remote get-url origin 2>/dev/null || echo "no origin"`
- Branch: !`git branch --show-current || echo "detached"`
- PR: !`gh pr view --json number,url --jq '"#\(.number) \(.url)"' 2>/dev/null || echo "no PR for current branch"`
- Merge state: !`gh pr view --json mergeStateStatus,reviewDecision,isDraft --jq '"merge=\(.mergeStateStatus // "unknown") review=\(.reviewDecision // "unknown") draft=\(.isDraft)"' 2>/dev/null || echo "unknown"`
- Failed checks: !`gh pr checks --json name,state --jq '[.[] | select(.state == "FAILURE")] | length' 2>/dev/null || echo "unknown"`

Follow the full workflow in the `fix-pr` skill. If `$ARGUMENTS` contains a PR number, use that PR. Otherwise, use the current branch PR from the state above when one exists. Use the current state above to avoid repeating checks that are already answered.
