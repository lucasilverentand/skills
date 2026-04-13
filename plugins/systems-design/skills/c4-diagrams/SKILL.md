---
name: c4-diagrams
description: Generates C4 model architecture diagrams (System Context, Container, Component) as Mermaid for embedding in docs — picks the right C4 level for the question being answered, labels every element with its technology and responsibility, and avoids the "everything touches everything" spaghetti that makes most architecture diagrams useless. Writes to .context/architecture/diagrams/. Use when the user asks for a diagram of their system, an architecture visualization, a container/component diagram, wants to see how pieces fit together, or mentions "C4".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# C4 Diagrams

The C4 model gives you four levels of zoom on a software system — Context, Container, Component, Code. Most architecture diagrams try to show everything at once and end up showing nothing useful. C4 fixes that by making you pick one level and one audience.

## Current context

- Existing diagrams: !`ls .context/architecture/diagrams/ 2>/dev/null || echo "(none yet)"`

## Decision tree

- What question is the diagram answering?
  - **"What does this system do and who uses it?"** → Level 1: **System Context** — the system as a black box, its users, and the external systems it talks to
  - **"What are the major runnable pieces and how do they talk?"** → Level 2: **Container** — apps, services, databases, queues, each with its own process/runtime
  - **"What's inside this one container?"** → Level 3: **Component** — modules/classes/packages within a single container
  - **"How does this class/function work?"** → Level 4: **Code** — skip it, use the actual code or a UML class diagram tool
  - **"Show me the whole system"** → push back. C4 is valuable because it forces one level at a time. Ask which level they need, or offer to produce a Context + a Container diagram.
  - **"I need a sequence/flow diagram, not structure"** → C4 is for structure. Produce a Mermaid `sequenceDiagram` or `flowchart` instead, and tell the user that's what you're doing.

## The four levels

### Level 1 — System Context

**Audience:** anyone (execs, product, new hires)
**Shows:** the system as a single box, users (people), and external systems it depends on or integrates with
**Don't show:** anything *inside* the system

Use when: introducing the system to someone, scoping a conversation, defining the boundary.

### Level 2 — Container

**Audience:** engineers, architects
**Shows:** deployable/runnable units — web apps, APIs, workers, databases, queues, caches — and the protocols they use to talk
**Don't show:** classes, functions, or internal modules

Use when: explaining the runtime architecture, onboarding engineers, planning deploys, discussing scaling.

### Level 3 — Component

**Audience:** engineers working in a specific container
**Shows:** the major modules/packages/classes inside one container and how they collaborate
**Don't show:** other containers in detail — they're just labeled boxes at the edge

Use when: explaining the internals of a service, planning a refactor, documenting a module boundary.

### Level 4 — Code

Skip it. Real code diagrams go stale instantly and the IDE already shows them. If the user really wants one, produce a Mermaid `classDiagram` and call it out as "code-level, likely to drift."

## Producing a diagram

### 1. Pin down scope

Use `AskUserQuestion` if unclear:

1. **Which level** — Context, Container, or Component?
2. **Which system/container is the subject?** — C4 always has a single "system in focus"
3. **Who's the audience?** — affects how much jargon and tech detail to include
4. **What source material do you have?** — existing design docs, `.context/`, code to read, or just conversation

If `.context/architecture/` already has a design doc, read it first — diagrams should match the words.

### 2. Gather the elements

Walk through the system and list:

- **People (actors)** — only for Context level; in Container/Component, people go at the edge
- **The system in focus** — for Context, a single box; for Container, expanded into its containers; for Component, expanded into one container's components
- **External systems** — anything outside the boundary the system talks to
- **Relationships** — for each arrow, note: source, target, purpose, protocol/tech

A good rule of thumb: if you can't label the *purpose* of an arrow in ~5 words, the relationship is too vague to draw.

#### Default stack primitives

When diagramming systems built on the default stack (see `../architecture/references/third-party.md` and `../architecture/references/deploy.md`), use these standard labels and shorthand:

