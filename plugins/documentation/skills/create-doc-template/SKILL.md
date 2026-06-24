---
name: create-doc-template
description: Maintains Markdown document templates in the documentation plugin's project-docs library. Use when working in this skills repo and the user asks to add a reusable project document template, update an existing template reference, change the project-docs template library, or adjust README/template validation for project-docs.
---

# Create Doc Template
Create document templates that fit the project-docs library instead of importing a generic industry checklist.

## What good looks like
- The template has a clear owner in the document system: when to write it, how many copies exist, and which other templates it should link to instead of repeating.
- The empty template is useful. Headings and prompts tell the writer what belongs there, what evidence helps, and what to leave out.
- The outline borrows from industry practice, then cuts anything that would create stale paperwork.
- The template works across project types unless the requested document is intentionally narrow.

## Decision tree
- What is being changed?
  - **A new document template** -> follow the full workflow below, add the template under the consolidated project-docs references directory, update `project-docs` routing if needed, update the plugin `README.body.txt`, and run the project checks.
  - **An existing template** -> read the current template, identify the ownership or prompt gap, then update the smallest section that fixes it.
  - **Project document routing** -> update `../project-docs/SKILL.md` so the selector, routing rules, and references table point to the maintained template.
  - **A specific project document instance** -> use the `project-docs` skill; this skill is only for reusable templates in the consolidated project-docs references directory.
  - **Something else** -> ask whether the user wants a reusable project-docs template or a filled project document.

## Workflow
1. Read `../../README.body.txt`, `../project-docs/SKILL.md`, and nearby `../project-docs/references/*-template.md` files before drafting. Use the closest existing template for pacing, prompt density, and section size.
2. Define the template contract in plain language: when it is written, who reads it, what decision or review it supports, and which template owns adjacent details.
3. Do a lightweight research pass on current examples, standards, or common outlines for the document type. Keep notes on useful section ideas, not source prose.
4. Build the outline by subtraction. Start from the common industry shape, then remove sections that duplicate another template, ask for facts no one will maintain, or exist only to look complete.
5. Draft the Markdown using the repo conventions below.
6. Update the plugin `README.body.txt` when adding a public template: add the table row and any relationship note needed to prevent duplicate ownership.
7. Run `bun run check` before finishing. If dependencies are missing, run `bun install` first.

## Repo conventions
- Use YAML frontmatter with `title`, `status`, `owner`, and `last_updated`. Match the existing templates for default values unless the user gives different values.
- Use one H1 matching the template title.
- Use sentence-case headings.
- Use numbered H2 sections. Use H3/H4 only when the section genuinely has repeated parts or a stable internal structure.
- Put `---` between every H2 section, but not before the first or after the last.
- Avoid generic "Scope" openers. If the document needs orientation, put a short prompt under the H1. Keep `## 1. Summary` only when summary is the first real section.
- Use Markdown tables for matrices, schemas, acceptance criteria, contracts, options, risks, and rollout phases when a table makes review easier.
- Use Mermaid for flows, state machines, sequences, component boundaries, and rollout paths when a small diagram answers a review question better than prose.
- Keep Markdown Prettier-friendly with `proseWrap: never`.

## Prompt writing
- Put section instructions in HTML comments using `<!-- Prompt: ... -->`.
- Write prompts as instructions for the person or LLM filling the section, not as descriptions of the section.
- Include the shape of the expected answer: paragraph, bullets, numbered list, table, Mermaid diagram, links, or examples.
- Name useful evidence: issues, source docs, customer signals, measurements, prototypes, decisions, releases, or code locations.
- Name boundaries. Tell the writer which related template owns details that should be linked instead of copied.
- Keep the wording concrete. Prefer "Name the decision, the constraint that forced it, and the trade-off accepted" over "describe context."
- Tell the writer when to delete a section, say "not applicable," or leave a question open. Empty template sections should not survive by accident.
- Preserve the repo's privacy posture. Do not ask writers to collect personal data unless the template's purpose truly requires it.

## Final check
Before handing off, verify:

- The new or changed template matches the README conventions.
- The template contract is clear enough to add to the README table.
- Each section has a useful prompt or intentionally needs no prompt.
- The outline is short enough to fill during real project work.
- Tables and diagrams are suggested where they clarify review, not everywhere.
- The plugin `README.body.txt` lists the template if it belongs in the public template library.
- `bun run check` passes, or the blocker is recorded with the exact failure.
