---
name: research
description: Writes research summary reports that synthesize findings from multiple sources with clear sourcing. Use when the user asks to research a topic, summarize findings, or produce a literature review or technology survey.
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
---

# Research Report

## Decision Tree

- What kind of research?
  - **Technology survey** → evaluate a category of tools/libraries, focus on ecosystem health and fit
  - **Technical deep-dive** → investigate how something works internally, focus on mechanisms and trade-offs
  - **Market research** → analyze market landscape, focus on trends, players, and opportunities
  - **User research synthesis** → summarize user feedback/interviews, focus on patterns and insights
  - **Literature review** → survey existing writing on a topic, focus on consensus and gaps

- How broad is the scope?
  - **Narrow question** → 1-3 sources may suffice, keep the report short
  - **Broad survey** → 5-10+ sources, use a structured synthesis with themes
  - **Ongoing topic** → note what's stable knowledge vs. rapidly changing

## Template

```markdown
# Research: <topic>

**Date:** <date>
**Author:** <name>
**Audience:** <who this is for>
**Status:** Draft | Review | Final

## Summary

<!-- 2-3 sentences: the key findings and their implications -->

## Research Question

<!-- The specific question(s) this research aims to answer -->

1. <Primary question>
2. <Secondary question, if any>

## Methodology

<!-- How the research was conducted -->

- **Sources searched:** <where you looked — web, docs, repos, papers>
- **Search terms:** <what you searched for>
- **Date range:** <when the sources are from>
- **Inclusion criteria:** <what qualified as a relevant source>
- **Limitations:** <what this research doesn't cover and why>

## Background

<!-- Context the reader needs to understand the findings -->

## Findings

### Finding 1: <title>

<Description of what was found>

**Sources:** [Source A](url), [Source B](url)
**Confidence:** High | Medium | Low
**Implication:** <what this means for the decision or project>

### Finding 2: <title>

<Description>

**Sources:** [Source C](url)
**Confidence:** High | Medium | Low
**Implication:** <what this means>

## Synthesis

<!-- Bring findings together. What patterns emerge? What's the overall picture? -->

### Key themes
1. <theme> — supported by findings 1, 3
2. <theme> — supported by findings 2, 4

### Consensus vs. debate
- **Consensus:** <what most sources agree on>
- **Debated:** <where sources disagree and why>

## Conclusions

<!-- Direct answers to the research questions -->

1. **<Question 1>** — <answer, with confidence level>
2. **<Question 2>** — <answer>

## Open Questions

<!-- What couldn't be answered and what further research would help -->

- <Question that remains unanswered>
- <Area that needs deeper investigation>

## Sources

| # | Source | Type | Date | Relevance |
|---|---|---|---|---|
| 1 | [<title>](url) | Article / Docs / Repo / Paper | <date> | <why it's relevant> |
| 2 | [<title>](url) | ... | <date> | ... |
```

## Workflow

1. **Define the research question** — a clear question focuses the research and prevents rabbit holes. Confirm with the user before starting
2. **Search broadly first** — run `bun run tools/research-scaffold.ts --topic <topic>` to set up the document, then use WebSearch to survey the landscape
3. **Read deeply second** — use WebFetch on the most relevant sources. Read primary sources, not just summaries
4. **Cross-reference** — never rely on a single source. Look for confirmation or contradiction across sources
5. **Synthesize** — don't just list findings. Identify themes, consensus, and disagreements. The synthesis section is where the research becomes useful
6. **Track sources rigorously** — every factual claim needs a source. Use the sources table to make it auditable

## Section guidance

### Research Question
Frame it as a specific, answerable question. "What's the best database?" is too broad. "Which embedded database has the best write throughput for append-only workloads under 100GB?" is researchable.

### Methodology
Be transparent about how you searched and what you excluded. This lets the reader assess whether the research is complete or if important sources might have been missed.

### Findings
Each finding is a discrete piece of information backed by sources. Rate confidence based on source quality and agreement:
- **High**: multiple reliable sources agree
- **Medium**: single reliable source or partial agreement
- **Low**: single source, anecdotal, or sources conflict

### Synthesis
The most important section. Individual findings are data points — the synthesis is the insight. Group findings into themes, identify where sources agree and disagree, and explain what the overall picture looks like.

### Open Questions
Research rarely answers everything. Being explicit about what's unknown is more useful than pretending to have complete answers. Frame open questions in a way that makes them actionable for future research.

### Sources
Every source gets an entry with type, date, and relevance note. This makes the research auditable and helps others extend it. Prefer primary sources (official docs, papers, benchmarks) over secondary (blog posts, tutorials).

## Anti-patterns

- **Single-source conclusions** — one blog post is not research. Cross-reference
- **Outdated sources** — check publication dates. A 2020 benchmark is probably irrelevant in 2026
- **Missing methodology** — without knowing how you searched, the reader can't assess completeness
- **Findings without implications** — "Library X has 50K GitHub stars" is a fact. "Library X has strong community support, reducing the risk of abandonment" is a useful finding
- **No synthesis** — a list of findings is a bibliography, not research. Connect the dots
- **Opinion presented as fact** — clearly separate what the sources say from your interpretation

## Tools

| File | What it covers |
|---|---|
| `tools/research-scaffold.ts` | Create research doc: `bun run tools/research-scaffold.ts --topic <topic>` |
| `../tools/report-scaffold.ts` | Generate skeleton: `bun run ../tools/report-scaffold.ts research <topic>` |
| `../tools/source-collector.ts` | Gather source material from files and git history |
