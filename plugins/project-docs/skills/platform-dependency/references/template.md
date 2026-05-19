---
title: Platform dependency
status: Active
owner: Luca Silverentand
last_updated: 2026-05-14
related:
  - project-brief.md
  - feature-spec.md
  - release-readiness.md
---

# Platform dependency
<!-- Prompt: Open with one short paragraph defining the external thing the product builds on, the part of it that matters here, and what lives elsewhere with links. Resist the urge to recap the whole product. -->

<!-- Relationship guide for planners/AI: This document owns the truth about one external system. Link it from the project brief when the project commits to the dependency, from feature specs when behavior depends on it, and from release readiness when dependency risk affects shipping. -->

## 1. The dependency
<!-- Prompt: Describe what the dependency is, who owns it, and how the product relates to it. If there was a real choice, name the alternatives that were rejected and the trade-off each represented. If there wasn't a choice (the OS is the OS, the protocol is the protocol), say so plainly. Close with what the commitment locks in: audience, platforms, capabilities now available, capabilities now off the table. -->

---

## 2. Capabilities
<!-- Prompt: List what the dependency offers that the product can act on. Be concrete: named features, endpoints, surfaces, data types, behaviors. Organize by relevance to our use, not by the structure of the vendor's docs. -->

---

## 3. Limits
<!-- Prompt: Describe what the dependency does not do, does badly, or refuses to do. Cover three flavors, worth keeping straight even when they sit in one section:
1. **Hard ceilings** — rate caps, regional gaps, missing features.
2. **Soft degradation** — behavior under load, partial availability.
3. **Absences** — the capability that simply isn't there.
An absence shapes the design as much as a feature. -->

---

## 4. Interface
<!-- Prompt: How the product talks to the dependency. The subsections below are framed to work whether this is an API, an OS framework, a hardware peripheral, a protocol, or a vendor SDK. Skip any subsection that genuinely doesn't apply, but be honest before you skip — most dependencies have an analog. -->

### 4.1. Access
<!-- Prompt: How we earn the right to talk to it. Authentication, authorization, capability grants, pairing, permissions, entitlements, identity. Include the failure modes of access itself: revoked tokens, denied permissions, unpaired devices, expired certificates. -->

### 4.2. Exchange
<!-- Prompt: The unit of communication and what flows across it. Request/response shapes for APIs; events, signals, and characteristics for hardware; messages for protocols; calls and callbacks for OS frameworks. Include data formats, encoding, payload size limits, and which direction the initiative flows in (we poll vs it pushes). -->

### 4.3. Lifecycle
<!-- Prompt: How a session, connection, or interaction opens, runs, and closes. State transitions, reconnection behavior, idle timeouts, backpressure, ordering guarantees, retry semantics. Where the contract is enforced strictly and where it's loose. -->

---

## 5. Variants and versions
<!-- Prompt: The matrix of what's confirmed to work: products, plans, regions, OS versions, hardware generations, API versions. One line if the dependency is monolithic. A table if the surface is fragmented. Pre-empt the "what about X" questions with a row that names X.

Sample structure:

|Variant|Status|Notes|
|---|---|---|
|iOS 17+ on iPhone 14 Pro+|Confirmed|Tested on device, all capabilities present|
|iOS 16|Partial|Capability X missing; falls back to Y|
|iPadOS|Unsupported|Out of scope for v1|
| Android | N/A | Different dependency entirely | -->

---

## 6. Behavior in practice
<!-- Prompt: How the dependency actually behaves in the field, not how the docs describe it. Cover latency, accuracy, contention with other consumers, failure modes, and conditions that silently degrade it. Use concrete numbers where measured. Use honest "to verify on device" or "to confirm in production" markers where not. Separate measured baselines from assumptions. -->

---

## 7. Cost
<!-- Prompt: What the dependency costs across whatever axes apply: money, user resources (battery, bandwidth, storage, attention), lock-in, complexity. Separate the marginal cost the product adds from the total cost the user or business already pays.

Break monetary cost out by scale tier so the curve is visible:

|Scale|Monthly cost|Notes|
|---|---|---|
|1k users|...|Free tier? Per-call?|
|100k users|...|Tier change, bulk pricing, support upgrades|
|1M users|...|Negotiated, hits hard caps, separate contract|

Note the inflection points where pricing changes shape, not just amount. -->

---

## 8. Fallback and graceful degradation
<!-- Prompt: What the product does when the dependency is unavailable, slow, partial, or denied. Map each major failure mode from section 3 (Limits) and section 6 (Behavior in practice) to a response:
- **Hard failure** (no access, outage, hardware absent) — what the user sees, what still works without it.
- **Soft failure** (slow, partial, rate-limited) — degraded experience, caching, queueing, retry strategy.
- **Permission denied / opt-out** — the product's behavior when the user refuses access or revokes it later.
Where the answer is "the product is broken," say so honestly. That's a real design decision. -->

---

## 9. Monitoring and observability
<!-- Prompt: How we know when the dependency is misbehaving before users tell us. Cover:
- **Signals** — what we measure (success rate, latency percentiles, error codes, throttling responses, queue depth).
- **Where the data goes** — the dashboard, log stream, or telemetry pipeline that holds it.
- **Thresholds and alerts** — what triggers a page vs a ticket vs a log line.
- **Blind spots** — what we can't see from our side (vendor-side outages, partial regional failure, silent contract changes).
Link to the actual dashboards and runbooks once they exist. -->

---

## 10. Risks
<!-- Prompt: What could shift underneath the product. Deprecations, pricing changes, capability tightening, replacement by a competitor, capabilities we'd want but probably won't get. The job here is to track, not to pre-build. For each risk, note severity (how badly it would hurt) and likelihood (rough guess is fine). -->

---

## 11. Exit strategy
<!-- Prompt: What it would take to leave this dependency. Not a plan to execute — a forced honesty about lock-in. Cover:
- **What's portable** — code, data, contracts that would survive a switch.
- **What's not** — capabilities only this dependency offers, integrations that would need rebuilding, retraining or migration costs to the user.
- **Plausible replacements** — even if they're worse today, list what we'd reach for. "There is no replacement" is a valid and important answer.
- **Trigger conditions** — the risk from section 10 that would actually force us to leave. Pricing past $X, deprecation, a specific capability removed, a competitor shipping a viable alternative. -->

---

## 12. References
<!-- Prompt: Bullet points linking to relevant docs, specs, vendor pages, and internal notes. -->
