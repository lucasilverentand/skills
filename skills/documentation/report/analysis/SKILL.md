---
name: analysis
description: Writes technical analysis and investigation reports with evidence-backed findings and recommendations. Use when the user asks to analyze a system, investigate an issue, audit code quality, or document a technical deep-dive.
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
---

# Analysis Report

## Decision Tree

- What is the analysis about?
  - **Investigating a bug or incident** → focus on timeline, root cause, and fix
  - **Evaluating architecture or design** → focus on trade-offs, constraints, and alternatives
  - **Code quality audit** → focus on patterns found, metrics, and specific examples
  - **Performance investigation** → focus on measurements, bottlenecks, and optimization opportunities
  - **Security review** → focus on vulnerabilities found, severity, and remediation

- How deep should it go?
  - **Quick assessment** (1-2 pages) → executive summary, key findings, recommendations only
  - **Full analysis** (3-10 pages) → all sections with detailed evidence
  - **Deep dive** (10+ pages) → everything plus appendices with raw data

## Template

```markdown
# Analysis: <topic>

**Date:** <date>
**Author:** <name>
**Audience:** <who this is for>
**Status:** Draft | Review | Final

## Executive Summary

<!-- 2-3 sentences: the key conclusion and recommended action -->

## Problem Statement

<!-- What question is being investigated? What triggered this analysis? -->

### Context
<!-- Background the reader needs to understand the analysis -->

### Scope
<!-- What is included and excluded from this analysis -->

## Methodology

<!-- How was evidence gathered? What tools and approaches were used? -->

- Source 1: <what and why>
- Source 2: <what and why>

## Findings

### Finding 1: <title>

**Evidence:**
<!-- Code snippets, data, screenshots, links -->

**Impact:** High | Medium | Low
**Confidence:** High | Medium | Low

### Finding 2: <title>

**Evidence:**
<!-- ... -->

**Impact:** High | Medium | Low
**Confidence:** High | Medium | Low

## Trade-offs

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| Option A | ... | ... | S/M/L |
| Option B | ... | ... | S/M/L |

## Recommendations

1. **<Action>** — <reasoning and expected outcome>. Priority: High
2. **<Action>** — <reasoning>. Priority: Medium
3. **<Action>** — <reasoning>. Priority: Low

## Appendix

<!-- Raw data, full code listings, detailed metrics — anything that supports the findings but would clutter the main text -->
```

## Workflow

1. **Define the question** — state the problem or question upfront. Every analysis needs a clear "what are we trying to answer?"
2. **Scope it** — define what's in scope and what's out. This prevents scope creep and sets reader expectations
3. **Gather evidence** — run `bun run tools/analysis-scaffold.ts --path <dir>` to collect codebase context, then supplement with WebSearch/WebFetch for external information
4. **Analyze** — look for patterns, root causes, and trade-offs. Don't just describe what you found — explain what it means
5. **Recommend** — end with concrete, prioritized actions. Every finding should connect to a recommendation

## Section guidance

### Executive Summary
Write this last, but place it first. A reader who stops here should know the key conclusion and what to do about it. No hedging — state the recommendation clearly.

### Problem Statement
Be precise about what triggered the analysis. "The API is slow" is not a problem statement. "P95 latency on /api/search exceeded 2s after the v3.2 release" is.

### Methodology
List every source of evidence and how it was collected. This lets the reader assess the strength of the conclusions. Include tool versions, query parameters, and date ranges.

### Findings
Each finding is a discrete observation backed by evidence. Rate each by impact (how much it matters) and confidence (how certain you are). Use code blocks, tables, and links liberally.

### Trade-offs
When recommending changes, always present the trade-offs. What do you gain, what do you lose, how much effort does it take? A table works well when comparing 2-3 approaches.

### Recommendations
Numbered, prioritized, and actionable. Each recommendation should reference which finding(s) it addresses. Include expected effort where possible.

## Anti-patterns

- **Findings without evidence** — every claim needs supporting data. "The code is messy" is an opinion. "There are 47 functions over 200 lines in `src/`" is a finding
- **Evidence without conclusions** — don't just dump data. Explain what it means and what to do about it
- **Missing trade-offs** — every recommendation has downsides. Acknowledge them
- **Scope creep** — define scope upfront and stick to it. Note out-of-scope findings in an appendix for future investigation
- **Burying the lead** — put the most important finding first, not last

## Tools

| File | What it covers |
|---|---|
| `tools/analysis-scaffold.ts` | Create analysis doc with codebase context: `bun run tools/analysis-scaffold.ts --path <dir> --topic <topic>` |
| `../tools/report-scaffold.ts` | Generate skeleton: `bun run ../tools/report-scaffold.ts analysis <topic>` |
| `../tools/source-collector.ts` | Gather source material from files and git history |
