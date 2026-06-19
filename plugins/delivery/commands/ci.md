---
description: Checks CI status, watches in-progress runs, diagnoses and fixes failures
allowed-tools: Read Bash Glob Grep Edit Agent
---

Check CI status for the current branch and take action.

## Current state
- Branch: !`git branch --show-current`
- PR: !`gh pr view --json number,url --jq '"\(.url)"' 2>/dev/null || echo "no PR"`
- Latest run: !`gh run list --branch $(git branch --show-current) --limit 1 --json status,conclusion,name,databaseId --jq '.[0] | "\(.name): \(.status) \(.conclusion // "")" + " (ID: \(.databaseId))"' 2>/dev/null || echo "no runs found"`
- Failed checks: !`gh pr checks --json name,state --jq '[.[] | select(.state == "FAILURE")] | length' 2>/dev/null || echo "unknown"`

Use the `repo-management` skill. Read `references/ci-and-pr-repair.md` and route from the current state above without repeating checks that are already answered.
