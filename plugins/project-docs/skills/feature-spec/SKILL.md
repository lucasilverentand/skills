---
name: feature-spec
description: Writes feature spec documents from the project-docs template. Use when the user asks for a feature spec, wants user stories or acceptance criteria, needs product behavior documented before implementation, or is filling feature-spec.md.
---

# Feature Spec
Use this skill to capture user-visible behavior, acceptance criteria, lifecycle, edge cases, rollout, and non-goals before implementation work starts.

## Decision tree
- What is the user asking for?
  - **A new feature spec** -> read `../../README.md` and `references/template.md`, then draft the spec in the requested destination.
  - **Project-level framing** -> use the `project-brief` skill and link to that brief from the feature spec.
  - **Technical implementation shape** -> use the `technical-design` skill after feature behavior is clear enough to design.
  - **Audience detail or dependency truth** -> link to `customer-profile` or `platform-dependency` documents instead of repeating them.
  - **Something else** -> ask whether the user needs product behavior or implementation design.

## Workflow
1. Read `../../README.md` for shared conventions and the project-docs chain.
2. Read `references/template.md` before drafting or editing.
3. Gather user stories, acceptance criteria, design references, model concepts, lifecycle, behavior rules, persistence, performance budget, telemetry, edge cases, rollout, and non-goals.
4. Keep acceptance criteria reviewable. Use tables when states, roles, or conditions matter.
5. Link related project brief, customer profile, platform dependency, research brief, and decision record documents.
6. Keep implementation details out unless they are necessary to explain product behavior; move the rest to a technical design.

## Document contract
- **When to write**: Before building a feature with real scope.
- **How many**: One per feature.
- **Owns**: User stories, acceptance criteria, product behavior, model concepts, lifecycle, edge cases, telemetry needs, rollout, and non-goals.
- **Link instead of duplicating**: Project thesis, audience detail, dependency analysis, implementation architecture, and release evidence belong in their own documents.
