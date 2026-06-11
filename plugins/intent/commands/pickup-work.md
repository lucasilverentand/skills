---
description: Picks up the next actionable Linear issue for the product represented by the current repo
allowed-tools: Read Bash Glob Grep Edit AskUserQuestion mcp__linear__* mcp__codex_apps__linear__*
---

Pick up the next actionable Linear issue for the project represented by the current working directory using the `pickup-work` skill.

Use the directory where `/pickup-work` was run as the product context. Let the skill detect the repo and Linear context, choose one issue, assign it to me, move it to an in-progress status, and report the selected issue plus the first implementation step.
