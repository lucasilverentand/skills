# Linear issue rules
Use this reference when creating, updating, or tidying Linear issues. It is the shared issue contract for planner setup, issue authoring, and issue hygiene workflows.

## Contents
- [Creation workflow](#creation-workflow)
- [Issue shape](#issue-shape)
- [Field rules and examples](#field-rules-and-examples)
- [Relationship rules](#relationship-rules)
- [Status updates](#status-updates)
- [What not to encode as Linear structure](#what-not-to-encode-as-linear-structure)

## Creation workflow
1. Read the source material: project brief, task spec, planner structure, existing issue, or user request.
2. Inspect the target Linear project before creating anything: existing issues, milestones, labels, statuses, project documents, and obvious duplicates.
3. Create small executable issues. Each issue needs one clear outcome, context, acceptance criteria, and an out-of-scope boundary when scope could sprawl.
4. Use Linear fields for machine-readable structure: priority, milestone, labels, parent, blockers, related issues, and project status updates.
5. Prefer names over copied IDs in reusable text. Runtime-created Linear records will get their own IDs, URLs, and branch names.
6. Add a comment when an expected label, milestone, or status does not exist and the issue is created without it.

## Issue shape
Each created issue should have:
- Title: action verb plus outcome, for example `Define product brief`.
- Context: why this work exists and what downstream planning it affects.
- Goal: the concrete output.
- Acceptance criteria: checkable bullets, adapted to the chosen project type profile.
- Out of scope: what this issue should not turn into.
- Links: the smallest useful planning doc or decision, not the whole document chain.

Keep implementation tickets out of planner setup. Create implementation issues only when the user explicitly asks for execution backlog creation or when refining an existing execution issue.

## Field rules and examples
|Field|Use it for|Example|Do not use it for|
|---|---|---|---|
|Labels|Work type, area, platform, tests, planning, documentation, agent-skill work, and the product label when those labels exist.|`Planning`, `Documentation`, `Security`, `<Product>`.|Status, priority, ownership, or dependency notes.|
|Priority|Execution urgency and sequencing pressure.|High for `Choose target platform` because later stack, distribution, and architecture decisions depend on it.|Personal interest, uncertainty, or broad importance without near-term impact.|
|Milestone|Delivery phase or review gate.|`Phase 1 - Decide` for architecture, data, auth, privacy, cost, observability, and security decisions.|Area grouping, component ownership, or "nice to have" buckets.|
|Parent issue|A real umbrella outcome whose children are slices of the same deliverable.|A parent `Set up CI/CD baseline` with children for web PR checks, native signing build, and release workflow if split is needed.|Epics, broad themes, arbitrary nesting, or grouping every planning issue under one parent.|
|Related issues|Context links where order does not matter.|`Create domain glossary` related to `Define product brief` because terms come from the brief but neither blocks the other.|Dependencies, duplicate work, or review handoffs.|
|Blocks / blocked by|Hard sequencing constraints.|`Confirm or override tech stack` is blocked by `Choose target platform` when platform choice changes valid stack options.|Soft preferences, "should read first", same milestone, shared owner, or vague coupling.|

Use existing workspace labels by exact name when available. Do not invent a dense label taxonomy during setup. If a useful label is missing and label creation is outside the current workflow, create the issue without that label and note the gap.

## Relationship rules
Use relationships sparingly. A clean project with a few true dependencies is better than a graph where every planning document blocks every later document.

### Blockers
Create blockers only when the blocked issue cannot produce a useful output without the upstream issue.

Good blocker examples:
- `Confirm or override tech stack` blocked by `Choose target platform`.
- `Sketch system architecture` blocked by `Confirm or override tech stack` when stack choices decide hosting, runtime, or deployment shape.
- `Planning retrospective and exit sign-off` blocked by unresolved Phase 0-3 issues because it is the explicit execution gate.

Bad blocker examples:
- `Create risk register` blocked by every Phase 1 decision. The risk register can start with known risks and update later.
- `Create open questions log` blocked by the product brief. It can collect unresolved questions while the brief is still being written.
- Any issue blocked by another issue only because the same person will probably do both.

### Parent issues
Do not create a parent issue by default for the planner's 23 base issues. The project and milestones already provide structure.

Create a parent only when:
- The parent has its own outcome and close condition.
- Every child is a real slice of that outcome.
- The child list is small enough that nesting makes the work clearer.

### Related issues
Use related issues for context without ordering:
- `Define success metrics` related to `Define product brief`.
- `Choose observability stack` related to `Define success metrics`.
- `Run security sanity check` related to `Pick auth and identity model`.

If completing one issue is required before another can make progress, use blockers instead of related issues.

### Duplicates and overlap
If an existing issue already covers the same work, update or relate to the existing issue instead of creating a duplicate. If overlap is partial, keep the sharper issue and link the broader context as related.

## Status updates
Use project status updates for project-level communication, not issue chatter.

Post or refresh a status update when:
- The planner project is created or substantially refreshed.
- A milestone finishes or the project moves from planning to execution.
- A blocker, scope change, or missing Linear field changes project risk.
- The next unblocked issue changes in a way the project owner should notice.

Status update example:

```markdown
Planner project created with Phase 0-4 milestones and planning issues.

First unblocked issue: Define product brief.
Risk: on track. The product label was missing, so issues were created with functional labels only.
```

## What not to encode as Linear structure
- Do not use blockers for "read this first", review preference, shared context, or likely work order.
- Do not use parent issues as epics, folders, milestones, or area labels.
- Do not use related issues when a real dependency exists.
- Do not use labels for status, priority, assignee, or risk.
- Do not use priority to express how interesting or visible the work is.
- Do not create implementation issues from planning docs unless the user explicitly asks for execution backlog creation.
- Do not copy planning facts into every issue description. Link the canonical document and put only task-specific context in the issue.
