---
description: Audits and tidies an existing Linear project — duplicates, stale blockers, field hygiene, document drift, and missing links
allowed-tools: Read Bash Glob Grep Edit AskUserQuestion mcp__linear__* mcp__codex_apps__linear__*
---

Tidy the requested Linear project using the `linear-issues` skill's tidy issue hygiene branch.

Default to report-only mode unless the user asked to apply safe fixes or confirmed a full tidy plan. Use Linear MCP tools to inspect the project before suggesting or applying changes. Produce the tidy report format from `linear-issues`, including unresolved cleanup findings when human judgment is required.
