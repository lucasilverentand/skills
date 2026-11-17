# Structure concurrent work and prevent races
Use before concurrent writers or when one agent's output is another's input. For a sole writer, a clear brief suffices. Keep coordination in the conversation or an approved existing work record; do not create a management hierarchy, lock service or coordination report for every task. Host mechanisms govern messaging, isolation, waits and cancellation.

## Give every change an owner
The current lead owns the assignment map, shared contracts, integration and the acceptance checkpoint. Advisors and reviewers are read-only unless explicitly assigned a bounded write. Implementation workers own concrete deliverables within their write scope, not an open-ended role such as “backend.” The lead follows the same ownership rules as workers.

Before dispatch, record a compact map with each assignment's owner, deliverable, starting revision/state, exclusive write scope, prerequisites, handoff and status. Use useful states such as ready, running, blocked, ready for integration and integrated. Include the actual files/directories, external records or shared resources to mutate, not merely task names. Small teams can express this in a few lines. Keep the map current on meaningful handoffs or changes; elapsed time or silence does not mean ownership was released.

Assign one active writer per overlapping scope. Prefer disjoint files. A directory assignment includes its files unless explicit exclusions are agreed; renames, deletions, generated output and side-effecting commands count as writes. Split a file only when regions are genuinely independent and editing tools can preserve concurrent changes; otherwise assign the whole file to one owner. The same record, generated bundle, shared config or test environment needs a single writer too. Read access is not write ownership.

Ask workers to propose any necessary edit outside their scope to the lead. The lead applies it in its own unassigned scope or arranges an explicit handoff; it does not quietly edit an active worker's files. Batch unavoidable shared changes under one owner instead of giving every worker the shared file.

## Settle interfaces and release dependencies
Agree the smallest shared contract before dependent implementation: inputs/outputs, affected schema or symbols, error behavior and relevant acceptance. Give consumers the same contract and baseline. A changed contract goes through the lead, which updates affected briefs before consumers proceed; workers do not invent competing versions.

Start a dependent write only after its prerequisite is actually available and verified at the stated location/revision. A plan, progress message or finished worker without an inspected artifact is not a handoff. Block only dependent work; independent branches can continue.

At handoff, return the actual artifact/revision, changed paths or records, interface changes, checks and unresolved concerns. The lead verifies the result and releases or transfers the scope explicitly. Transfer ownership only after the former writer and its in-flight mutations have stopped or completed, with host-supported confirmation; sending a stop message alone is insufficient. A replacement receives the preserved work and current state, not a stale original brief.

## Coordinate shared checkout and tool state
Separate checkouts isolate edits but do not resolve semantic conflicts or isolate shared services. Use host-supported isolation when useful; do not assume another agent sees the lead's filesystem or latest revision. Include the actual baseline and integration route in the brief.

In a shared checkout, serialize index, branch, commit and history mutations under the assigned Git/integration owner. Workers do not stage others' edits, switch branches, reset or clean a shared tree to prepare their own work. Run repo-wide formatters, generators and dependency updates under one owner after affected writers settle, or explicitly exclude their output from other scopes.

Treat simulators, shared ports, databases, fixtures and deployments as mutable resources too. Give independent workers isolated instances when supported and authorized; otherwise schedule exclusive use. A test that resets shared state must not race another worker's verification. Avoid ad hoc locks with no reliable release mechanism.

## Integrate and recover deliberately
One owner integrates in dependency order. Inspect actual worker changes against the current target and preserve unrelated edits. In a shared tree the changes may already be present; do not reapply them as if they came from an isolated branch. Reconcile semantic disagreements even when text merges cleanly.

On an unexpected edit, stale baseline, ownership collision or contract change, pause the affected writes and notify the lead with scope and evidence. Preserve both sets of work. Do not overwrite, revert, regenerate or resolve a conflict by taking one side without inspection. The lead identifies current state, resolves the overlap within accepted scope, updates assignments and resumes only affected work. Repeated collisions call for a smaller split or a single writer.

Before final verification/review, establish a stable integrated revision or artifact with no in-flight writes to the reviewed scope. Read-only preparation may overlap implementation, but record the exact revision for final findings and checks. Later changes invalidate only affected evidence and require corresponding rechecks. Finish against the integrated result, not a collection of individually passing worker reports.
