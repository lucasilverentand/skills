---
name: requirements
description: Gathers, structures, and prioritizes requirements for a system before any design work begins. Use when the user has a vague idea ("I need to build X", "we need a service that does Y"), wants to define what a system should do and under what constraints, asks about non-functional requirements, says things like "what are the requirements for", "help me scope this", "what do I need to think about before building", or "let's figure out what this needs to do". Do NOT use for designing the system itself — this skill produces the inputs that architecture and design skills consume.
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Gather Requirements
Turn a vague "build X" into structured, prioritized requirements before any design work begins. This skill produces the spec that architecture consumes — it does not pick technologies, draw boxes, or model data. Those are other skills' jobs.

## Current context
```shell
!ls .context/architecture/requirements/ 2>/dev/null || echo "(none yet)"
```

## Decision tree
- What does the user need?
  - **Full requirements gathering for a new system** → follow the full process below
  - **Quick NFR analysis for an existing design** → jump straight to "NFR analysis"
  - **Single-question scope check** ("do I need X?") → answer directly, then suggest full gathering if the question reveals gaps
  - **User already has a design and wants feedback** → hand off to `workflow:design-review` when available
  - **User wants to start designing** → capture requirements first, then hand off to `workflow:architecture` when available

## Interview framework
Pin down 7 areas using `AskUserQuestion`. Ask in batches of 3-4 — not all at once, not one at a time. Skip questions you can answer from the codebase. Call out assumptions explicitly so the user can correct them.

Before asking, scan the project for existing context:

- Read `.context/` files, README, and existing docs
- Check the codebase for clues about scale, stack, integrations
- Pre-fill what you can. Don't waste the user's time asking things the code already answers.

### Areas to cover
1. **Purpose** — What problem does this solve? Who uses it? What does success look like? What happens if we don't build it?
2. **Scale** — Users, requests/second, data volume, growth trajectory. Today and 2 years out. If the user doesn't know, help them estimate from comparable systems.
3. **Latency and availability** — p50/p99 targets for key operations, uptime requirement, acceptable downtime window, recovery expectations.
4. **Consistency** — Are stale reads acceptable? Where? For how long? Are there transactional writes that must be atomic? What's the blast radius of a bug or inconsistency?
5. **Data** — Core entities, key relationships, hot paths (what gets read/written most). Don't model the schema — just understand what exists.
6. **Constraints** — Existing stack, team skills and size, budget ceiling, compliance obligations (GDPR, SOC2, PCI), hard deadlines.
7. **Integrations** — Upstream and downstream systems, auth providers, payment processors, third-party APIs, event buses. What already exists vs what's new.

## Functional requirements structuring
Once the interview is done, structure what the system must DO:

- **List capabilities, not implementation details.** "Users can reset their password via email" — not "send a POST to /reset with a JWT".
- **Use MoSCoW prioritization:**
  - **Must** — launch blocker, the system is useless without it
  - **Should** — important, but a workaround exists for v1
  - **Could** — nice-to-have, build if time allows
  - **Won't** — explicitly out of scope (write these down so they stop coming up)
- **Each requirement must be testable.** "Users can reset their password" is testable. "Good UX" is not.
- **Number them** (F1, F2, ...) so the architecture skill can trace design decisions back to requirements.

## NFR analysis
Walk `references/nfr-checklist.md` area by area. For each relevant NFR:

- **Set concrete targets with units.** Not "fast" but "p99 < 300ms for search". Not "highly available" but "99.95% uptime, < 5min RTO".
- **Identify the rationale.** Why this number? Legal requirement? Business impact? User expectation? Gut feel? Be honest — gut feel is fine as a starting point, but label it.
- **Mark hard vs soft constraints.** Hard = non-negotiable (legal, contractual, physics). Soft = can be traded off during design if something else matters more.
- **Identify the hardest constraint** — the single NFR the architecture must optimize for. There's always one. If the user says "everything is equally important", push back — because that means nothing is prioritized and the design will try to optimize for everything and achieve nothing.
- **Call out conflicts.** Strong consistency vs low latency. High availability vs cost efficiency. Global distribution vs data residency. Name the tension so the architecture skill can make an informed trade-off.

## Output
Write structured requirements to `.context/architecture/requirements/<system>.md` using the template from `references/requirements-template.md`. Read the template before writing — match its structure exactly.

Include an "Open questions" section for anything unresolved. These become the first thing the architecture skill addresses.

## Cross-references
|Situation|Hand off to|
|---|---|
|Requirements done, ready to decompose into components|`workflow:architecture` if installed|
|Requirements done, ready to write a design doc|`documentation:write-design-doc` if installed|
|Need to review an existing design against these requirements|`workflow:design-review` if installed|

## Key references
|File|Covers|
|---|---|
|`references/nfr-checklist.md`|Non-functional requirements checklist — walk this during NFR analysis|
|`references/requirements-template.md`|Structured output template — match this format|
