---
name: linear-issues
description: Creates, updates, estimates, and tidies Linear issues using Luca's issue-shaping rules. Use when the user asks to create a Linear issue, write ticket-ready issue text, refine an existing issue, add acceptance criteria, set issue relationships, estimate points, audit issue hygiene, tidy a Linear project, find duplicates, fix stale blockers, or normalize labels, milestones, priorities, and issue state.
---

# Linear Issues
Use this skill for issue-level work in Linear. It owns issue shape, field semantics, relationships, complexity scoring, and tidy-up checks. Project creation, project documents, and repo-context issue pickup remain separate skills.

## Decision tree
- What does the user need?
  - **Create Linear issues from a spec, brief, planner structure, or rough request** -> follow "Create or update issues" and read `references/issue-rules.md`.
  - **Update, refine, split, relate, block, unblock, label, prioritize, or normalize existing issues** -> follow "Create or update issues" and read `references/issue-rules.md`.
  - **Estimate, score, point, size, or audit issue complexity** -> follow "Estimate complexity" and read `references/complexity-scale.md`.
  - **Tidy a Linear project, initiative, milestone, or issue set** -> follow "Tidy issue hygiene" and read `references/tidy-checks.md` plus `references/unresolved-findings.md`.
  - **Create a full planner project** -> use `create-planner-project`; it calls this skill's issue rules while creating planner issues.
  - **Pick up the next repo issue** -> use `pickup-work`; it owns repo detection, assignment, and moving one issue into progress.

## Create or update issues
1. Read `references/issue-rules.md`.
2. Inspect existing Linear issues, labels, milestones, statuses, relationships, comments, and documents before creating or changing anything.
3. Prefer updating, relating, or narrowing an existing issue over creating a duplicate.
4. Keep each issue executable: one clear outcome, context, acceptance criteria, out-of-scope boundary, and focused links.
5. Use Linear fields for machine-readable structure: priority, milestone, labels, parent, blockers, related issues, and project status updates.
6. Add a short comment when an expected field does not exist or a rule cannot be applied.

## Estimate complexity
1. Read `references/complexity-scale.md`.
2. Inspect the issue title, description, acceptance criteria, comments, labels, dependencies, linked context, and validation expectations.
3. Score complexity only. Do not estimate time.
4. If the issue is larger than 16 points, mark it oversized and recommend a split instead of assigning a larger score.

## Tidy issue hygiene
1. Scope the run: target project, initiative, milestone, or issue set; current project phase; and requested mode.
2. Read `references/tidy-checks.md` and `references/unresolved-findings.md`.
3. Fetch the Linear project or issue evidence before proposing changes.
4. Classify each finding as `auto-safe`, `suggest`, or `out-of-scope`.
5. Apply only low-risk fixes when the user asked for apply-safe or full tidy mode.
6. Report unresolved cleanup using the unresolved-findings format.

## Field rules
- Reuse Linear team labels, statuses, milestones, and priorities by exact name; do not invent a dense taxonomy during issue work.
- Use blockers only for hard sequencing where the downstream issue cannot produce a useful output.
- Use related issues for context without ordering.
- Do not use labels for status, priority, ownership, or risk.
- Do not assign people, cycles, due dates, or estimates unless the user asked for that specific action.

## References
|Reference|When to read|
|---|---|
|`references/issue-rules.md`|Creating or updating issues, fields, relationships, blockers, related issues, and project status updates|
|`references/complexity-scale.md`|Estimating Linear issue points by complexity only|
|`references/tidy-checks.md`|Auditing duplicates, blockers, field hygiene, document drift, state hygiene, and missing links|
|`references/unresolved-findings.md`|Reporting tidy findings that need human judgment|
