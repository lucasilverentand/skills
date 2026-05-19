---
name: decision-record
description: Writes decision record documents from the project-docs template. Use when the user asks for a decision record, wants to capture why a choice was made, needs options and trade-offs preserved, or is filling decision-record.md.
---

# Decision Record
Use this skill to preserve a decision that future work may need to understand without forcing every affected document to retell the same rationale.

## Decision tree
- What is the user asking for?
  - **A new decision record** -> read `../../README.md` and `references/template.md`, then draft the record in the requested destination.
  - **A design that has not been chosen yet** -> use the `technical-design` skill for options and review, then create a decision record once the choice is made.
  - **Research evidence behind the decision** -> use the `research-brief` skill and link it from the decision record.
  - **Follow-up implementation work** -> capture follow-up issues in the record and file them only when the user asks or the repo workflow requires it.
  - **Something else** -> ask what decision was made, what alternatives were considered, and what trade-off was accepted.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `references/template.md` before drafting or editing.
3. Capture the decision, context, options considered, chosen option, trade-offs, follow-up work, and review trigger.
4. Write the decision in the past or present tense, not as a proposal, unless the user explicitly wants a draft.
5. Keep options concrete. Name what was rejected and why, including cost, risk, timing, maintenance, and product effects.
6. Link affected briefs, specs, technical designs, dependency docs, research briefs, PRs, and issues.

## Document contract
- **When to write**: After choosing a product, technical, operational, or process direction that future work may need to understand.
- **How many**: One per important decision.
- **Owns**: Decision, context, options, chosen direction, trade-offs, follow-up work, and review trigger.
- **Link instead of duplicating**: Deep research belongs in research briefs; implementation plans belong in technical designs; feature behavior belongs in feature specs.
