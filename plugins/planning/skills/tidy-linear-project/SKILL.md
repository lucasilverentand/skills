---
name: tidy-linear-project
description: Keeps an existing Linear project tidy after planning and during execution. Use when the user asks to "tidy Linear", "clean up the project", "audit issues", "find duplicates", "check stale blockers", "fix project drift", or run periodic Linear housekeeping on a project, initiative, or milestone set. Use when planning is underway or execution has started and relationships, labels, priorities, documents, and issue states need coherence without changing product scope.
---

# Tidy Linear Project
Use this skill to audit and tidy a Linear project, initiative, milestone set, or active planning queue without changing product scope. This skill owns project hygiene. It may use `issue-authoring` references for issue-body and metadata semantics, but it does not author new feature scope by default.

## Boundary
- Do not create new product scope during a tidy pass.
- Do not rewrite issue bodies unless the change preserves the existing goal and clarifies acceptance criteria or metadata.
- Do not reprioritize, reassign, reschedule, or move work across phases unless the user explicitly asks.
- File or report follow-up work when cleanup would require product judgment.

## Decision tree
- What does the user need?
  - **Report-only Linear project audit** -> follow "Workflow" and stop before applying fixes.
  - **Apply safe Linear cleanup** -> follow "Workflow" and apply only auto-safe fixes.
  - **Review unresolved cleanup findings** -> follow "Workflow", then format human-judgment items with `references/linear-unresolved-findings.md`.
  - **Author, split, or score one issue artifact** -> use `issue-authoring` instead.

## Workflow
1. Identify the Linear project, initiative, milestone, or issue set to tidy.
2. Read `references/linear-tidy-checks.md` and `references/linear-unresolved-findings.md`.
3. Read `../issue-authoring/references/issue-rules.md`, `../issue-authoring/references/linear.md`, and `../issue-authoring/references/complexity-scale.md` for shared issue-body, metadata, dependency, priority, milestone, and complexity semantics.
4. Inspect current Linear state: issues, descriptions, acceptance criteria, labels, milestones, priorities, estimates, blockers, related links, documents, comments, and status history.
5. Separate findings into auto-safe fixes, suggestions, unresolved cleanup, and out-of-scope product decisions.
6. Apply only auto-safe fixes when the user asked for cleanup execution. Otherwise produce a report.
7. For unresolved cleanup, use the report format in `references/linear-unresolved-findings.md`.
8. Summarize what changed, what remains unresolved, and which follow-up skill or tracker should own any work outside tidy scope.

## Output
Return a concise tidy report with:

- Scope audited.
- Auto-safe fixes applied or proposed.
- Suggestions that need human/product judgment.
- Unresolved cleanup items in the reference format.
- Follow-up issues or documents that should be created outside this tidy pass.

## References
|Reference|When to read|
|---|---|
|`references/linear-tidy-checks.md`|Auditing duplicates, blockers, fields, documents, states, and links|
|`references/linear-unresolved-findings.md`|Reporting cleanup findings that need human judgment|
|`../issue-authoring/references/issue-rules.md`|Shared issue body, metadata, readiness, splitting, and platform-neutral semantics|
|`../issue-authoring/references/linear.md`|Mapping generic issue metadata to Linear fields only|
|`../issue-authoring/references/complexity-scale.md`|Assigning issue points and decomposing oversized issues|
