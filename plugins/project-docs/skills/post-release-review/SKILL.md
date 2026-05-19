---
name: post-release-review
description: Writes post-release review documents from the project-docs template. Use when the user asks for a post-release review, wants a retrospective after shipping or abandoning work, needs lessons and follow-up issues captured, or is filling post-release-review.md.
---

# Post-Release Review
Use this skill to compare what happened against the plan and turn useful lessons into durable decisions or follow-up work.

## Decision tree
- What is the user asking for?
  - **A new post-release review** -> read `../../README.md` and `../../documents/post-release-review.md`, then draft the review in the requested destination.
  - **The release has not shipped yet** -> use the `release-readiness` skill until there is an outcome to review.
  - **A decision worth preserving** -> use the `decision-record` skill and link it from the review.
  - **Follow-up work outside the review** -> file or draft issues only when the user asks, or when repo instructions require filing later work.
  - **Something else** -> ask what shipped, stalled, rolled back, or was abandoned.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `../../documents/post-release-review.md` before drafting or editing.
3. Gather what happened, what changed from the plan, what worked, what did not, decisions worth keeping, debt created, and follow-up issues.
4. Link release readiness, feature specs, decision records, incidents, PRs, changelog entries, and follow-up issues where they explain the outcome.
5. Keep the review factual. Avoid blame language and vague lessons that no one can act on.
6. Convert durable decisions and follow-up work into linked records instead of burying them in prose.

## Document contract
- **When to write**: After something ships, stalls, rolls back, or gets abandoned and the team needs to preserve what happened.
- **How many**: One per release or abandoned effort.
- **Owns**: Outcome, plan changes, what worked, what did not, preserved decisions, debt created, and follow-up issues.
- **Link instead of duplicating**: Launch evidence belongs in release readiness; product behavior belongs in feature specs; precedent belongs in decision records.
