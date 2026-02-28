---
name: status
description: Writes project status and sprint update reports from git history and project state. Use when the user asks for a status report, sprint summary, weekly update, or progress overview.
allowed-tools: Read Grep Glob Bash
---

# Status Report

## Decision Tree

- What period is the report covering?
  - **Weekly update** → use `--since "1 week ago"` when collecting sources
  - **Sprint summary** → use `--since "2 weeks ago"` or the sprint start date
  - **Monthly/quarterly** → use the appropriate date range, group by workstream
  - **Ad-hoc project status** → gather from current branch state and recent PRs

- Who is the audience?
  - **Team members** → focus on technical details, specific PRs, and blockers
  - **Stakeholders / management** → focus on outcomes, milestones, and risks at a high level
  - **Cross-team** → focus on interfaces, dependencies, and shared milestones

## Template

```markdown
# Status Report: <project/team name>

**Period:** <start date> to <end date>
**Author:** <name>
**Audience:** <who this is for>

## Summary

<!-- 2-3 sentences: what happened this period, the single most important thing -->

## Accomplishments

### <Workstream A>
- Completed X — <brief description, link to PR or commit>
- Shipped Y — <outcome and any metrics>

### <Workstream B>
- Completed Z — <brief description>

## In Progress

| Item | Owner | Status | ETA |
|---|---|---|---|
| Feature A | @name | 70% | next Tuesday |
| Bug fix B | @name | In review | tomorrow |

## Blockers and Risks

| Blocker | Impact | Mitigation | Owner |
|---|---|---|---|
| Waiting on API from team X | Blocks feature A | Escalated to PM | @name |
| CI flaky tests | Slows all PRs | Investigating root cause | @name |

## Metrics

| Metric | This period | Previous | Trend |
|---|---|---|---|
| PRs merged | 12 | 8 | up |
| Open bugs | 3 | 5 | down |
| Test coverage | 84% | 82% | up |

## Next Steps

- [ ] <What's planned for the next period>
- [ ] <Key milestones coming up>
- [ ] <Dependencies to resolve>
```

## Workflow

1. **Collect sources** — run `bun run tools/status-gen.ts --since <period>` to gather git log, PR counts, and contributor activity
2. **Group by workstream** — organize completed work into logical themes, not a flat list of commits
3. **Highlight blockers prominently** — these are the most actionable part of any status report. Include impact and mitigation for each
4. **Add metrics** — even simple counts (PRs merged, bugs closed) make progress concrete
5. **Keep it scannable** — bullet points over paragraphs, tables for anything with 3+ items

## Section guidance

### Summary
The reader who only reads this section should understand the overall state of the project. Lead with the most important news — a shipped feature, a critical blocker, or a milestone hit.

### Accomplishments
Group by workstream or theme, not chronologically. Each item should state what was done and link to evidence (PR, commit, deploy). Focus on outcomes ("users can now X") over activities ("merged PR #123").

### In Progress
Use a table with owner, progress indicator, and ETA. This makes it immediately clear who is working on what and when it lands.

### Blockers and Risks
Every blocker needs: what it is, what it impacts, what the mitigation plan is, and who owns resolution. Risks that haven't materialized yet go here too with likelihood assessment.

### Metrics
Pick 3-5 metrics that matter for the project. Show trend (up/down/flat) and comparison to the previous period. Don't include metrics you aren't tracking — it's better to have 3 real ones than 10 fake ones.

### Next Steps
Concrete, time-bound items. Not aspirational — these are commitments for the next period. Use checkboxes so they can be tracked.

## Anti-patterns

- **Wall of commits** — don't just paste `git log`. Synthesize the commits into meaningful accomplishments
- **No blockers listed** — if there are genuinely no blockers, say so explicitly. An empty section looks like you forgot
- **Vague next steps** — "continue working on X" is not a next step. Be specific about what will be done
- **Missing audience context** — a status report for your team lead reads very differently from one for a client

## Tools

| File | What it covers |
|---|---|
| `tools/status-gen.ts` | Collect git log, PR stats, contributor activity: `bun run tools/status-gen.ts --since "1 week ago"` |
| `../tools/report-scaffold.ts` | Generate skeleton: `bun run ../tools/report-scaffold.ts status <topic>` |
| `../tools/source-collector.ts` | General source gathering: `bun run ../tools/source-collector.ts --git-log --since <period>` |
