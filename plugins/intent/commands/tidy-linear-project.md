---
description: Audits and tidies an existing Linear project — duplicates, stale blockers, field hygiene, document drift, and missing links
allowed-tools: Read Bash Glob Grep Edit AskUserQuestion mcp__linear__* mcp__codex_apps__linear__*
---

Tidy the requested Linear project using the `issue-authoring` skill's Linear tidy references.

Default to report-only mode unless the user asked to apply safe fixes or confirmed a full tidy plan. Use Linear MCP tools to inspect the project before suggesting or applying changes. Read `issue-authoring/references/linear-tidy-checks.md` and produce unresolved cleanup findings from `issue-authoring/references/linear-unresolved-findings.md` when human judgment is required.
