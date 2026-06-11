---
name: write-design-doc
description: Assembles architecture, data modeling, and API design work into a structured, readable system design document. Focuses on writing quality, document structure, and completeness — the thinking work (decomposition, trade-offs, data modeling) happens in other skills and this skill pulls the results together into a single artifact that engineers and LLMs can implement from. Use when the user asks to write a design doc, document a design, write up the architecture, create a technical spec, assemble a system design, or says things like "write this up", "let's document the design", "create a design doc for this", or "turn this into a spec".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Write a Design Doc
Assembles a system design into a structured document that engineers and LLMs can understand, implement from, and maintain. This skill is about the DOCUMENT — structure, sections, writing quality, completeness. The intellectual work of decomposing systems, analyzing trade-offs, modeling data, and designing APIs happens in other skills; this skill pulls their outputs together into a coherent, readable artifact.

## Current context
- Existing architecture artifacts: !`ls .context/architecture/ 2>/dev/null || echo "none yet"`

## Decision tree
- What does the user need?
  - **Writing a full design doc for a new system** → follow the full process below
  - **Updating an existing design doc** → read the current doc, apply changes, preserve the existing structure
  - **Quick informal sketch** → talk through it in chat, offer to formalize into a doc later
  - **User hasn't done the design thinking yet** → hand off to `design:architecture` first when available, come back here when the thinking is done
  - **User wants to review an existing doc** → hand off to `design:design-review` when available

## Document structure
Every design doc has these 10 sections. Each one has content or an explicit "N/A — reason."

### 1. Summary
2-3 sentences: what is being built, who it's for, why now. A reader should know whether this doc is relevant to them after reading this paragraph alone.

### 2. Requirements
Functional and non-functional. If requirements were gathered with the `intent:requirements` skill, link to that output rather than duplicating. Otherwise, capture them inline. Non-functional requirements need concrete targets: "p99 latency < 200ms" not "fast."

### 3. High-level architecture
Components and how they communicate. Include a Mermaid diagram — delegate to `design:c4-diagrams` if the system has more than 4-5 components. Name concrete technology for each component: "Orders Worker (Cloudflare Workers, Hono)" not "Orders Service."

### 4. Data model
Entities, relationships, ownership, storage engine. If the model is detailed, link to the `design:data-modeling` output rather than duplicating the full schema here. At minimum, show the core entities and their relationships.

### 5. Key flows
Walk 2-4 important request paths end-to-end. At least one happy path and one failure/error path. Use numbered steps, not prose paragraphs:

1. Client sends POST /orders with cart_id
2. Orders Worker validates the cart exists (D1 lookup)
3. ...

### 6. API surface
Main endpoints or operations. If the API is substantial (>5 endpoints), delegate to `design:api-design` and link to its output in `.context/architecture/api/`. Here, show only the most important operations with their signatures.

### 7. Non-functional story
How the design meets EACH non-functional requirement from section 2. Be specific and tie back to concrete mechanisms: "handles 5k req/s because Workers auto-scale per-isolate and D1 read replicas serve reads from edge" — not "scales well."

### 8. Trade-offs
|Decision|Chose|Rejected|Why|
|---|---|---|---|
|...|...|...|...|

Every non-obvious choice gets a row. Give rejected options their real best case — strawman comparisons are useless.

### 9. Open questions
What's unclear, what needs input from others, what was deliberately punted. Mark each with who needs to answer and a rough deadline if applicable.

### 10. Next steps
Concrete first actions to de-risk the design. Not "implement the system" but "set up the D1 schema and seed test data to validate the query patterns."

## Writing principles
These are non-negotiable. A design doc that violates these is worse than no doc at all.

- **Write for a junior engineer or a weaker LLM model.** The next reader may not have been in the room when the design was discussed. They need to understand the system from the doc alone.
- **Explain jargon the first time you use it.** "the outbox pattern (write events to a DB table in the same transaction as the state change, then a worker publishes them)" — not just "the outbox pattern."
- **State the WHY next to every choice.** Not "uses Postgres" but "uses Postgres because transactional writes across orders and line_items must be atomic." Every technology, pattern, and boundary needs a reason.
- **Be concrete.** Name files, services, cloud resources, paths. "Orders Worker owns `orders` and `line_items` in D1 (`orders-db`)" beats "Orders service handles order data."
- **Mark uncertainty.** Write "TBD: expected write/read ratio" — not a made-up number. Fake precision is worse than an honest gap.
- **Prefer trade-offs over recommendations.** "Chose KV over D1 for sessions because lookups are single-key and KV is 10x cheaper at this access pattern, giving up SQL queryability" is more useful than "uses KV."
- **Add a Glossary section** when the doc uses 5+ specialized terms. Place it at the end, keep it alphabetical and skimmable.

## Output
Write the finished doc to `.context/architecture/<name>.md`. After writing:

1. If `.context/overview.md` exists, add a pointer to the new doc from it
2. If major decisions were made during the writing, suggest capturing them individually as ADRs via `design:write-adr`
3. If the user will build next, suggest concrete first implementation steps

## Verification checklist
Before considering the doc done, verify:

- [ ] Does every section have content or an explicit "N/A — reason"?
- [ ] Do NFR targets in the doc match the architecture's actual capabilities?
- [ ] Are all trade-offs documented, not just the obvious ones?
- [ ] Is there a glossary for specialized terms (if 5+ are used)?
- [ ] Do diagrams match the prose — same component names, same data flows?
- [ ] Can a reader who missed all design discussions implement from this doc?

## Cross-references
|When|Use|
|---|---|
|Need to gather requirements first|`intent:requirements` if installed|
|Need to do architecture thinking|`design:architecture` if installed|
|Need a data model|`design:data-modeling` if installed|
|API surface is substantial|`design:api-design` if installed|
|Need a diagram|`design:c4-diagrams`|
|Decisions deserve individual records|`design:write-adr`|
|Want to review the finished doc|`design:design-review` if installed|

## Key references
|File|Covers|
|---|---|
|`references/design-template.md`|Filled-in example of the design doc structure|
