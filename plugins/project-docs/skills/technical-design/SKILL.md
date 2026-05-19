---
name: technical-design
description: Writes technical design documents from the project-docs template. Use when the user asks for a technical design, wants implementation architecture, needs state, contract, migration, or failure-mode planning, or is filling technical-design.md.
---

# Technical Design
Use this skill to turn settled product scope into an engineering plan that reviewers can evaluate before code changes sprawl.

## Decision tree
- What is the user asking for?
  - **A new technical design** -> read `../../README.md` and `references/template.md`, then draft the design in the requested destination.
  - **Product behavior or acceptance criteria are still unclear** -> use the `feature-spec` skill first, then return to technical design.
  - **A cross-cutting system architecture decision** -> use this skill for implementation structure and a `decision-record` for the chosen direction if it creates precedent.
  - **Testing expectations** -> link to `testing-strategy` for project-wide rules and write only the feature-specific testing plan here.
  - **Something else** -> ask whether the user needs implementation design or a product feature spec.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `references/template.md` before drafting or editing.
3. Gather goals, non-goals, proposed design, state model, interfaces, contracts, failure modes, security, privacy, migration, rollout, testing plan, alternatives, and open questions.
4. Use diagrams or tables for flows, state ownership, API contracts, data models, rollout phases, and alternatives when they make review easier.
5. Preserve trade-offs and rejected options. They are often the part future maintainers need.
6. Link to feature specs, testing strategy, platform dependency docs, research briefs, and decision records where they affect the design.

## Document contract
- **When to write**: After product scope is clear enough to choose implementation shape.
- **How many**: One per feature, system, or infrastructure change that needs engineering review.
- **Owns**: Goals, non-goals, implementation structure, state ownership, contracts, failure handling, migration, rollout, testing plan, alternatives, and open questions.
- **Link instead of duplicating**: Product behavior belongs in feature specs; shared testing rules belong in testing strategy; durable decisions belong in decision records.
