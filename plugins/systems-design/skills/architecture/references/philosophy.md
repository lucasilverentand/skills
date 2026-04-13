# Architecture Philosophy

Three principles that apply to every architecture decision.

## Monolith-first

Start as a single deployable unit. Split into services only when forced by real operational or scaling pain — not because a diagram looks cleaner with more boxes.

Premature service boundaries add network hops, deployment complexity, distributed-system failure modes, and operational overhead for zero benefit. A monolith is easier to debug, deploy, test, and reason about.

Pick patterns that are scale-friendly WITHIN a monolith: queues over DB polling, outbox over direct publish, clear module boundaries over god modules. This way, splitting later is a refactor, not a rewrite.

**Anti-pattern:** drawing 8 microservices on day 1 because "that's how Netflix does it." Netflix has thousands of engineers and decades of operational tooling. You don't.

## Extract early when the concept is clear

Don't wait for a strict rule-of-three. If a bounded context or abstraction is obvious today, draw the boundary now.

Waiting too long bakes implicit assumptions into call sites — assumptions that are harder to unwind than extracting a clean abstraction when you first see the shape. The cost of extracting early is low; the cost of extracting late is high because every caller has made assumptions about the inlined logic.

**Anti-pattern:** copy-pasting the same validation logic into 4 handlers before extracting a shared utility. By then, each copy has diverged slightly and the extraction requires reconciling differences.

## Lean on the existing stack hard

Don't introduce a new tool unless the current ones genuinely can't do the job. Every new dependency is a new failure mode, a new thing to learn, a new thing to monitor, and a new thing to upgrade.

The bar for adding a technology should be: "What does this do that our current stack cannot?" — not "What does this do slightly better?" Slightly better doesn't justify the operational cost of another moving part.

Deviate when the existing stack genuinely can't do the job. Document WHY you're deviating. Silent deviations are tech debt.

**Anti-pattern:** adding Redis "for caching" when Cloudflare KV does the same thing with zero additional infrastructure. Adding Kafka for message passing when CF Queues integrates natively with Workers and you don't need ordered streams at 100k/s.
