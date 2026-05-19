---
name: customer-profile
description: Writes customer profile and market documents from the project-docs template. Use when the user asks for a customer profile, wants persona or market notes, needs audience assumptions for a project, or is filling customer-profile.md.
---

# Customer Profile
Use this skill to capture audience truth for a project so briefs and feature specs can link to it instead of re-describing users and market assumptions.

## Decision tree
- What is the user asking for?
  - **A new customer profile** -> read `../../README.md` and `../../documents/customer-profile.md`, then draft the profile in the requested destination.
  - **A project brief audience section** -> keep the brief short and link to the customer profile for detailed audience, alternatives, and assumption risks.
  - **Feature-specific user stories** -> use the `feature-spec` skill and reference this profile for audience context.
  - **Research evidence or source trail** -> use the `research-brief` skill and link it from the customer profile where claims depend on evidence.
  - **Something else** -> ask whether the user needs durable audience context or a narrower feature behavior doc.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `../../documents/customer-profile.md` before drafting or editing.
3. Gather who the project serves, what they are trying to do, current alternatives, value drivers, market shape, risks, and unknowns.
4. Separate evidence from assumption. Mark unverified claims as assumptions or open questions.
5. Avoid collecting personal data unless the project genuinely needs it and the user approved that scope.
6. Link to research briefs for evidence trails instead of embedding long source summaries.

## Document contract
- **When to write**: Once there is a rough sense of who the project is for.
- **How many**: One living document per project.
- **Owns**: Audience segments, use contexts, alternatives, value, market notes, assumption risks, and open questions.
- **Link instead of duplicating**: Project justification belongs in the project brief; feature behavior belongs in feature specs; evidence trails belong in research briefs.
