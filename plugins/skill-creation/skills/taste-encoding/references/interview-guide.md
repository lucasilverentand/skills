# Interview Guide

How to conduct a taste interview that extracts actionable, encodable preferences.

## Before you start

1. **Read the target skill** — understand what decisions it guides and where it's currently generic.
2. **Read the user's CLAUDE.md and memory** — don't re-ask things already settled. If CLAUDE.md says "Bun over Node", that's encoded taste — acknowledge it and move deeper.
3. **Read existing reference files** in the target skill — know what's already opinionated.
4. **Prepare a topic list** — the decisions that need taste, grouped by theme.

## Question strategies

### Decision-framed questions

Ask about decisions, not preferences. The decision framing surfaces reasoning.

| Instead of | Ask |
|---|---|
| "Do you prefer X or Y?" | "When you're choosing between X and Y, what tips the scale?" |
| "What's your naming convention?" | "When you add a new table, how do you name it and why?" |
| "Do you like JSONB?" | "When do you reach for JSONB vs a proper table?" |

### The "what happened" follow-up

When a user states a strong preference, ask what experience drove it. These stories become anti-patterns and rationale text.

- "You mentioned never mocking the database — was there a specific incident?"
- "You feel strongly about prefixed IDs — what debugging experience made that stick?"
- "What went wrong the time you didn't do it this way?"

The answer is almost always a story. Stories encode better than rules because they give the agent enough context to judge edge cases.

### The "when would you break this rule" probe

Every good rule has exceptions. Asking about exceptions reveals the boundary conditions for decision rules.

- "You default to D1. When would you reach for Neon instead?"
- "You said monolith-first. What would make you split early?"
- "Is there a project size or team size where this changes?"

### The "show me an example" request

When a preference is abstract, ask for a concrete example. Examples become the `references/examples.md` or inline code in conventions.

- "Can you show me a schema that follows your conventions?"
- "What does a good commit message look like in your style?"
- "Show me an API endpoint designed the way you'd want it."

## Domain-specific question sets

These are starting points — not checklists. Skip what's already known, probe what's interesting.

### Architecture / system design

- How do you decide between monolith and services?
- What's your default deployment target? When do you deviate?
- How do you handle async work (queues, cron, events)?
- What's your approach to caching? Invalidation strategy?
- How do you think about failure modes and resilience?
- What observability do you set up by default?

### Data modeling

- ID strategy (UUIDs, ULIDs, sequential, prefixed)?
- Naming conventions (tables, columns, indexes)?
- Soft delete vs hard delete?
- Multi-tenancy approach?
- When do you use JSONB vs normalized tables?
- Audit logging approach?
- Migration workflow?

### API design

- REST vs GraphQL vs gRPC — when do you pick each?
- URL conventions (casing, pluralization, nesting depth)?
- Error response format?
- Pagination strategy?
- Auth approach (JWT, sessions, API keys)?
- Versioning strategy?

### Frontend / UI

- Component architecture (atomic design, feature-based, etc.)?
- State management approach?
- Styling methodology?
- Accessibility standards?
- Performance budgets?
- Testing strategy (unit, integration, E2E balance)?

### DevOps / infrastructure

- CI/CD pipeline shape?
- Environment strategy (staging, preview, etc.)?
- Secrets management?
- Monitoring and alerting philosophy?
- Incident response approach?

### Testing

- Test pyramid balance (unit vs integration vs E2E)?
- Mocking policy?
- Database testing strategy?
- Fixture management?
- When to write tests (before, during, after)?

## Depth calibration

Not every topic deserves the same depth. Calibrate based on:

**Go deep** (3-5 follow-up questions) when:

- The user has a strong opinion with a story behind it
- The decision affects many other decisions downstream (e.g., ID strategy affects every table, every API response, every log line)
- The current skill is weakest in this area
- The user's choice diverges from industry convention (the "why" is especially important)

**Stay shallow** (1-2 questions) when:

- The user says "whatever's standard" or "I don't care about this one"
- The decision is isolated (doesn't cascade into other choices)
- The skill already has reasonable defaults for this area

**Skip entirely** when:

- Already encoded in CLAUDE.md or the skill's existing references
- The user explicitly says they don't want to opine
- The decision doesn't apply to the user's stack

## Batching and flow

Group questions by theme to maintain conversational flow. Don't jump from naming conventions to deployment strategy to naming again.

A good interview order for a full-domain taste encoding:

1. **High-level philosophy** — principles that guide everything (2-3 questions)
2. **Concrete defaults** — the specific choices for common decisions (5-10 questions, batched by sub-topic)
3. **Edge cases and exceptions** — when to break the rules (2-3 questions per topic where the user had strong opinions)
4. **Validation** — "Here's what I'm hearing — does this summary match your intent?" (1 question at the end)

## Knowing when to stop

An interview should take 10-20 questions for a full domain encoding. Signs you've gone far enough:

- The user's answers are getting shorter ("yeah, standard", "no preference")
- You're asking about increasingly niche decisions
- The user says "that's enough" or "let's move on"
- You have enough material to write distinct, opinionated reference files

Better to encode 10 strong opinions well than to capture 30 weak ones. Taste is about the decisions that matter, not completeness.
