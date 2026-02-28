# Report

Writes structured reports and documents in Markdown from diverse source material.

## Sub-types

| Sub-type | What it covers |
|---|---|
| `status` | Project status updates, sprint summaries, weekly progress reports |
| `analysis` | Technical analysis, investigations, audits, deep-dives |
| `comparison` | Side-by-side evaluation of options, technologies, or approaches |
| `retro` | Retrospectives, post-mortems, incident reviews |
| `research` | Research summaries, literature reviews, technology surveys |

## Shared Tools

- `tools/report-scaffold.ts` — generates a report skeleton based on report type and topic
- `tools/source-collector.ts` — gathers and summarizes source material from files and git history

## Sub-skill Tools

- `status/tools/status-gen.ts` — collects git log, PR activity, issue updates to draft a status report
- `analysis/tools/analysis-scaffold.ts` — creates analysis doc with sections pre-filled from codebase context
- `comparison/tools/comparison-matrix.ts` — generates a comparison table from criteria and options
- `retro/tools/retro-scaffold.ts` — creates retro doc with timeline from git/issue history
- `research/tools/research-scaffold.ts` — creates research doc with structured sections
