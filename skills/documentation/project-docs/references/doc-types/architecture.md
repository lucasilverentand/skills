# Doc Type: Architecture (`docs/architecture.md`)

```markdown
# Architecture

## System overview
High-level description of the system and a diagram showing major components and how they connect.

## Components
For each major component:
- **Name** — what it is and what it's responsible for
- **Technology** — runtime, framework, language
- **Communicates with** — which other components and how (HTTP, events, shared DB, etc.)
- **Deployed as** — container, serverless function, static site, etc.

## Data flow
How data moves through the system for the most important operations. Use diagrams (Mermaid) where possible.

## Infrastructure
Where things run: cloud provider, regions, key services (database, cache, queue, CDN).

## Key design decisions
Brief notes on non-obvious architectural choices and why they were made. Link to decision records in `docs/decisions/` for longer explanations.

## Boundaries and constraints
- External dependencies and SLAs
- Rate limits, quotas, or capacity constraints
- Security boundaries (what trusts what)
```

**Guidance:**
- Start with a Mermaid diagram — it's worth more than paragraphs of prose
- Components should map to actual deployable units or packages, not abstract layers
- Data flow should cover the 2-3 most common paths, not every edge case
- Link to decision records for "why" — architecture doc covers "what" and "how"
