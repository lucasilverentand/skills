# Decision Document

## When to use

Recording a significant decision after it's been made — why it was made, what alternatives were considered, and what the consequences are. Decision docs create institutional memory so future teams understand the reasoning.

## How decision docs relate to ADRs

ADRs (Architecture Decision Records) are a specific, lightweight format for technical decisions stored in the codebase. Decision docs are broader — they can cover organizational, process, or strategic decisions too.

- **ADR tooling:** `development/knowledge` (tools/adr-create.ts) — use this to scaffold and manage ADRs
- **ADR content guidance:** this reference — use these principles for writing the content

## Template

```markdown
# Decision: <title>

**Date:** <date>
**Decision-makers:** <who made the call>
**Status:** Proposed | Decided | Deprecated | Superseded by <link>

## Context

<!-- What situation forced a decision? What constraints existed? -->

## Decision

<!-- What was decided. State it clearly and unambiguously. -->

## Alternatives Considered

### <Alternative A>

**Description:** <how it would work>
**Pros:** <advantages>
**Cons:** <disadvantages>
**Why rejected:** <specific reasoning>

### <Alternative B>

**Description:** <how it would work>
**Pros:** <advantages>
**Cons:** <disadvantages>
**Why rejected:** <specific reasoning>

## Consequences

### Positive
- <What this decision makes easier>
- <What it enables>

### Negative
- <What this decision makes harder>
- <What trade-offs are accepted>

### Neutral
- <Things that change but aren't clearly positive or negative>

## Review Date

<!-- When should this decision be revisited? -->
```

## The Four Essential Sections

Every decision doc — whether it's a formal document or a quick ADR — needs these four elements:

1. **Context** — what situation forced a decision? Include constraints (timeline, budget, team skills, dependencies) and what triggered the decision
2. **Decision** — what was decided, stated clearly enough that someone reading this in a year understands exactly what changed
3. **Alternatives** — what else was on the table and why it was rejected. This is the most valuable section for future readers
4. **Consequences** — what does this decision make easier or harder? Be honest about the trade-offs

## Section Guidance

### Context
Write for the person who wasn't in the room. Include the organizational and technical context that made this decision necessary. "We needed to pick a database" is not enough. "The current SQLite setup can't handle concurrent writes from 3 services, and we're launching the multi-tenant feature in 6 weeks" is context.

### Decision
State the decision as a clear, unambiguous fact. "We will use Postgres via Neon for the multi-tenant backend." Not "We're leaning toward Postgres."

### Alternatives
The most commonly skipped section, and the most valuable. When someone in 6 months asks "why didn't we use X?", this section answers it. Give each alternative a fair description and an honest reason for rejection.

### Consequences
Separate positive, negative, and neutral consequences. Being honest about downsides builds trust and gives future teams the information they need to revisit the decision if circumstances change.

## Anti-patterns

- **Recording only the decision** — without context and alternatives, the decision looks arbitrary
- **Writing after memory fades** — write decision docs while the reasoning is fresh, not months later
- **No review date** — decisions have shelf lives. Setting a review date prevents outdated decisions from becoming sacred
- **Ambiguous status** — always mark whether the decision is proposed, decided, or superseded
- **Missing trade-offs** — every decision has downsides. Acknowledging them shows thorough thinking
