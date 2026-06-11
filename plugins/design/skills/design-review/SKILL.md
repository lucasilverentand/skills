---
name: design-review
description: Reviews and critiques an existing or proposed system design — flags single points of failure, missing non-functional requirements, scaling bottlenecks, security gaps, operational blind spots, unjustified tech choices, and places where the design will fall over under load or failure. Produces a structured review with severity-tagged findings, not just vibes. Use when the user asks for a second opinion on an architecture, requests a design review, wants feedback on a proposed system, pastes a design doc, or says things like "review this design", "what's wrong with X", "poke holes in this", or "is this a good architecture".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Review a System Design
Read a design, stress-test it against real failure modes and scale pressures, and produce honest feedback — not a rubber stamp, not a wishlist, but the kind of review that would surface issues before prod does.

## Decision tree
- What are you reviewing?
  - **A written design doc** (markdown file, paste, URL) → read it fully, then follow "Full review" below
  - **A diagram only, no doc** → ask for context: goals, scale, constraints. You can't review architecture from a picture alone.
  - **A vague idea** ("what do you think of using X for Y?") → this is a discussion, not a review. Talk through trade-offs; offer to run a real review once there's a concrete design.
  - **An existing production system** → read code and `.context/` first, then review the *implemented* architecture against what it should do
  - **A PR introducing an architectural change** → scope the review to the change, but pull in surrounding context from the codebase

## Full review

### 1. Understand what you're reviewing
Before criticizing anything, make sure you understand:

- **Goal** — what is this system supposed to do?
- **Constraints** — scale targets, latency/availability requirements, team size, budget, existing stack
- **Context** — what's already in place, what's being replaced, what's out of scope

If the doc doesn't say, ask — don't review against imagined requirements. A design is only wrong relative to something; make sure you know what that something is.

### 2. Stress-test with these lenses
Walk each lens below and write findings as you go. Not every lens applies to every design — skip the ones that don't fit, but skip *consciously*.

#### Failure modes
- What happens when each component is slow? Down? Returns garbage?
- Are there single points of failure? Is that acceptable?
- What's the blast radius of a bad deploy? A runaway query? A poisoned message?
- Can the system recover without human intervention? Within the RTO?
- Are timeouts set everywhere? Retries bounded? Circuit breakers where they matter?

