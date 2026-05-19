---
name: documentation-placement-rules
description: Writes documentation placement rules from the project-docs template. Use when the user asks where docs should live, wants a documentation placement rulebook, needs Linear versus repo documentation ownership, or is filling documentation-placement-rules.md.
---

# Documentation Placement Rules
Use this skill to create or update the rulebook that tells a project where each kind of planning, repo, and code-level document belongs.

## Decision tree
- What is the user asking for?
  - **A new placement rulebook** -> read `../../README.md` and `../../documents/documentation-placement-rules.md`, then draft the document in the requested destination.
  - **A decision about where one doc should live** -> use the placement table from `../../documents/documentation-placement-rules.md`, explain the chosen surface briefly, and create or update the doc there if asked.
  - **Updates to existing placement rules** -> preserve established owners, review expectations, and cross-linking conventions unless the user explicitly changes them.
  - **A different project document type** -> use the matching project-docs skill for that document and consult this template only for placement.
  - **Something else** -> ask one short clarifying question about the document surface or ownership decision.

## Workflow
1. Read `../../README.md` for shared conventions, status values, and how project documents relate.
2. Read `../../documents/documentation-placement-rules.md` before drafting or editing.
3. Identify the documentation surfaces in play: Linear initiative, Linear project, Linear issue, repo `documents/`, package docs, README, or code comments.
4. Decide ownership by durability, review path, and who needs to find the document later.
5. Keep the rules usable. Prefer a table for document type, destination, owner, linked docs, and reason.
6. Update frontmatter and `related:` references when writing a concrete document.

## Document contract
- **When to write**: When a repo, app, product area, or initiative has more than one plausible documentation surface.
- **How many**: One per app, product area, or repo.
- **Owns**: Placement decisions, ownership expectations, review triggers, and cross-linking conventions.
- **Link instead of duplicating**: Specific project scope, feature behavior, technical designs, release checks, and reviews belong in their own documents.
