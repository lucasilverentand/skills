---
name: reports
description: Writes structured reports in Markdown from diverse source material — status updates, technical analyses, option comparisons, retrospectives, and research summaries. Routes to the right report type based on context, then follows a type-specific template with evidence-backed content.
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
---

# Reports

## Voice & Style
> See `documentation/writing-style` for full guide (`references/voice-and-tone.md`)

Factual and evidence-driven. Every claim is backed by data, code, or sources. Tables for structured comparisons. Executive summary that stands alone. No filler paragraphs.

> For substantial documents, follow the co-authoring workflow: `documentation/writing-style` → `references/co-authoring-workflow.md`

## Decision Tree

- What kind of report?
  - **Project status, sprint update, or weekly progress** → follow `references/status.md`
  - **Technical analysis, investigation, or audit** → follow `references/analysis.md`
  - **Comparing technologies, libraries, or approaches** → follow `references/comparison.md`
  - **Retrospective, post-mortem, or incident review** → follow `references/retro.md`
  - **Research summary, literature review, or survey** → follow `references/research.md`
  - **None of the above** → use the general workflow below with a custom structure

## General workflow

Every report follows this process regardless of type:

1. **Clarify scope** — confirm the topic, audience, time period, and desired depth with the user
2. **Gather sources** — collect material using the approach that fits:
   - Files in the project → read them with Read/Glob/Grep
   - Git history → `bun run tools/source-collector.ts --git-log --since <period>`
   - External information → WebSearch / WebFetch
   - User-provided context → use what's in the conversation
3. **Outline** — draft section headings before writing prose. Share the outline with the user if the report is large
4. **Write** — fill in each section with concrete evidence, not filler. Use tables for structured data, bullet lists for key points
5. **Review** — check against `documentation/writing-style` → `references/quality-standards.md`

## Formatting rules

- **Title**: `# Report: <topic>` with date below (or type-specific title like `# Analysis: <topic>`)
- **Audience marker**: state who the report is for right after the title
- **Executive summary**: every report starts with a 2-3 sentence summary
- **Tables** for structured comparisons, metrics, and timelines
- **Bullet lists** for key points and action items
- **Code blocks** with language tags when referencing code
- **Links** to source files and external references inline

## Tools

| Tool | Purpose |
|---|---|
| `tools/report-scaffold.ts` | Generate a report skeleton: `bun run tools/report-scaffold.ts <type> <topic>` |
| `tools/source-collector.ts` | Gather git history and file contents: `bun run tools/source-collector.ts --git-log --since <period>` |
| `tools/status-gen.ts` | Collect git log, PR stats, and contributor activity for status reports |
| `tools/analysis-scaffold.ts` | Create analysis doc pre-filled with codebase context |
| `tools/comparison-matrix.ts` | Generate a comparison table from criteria and options |
| `tools/retro-scaffold.ts` | Create retro doc with timeline from git/issue history |
| `tools/research-scaffold.ts` | Create research doc with structured sections and source tracking |

## Key references

| File | What it covers |
|---|---|
| `references/status.md` | Status report template, workflow, section guidance |
| `references/analysis.md` | Analysis report template, methodology, findings format |
| `references/comparison.md` | Comparison report template, criteria, scoring |
| `references/retro.md` | Retrospective template, blameless tone, action items |
| `references/research.md` | Research report template, source tracking, synthesis |
| `documentation/writing-style` | Shared voice, tone, formatting, and quality standards |
