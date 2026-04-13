---
name: design-system
description: Produces a system/architecture design from requirements — gathers constraints, proposes components and data flow, picks a data model, defines APIs, calls out non-functional requirements (scale, latency, availability, security), and documents the key trade-offs. Writes the design to .context/architecture/ so downstream AI tools and humans share the same picture. Use when the user asks to design a system, architect a service, sketch out how to build something, plan a new feature's structure, or says things like "how would you build X", "design me a Y", or "what's the architecture for Z".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Design a System

Turns a fuzzy "how should we build this" into a concrete design document that names components, draws the data flow, picks tech, and is honest about trade-offs.

## Current context

- Repo: !`basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "(not a git repo)"`
- Existing architecture docs: !`ls .context/architecture/ 2>/dev/null || echo "none yet"`

## Decision tree

- What does the user want?
  - **Designing a brand-new system from scratch** → follow "Full design" below
  - **Designing one slice of an existing system** (new feature, new service) → read existing `.context/` first, then follow "Full design" scoped to that slice
  - **Just a rough sketch / whiteboard** → skip the document, talk through components and trade-offs in chat; offer to write it up after
  - **The user already has a design and wants feedback** → stop and hand off to `design-review`
  - **The user wants a picture, not a doc** → hand off to `c4-diagrams`
  - **The user wants to capture a single decision** → hand off to `write-adr`

## Full design

### 1. Understand before designing

A design is only as good as the requirements feeding it. Before proposing anything, get the answers to these — ask with `AskUserQuestion` in batches, don't guess:

| Area | What to pin down |
|---|---|
| **Purpose** | What problem does this solve? Who uses it? What does success look like? |
| **Scale** | Users, requests/sec, data volume, growth expectations (today and in 2 years) |
| **Latency / availability** | p50/p99 targets, uptime requirements, acceptable downtime |
| **Consistency** | Can reads be stale? Are writes transactional? What's the blast radius of a bug? |
| **Data** | What entities exist? How do they relate? What's the hot path? |
| **Constraints** | Existing stack, team skills, budget, compliance, deadlines |
| **Integrations** | Upstream/downstream systems, auth providers, payment, third-party APIs |

Skip questions you can infer from context or the codebase — but call out what you assumed so the user can correct you.

### 2. Sketch the shape

Before writing the doc, think through:

- **Bounded contexts / components** — what are the natural seams? Name each one and give it a single responsibility.
- **Data flow** — trace a representative request through the system. Where does it touch? What's synchronous vs. async?
- **State** — which component owns which data? What's the source of truth? Where are caches and how do they invalidate?
- **Failure modes** — what happens when each component is slow, down, or returns garbage? What's the blast radius?
- **Non-functional requirements** — how does the design meet the scale/latency/availability targets from step 1?

If two components share a database, ask whether they should actually be one component. If one component touches everything, ask whether it should be split.

### 3. Pick tech deliberately

Lean on the stack defaults (see `../../references/stack-defaults.md`) and CLAUDE.md before inventing new choices. For greenfield, default to the established stack unless the requirements force a different choice — and if they do, say *why* clearly.

**Key defaults to apply unless there's a reason not to:**

- **Architecture:** monolith-first. Split only when forced by real operational or scaling pain.
- **Data:** Neon (EU region), prefixed ULIDs, `created_at`/`updated_at`/`deleted_at`, soft delete, snake_case tables/columns.
- **Multi-tenancy:** `tenant_id` on every tenant-scoped table + Postgres RLS as backstop.
- **API:** REST + JSON via Hono (public), Hono RPC (internal TS-to-TS). RFC 7807 errors. URL path versioning.
- **Async:** inline for <50ms, Cloudflare Queues otherwise. Outbox pattern for cross-system writes.
- **Auth:** Better Auth (users), scoped API keys (machines). ABAC enforced at middleware + service + RLS layers.
- **Monorepo:** `apps/` + `packages/` + `services/` with `@repo/<name>` packages.
- **Idempotency:** middleware-enforced on all write endpoints.
- **Privacy:** EU-primary data residency, PII encryption, cookieless PostHog analytics.

See `../../references/stack-defaults.md` for the full list with rationale for every choice.

Every tech choice should answer: **what does this buy us, and what are we giving up?** If you can't answer both, you're cargo-culting.

### 4. Write the design doc

