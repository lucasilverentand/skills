---
name: write-adr
description: Writes Architecture Decision Records (ADRs) in MADR format — captures context and problem, decision drivers, considered options with pros/cons, the chosen option and why, and consequences. Numbers files sequentially under .context/architecture/adr/. Use when the user asks to document a decision, write an ADR, record a trade-off, capture why something was chosen over alternatives, or says things like "let's write this up as an ADR", "log this decision", or "we should document why we picked X".
allowed-tools: Read Grep Glob Bash Write Edit AskUserQuestion
---

# Write an ADR

An ADR is a timestamped, immutable record of a single architectural decision — the context, the options, the choice, the consequences. It exists so future-you (or a new team member, or an LLM) can reconstruct *why* the code looks the way it does without having to re-debate the decision.

## Current context

- ADR directory: !`ls .context/architecture/adr/ 2>/dev/null || echo "(none — will be created)"`
- Next ADR number: !`ls .context/architecture/adr/ 2>/dev/null | grep -E '^[0-9]{4}-' | sed 's/-.*//' | sort -n | tail -1 | awk '{printf "%04d", $1+1}' 2>/dev/null || echo "0001"`

## Decision tree

- What's being decided?
  - **A genuine trade-off with multiple viable options** → write a full ADR (follow below)
  - **A choice forced by external constraints** (e.g., "we must use Postgres because the company standard says so") → still write it, but keep options short and be explicit that the decision was forced
  - **An obvious default** ("use HTTPS", "add input validation") → don't write an ADR. Not everything deserves one.
  - **A decision that's already been made but never documented** → write a retrospective ADR; mark the date as "documented <today>, decided <approx>"
  - **A decision that might change** → still write it. ADRs are immutable but can be superseded. See "Superseding" below.

### What always warrants an ADR

These topics always deserve a written record (per the convention references in sibling skills):

- **New service or Worker** — adding a deployable unit changes the operational surface
- **New external dependency** — new vendor, new SaaS, new API integration
- **Auth/authz model changes** — who can do what, and how it's enforced
- **Data model changes affecting multiple services** — schema changes with cross-service impact
- **Deviations from stack defaults** — choosing something other than the established default (e.g. DynamoDB instead of Neon, Redis instead of KV)

### What does NOT need an ADR

- Library upgrades (patch, minor, or even major if non-breaking)
- Styling choices (CSS, component design)
- Internal refactors that don't change boundaries or behavior
- Picking the established default — defaults are already documented in the convention references

## Writing an ADR

### 1. Clarify the decision

