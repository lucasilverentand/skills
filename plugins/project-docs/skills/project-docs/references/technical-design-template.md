---
title: Technical design
status: Active
owner: Luca Silverentand
last_updated: 2026-05-15
related:
  - feature-spec.md
  - testing-strategy.md
---

# Technical design
<!-- Prompt: Open with one or two short paragraphs naming the feature, system, workflow, or infrastructure change this design covers. Link to the project brief, feature spec, platform dependency docs, issues, prototypes, or previous decisions that set the boundary. State what this technical design adds beyond those docs.

Use this template after product scope is clear enough to make implementation choices. The doc should answer how we will build the thing, what contracts it creates, and where it can fail. It should not re-spec product behavior already owned by the feature spec. Keep it practical: enough detail for someone to implement or review the plan, not a tour of every possible architecture. -->

## 1. Goals
<!-- Prompt: The engineering outcomes this design must make true. Prefer concrete behavior over broad qualities. For apps, reference the user-visible capability from the feature spec instead of repeating it. For services, include the contract or operational property. For infrastructure, include the state the platform needs to reach. Three to six bullets. -->

---

## 2. Non-goals
<!-- Prompt: The tempting adjacent implementation work this design intentionally does not cover. Include boundaries that protect build scope: platforms not supported, old data not migrated, contracts left unchanged, observability deferred, or manual operations accepted for now. Product non-goals belong in the feature spec unless they change the engineering shape. -->

---

## 3. Proposed design
<!-- Prompt: Describe the chosen implementation at the level needed for review. Cover the major components, where code will live, how data moves through them, and which parts are new vs reused. For a UI feature, include the state owner and rendering path. For an API or service, include request flow, background work, and persistence. For infrastructure, include resources, ownership, and lifecycle.

Use visuals when structure is easier to review that way: Mermaid component diagrams for boundaries, sequence diagrams for request flows, state diagrams for internal lifecycles, and flowcharts for background work. Keep diagrams small enough that each one answers a specific review question. -->

---

## 4. Data or state model
<!-- Prompt: Define the implementation model: stored records, in-memory state, configuration, derived values, caches, queues, and ownership. If the feature spec already defines the public domain model, reference it and only describe what changes for implementation.

Use Markdown tables for schemas, config, state fields, defaults, ownership, and lifecycle. If the work has no persistent model, describe the runtime state instead. -->

---

## 5. Interfaces and contracts
<!-- Prompt: The implementation boundaries other code or people depend on: API endpoints, function signatures, events, schemas, environment variables, CLI flags, file formats, component props, job payloads, permissions, or operational handoffs. Public product contracts should match the feature spec; this section explains the exact technical contract.

Use Markdown tables for endpoints, events, payload fields, permissions, and environment variables. Include examples where they prevent ambiguity. -->

---

## 6. Failure modes
<!-- Prompt: Concrete ways this implementation can fail and how each is handled. Cover bad input that crosses a technical boundary, missing permissions, unavailable dependencies, partial writes, retries, stale cache, race conditions, concurrency, degraded device or network state, and operator mistakes. Product edge cases belong in the feature spec; this section covers the engineering behavior behind them.

Use a Markdown table when listing more than a few failures. Say when each failure is surfaced to a user, logged, retried, ignored, or treated as fatal. -->

---

## 7. Security and privacy
<!-- Prompt: What this implementation exposes, stores, transmits, or trusts. Include authentication and authorization checks, secret handling, data minimization, retention, auditability, tenant or user boundaries, and privacy-sensitive telemetry. Use a table for trust boundaries, permissions, retained fields, or data flows when useful. If there is no sensitive data or trust boundary, say why. -->

---

## 8. Migration and rollout
<!-- Prompt: How this implementation reaches production or adopters. Cover schema migrations, backfills, feature flags, compatibility with old clients or data, deployment order, rollback behavior, and cleanup. Link to the feature spec for the user-facing rollout plan instead of repeating it.

Use a Markdown table for rollout phases, migration steps, compatibility windows, or rollback triggers. For local-only or library changes, cover versioning and how adopters move from the old shape to the new one. -->

---

## 9. Testing plan
<!-- Prompt: The tests or checks that would prove this design works. Reference testing-strategy.md for the project-wide layers, tools, coverage expectations, fixture approach, CI gates, and flaky-test rules. This section should only add the feature-specific checks needed for this design. Include unit, integration, UI, contract, migration, load, manual, simulator/device, and operational checks only where they apply. Tie tests back to contracts, failure modes, and migration risk rather than restating acceptance criteria from the feature spec. Use a table when mapping risks to checks. Name any hard-to-test behavior and how we will inspect it anyway. -->

---

## 10. Alternatives considered
<!-- Prompt: The real implementation alternatives, including doing nothing. For each: what it would have made easier, why it was rejected, and what would make us reconsider later. Use a decision table when comparing several options. Keep this section honest and short. -->

---

## 11. Open questions
<!-- Prompt: Questions that still affect implementation choices. If a question does not need to be answered before build starts, mark the point where it must be resolved. -->