Write to `.context/architecture/<name>.md` (e.g., `.context/architecture/orders-service.md`). If `.context/architecture/` doesn't exist, create it. Use this structure — see `references/design-template.md` for the filled-in template.

1. **Summary** — 2-3 sentences: what it is, who uses it, why now
2. **Requirements** — functional + non-functional (scale, latency, availability, security, compliance)
3. **High-level architecture** — components and how they talk, with a Mermaid diagram. If the diagram is complex, delegate to `c4-diagrams` and embed the result.
4. **Data model** — entities, relationships, ownership, storage choice
5. **Key flows** — walk through 2-4 important request paths (happy path + one failure)
6. **API surface** — the main endpoints/operations. If substantial, delegate to `api-design` and link to its output.
7. **Non-functional story** — how the design meets each NFR from step 1. Be specific: "handles 5k req/s because X is horizontally scaled behind Y, with Z as the bottleneck"
8. **Trade-offs** — what you chose, what you rejected, and why. Alternatives that were genuinely considered.
9. **Open questions** — what's still unclear, what needs user input, what you punted on
10. **Next steps** — what should happen first to de-risk this design

### 5. Link it up

After writing:

- Add a pointer from `.context/overview.md` (if it exists) to the new design file
- If major architectural decisions were made, suggest capturing them as ADRs via `write-adr`
- If the user will build this next, suggest concrete first steps (spike, schema draft, proof of concept)

## Writing principles

Architecture docs are for future engineers (and LLMs) who weren't in the room. They should answer "why does it look like this?" — not just "what does it look like?"

**Write for a junior engineer or a weaker LLM model.** Assume the reader is smart but hasn't seen this pattern before. That means:

- **Explain jargon the first time you use it.** When introducing a pattern like "outbox", "saga", "CQRS", "backpressure", "CAP", "eventual consistency", "idempotent", add a one-line parenthetical: *"the outbox pattern (write events to a DB table in the same transaction as the state change, then a worker publishes them — avoids losing events if the queue is down)"*. Cost: a sentence. Benefit: the doc stays useful to the next person who joins.
- **State the why next to every choice.** Not just "uses Postgres" but "uses Postgres because we need transactional writes across `orders` and `line_items`, and the team already runs it in prod". A reader without context can't guess rationale.
- **Prefer plain language over pattern names.** "We write the event into a DB table first, then a background worker publishes it" beats "we use the transactional outbox pattern" — and costs nothing to add *both*.
- **Define acronyms on first use.** RTO (Recovery Time Objective — how long to restore after an incident), RPO (Recovery Point Objective — how much data you can lose), NFR (non-functional requirement), etc.
- **Add a "Glossary" section at the bottom** when the doc uses more than ~5 specialized terms. It's searchable and a junior can skim it.

Other principles:

- **Be concrete** — "Orders service owns the `orders` and `line_items` tables in Postgres (Neon)" beats "Orders service handles order data"
- **Name the files and services** — paths, repo names, cloud resources. If it'll be `apps/orders-api/` in the monorepo, say so.
- **Write for disagreement** — when you make a non-obvious choice, write it so a skeptical reader can either accept or challenge it. Give them something to push back on.
- **Mark uncertainty** — if you don't know the traffic shape or the consistency requirements, say "TBD: expected write/read ratio" instead of inventing one
- **Prefer trade-offs over recommendations** — "chose Postgres over DynamoDB because X, giving up Y" is more useful than "uses Postgres"

## Cross-references

| When | Use |
|---|---|
| User wants a diagram | `c4-diagrams` |
| User wants to capture a specific decision | `write-adr` |
| API surface is substantial | `api-design` |
| User wants critique of an existing design | `design-review` |
| `.context/` doesn't exist yet | Recommend running `project-context` first |

### 6. Verify against stack defaults

After writing the design doc, re-read `../../references/stack-defaults.md` and check for contradictions. If the design deviates from a default, it should be called out explicitly in the "Trade-offs" section with a reason — silent deviations become tech debt.

## Key references

| File | Covers |
|---|---|
| `../../references/stack-defaults.md` | All default technology choices with rationale — the strong prior for every design |
| `references/design-template.md` | Filled-in example of the design doc structure |
| `references/nfr-checklist.md` | Non-functional requirements to consider: scale, latency, availability, security, operability, cost |
