# GitHub metadata adapter
Use this adapter only after reading `issue-rules.md`. It maps platform-neutral issue metadata to GitHub issue fields.

## Field mapping
|Generic metadata|GitHub field|
|---|---|
|Project or area|Repository, GitHub Project, component label, or area label|
|Milestone, phase, or release|Milestone for release targets; existing labels for phases when that is the repo convention|
|Labels or type|Existing labels by exact name|
|Priority|Existing priority label or project field, based on business urgency|
|Dependencies|Linked issues or task list references for strict prerequisites when the repo convention supports them|
|Related links|Linked issues, discussions, docs, or code pointers for context|
|Complexity|Existing size, points, estimate label, or project field when the repo uses one|

Do not assign people, add projects, or create labels unless the user explicitly asks. If the repository has an issue template, adapt the heading names to that template while preserving the issue-authoring content model.
