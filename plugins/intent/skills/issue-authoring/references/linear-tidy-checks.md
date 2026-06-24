# Linear project tidy checks
Use this reference during a `tidy-linear-project` run. Each section lists what to look for, typical tidy actions, and what stays out of scope.

## Contents
- [Duplicates and overlap](#duplicates-and-overlap)
- [Stale blockers](#stale-blockers)
- [Field hygiene](#field-hygiene)
- [Document drift](#document-drift)
- [State hygiene](#state-hygiene)
- [Missing links](#missing-links)

## Duplicates and overlap

### Look for
- Issues with nearly identical titles or acceptance criteria in the same milestone.
- Parent and child issues that restate the same outcome without a split in deliverables.
- Open issues that repeat work already Done or Canceled under another identifier.
- Speculative Suggestion issues that duplicate committed Todo work.

### Tidy actions
|Finding|Auto-safe|Suggest|Out of scope|
|---|---|---|---|
|Exact duplicate open issue|—|Mark one as duplicate of the other or merge after human confirmation|—|
|Partial overlap|—|Keep the sharper issue; link the other as related; move unique AC into one description|Rewriting scope to combine unlike outcomes|
|Done work still tracked as open duplicate|—|Close or mark duplicate with evidence link|—|

### Evidence to collect
- Issue IDs, titles, states, and milestone.
- Overlapping acceptance criteria bullets quoted side by side.
- Recommendation: merge, mark duplicate, or relate only.

## Stale blockers

### Look for
- `blocked by` relations where the blocker is Done, Canceled, or will not be done.
- Blockers that only expressed "read this first" or soft ordering.
- Blocked issues making progress despite the blocker.
- Circular or long blocker chains with no active unblocker.

### Tidy actions
|Finding|Auto-safe|Suggest|Out of scope|
|---|---|---|---|
|Blocker is Done/Canceled|Remove blocker relation|—|—|
|Soft preference encoded as blocker|—|Remove blocker; add related link or comment|—|
|Blocker still valid but stale description|—|Comment on blocker issue to refresh status|Changing product sequencing|
|Circular blockers|—|Propose one relation to remove|—|

## Field hygiene

### Look for
- Missing or vague acceptance criteria on execution-bound issues.
- Missing priority on issues where business urgency is known.
- Missing milestone on issues that clearly belong to a delivery phase or release.
- Labels missing when peer issues in the same area share a consistent label set.
- Planning issues in execution milestones, or execution issues still in planning-only milestones.
- Missing complexity score when scope is clear enough to score.

### Tidy actions
|Finding|Auto-safe|Suggest|Out of scope|
|---|---|---|---|
|Label exists on peers, missing here|Add same existing label|—|—|
|No acceptance criteria|—|Draft AC from description and ask for confirmation|Changing what the issue delivers|
|Wrong priority vs stated urgency|—|Suggest priority change with rationale|Reprioritizing the roadmap|
|Wrong milestone|—|Suggest milestone move|Moving work across phases as a scope decision|
|Missing product or area label|—|Suggest label if convention is clear|Creating many new labels|
|Missing complexity score|Add score when acceptance criteria and scope are clear|Suggest a score or split when scope is unclear|Scoring placeholder or tracker issues|

### Acceptance criteria bar
Useful acceptance criteria are checkable, bounded, and testable. Suggest additions; do not silently rewrite existing AC that changes meaning.

## Document drift

### Look for
- Project document claims a milestone or scope that open issues contradict.
- Issues reference documents that moved, were archived, or were renamed.
- Decisions recorded only in comments but not in a decision record or project doc when the team uses that convention.
- Repo `documents/` paths mentioned in Linear without a matching link from the project doc.
- Duplicate copies of the same brief or spec in multiple surfaces.

### Tidy actions
|Finding|Auto-safe|Suggest|Out of scope|
|---|---|---|---|
|Issue mentions doc by title, no link|Add link when URL is known|—|—|
|Doc outdated vs issues|—|List sections to update; propose patch text|Rewriting history or deleting old doc versions|
|Decision only in comment|—|Suggest creating or updating a decision record|Making the decision itself|
|Duplicate canonical docs|—|Point to one canonical surface; suggest link-only copies|—|

Prefer suggesting a short doc update or a comment on the project with a bullet list of drift. Do not replace the whole document in one tidy pass.

## State hygiene

### Look for
- Issues in In Progress with no recent activity and no linked implementation evidence.
- Todo issues with completion evidence in comments or linked work.
- Canceled issues still blocking others.
- Done issues still blocking open work.
- Suggestion issues that were promoted to real work but left open.

### Tidy actions
|Finding|Auto-safe|Suggest|Out of scope|
|---|---|---|---|
|Done blocker blocking open issue|Remove blocker|—|—|
|Clear completion evidence, still Todo/In Progress|—|Move to Done with comment citing evidence|—|
|Stale In Progress, no evidence|—|Suggest move to Todo or comment asking planner|—|
|Ambiguous completion|—|Ask for confirmation|Marking done without evidence|

### Evidence that counts
- Merged PR, commit, release, or deployment note tied to the issue.
- Explicit "done" or "shipped" from the owner in Linear.
- Parent issue closed with all children done when this issue was tracking only.

Does not count: old activity dates alone, label changes, or title edits.

## Missing links

### Look for
- Milestones with no linked issues while issues use the milestone name only in text.
- Project documents not linked from kickoff, gate, or retrospective issues.
- Related work in the same milestone with no `related to` link when context is shared.
- Initiative or dependency docs not linked from issues that name them in prose.
- Cross-project dependencies described in text without a Linear relation.

### Tidy actions
|Finding|Auto-safe|Suggest|Out of scope|
|---|---|---|---|
|Same milestone, obvious shared context|Add related link|—|—|
|Doc URL known, not linked from issue|Add markdown link in issue or comment|—|—|
|Cross-team dependency|—|Suggest related or comment with planner tag|Creating new projects or issues|
|Should be a blocker|—|Suggest blocker after confirming strict dependency|—|
