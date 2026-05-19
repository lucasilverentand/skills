---
name: project-brief
description: Writes project brief documents from the project-docs template. Use when the user asks for a project brief, wants a one-page kickoff or framing document, needs scope and success criteria for a new project, or is filling project-brief.md.
---

# Project Brief
Use this skill to turn early project intent into the project-level anchor: why it should exist, what is in scope, and how success will be judged.

## Decision tree
- What is the user asking for?
  - **A new project brief** -> read `../../README.md` and `references/template.md`, then draft the brief in the requested destination.
  - **Audience detail or market assumptions** -> use the `customer-profile` skill and link to that document from the brief instead of copying the detail.
  - **Feature behavior or acceptance criteria** -> use the `feature-spec` skill and keep only project-level scope in the brief.
  - **External platform, vendor, API, OS, or hardware dependency** -> use the `platform-dependency` skill and link to it from the brief.
  - **Something else** -> ask one short question about whether the user needs project framing or a narrower downstream document.

## Workflow
1. Read `../../README.md` for shared conventions and the project-docs chain.
2. Read `references/template.md` before drafting or editing.
3. Gather the project name, audience, reason to exist, core experience, scope boundary, success criteria, risks, and open questions.
4. Keep it compact. The brief should be enough to justify the project and point to deeper docs.
5. Use `related:` for customer profile, platform dependency, and feature spec links when those documents exist or are planned.
6. Remove prompt comments from sections you fill. Leave open questions explicit instead of hiding uncertainty in polished prose.

## Document contract
- **When to write**: At the start of a project, before commitment.
- **How many**: One per project.
- **Owns**: Project purpose, principles, scope boundary, success criteria, assumptions, and open questions.
- **Link instead of duplicating**: Audience detail, feature behavior, dependency analysis, technical implementation, and release evidence belong in their own documents.
