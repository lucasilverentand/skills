---
description: Commits recent work with intent-aware messages drawn from conversation context
allowed-tools: Read Bash Glob Grep Edit
---

Commit the changes from the work just completed using the `repo-management` skill.

Before writing commit messages, reflect on the **conversation context**: what the user asked for, what problem was being solved, what decisions were made, and what approach was taken. The commit messages should capture this intent, not just describe the mechanical file changes.

## How to use conversation context
The diff shows what changed. The conversation shows why. Mine the conversation for:

- The original request: what the user asked for or the problem they described.
- Decisions made: alternatives considered and rejected, trade-offs chosen.
- The approach: why this implementation strategy was chosen.

Then read `references/commits.md` from the `repo-management` skill and route to single commit or multi-commit split based on whether the changes are focused on one concern or multiple. Follow all steps: staging, message format, signing/attribution rules, and verification.