#### Scaling cliffs
- Where's the bottleneck at 10x current load? At 100x?
- Which component is hardest to scale — stateful DB, single-writer queue, a sync RPC chain?
- Are hot keys / hot rows going to bite? (think: celebrity users, popular products, global counters)
- Is fanout bounded? (1 request → N downstream calls — what's N worst case?)
- Do caches thunder-herd on cold start or invalidation?

#### Data & consistency
- Who owns each piece of data? Is there exactly one source of truth?
- How are cross-service writes handled? (dual-write risk, outbox, sagas?)
- Are reads allowed to be stale? Where? For how long?
- What happens on concurrent writes to the same record?
- How do schema migrations happen without downtime?

#### Security
- Is input validated at every boundary?
- AuthN and AuthZ — clear, enforced, not just "we'll add it later"
- Secrets management — how, where, rotated?
- PII handling — GDPR delete flow, audit trail, data residency
- Rate limiting on public endpoints
- What does an attacker gain by compromising each component?

#### Operability
- Can oncall debug this at 3am? What dashboards, logs, traces exist?
- What pages a human vs what's just a ticket?
- Is the deploy story clear? Rollback? Feature flags?
- Runbooks for known failure modes?
- Is cost observable — can you tell who/what is burning money?

#### Design coherence
- Does the architecture match the stated requirements, or is it cargo-culted from somewhere else?
- Are tech choices justified? ("We picked X because Y" — is Y actually true?)
- Are there simpler alternatives that were genuinely considered?
- Is anything over-engineered for the actual scale? Under-engineered?
- Are service boundaries drawn along responsibility lines or along org-chart lines?

#### Stack defaults compliance
Check the design against the convention references in sibling skills (`../data-modeling/references/`, `../api-design/references/`, `../architecture/references/`). If the `intent:requirements` skill is installed, use its NFR checklist for non-functional coverage; otherwise evaluate NFRs from the design text and ask for missing targets. Deviations aren't wrong, but they should be intentional and documented. Flag if:

- Async work is handled inline instead of via Queues (for anything >50ms)
- Write endpoints lack `Idempotency-Key` enforcement
- AuthZ is only enforced in handlers (should be middleware + service layer + RLS)
- Error responses don't use RFC 7807 Problem Details
- Outbound calls lack per-operation timeouts
- Multi-table writes aren't in a transaction
- No outbox for cross-system side effects (direct queue publish from handler)
- IDs aren't prefixed ULIDs
- Data residency isn't EU-primary without stated reason
- PII fields lack encryption at rest
- Breaking schema changes use single-step migration instead of expand-contract
- Missing `tenant_id` + RLS on tenant-scoped tables
- Cron jobs run logic inline instead of enqueuing onto Queues
- File uploads proxy bytes through the API instead of using presigned URLs to R2
- Public endpoints lack rate limiting (per-user, not just per-IP)
- Feature flags have no cleanup plan (release flags should be removed after full rollout)
- D1 used for multi-tenant or compliance-sensitive data where Neon would be more appropriate (or vice versa without justification)
- Cloudflare Pages used instead of Workers with Static Assets for new projects

### 3. Write the review
Produce a structured review document. Write it back to the user in chat for discussion, and optionally save it to `.context/architecture/reviews/<design>-review-<date>.md` if they want a record.

Structure:

```markdown
# Review: <design name>
Reviewer: Agent
Date: <YYYY-MM-DD>

## Summary

<2-3 sentences: overall take, most important finding>

## What works

<Things the design gets right. This is not flattery — note real strengths so they don't get lost in a refactor.>

## Findings

### [CRITICAL] <finding title>
**Problem:** <what's wrong>
**Why it matters:** <consequence under realistic conditions>
**Suggestion:** <one or two concrete ways to fix it>

### [MAJOR] <finding title>
...

### [MINOR] <finding title>
...

### [QUESTION] <finding title>
**Question:** <something the doc doesn't answer that a reviewer would need to know>

## Open questions for the author

<Things you couldn't review because the doc didn't say>
```

### 4. Severity guide
Use these to force calibration — don't label everything CRITICAL.

|Severity|Meaning|Example|
|---|---|---|
|**CRITICAL**|Will cause incidents in production or block a core requirement|Dual-write between DB and queue with no outbox → lost events|
|**MAJOR**|Significant risk or cost you'd want to address before building|Single Redis instance for session store at 99.95% target|
|**MINOR**|Worth fixing but won't sink the project|Missing rate limits on internal admin endpoint|
|**QUESTION**|Reviewer can't assess without more info|"What's the expected write/read ratio on the orders table?"|

### 5. Keep it useful
- **Be specific** — "this will fall over under load" is useless; "Postgres write throughput caps around 5k/s on the current Neon tier; the design assumes 10k/s peak — what's the plan?" is a review
- **Don't rewrite the design** — propose fixes, but a review is not a redesign. If the whole thing is wrong, say so clearly and suggest a reset rather than editing every section.
- **Rank honestly** — the author will triage by severity. If everything is critical, nothing is.
- **Call out what's good** — designs get refactored and the good parts often get lost. Name them so they survive.
- **Ask, don't assume** — when you can't tell if something is a gap or an omission from the doc, put it in "Questions" rather than "Findings"

### 6. Write so a junior can learn from the review
Reviews are a teaching tool. The author might be senior; the next person to read the doc might not be. That means:

- **When you name a failure mode, explain it in one line.** Don't just say "thundering herd on cache expiry" — add "(when a cached value expires, every waiting request hits the backend at once, overwhelming it)". The extra sentence costs nothing and the finding becomes actionable without the reader having to google.
- **When you cite a pattern as a fix, explain what it is.** "Add a circuit breaker (a wrapper that stops calling a failing dependency after N errors, giving it time to recover)" beats "add a circuit breaker".
- **Prefer plain phrasing.** "This design has a SPOF" → "This design has a single point of failure — if the Redis instance goes down, every request fails. See the 'Availability' row below."
- **Say why a finding matters in concrete terms.** Not "risks dual-write inconsistency" but "if the Stripe webhook arrives while the DB write is still in flight, the order will look unpaid forever — no retry path exists". A junior reading this should be able to picture the incident.
- **If a reviewer needs deep domain knowledge to understand a finding, say so explicitly** so the author knows who to loop in.

Embedded explainers make the review useful to a wider audience — including weaker LLM models that will read this doc later as context.

## Key references
|File|Covers|
|---|---|
|`../data-modeling/references/`|Data conventions — IDs, naming, tenancy, soft delete, JSONB, audit, migrations (one file per topic)|
|`../api-design/references/`|API conventions — HTTP, errors, auth, pagination, API patterns (one file per topic)|
|`../architecture/references/`|Infra conventions — async, resilience, observability, deploy, testing, privacy (one file per topic)|
|`intent:requirements`|Companion requirements skill — use for NFR coverage if the plugin is installed|

## Cross-references
|Situation|Action|
|---|---|
|The design is missing a section entirely (e.g., no NFRs)|Flag the gap; hand off to `intent:requirements` for NFRs or `design:write-design-doc` for structure if installed|
|The user wants the design rewritten after review|Hand off to `architecture` plus `design:write-design-doc` with findings as input if installed|
|A finding deserves a permanent decision record|Suggest `design:write-adr` to capture the resolution if installed|
