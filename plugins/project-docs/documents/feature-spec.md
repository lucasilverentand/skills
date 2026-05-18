---
title: Feature spec
status: Active
owner: Luca Silverentand
last_updated: 2026-05-14
related:
  - project-brief.md
  - customer-profile.md
  - platform-dependency.md
  - release-readiness.md
---

# Feature spec
<!-- Prompt: Open with one short paragraph describing the feature this doc defines, what it deliberately leaves to other docs, and links to the relevant project brief, customer profile, or platform dependency. This template is designed to flex across project types — iOS or Expo apps, backend APIs, open-source libraries, CLIs. Skip sections that genuinely don't apply (UI design on a library, telemetry on an offline CLI) but only after being honest that nothing fits. The remaining structure should hold for anything we ship. -->

<!-- Relationship guide for planners/AI: This document should be written against the parent project brief, customer profile, and any platform dependency it touches. Define feature behavior here; do not restate the project thesis, personas, or dependency contracts except where a short link-backed summary helps the reader. -->

## 1. User stories & acceptance criteria
<!-- Prompt: One or more user stories framing the feature from the perspective of who uses it. The "user" depends on the project: end user for an app, developer integrating for a library, client for an API, operator for a tool. Format: "As a {who}, I want to {what} so that {why}."

For each story, list acceptance criteria as observable conditions that mean "done." Use a Markdown table when there are several criteria, variants, roles, or states to compare. Criteria should be testable: "the response includes a `version` field" beats "the response is well-formed."

Keep stories small enough that the criteria fit on one screen. If a story sprawls, split it. -->

---

## 2. Design
<!-- Prompt: For features with UI: link to or embed the design source of truth (Figma frame, screenshot, design doc). Include enough that a reader can picture the feature without opening anything else, but the linked source stays canonical. Add screenshots, wireframes, state tables, or Mermaid flow diagrams when they make the intended experience easier to review. Note any states the design covers (empty, loading, error, success) and which are still missing.

For features without UI (libraries, APIs, CLIs): delete this section. The Model and Behavior sections already carry the shape. If you find yourself wanting code samples or request/response examples here, put them in section 3 (Model) instead. -->

---

## 3. Model
<!-- Prompt: The product-level concepts the feature exposes: domain objects, user-facing states, key signals, categories, and externally visible request or response shapes. Keep storage layout, ownership, migrations, and internal runtime state in the technical design.

If the feature transforms raw inputs into a normalized form, describe the transform and what comes out. Use a Markdown table for fields, states, buckets, or categories when readers will need to reference individual rows.

If there are discrete states, buckets, or categories layered on top of a continuous value, list them with what each means. Note which boundaries are tunable and which are fixed. Defaults should come from somewhere real (testing, remote config), not magic numbers.

For APIs and libraries, this is where public request/response shapes, type signatures, and example payloads live. Internal DTOs, database rows, queues, and function boundaries belong in the technical design. -->

---

## 4. Lifecycle
<!-- Prompt: The product lifecycle: states the user, integrator, client, or operator can observe, and what triggers each transition. Explicit user actions vs automatic transitions. What starts it, what ends it, what pauses it. Use a Mermaid state diagram for more than a few transitions. Internal job, cache, retry, or persistence lifecycles belong in the technical design. -->

---

## 5. Behavior

### 5.1. Decision logic
<!-- Prompt: The product decision layer: when the feature should act from the user's point of view. Inputs (signals, configuration, user preferences), tunables (thresholds, durations, cool-downs), and the discipline: what the feature deliberately avoids. Most decision layers fail in one of two directions. Name both. Use a decision table when rules have multiple inputs or outcomes. Implementation algorithms and code structure belong in the technical design. -->

### 5.2. Outputs
<!-- Prompt: The user-visible channels through which the feature acts on the world. How they combine when more than one is active: stack, or deduplicate. User-facing controls for which channels are on. API responses, notifications, exports, UI state changes, CLI output, and files created by the feature all count. Internal events and queues belong in the technical design unless they are part of the public contract. -->

---

## 6. Persistence
<!-- Prompt: What the feature needs to remember from the user's point of view: saved preferences, draft work, history, generated artifacts, exported files, or records that later surface back to the user. Say what is retained and why; leave table names, indexes, migrations, and cache shape to the technical design. For libraries or pure compute features that don't persist, say so plainly and delete the rest. -->

---

## 7. Performance budget
<!-- Prompt: The targets this feature must hit. Keep it short. Pick the axes that matter for this project type:
- **Latency** — p50 / p95 for API endpoints, frame time for UI features, cold-start time for apps.
- **Memory** — peak working set, leak ceiling.
- **Battery / CPU** — for mobile and always-on features.
- **Binary / bundle size** — for libraries and client apps.
- **Throughput** — for APIs and pipelines.
Give a number for each, even if it's a guess marked as a guess. A budget without a number is a wish. -->

---

## 8. Telemetry
<!-- Prompt: What this feature emits so we can tell whether it's working. Hard rules:
- **Anonymous only.** No PII, no user identifiers, no anything that ties an event to a person.
- **No external systems.** No third-party analytics, no SaaS observability services. Destinations are our own logs, our own metrics, our own storage — or nothing.

For each event:
- **Name** — stable, snake_case, the kind of thing you'd grep for.
- **When it fires** — the condition or state transition.
- **Payload** — fields and their types. Verify nothing in the payload could de-anonymize.
- **Where it lands** — log stream, in-process counter, local file, persistent metric.

If this feature has no measurable behavior worth tracking, write "No telemetry by design" and one line of why. That's a valid answer for OSS libraries and pure-compute features. -->

---

## 9. Edge cases
<!-- Prompt: Product edge cases and user-visible failure behavior. Prefer specific scenarios ("device disconnects mid-session") over abstract categories ("network errors"). Include OS-level conditions that can silently break the feature: permissions denied, background limits, hardware unavailable. For APIs and libraries, include public bad-input behavior: malformed payload, exhausted iterator, unsupported option. Use a table with columns like Scenario, Expected behavior, User-visible message, and Follow-up. Internal partial writes, retries, races, and operator mistakes belong in the technical design. -->

---

## 10. Rollout
<!-- Prompt: How this feature reaches users or adopters. Keep this focused on exposure, eligibility, communication, and product rollback. Deployment order, schema migrations, compatibility mechanics, and cleanup belong in the technical design.

The shape varies by project type — pick the path that fits:
- **App (iOS / Expo)** — internal build → TestFlight or internal beta → staged store rollout. Note minimum OS version, App Store review risks, forced-update behavior.
- **Backend / API** — feature flag → canary or single-region → full deploy. Note schema migrations, backwards compatibility, deprecation window for old behavior.
- **Library / SDK** — semver bump → release notes → optional pre-release tag. Note breaking-change handling and migration guide if any.
- **CLI / tool** — version bump → changelog → distribution channel update (Homebrew, npm, cargo, etc.).

Use a Markdown table for phases when there is more than one. For each phase: who sees it, how we'd know to roll back, and what the kill switch is. If there's no kill switch, say so honestly. -->

---

## 11. Non-goals
<!-- Prompt: What this feature explicitly does not do. The lines it refuses to cross. Be opinionated. Vague non-goals are worse than none. -->
