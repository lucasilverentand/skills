---
name: design-workflow
description: Guides a full system design from idea to spec — sequences requirements gathering, architecture decomposition, data modeling, API design, and document writing into a coherent workflow with clear handoffs. Use when the user asks to "design a system", "build X from scratch", "architect something end-to-end", "plan a new service", or has a broad design ask that spans multiple concerns. Also use when the user says things like "I need to build X" without specifying which aspect to start with. This is the entry point for any design task that isn't clearly scoped to a single skill (data model only, API only, etc.).
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Design Workflow
Orchestrates a full system design by sequencing the focused skills in the right order. Each skill does one thing well — this skill decides which ones to invoke, in what order, and handles the transitions between them.

This plugin owns the core design skills: `architecture`, `data-modeling`, `api-design`, `design-review`. For full end-to-end work, compose with companion plugin skills when they are installed: `project:requirements`, `documentation:write-design-doc`, `documentation:write-adr`, and `documentation:c4-diagrams`.

## When to use this vs a specific skill
- **User says "design me a system for X"** → use this workflow
- **User says "design the API for X"** → go directly to `api-design`
- **User says "review this design"** → go directly to `design-review`
- **User says "what should the database look like"** → go directly to `data-modeling`
- **User has a broad, ambiguous request** → start here, narrow down

## The design sequence
Not every project needs every step. Skip steps that don't apply, but skip consciously — acknowledge what you're skipping and why.

### Step 1: Scope check
Before doing anything, figure out what already exists:

- Read `.context/architecture/` for existing design artifacts
- Read the codebase for existing schemas, routes, and infrastructure
- Check if requirements, architecture docs, or ADRs already exist

If significant work already exists, don't start from scratch — pick up where the existing work leaves off.

### Step 2: Requirements (skip if scope is clear)
**When to do this:** The user has a vague idea ("I need to build X") or the requirements have gaps that would block architecture decisions.

**When to skip:** The user has a clear, specific ask with known constraints, or existing documentation covers the requirements.

**What to do:** If `project:requirements` is installed, follow it. Otherwise gather the minimum requirements inline. The output is a structured requirements doc in `.context/architecture/requirements/`. The key deliverables are: functional requirements (MoSCoW-prioritized, numbered), NFR targets with concrete numbers, constraints, and open questions.

**Transition:** Once requirements are captured, move to architecture. Carry the requirements doc forward — the architecture skill reads it as input.

### Step 3: Architecture
**Always do this** for new systems. This is the core intellectual work — component decomposition, data flow, failure modes, tech selection.

**What to do:** Follow the `architecture` skill. The output is a set of components with clear boundaries, data flow analysis, failure mode thinking, and tech selection with trade-offs.

**Key decision at this step:** D1 vs Neon (see `data-modeling`'s "Data store selection"). This shapes everything downstream.

**Transition:** Architecture produces the component list and data flow. Hand these to data-modeling for schema design, then api-design for the API surface.

### Step 4: Data modeling
**When to do this:** The system has persistent state (most systems do).

**When to skip:** The system is stateless (pure compute, proxy, or orchestration layer with no database).

**What to do:** Follow the `data-modeling` skill. Start from the entities identified in architecture. The output is a Drizzle schema with IDs, naming, tenancy, timestamps, indexes, and migrations.

**Transition:** The schema informs the API design — resources map to entities, and the API shapes are derived from the schema.

### Step 5: API design
**When to do this:** The system has an HTTP or RPC interface (most systems do).

**When to skip:** The system is purely background (queue consumer, cron job) with no external API.

**What to do:** Follow the `api-design` skill. Start from the resources identified in data modeling and the flows from architecture. The output is a spec with endpoints, schemas, auth, errors, and cross-cutting concerns.

### Step 6: Write the design doc
**When to do this:** The design is substantial enough to document (>1 service, >5 endpoints, non-trivial architecture). Or the user explicitly asks for a design doc.

**When to skip:** Small features, quick additions, or when the user prefers to keep things informal.

**What to do:** If `documentation:write-design-doc` is installed, follow it. Otherwise write the design doc inline from the outputs of steps 2-5. The design doc is the artifact that engineers implement from.

### Step 7: ADRs and diagrams (as needed)
**ADRs:** If any non-obvious decisions were made during the design (new service, new vendor, deviation from defaults), suggest capturing them as ADRs via `documentation:write-adr` when available. Don't create ADRs for every decision — only for genuine trade-offs where the rejected option had real merit.

**Diagrams:** If the system has >4 components or the user wants a visual, produce a C4 diagram via `documentation:c4-diagrams` when available. A Container-level diagram is the most useful default.

### Step 8: Self-review
Before declaring the design done, run a quick self-review using the `design-review` lens:

- Does every NFR have a concrete mechanism in the architecture?
- Are failure modes addressed for each component?
- Is the trade-off table complete?
- Would a junior engineer be able to implement from this doc?

If gaps surface, go back and fill them rather than leaving them as "open questions" — unless they genuinely need input from someone else.

## Working style
- **Don't dump everything at once.** Work through one step at a time. Show the output of each step, check if the user has feedback, then move to the next.
- **Skip freely, but say so.** "Skipping formal requirements gathering since you've already described the scope clearly" is better than silently jumping to architecture.
- **Carry context forward.** Each step builds on the previous one. Reference specific decisions, entity names, and component names from earlier steps.
- **Surface trade-offs at decision points.** When architecture produces a decision (D1 vs Neon, sync vs async, monolith vs service), pause and explain the trade-off before continuing. The user may have a preference.
- **Use `AskUserQuestion` for genuine forks.** When there are two viable paths and the choice affects everything downstream, ask. Don't ask about cosmetic details.
