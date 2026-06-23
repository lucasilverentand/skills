# Linear metadata adapter
Use this adapter only after reading `issue-rules.md`. It maps platform-neutral issue metadata to Linear fields.

## Field mapping
|Generic metadata|Linear field|
|---|---|
|Project or area|Project, team, and existing product or area labels|
|Milestone, phase, or release|Milestone when available; otherwise an existing phase or release label|
|Labels or type|Existing Linear labels by exact name|
|Priority|Linear priority, based on business urgency|
|Dependencies|Blocks / blocked by relations for strict prerequisites|
|Related links|Related issue links for useful context that is not prerequisite work|
|Complexity|Estimate or points field|

Do not assign people, cycles, due dates, or planner-owned fields unless the user explicitly asks. If required metadata is missing, note the gap or ask only when it blocks a useful issue.

## Milestone default
For greenfield planning, treat milestones as delivery phases. For mature projects, treat milestones as release targets. Follow an existing project convention when one is visible.
