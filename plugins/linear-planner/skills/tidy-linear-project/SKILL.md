---
name: tidy-linear-project
description: Keeps an existing Linear project tidy after planning and during execution. Use when the user asks to "tidy Linear", "clean up the project", "audit issues", "find duplicates", "check stale blockers", "fix project drift", or run periodic Linear housekeeping on a project, initiative, or milestone set. Use when planning is underway or execution has started and relationships, labels, priorities, documents, and issue states need coherence without changing product scope.
---

# Tidy Linear Project
Use this skill to audit and lightly repair an existing Linear project. Read `references/tidy-checks.md` for the full check catalog and `references/unresolved-findings.md` for how to report items that need a human.

## Core rules
- **Tidy-up only.** Improve structure, metadata, relationships, and hygiene. Do not change product scope, acceptance criteria meaning, priorities because of new product direction, or milestone membership to reshuffle the plan.
- **Suggest before destructive edits.** Propose merges, cancellations, blocker removals, and status moves when evidence is incomplete or two issues might be the same work. Apply only low-risk fixes automatically.
- **Evidence before state moves.** Move issues to Done or Canceled only when comments, linked PRs, merged code, explicit owner confirmation, or unambiguous completion notes prove the outcome. Otherwise suggest the move.
- **Documents over rewrites.** When project documents drift from issues or milestones, suggest targeted updates or links. Do not rewrite planning history or delete document versions.
- **Linear MCP first.** Use Linear tools to list and fetch the project, issues, milestones, documents, labels, relationships, and comments before proposing changes.

## Decision tree
- What did the user give you?
  - **A Linear project URL or ID** -> use it as the audit target.
  - **Only a repo or product name** -> search Linear for the matching initiative or project, confirm the best match, then continue.
  - **An initiative with multiple projects** -> ask whether to tidy one project or each active project under the initiative.
- What mode?
  - **Report only** (default) -> produce findings and suggestions; apply only auto-safe fixes listed below.
  - **Apply safe fixes** -> also apply auto-safe fixes and leave comments where behavior changes.
  - **Full tidy with confirmation** -> present a numbered plan for every mutating action; wait for explicit approval per batch before applying destructive or ambiguous edits.

## Workflow
1. **Scope the run.** Record project name, team, current milestone focus, and whether the project is in planning or execution. Note the run mode.
2. **Snapshot context.** Fetch the project, milestones, labels, documents, and open issues (include recently completed or canceled if checking state hygiene). Skim the canonical project document if one exists.
3. **Run checks.** Walk the sections in `references/tidy-checks.md` in order: duplicates and overlap, stale blockers, field hygiene, document drift, state hygiene, missing links.
4. **Classify each finding** as one of:
   - `auto-safe` — apply in Apply-safe or Full-tidy mode (examples: add a missing related link when both sides are obvious; add a label that already exists on sibling issues; remove a blocker when the blocked issue is Done).
   - `suggest` — comment or report only; needs human judgment (examples: merge candidates, priority changes, milestone moves, acceptance-criteria rewrites).
   - `out-of-scope` — product or planning-scope change; do not act (examples: new features, descoping, resequencing the roadmap).
5. **Apply auto-safe fixes** when mode allows. After each batch that changes how people should work, leave a short Linear comment on the affected issue or project pointing to what changed and why.
6. **Publish the tidy report** using the output format below. Attach unresolved items using `references/unresolved-findings.md`.
7. **Optional periodic hook.** When the user wants this on a schedule, recommend running report-only weekly during execution and apply-safe after milestone transitions or planning phase gates.

## Auto-safe fixes
Apply these without asking when mode is Apply-safe or Full-tidy:
- Remove a `blocked by` relation when the blocker issue is Done or Canceled and the blocked issue is still open.
- Add a `related to` link between two issues when descriptions or titles clearly reference each other and no relation exists.
- Add an existing workspace label when the same label pattern is already used on peer issues in the milestone.
- Link a project document from an issue description when the document title matches the issue topic and the issue has no doc link.
- Fix broken or missing markdown links inside an issue when the target URL is already present elsewhere in the thread.

Do not auto-merge issues, auto-cancel work, auto-change priority, auto-move milestones, or auto-rewrite acceptance criteria.

## Output format
Return a markdown report with these sections:

```markdown
## Tidy run summary
- Project:
- Mode:
- Issues scanned:
- Auto-safe fixes applied:
- Suggestions:
- Out of scope (not acted on):

## Findings
### Duplicates and overlap
...

### Stale blockers
...

### Field hygiene
...

### Document drift
...

### State hygiene
...

### Missing links
...

## Unresolved cleanup
(Use the format in references/unresolved-findings.md)
```

## Field rules
- Reuse label, status, and milestone names from the workspace; do not invent new taxonomy during a tidy pass unless the user explicitly asked to create missing labels.
- Follow `../create-planner-project/references/linear-issue-creation.md` for relationship semantics when adding or removing blockers and related issues.
- Do not create new issues unless the user asked to track unresolved findings as issues; prefer the unresolved-findings report format first.
- Do not assign people, change cycles, or estimate points during a tidy pass unless the user included that in the request.

## Key references
|Reference|When to read|
|---|---|
|`references/tidy-checks.md`|Full checklist for each audit section|
|`references/unresolved-findings.md`|Reporting items that need a human decision|
|`../create-planner-project/references/linear-issue-creation.md`|Blocker, related, label, priority, and milestone rules|