| Primitive | Label format | Responsibility |
|---|---|---|
| Worker (API) | `<Name> API [Hono on Workers]` | HTTP request handling, validation, auth |
| Worker (service) | `<Name> Worker [Worker]` | Queue consumer, cron job, background processing |
| Postgres | `<Name> DB [Postgres / Neon]` | Source of truth, transactional writes |
| Queue | `<topic-name> [CF Queue]` | Async event delivery, retry/DLQ |
| Durable Object | `<Name> DO [Durable Object]` | Per-key state: rate limits, WebSocket rooms, counters |
| KV | `<Name> [CF KV]` | Key-value cache, config, feature flags |
| R2 | `<Name> [CF R2]` | Object storage, file uploads, access logs |
| D1 | `<Name> [CF D1]` | Lightweight SQLite for tiny projects |
| External: Neon | `Neon [Postgres]` | Managed serverless Postgres (EU region) |
| External: PostHog | `PostHog [External]` | Analytics, errors, feature flags |
| External: Resend | `Resend [External]` | Transactional email |
| External: Polar.sh | `Polar.sh [External]` | Payments and billing (web) |
| External: RevenueCat | `RevenueCat [External]` | In-app purchase management (mobile) |
| External: Better Stack | `Better Stack [External]` | Uptime monitoring and alerting |

Use `Service Binding` as the protocol label for Worker-to-Worker calls within the same CF account (no network hop). Use `Queue` for async inter-service communication.

### 3. Write the Mermaid

Use `flowchart` with subgraphs for the system boundary. Mermaid doesn't have native C4 support across all renderers, but flowchart with consistent styling works everywhere. See `references/mermaid-c4.md` for templates for each level.

Conventions to keep diagrams readable:

- **Every element has:** a short name, a type (`[Person]`, `[Web App]`, `[Database]`), and a one-line responsibility
- **Every relationship has:** a verb phrase and, where it matters, the protocol ("reads via HTTPS/JSON")
- **Boxes inside the boundary** are styled differently from external systems — use subgraphs and node styling
- **Max ~15 elements per diagram** — if you have more, you're probably mixing levels. Split or zoom out.
- **No spaghetti** — if arrows cross more than a couple of times, reorder elements. If you can't, the relationships are too dense for one diagram.

### 4. Write the file

Output to `.context/architecture/diagrams/<name>-<level>.md` (e.g., `orders-service-container.md`). The file should contain:

1. A title: `# Orders Service — Container Diagram`
2. A one-paragraph description: what it shows and what it doesn't
3. The Mermaid block
4. A legend listing each element with its responsibility (redundant with the diagram but searchable and copy-pasteable)
5. Links to related diagrams ("see also: `orders-service-context.md`")

### 5. Link from the design doc

If there's a design doc in `.context/architecture/`, add a link to the new diagram file. Diagrams that no doc references get stale fast.

## Writing principles

- **One level per diagram, always.** If you're tempted to "just add the database icon to the context diagram", stop — make a container diagram instead.
- **Label responsibility, not just names.** `Orders API (Hono on Workers)` alone is worse than `Orders API (Hono on Workers) — accepts order writes, publishes events`.
- **Show the boundary.** The whole point is to make "what's ours vs. what's theirs" visible. Subgraph the in-scope system.
- **Tech on the element or on the arrow, not both.** Pick one style and stay consistent within a diagram.
- **If it's confusing, remove elements.** A diagram that answers one question well beats one that answers several poorly.

### Write so a junior reader can use it

A diagram without prose is usually a riddle. Pair every diagram with:

1. **A one-paragraph "what this shows and doesn't show"** — so a reader knows if they're looking at the right picture for their question.
2. **A numbered walkthrough of the main flow** — "1. The customer hits the storefront. 2. The storefront calls the Orders API with the cart. 3. The API writes to Postgres and the outbox table in one transaction. 4. A worker drains the outbox and publishes to the queue. 5. Consumers (inventory, email) pick up the event." This makes the arrows readable even for someone who doesn't recognize the shorthand.
3. **A legend with each element's one-line responsibility.** Redundant with the node labels but searchable and copy-pasteable into tickets.
4. **A short glossary for any technology that's not universal** — "Hono: a fast web framework for edge runtimes. Cloudflare Queues: a managed message queue that runs on Workers." Two lines, huge difference for a reader who's new to the stack.

Remember: the diagram is for the *reader*, not the writer. A junior engineer or a weaker LLM model should be able to answer "what does this system do?" after reading the diagram + the surrounding prose. If they can't, the prose needs more explanation.

## Key references

| File | Covers |
|---|---|
| `../architecture/references/third-party.md` | Default vendors and stack primitives for diagram labels |
| `../architecture/references/deploy.md` | Monorepo layout and Worker topology |
| `references/mermaid-c4.md` | Mermaid templates for Context, Container, and Component levels with styling |
