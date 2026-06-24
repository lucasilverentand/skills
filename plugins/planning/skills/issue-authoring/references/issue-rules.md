# Issue authoring rules
Use this reference when writing, refining, or scoring issues. It defines the issue artifact Luca wants: compact, implementer-ready, honest about unknowns, and carrying proper routing plus complexity metadata.

## Contents
- [Authoring workflow](#authoring-workflow)
- [Body shape](#body-shape)
- [Metadata](#metadata)
- [Readiness and unknowns](#readiness-and-unknowns)
- [Splitting oversized issues](#splitting-oversized-issues)
- [What not to encode](#what-not-to-encode)

## Authoring workflow
1. Read the source material: project brief, task spec, existing issue, user request, design note, code finding, or other planning input.
2. Inspect existing issue context before writing: related issues, labels, milestones, projects, current issue text, and canonical docs.
3. Write for the implementer. A good issue should make the next concrete outcome clear without turning into a long spec.
4. Fill proper metadata: routing fields, priority, phase or release, labels or type, strict dependencies or related links, and complexity.
5. Use a destination adapter only to map generic metadata into platform fields. The core issue shape stays platform-neutral.
6. If the issue cannot be made useful because key information is missing, ask. If it can be made useful with honest assumptions or explicit unknowns, write it and surface those unknowns.

## Body shape
Default to these headings unless an existing tracker template requires different names:

```markdown
## Why
Decision context: why this issue exists, what it affects, and why it matters now.

## Goal
The concrete deliverable or outcome.

## Acceptance criteria
- Observable outcome or concrete required task.
- Include verification expectations here when they matter.

## Implementation notes
Optional. Short suggested path, constraints, traps, or known boundaries.

## Out of scope
One or two concise boundaries.

## Links
- Canonical few docs, code pointers, related issues, or evidence links.
```

Heading names may be fluid, but the content model should survive. For example, a destination template may call `Why` "Context" or `Acceptance criteria` "Definition of done"; preserve the substance instead of fighting the template.

Acceptance criteria can mix outcome checks and task-shaped bullets. Prefer observable outcomes, but include concrete task bullets when the path is obvious or important for avoiding wrong turns. Fold verification into acceptance criteria instead of adding a default verification section.

Use `Implementation notes` only when there is useful authoring-time guidance. Do not prescribe a full implementation unless the source material already establishes it.

## Metadata
Proper metadata means routing plus complexity.

|Metadata|Default meaning|
|---|---|
|Project or area|Where the issue belongs. Use the destination's project, area, component, or equivalent field.|
|Milestone, phase, or release|Use delivery phases for greenfield work. Use release targets for mature projects.|
|Labels or type|Work type, product area, platform, tests, documentation, security, or similar existing taxonomy.|
|Priority|Business urgency. Do not use priority to encode sequencing pressure.|
|Dependencies|Strict prerequisite work an implementer should finish before moving on.|
|Related links|Useful context that is not a prerequisite.|
|Complexity|Point or estimate metadata from `complexity-scale.md`. Assign by default when scope is clear enough.|

Do not set owner, assignee, cycle, due date, or planner-owned fields unless the user explicitly asks. Human planners own assignment.

Use existing metadata by exact name where possible. If useful metadata does not exist, do not invent it silently. Note the gap or ask only when the missing metadata blocks a useful issue.

## Readiness and unknowns
Before filing or finalizing an issue, think through whether it has:
- A clear goal.
- Useful acceptance criteria.
- Proper routing metadata.
- A complexity score, or an honest reason it cannot be scored.
- A priority basis.
- A milestone, phase, release, or explicit reason this is unknown.
- Dependency or related links when sequencing/context matters.
- An out-of-scope boundary.

Missing information does not always block writing the issue. Ask only when the issue would otherwise mislead the implementer or planner. Otherwise, include a clear assumption or unknown in the body or metadata note.

## Splitting oversized issues
Keep issues small enough to implement and review as one coherent outcome. If an issue is larger than 16 points, too ambiguous to score, or bundles unrelated outcomes, split it into smaller issues.

Avoid tracker issues by default. They tend to hide implementation scope. Use a tracker only when a human planner explicitly wants coordination without direct implementation.

Each split issue should have its own goal, acceptance criteria, out-of-scope boundary, routing metadata, dependencies, and complexity.

## What not to encode
- Do not use priority for sequencing. Use dependencies.
- Do not assign people by inference.
- Do not create platform metadata silently.
- Do not file vague placeholder issues when a useful issue requires one blocking answer.
- Do not copy a whole planning doc into every issue. Link the canonical source and keep issue-specific context in the issue.
