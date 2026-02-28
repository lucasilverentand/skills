---
name: report
description: Writes structured reports and documents in Markdown from diverse source material. Routes to the appropriate report sub-type based on what the user needs — status updates, technical analysis, option comparisons, retrospectives, or research summaries.
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
---

# Report Writing

## Decision Tree

- What kind of report?
  - **Project status, sprint update, or weekly progress** → use `status/` sub-skill
  - **Technical analysis, investigation, or audit** → use `analysis/` sub-skill
  - **Comparing technologies, libraries, or approaches** → use `comparison/` sub-skill
  - **Retrospective, post-mortem, or incident review** → use `retro/` sub-skill
  - **Research summary, literature review, or survey** → use `research/` sub-skill
  - **Multiple report types needed** → run each sub-skill separately, then combine
  - **None of the above** → follow "General workflow" below with the custom template

## General workflow

Every report follows this process regardless of type:

1. **Clarify scope** — confirm the topic, audience, time period, and desired depth with the user
2. **Gather sources** — collect material using the approach that fits:
   - Files in the project → read them with Read/Glob/Grep
   - Git history → `tools/source-collector.ts --git-log --since <period>`
   - External information → WebSearch / WebFetch
   - User-provided context → use what's in the conversation
3. **Outline** — draft section headings before writing prose. Share the outline with the user if the report is large
4. **Write** — fill in each section with concrete evidence, not filler. Use tables for structured data, bullet lists for key points
5. **Review** — check for completeness, remove fluff, ensure every claim is grounded in sources

## Formatting rules

- **Title**: `# Report: <topic>` with date below
- **Audience marker**: state who the report is for right after the title
- **Executive summary**: every report starts with a 2-3 sentence summary
- **Tables** for structured comparisons, metrics, and timelines
- **Bullet lists** for key points and action items
- **Code blocks** with language tags when referencing code
- **Links** to source files and external references inline
- No filler paragraphs — every sentence should add information

## Quality checklist

Before delivering any report:

- [ ] Every claim is backed by evidence (code, data, link, or explicit reasoning)
- [ ] Action items are specific and assigned where possible
- [ ] Tables are used for any data with 3+ comparable items
- [ ] Executive summary can stand alone — a reader who only reads it gets the key message
- [ ] No orphan sections (empty or placeholder content)

## Shared tools

| File | What it covers |
|---|---|
| `tools/report-scaffold.ts` | Generate a report skeleton: `bun run tools/report-scaffold.ts <type> <topic>` |
| `tools/source-collector.ts` | Gather git history and file contents: `bun run tools/source-collector.ts --git-log --since <period>` |

## Sub-skill tools

| File | What it covers |
|---|---|
| `status/tools/status-gen.ts` | Collect git log, PR activity, and issue updates to draft a status report |
| `analysis/tools/analysis-scaffold.ts` | Create analysis doc with sections pre-filled from codebase context |
| `comparison/tools/comparison-matrix.ts` | Generate a comparison table from criteria and options |
| `retro/tools/retro-scaffold.ts` | Create retro doc with timeline from git/issue history |
| `research/tools/research-scaffold.ts` | Create research doc with structured sections and source tracking |
