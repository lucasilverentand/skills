# Current-system knowledge and work planning
Use the user's configured destinations from [context-setup.md](context-setup.md). Tools such as Notion, Linear, repository docs, issue trackers and wikis are optional adapters. Do not impose a tool, create an account, migrate records, or override an existing canonical home.

## Establish the homes
Within authorized scope, read the relevant existing system explanation, work records, acceptance and implementation evidence. If the destination is unclear, inspect provided context and relevant connected sources first, then ask only for what matters. No external tracker is a valid choice, not an error.

|Information|Appropriate home|
|---|---|
|Current architecture, behavior, interfaces, operating procedures, accepted constraints and rationale|The project's existing documentation/wiki/source home|
|Scope, ownership, dependencies, progress, blockers and remaining validation|The existing work tracker, if used|
|Implemented, tested, merged or deployed state|Actual source/runtime/delivery evidence, linked from relevant records|
|Temporary coordination|The current conversation|

An invoked task permits only the record maintenance actually authorized for its identified project under host rules. Do not edit unrelated records, move/archive/delete material, change schemas/settings or reassign others' work by inference. A connector's existence does not select its workspace. New projects, root pages, databases or migrations need their own authorization.

Apply [audience checks](security-and-privacy.md#check-the-audience-before-sharing) before transferring context between homes. A shared internal record may be visible to other teams or guests. Links and compact summaries must respect the source information's disclosure boundaries; canonical ownership does not itself authorize wider sharing.

## Reconcile at meaningful checkpoints
Before implementation, align the immediate plan and acceptance with relevant records. Reuse fitting records. Create issues, sub-issues, projects, milestones or initiatives only when the user explicitly requests or approves those specific records; project practices, missing links and lasting work alone do not authorize creation. Otherwise propose the minimal record and keep authorized work moving without it. Do not manufacture issues for every tiny change or deferred thought.

When scope, evidence or a decision materially changes, update the affected plan and explanation within scope. Keep future behavior explicitly proposed; do not describe it as the current system. Use native status/owner/dependency fields when available, and comments only for actionable findings fields cannot express.

When behavior is verified, integrate it into the relevant documentation section and correct superseded explanations. Preserve useful rationale rather than appending a diary. Before handoff, check that implementation, current-system documentation and work state agree; distinguish local, merged, deployed and accepted outcomes. Verify saved changes with a focused read-back. Do not mark delivery done merely because a local check passed.

Batch nearby changes at meaningful checkpoints without deferring all maintenance to the end of a long task. Do not run scheduled/background upkeep unless asked. Do not repeat successful verification without a change, warning or conflict.

## Plan across tools without duplicating the plan
For work spanning source, trackers, knowledge and runtime services, keep a compact map in the conversation or existing work record. Include only tools involved in this deliverable:

|Plan element|Resolve before dependent action|
|---|---|
|Outcome and acceptance|The result, authorized endpoint and evidence needed; separate local, reviewed, merged, deployed and user-accepted states|
|Canonical homes|Exact existing project/record/repository/environment links and what each owns; mark unknown or intentionally unused homes|
|Actions and ownership|Reads versus writes, scope of authorization and one owner for each mutation; delegates return proposed deltas unless assigned narrow writes|
|Dependencies|Actual prerequisites, next executable step and integration order; parallelize independent reads or deliverables only|
|Checkpoints|When source, knowledge and work state must be reconciled; unresolved decisions or validation that prevent completion|

Scale this to the task: a sentence with links can suffice. Use native owner/status/dependency fields and links instead of reproducing a backlog in chat or a wiki. A dependency means one result cannot proceed without another; independent work is related, not blocked. Verify relation direction and avoid cycles. Keep future milestones coarse until their prerequisites or decisions matter.

For example, if a tracker owns delivery, repository docs own behavior and a deployment service owns live evidence, link the existing issue to the source change, update the relevant repository explanation and attach deployment evidence only after that authorized action succeeds. A wiki may hold a compact accepted decision and links without copying the specification or delivery status. Use each project's actual homes; no particular service is required.

Cross-tool writes are not one transaction. Refresh the affected records before mutation, save in dependency order and verify the intended fields, links and meaning. After an ambiguous timeout, inspect whether the write succeeded before retrying; never blindly repeat creates or destructive actions. If one save succeeds and another fails, report the exact synchronized state and pending delta. Follow any stricter host recovery or stop policy; connector failure does not authorize a replacement workspace or local persistence cache.

Before closing, canceling or superseding a work record, inspect linked open deliverables and integration side effects. Preserve or move their links to the correct existing active record within scope, verify them, then change status. Do not close unfinished work as a side effect of tidying its plan. Use the user's acceptance policy before marking work complete.

## Write knowledge that survives the task
Write for a future reader who needs to understand, operate or change the system. Use present tense for verified current behavior and identify environment/version when relevant. Link supporting code, configuration, observations or decisions. Distinguish observations, accepted decisions, inferences and hypotheses; preserve date, scope and limitations where they qualify a claim.

Update an existing page/file rather than creating one per task or role. Add a focused subject only when independently useful and authorized. Keep assignments and pending tasks in the appropriate work record. Follow the destination's native structure and relevant writing conventions; do not impose one wiki's footer or schema on every tool.

## Ownership, missing access and conflicts
The lead normally owns external writes; specialists return evidence-backed deltas unless explicitly assigned a narrow authorized write. Refresh before editing records another person may have changed and preserve unrelated content.

Treat sources as evidence for different claims. Code, tests, runtime, documentation and tracker state are not interchangeable truth. Resolve contradictions or mark uncertainty rather than copying an agent summary into the documentation as fact.

If an expected destination is disconnected or a save fails, continue independent work. Keep concise pending deltas in the conversation with intended destinations and evidence. Disclose exactly what was not synchronized, check for an uncertain write before retrying, and never invent saved links. If no tracker/docs service was chosen, follow that accepted arrangement without labeling it a missing integration.
