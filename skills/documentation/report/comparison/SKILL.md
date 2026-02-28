---
name: comparison
description: Writes structured comparison reports evaluating multiple options against defined criteria. Use when the user asks to compare technologies, libraries, approaches, architectures, or any set of alternatives.
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
---

# Comparison Report

## Decision Tree

- What are you comparing?
  - **Technologies or libraries** → research each via WebSearch, check GitHub stats, read docs
  - **Architectural approaches** → analyze trade-offs from codebase context and design principles
  - **Vendors or services** → research pricing, features, limits, and lock-in
  - **Internal approaches** → analyze existing code, performance data, and team capabilities

- How many options?
  - **2 options** → detailed side-by-side with prose comparison per criterion
  - **3-5 options** → comparison matrix table is essential, brief prose per option
  - **6+ options** → filter down to 3-5 finalists first, then do detailed comparison

## Template

```markdown
# Comparison: <what is being compared>

**Date:** <date>
**Author:** <name>
**Audience:** <who this is for>
**Decision deadline:** <when a decision is needed, if applicable>

## Summary

<!-- 2-3 sentences: which option is recommended and the top reason why -->

## Context

<!-- Why this comparison is needed. What problem are we solving? What constraints exist? -->

## Criteria

| # | Criterion | Weight | Description |
|---|---|---|---|
| 1 | <criterion> | High | <what it means and why it matters> |
| 2 | <criterion> | Medium | <what it means> |
| 3 | <criterion> | Low | <what it means> |

## Options

### Option A: <name>

**What it is:** <1-sentence description>

- Strengths: ...
- Weaknesses: ...
- Cost: ...
- Maturity: ...

### Option B: <name>

**What it is:** <1-sentence description>

- Strengths: ...
- Weaknesses: ...
- Cost: ...
- Maturity: ...

## Comparison Matrix

| Criterion | Weight | Option A | Option B | Option C |
|---|---|---|---|---|
| <criterion 1> | High | Good | Fair | Excellent |
| <criterion 2> | Medium | Fair | Good | Good |
| <criterion 3> | Low | Excellent | Good | Fair |

## Scoring

| Option | Weighted Score | Rank |
|---|---|---|
| Option C | 8.5 / 10 | 1 |
| Option A | 7.2 / 10 | 2 |
| Option B | 6.1 / 10 | 3 |

## Recommendation

**Recommended: Option C**

<Reasoning that ties back to criteria and scores. Address why the runner-up wasn't chosen. Note any conditions that would change the recommendation.>

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| <risk with chosen option> | Medium | High | <mitigation plan> |

## Appendix

<!-- Detailed research notes, raw data, links to documentation -->
```

## Workflow

1. **Define criteria first** — before researching options, agree on what matters. Use the user's constraints (budget, timeline, team skills) to weight criteria
2. **Research each option** — run `bun run tools/comparison-matrix.ts --options "A,B,C" --criteria "perf,cost,DX"` to generate the comparison structure, then fill in with research
3. **Score consistently** — use the same scale for all options. A 5-point scale (Poor, Fair, Good, Very Good, Excellent) or numeric 1-10 works well
4. **Make a clear recommendation** — don't end with "it depends". Pick one and explain the conditions under which you'd pick differently

## Section guidance

### Criteria
Define criteria before researching options to avoid bias. Each criterion needs a weight (High/Medium/Low or numeric) and a clear description of what "good" looks like. Get the user to confirm criteria before proceeding.

### Options
Give each option a fair, balanced description. List both strengths and weaknesses. Don't write one option's section enthusiastically and another dismissively — let the comparison matrix do the ranking.

### Comparison Matrix
The core of the report. Rows are criteria, columns are options. Use consistent ratings. Include the weight column so the reader can re-evaluate with different priorities.

### Scoring
If using numeric scores, show the math. Weight x score per criterion, summed per option. This makes the recommendation transparent and lets the reader adjust weights to see how the ranking changes.

### Recommendation
State it clearly. Explain why the recommended option wins despite its weaknesses. Address what conditions would change the recommendation (e.g., "if budget were unconstrained, Option B would be better because...").

## Anti-patterns

- **Criteria defined after research** — this introduces bias toward whichever option you researched first
- **Missing weights** — without weights, all criteria are treated equally, which is rarely accurate
- **Vague ratings** — "Option A is good at performance" doesn't help. "Option A handles 10K req/s, Option B handles 2K req/s" does
- **No recommendation** — the whole point is to help make a decision. "It depends" is not useful
- **Ignoring constraints** — the theoretically best option is irrelevant if the team can't use it or afford it
- **Stale data** — always check the latest versions, pricing, and feature sets. Libraries change fast

## Tools

| File | What it covers |
|---|---|
| `tools/comparison-matrix.ts` | Generate comparison table: `bun run tools/comparison-matrix.ts --options "A,B,C" --criteria "perf,cost,DX"` |
| `../tools/report-scaffold.ts` | Generate skeleton: `bun run ../tools/report-scaffold.ts comparison <topic>` |
| `../tools/source-collector.ts` | Gather source material from files and git history |