Before writing anything, pin these down with the user (use `AskUserQuestion` for the ones that aren't obvious):

1. **What is the decision?** — frame it as a question: "How should we handle session storage?"
2. **What options are on the table?** — at least two real alternatives. If there's only one, it's not a decision.
3. **Why now?** — what triggered this? A scaling issue, a security audit, a rewrite?
4. **Who's affected?** — which systems, teams, users?
5. **What are the decision drivers?** — cost, latency, team familiarity, compliance, operational simplicity

Skip questions where the answer is in the conversation or the codebase. Don't invent drivers the user didn't state.

### 2. Find the file number

ADRs are numbered sequentially: `0001-use-postgres.md`, `0002-outbox-pattern.md`, ...

1. Check `.context/architecture/adr/` for the highest existing number
2. New ADR is `<next>-<kebab-case-title>.md`
3. Create the `adr/` directory if it doesn't exist

### 3. Write the ADR

Use the MADR template below. Keep it focused — an ADR is not a design doc. One decision per file.

```markdown
# <NNNN>. <Short title phrased as the decision>

- Status: proposed | accepted | deprecated | superseded by [ADR-NNNN](NNNN-title.md)
- Date: <YYYY-MM-DD>
- Deciders: <who>
- Tags: <optional, e.g., data, api, security>

## Context and problem statement

<2-4 sentences describing the situation that forces a decision. What's the question? Why does it need answering now? What happens if we don't decide?>

## Decision drivers

- <Driver 1 — e.g., must support 10k writes/sec>
- <Driver 2 — e.g., team has no Kafka experience>
- <Driver 3 — e.g., Cloudflare-first stack per CLAUDE.md>

## Considered options

- **Option A:** <name>
- **Option B:** <name>
- **Option C:** <name>

## Decision outcome

Chosen option: **<Option B>**, because <concise justification tied to decision drivers>.

### Positive consequences

- <What this enables or improves>
- <...>

### Negative consequences

- <What this costs us or makes harder>
- <...>

## Pros and cons of the options

### Option A: <name>

<Short description.>

- Good: <reason>
- Good: <reason>
- Bad: <reason>
- Bad: <reason>

### Option B: <name>

<Short description.>

- Good: <reason>
- Good: <reason>
- Bad: <reason>
- Bad: <reason>

### Option C: <name>

<Short description.>

- Good: <reason>
- Bad: <reason>

## Links

- <Related ADR: NNNN-title.md>
- <Design doc: path or URL>
- <External reference: RFC, blog post, docs>
```

### 4. Status lifecycle

- **proposed** — written but not yet agreed on. Use while discussing.
- **accepted** — the decision is in force. This is the default state once agreed.
- **deprecated** — no longer the approach but not replaced. Rare.
- **superseded by [ADR-NNNN]** — a later ADR changes or reverses this one. When you supersede, update the old ADR's status but don't edit its body.

Default new ADRs to **proposed** unless the user says the decision is already made.

### 5. Index (optional but nice)

If you create `.context/architecture/adr/`, also create or update `.context/architecture/adr/README.md` with a one-line index:

```markdown
# ADRs

| # | Title | Status | Date |
|---|---|---|---|
| 0001 | Use Postgres for Orders | accepted | 2026-04-10 |
| 0002 | Outbox pattern for event publishing | accepted | 2026-04-10 |
```

Append new entries; don't reorder.

## Writing principles

- **One decision per ADR** — if you're tempted to write "database and queue and auth", that's three ADRs
- **Immutable** — once accepted, don't edit the body. If the decision changes, write a new ADR that supersedes it. The history matters.
- **Write options honestly** — if you pre-decided and wrote the options as strawmen, the ADR is useless. Give each option its real best case.
- **Tie the decision to the drivers** — "chose X because it's best" is not a decision; "chose X because driver 2 is the hardest constraint and X is the only option that meets it" is
- **Date it** — ADRs age. A reader needs to know whether "low team Kafka experience" was a driver in 2022 or last month.

### Write so a junior (or a weaker LLM) can follow along

An ADR's job is to make the decision *reproducible* — a reader a year later should be able to walk the same reasoning. If they can't, the ADR failed. Assume the reader is smart but new to this specific problem:

- **Explain each option in plain language first, then with jargon.** Instead of "Option B: transactional outbox", write "Option B: transactional outbox — write the event to a DB table in the same transaction as the state change, then a separate worker publishes it to the queue. This means the state change and the event record are atomic; if the queue is down, events queue up in the DB instead of being lost."
- **Expand acronyms the first time they appear.** "2PC (two-phase commit, a distributed transaction protocol that coordinates commit/rollback across multiple systems)".
- **For each Good/Bad bullet, make the consequence concrete.** Don't say "Bad: dual-write risk" — say "Bad: if the queue call fails after the DB commit, the event is lost with no retry path, and the state change silently diverges from what downstream consumers see".
- **Say *why* a driver is a driver.** "Must support 10k writes/sec" is a number; "Must support 10k writes/sec because black friday peak is 2x last year and the current Redis sessions fell over at 8k/s" is a driver with context.
- **Skip the generic tutorial.** Don't explain what Postgres is. Do explain what's specific to *this* decision — "Neon's autoscaling matters here because our load is spiky, not sustained".

## When to supersede vs edit

- **Fixing a typo or broken link** → edit in place, it's not a content change
- **Adding a missed consequence discovered later** → add a dated "Addendum" section at the bottom, don't rewrite the original
- **The decision itself changed** → write a new ADR, link it from the old one's status, don't touch the old body

## Key references

| File | Covers |
|---|---|
| `../data-modeling/references/` | Data conventions — ADRs should reference deviations from these |
| `../api-design/references/` | API conventions — ADRs should reference deviations from these |
| `../architecture/references/` | Infrastructure conventions — ADRs should reference deviations from these |
| `references/madr-template.md` | The raw template to copy |
| `references/examples.md` | Two complete example ADRs (outbox pattern, data store choice) |
