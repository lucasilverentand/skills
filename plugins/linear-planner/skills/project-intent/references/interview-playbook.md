# Project intent interview playbook
Use this reference to choose the smallest interview that will clarify intent. Keep the conversation moving; a good interview feels like structured thinking, not a form.

## Mode 1: One new idea
Start with one A/B/C choice if the user is unsure:

|Option|Use when|Consequence|
|---|---|---|
|A. Small utility|The idea solves a recurring personal pain or workflow gap.|Optimize for quick proof, narrow scope, and a low-maintenance repo.|
|B. Product bet|The idea could become a real app, business, or public product.|Optimize for audience clarity, differentiation, design, and validation.|
|C. Platform piece|The idea coordinates other tools, agents, repos, automations, or infrastructure.|Optimize for source-of-truth boundaries, operations, and integration risk.|

Then ask only the missing questions:
- Who is this for, even if the first user is Luca?
- What pain or desire makes it worth existing?
- What would prove it is useful within the next small slice?
- What should it explicitly not become?
- What taste, design, or workflow principles should future agents preserve?

## Mode 2: Existing project
Inspect available evidence first:
- Current branch, PRs, issues, and recent commits
- Linear initiative, project, milestones, and open issues
- Repo docs, README, project docs, and design docs
- Prior context or memory when available

Then interview against drift:
- What was the original intent?
- What does the current code or backlog imply the intent has become?
- Is that drift good, bad, or unresolved?
- Should the project be active, maintenance-only, paused, merged into another project, or killed?
- What would a future agent likely misunderstand?

## Mode 3: Many projects
Batch projects into groups of five to seven. Avoid asking the user to rank everything at once.

Use these status choices:

|Status|Meaning|Default next action|
|---|---|---|
|Active|Worth pushing now.|Name the current lane and next proof.|
|Maintained|Useful, but not a product push.|Keep small maintenance issues only.|
|Incubating|Interesting, but intent needs more thinking.|Run a short idea interview.|
|Paused|Keep context, do not spend active effort.|Record resume trigger.|
|Merge candidate|Overlaps another project.|Decide what survives and where.|
|Kill candidate|Not worth more attention.|Preserve any reusable learning, then close the loop.|

For each project, capture:
- What is it?
- Why keep it?
- What is the current lane?
- What should Codex do next?
- What should Codex avoid doing?

## Option-narrowing patterns
Use these option sets when the user is stuck:

### Scope choice
|Option|Shape|
|---|---|
|A. Narrow wedge|One workflow, one proof, one repo.|
|B. Useful hub|Enough structure to coordinate related work without building a full platform.|
|C. Full system|Integrations, automations, and durable project operations.|

### Validation choice
|Option|Shape|
|---|---|
|A. Personal proof|Luca uses it on real work for a week.|
|B. Workflow proof|It produces better Linear/GitHub/repo output than the current process.|
|C. External proof|Someone else can understand and use it without Luca explaining it live.|

### Agent behavior choice
|Option|Shape|
|---|---|
|A. Conservative agent|Ask before direction changes, prefer docs and issues.|
|B. Execution agent|Pick the next clear lane and carry it through PR/validation.|
|C. Strategy agent|Challenge project fit, propose kills/merges, and keep portfolio focus.|

## Exit criteria
Stop interviewing and draft the packet once these sentences can be completed:
- This exists to ...
- It is for ...
- The current lane is ...
- The next proof is ...
- Future agents should ...
- Future agents should not ...
