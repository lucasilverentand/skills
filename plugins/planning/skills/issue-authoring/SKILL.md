---
name: issue-authoring
description: Writes, refines, splits, and scores the issue artifact itself: compact implementer-ready body, acceptance criteria, scope boundary, routing metadata, and complexity. Use when the user asks to create an issue, write ticket-ready issue text, refine issue scope, add acceptance criteria, add issue metadata, estimate issue points, split oversized work, or make one issue clear enough for an implementer. Do not use for picking work, tidying Linear projects, implementation, pull requests, or project planning.
---

# Issue Authoring
Use this skill to author the issue artifact itself: clear body, acceptance criteria, routing metadata, complexity score, and scope boundaries. Keep the core guidance platform-neutral. Destination-specific references are adapters for field mapping only.

## Boundary
This skill owns the written issue and its metadata. It does not own backlog hygiene, project cleanup, issue selection, implementation, PR execution, or full planning-project setup.

Use companion planning skills instead:

- `tidy-linear-project` for duplicates, stale blockers, state hygiene, document drift, and project cleanup.
- `pickup-work` for selecting and starting the next actionable Linear issue.
- `create-planner-project` for creating Linear initiatives, projects, milestones, and batches of planning issues.
- `task-spec` or `requirements` when the source intent is too fuzzy to author one useful issue yet.

## Decision tree
- What does the user need?
  - **Write or refine an issue** -> follow "Author issues" and read `references/issue-rules.md`.
  - **Add proper metadata to an issue** -> follow "Author issues", read `references/issue-rules.md`, then read the destination adapter only if writing to a specific platform.
  - **Estimate, score, point, size, or audit one issue's complexity** -> follow "Score complexity" and read `references/complexity-scale.md`.
  - **Issue is too broad to score or implement cleanly** -> follow "Split oversized issues" and read `references/issue-rules.md` plus `references/complexity-scale.md`.

## Author issues
1. Read `references/issue-rules.md`.
2. Inspect the source material and existing issue context before writing: brief, spec, current issue text, linked docs, related issues, or user request.
3. Write for the implementer. Default to `Why`, `Goal`, `Acceptance criteria`, optional `Implementation notes`, `Out of scope`, and `Links`.
4. Fill proper metadata when enough information exists: routing fields, priority, milestone or phase, labels or type, strict dependencies or related links, and complexity.
5. Keep owner, assignee, cycle, due date, and similar human-planning fields out unless the user explicitly asked for them.
6. Use destination adapters only to map the generic metadata to platform fields. Do not let platform workflow rules change the issue shape.
7. Be honest about uncertainty. Ask only for details that block a useful issue; otherwise state assumptions or unknowns in the issue.

## Score complexity
1. Read `references/complexity-scale.md`.
2. Assign complexity by default when the issue is clear enough to score.
3. Store the score in the destination's estimate or points field when available.
4. Base the score on implementation complexity, then bump one level for meaningful uncertainty, dependency risk, or validation risk.
5. If the issue is larger than 16 points or cannot be honestly scored, mark it as needing decomposition instead of assigning a larger score.

## Split oversized issues
1. Keep issues small enough to be implemented and reviewed as one coherent outcome.
2. Prefer splitting oversized work into concrete child issues over creating tracker issues.
3. Create a tracker only when a human planner explicitly wants coordination without direct implementation.
4. Each split issue needs its own `Why`, `Goal`, acceptance criteria, out-of-scope boundary, links, routing metadata, and complexity.

## Metadata rules
- Priority means business urgency. Do not use priority to encode sequencing pressure; use dependencies for traceability.
- Milestones default to delivery phases for greenfield work and release targets for mature projects.
- Dependencies should be strict enough that an implementer knows what must finish before moving on.
- Missing metadata should not be invented silently. Fill known fields, note unknowns, and ask only when the missing field blocks a useful issue.
- Adapt heading names to an existing tracker template when needed, but preserve the default content model.

## References
|Reference|When to read|
|---|---|
|`references/issue-rules.md`|Shared issue body, metadata, readiness, splitting, and platform-neutral semantics|
|`references/complexity-scale.md`|Assigning issue points and decomposing oversized issues|
|`references/linear.md`|Mapping generic issue metadata to Linear fields only|
|`references/github.md`|Mapping generic issue metadata to GitHub issue fields only|
