---
name: architecture
description: Guides system architecture and decomposition — turns requirements into a concrete system shape by identifying components, drawing boundaries, tracing data flow, analyzing failure modes, and selecting technology. Covers the intellectual work of breaking a system apart, not the writing of a design document. Use when the user asks to architect a system, decompose a feature into components, figure out how services should talk to each other, evaluate system trade-offs, or says things like "how should we structure this", "what components do we need", "let's think through the architecture", or "where should this logic live".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Architecture
Turns requirements into a concrete system shape — components, boundaries, data flow, failure modes, and technology choices. This is the thinking skill: it's about decomposition and trade-offs, not about writing the document (that's `write-design-doc`), modeling data (that's `data-modeling`), or designing APIs (that's `api-design`).

## Current context
- Project: !`basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "(not a git repo)"`
- Existing architecture artifacts: !`ls .context/architecture/ 2>/dev/null || echo "none yet"`

## Decision tree
- What does the user need?
  - **Designing a new system from scratch** → run the full process below
  - **Adding a new feature or service to an existing system** → read existing `.context/` first, scope the work to the new slice only
  - **Rough sketch or whiteboard discussion** → talk through components and trade-offs in chat, skip the formal output
  - **User already has requirements documented** → read them, proceed to decomposition
  - **User doesn't have clear requirements yet** → hand off to `requirements` first
  - **User wants a picture** → hand off to `c4-diagrams`
  - **User wants to capture a specific decision** → hand off to `write-adr`

## Philosophy
These principles come from `references/philosophy.md` and apply to every architecture decision:

- **Monolith-first.** Split only when forced by real operational or scaling pain — not because a diagram looks cleaner with more boxes. Distributed systems are harder to debug, deploy, and reason about.
- **Extract early when the concept is clear.** If a bounded context is obvious today, draw the boundary now. Don't wait for rule-of-three — waiting creates coupling that's expensive to undo.
- **Lean on existing stack hard.** Every new tool is a new failure mode, a new thing to monitor, a new thing to learn. Deviate when the existing stack genuinely can't do the job, not when a shinier option exists.

## Full process

### 1. Component decomposition
Identify the bounded contexts — the natural seams in the system where one responsibility ends and another begins.

- Each component gets exactly one responsibility, stated in a single sentence.
- If two components share a database, ask whether they should be one component — shared storage is a hidden coupling.
- If one component touches everything, ask whether it should be split — that's a "god service" in disguise.
- Name each component clearly. A name like "processor" or "handler" is a smell; "order-fulfillment" or "payment-gateway" tells you what it does.
- **Prefer fewer components with clear boundaries over many small ones with unclear boundaries.** Each boundary is a maintenance cost — make sure it earns its keep.

### 2. Data flow analysis
Trace 2-3 representative requests through the system end-to-end. Pick flows that exercise different paths: a happy-path read, a write with side effects, and an error case.

For each hop between components:

- Is it **synchronous** (HTTP call, gRPC) or **async** (queue, event)?
- What **protocol** does it use?
- What's the **latency budget** for this hop?

Identify the **hot path** — the flow that handles the most traffic or is most latency-sensitive. Optimize the hot path first; everything else can be "good enough."

Mark where work is **inline** (must complete within the request, <50ms) vs **queued** (can happen later via CF Queues or similar). Queuing is the cheapest way to make a system feel fast — if the user doesn't need the result right now, don't make them wait.

### 3. State ownership
- **Which component owns which data?** Exactly one source of truth per piece of data. If two components both write to the same field, you have a bug waiting to happen.
- **Where are caches?** How do they invalidate? Stale caches are the #1 source of "it works sometimes" bugs.
- **What's the consistency model?** Strong consistency within a single service (same DB transaction). Eventual consistency across services (events, queues). Be explicit about which you're choosing and why.

### 4. Failure mode thinking
For each component, answer:

- **What happens when it's slow?** Do callers time out? Do queues back up? Does the user see a spinner forever?
- **What happens when it's down?** What else breaks? This is the blast radius.
- **What happens when it returns garbage?** Can callers validate responses, or do they trust blindly?
- **Can the system degrade gracefully?** Read-only mode, cached fallbacks, queued writes for later replay — these are the difference between "outage" and "degraded."
- **Are timeouts set everywhere?** An HTTP call without a timeout is a thread leak waiting to happen.
- **Are retries bounded?** Unbounded retries turn a blip into a thundering herd.

### 5. Tech selection
Lean on the reference files (`references/async.md`, `references/resilience.md`, `references/deploy.md`, `references/third-party.md`) for all infrastructure choices. For the data store decision (D1 vs Neon), see `data-modeling`'s "Data store selection" section — the short version: D1 for small/simple, Neon for multi-tenant/complex/compliance. For each technology decision:

- **What does this buy us?** Be specific — "Postgres gives us ACID transactions across these three tables in a single commit."
- **What are we giving up?** Every choice has a cost — operational complexity, vendor lock-in, learning curve.
- **Does it match the existing stack?** If deviating from conventions, say WHY clearly. Deviations are fine; silent deviations are tech debt.

### 6. Trade-off analysis
For each non-obvious decision, structure as:

|Decision|Chose|Rejected|Why|
|---|---|---|---|
|Message passing|CF Queues|Kafka|Queues integrates natively with Workers; Kafka adds ops burden for throughput we don't need|
|Session storage|KV|D1|Sessions are short-lived key-value lookups; KV is cheaper and faster for this access pattern|

Give rejected options their real best case — strawman comparisons are useless. If Kafka genuinely is better for high-throughput ordered streams, say so, then explain why that's not this situation. Tie each decision back to a specific requirement or constraint.

## Cross-references
|When|Use|
|---|---|
|Need to design the data model|`data-modeling`|
|Need to design the API|`api-design`|
|Need a diagram|`c4-diagrams`|
|Ready to write the doc|`write-design-doc`|
|A decision deserves recording|`write-adr`|
|Need to gather requirements first|`requirements`|

## Key references
|File|Covers|
|---|---|
|`references/philosophy.md`|Monolith-first, extract early, lean on existing stack|
|`references/async.md`|Inline vs queue, cron, outbox pattern, realtime (SSE/WebSocket)|
|`references/resilience.md`|Timeouts, retries, circuit breakers, caching, service-to-service|
|`references/observability.md`|Logging, request IDs, metrics, tracing, alerting, access logs|
|`references/deploy.md`|Monorepo layout, deployment, secrets, config, health checks, local dev|
|`references/testing.md`|Test pyramid, Worker tests, DB testing, fixtures, mocking, E2E|
|`references/third-party.md`|Default vendors: email, payments, analytics, search, monitoring|
|`references/privacy.md`|Data residency, PII storage, GDPR deletion, cookie consent|
