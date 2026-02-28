---
name: retro
description: Writes retrospective and post-mortem reports that identify patterns, root causes, and actionable improvements. Use when the user asks for a retro, post-mortem, sprint retrospective, or incident review.
allowed-tools: Read Grep Glob Bash
---

# Retrospective Report

## Decision Tree

- What kind of retro?
  - **Sprint retrospective** → focus on team process, velocity, and workflow improvements
  - **Project retrospective** → focus on planning accuracy, scope changes, and delivery outcomes
  - **Incident post-mortem** → focus on timeline, root cause, and prevention. Use blameless tone
  - **Release retrospective** → focus on what shipped, what slipped, and release process improvements

- What's the scope?
  - **Single sprint** → `--since "2 weeks ago"`, focus on recent patterns
  - **Full project** → gather from project start, focus on big themes
  - **Single incident** → narrow timeline, deep root cause analysis

## Template

```markdown
# Retrospective: <project/sprint/incident name>

**Period:** <start date> to <end date>
**Author:** <name>
**Participants:** <who contributed to this retro>

## Summary

<!-- 2-3 sentences: overall assessment and the single most important takeaway -->

## Timeline

| Date | Event | Impact |
|---|---|---|
| <date> | <what happened> | <effect on project/team> |
| <date> | <what happened> | <effect> |

## What Went Well

### <Theme 1>
- <Specific practice or decision that worked>
- **Why it worked:** <what made this effective>
- **Keep doing:** <how to sustain this>

### <Theme 2>
- <Specific practice or decision>
- **Why it worked:** <reasoning>
- **Keep doing:** <action>

## What Didn't Go Well

### <Theme 1>
- <Specific issue or pain point>
- **Impact:** <what this cost in time, quality, or morale>
- **Root cause:** <why this happened — focus on systems, not people>

### <Theme 2>
- <Specific issue>
- **Impact:** <what it cost>
- **Root cause:** <why>

## Patterns

<!-- Recurring themes across multiple items. These are more important than individual items. -->

| Pattern | Frequency | Trend |
|---|---|---|
| <pattern> | <how often> | Getting better / worse / stable |

## Metrics

| Metric | Target | Actual | Notes |
|---|---|---|---|
| Velocity | <planned> | <actual> | <context> |
| Bug rate | <target> | <actual> | <context> |
| Cycle time | <target> | <actual> | <context> |

## Action Items

| # | Action | Owner | Deadline | Priority |
|---|---|---|---|---|
| 1 | <specific improvement> | @name | <date> | High |
| 2 | <specific improvement> | @name | <date> | Medium |
| 3 | <specific improvement> | @name | <date> | Low |

## Previous Action Items Review

| # | Action from last retro | Status | Notes |
|---|---|---|---|
| 1 | <what was committed> | Done / In progress / Not started | <context> |
```

## Workflow

1. **Collect sources** — run `bun run tools/retro-scaffold.ts --since <period>` to build a timeline from git history and gather activity data
2. **Build the timeline** — lay out key events chronologically. This grounds the discussion in facts
3. **Identify themes** — group observations into "went well" and "didn't go well" categories. Look for patterns across multiple events
4. **Find root causes** — for every "didn't go well" item, ask "why?" until you reach a systemic cause. Focus on processes and systems, never on individuals
5. **Write action items** — each action must be specific, owned, and time-bound. Limit to 3-5 high-priority items — more than that won't get done
6. **Review previous actions** — check what was committed in the last retro and whether it was followed through

## Section guidance

### Timeline
A factual sequence of events. No interpretation here — just what happened and when. This is especially important for incident post-mortems where accuracy matters.

### What Went Well
Don't skip this section. Recognizing what works is as important as identifying problems. For each item, explain why it worked so the team can deliberately continue it.

### What Didn't Go Well
Be specific about impact — "deploys were slow" is vague, "the release took 6 hours instead of the expected 30 minutes" is actionable. Always pair with root cause.

### Root Causes
Use the "5 whys" technique. The surface problem is rarely the real problem. "Tests were flaky" is a symptom. "No CI stability monitoring and no ownership of test infrastructure" is a root cause. Always focus on systems and processes, not people.

### Action Items
The most important section. Rules:
- **Specific**: "Add retry logic to the deploy script" not "improve deploys"
- **Owned**: every action has a single person responsible
- **Time-bound**: every action has a deadline
- **Limited**: 3-5 items max. More than that and nothing gets done
- **Reviewed**: start the next retro by checking these

## Anti-patterns

- **Blame-oriented language** — "Bob broke the deploy" → "The deploy process has no rollback mechanism". Always focus on systems
- **Vague action items** — "Be more careful" is not an action item. "Add a pre-deploy checklist" is
- **No follow-through** — action items that are never reviewed in the next retro are worthless
- **Recency bias** — don't focus only on the last few days. Look at the full period
- **Skipping "went well"** — retros that are only negative become demoralizing and miss opportunities to reinforce good practices
- **Too many action items** — pick 3-5 that matter most. Better to do 3 well than commit to 10 and do none

## For incident post-mortems specifically

- Use UTC timestamps in the timeline
- Include detection time (how long before the issue was noticed)
- Include resolution time (how long to fix)
- Classify severity: SEV1 (customer-facing outage), SEV2 (degraded service), SEV3 (internal impact only)
- Add a "prevention" section: what would have caught this earlier or prevented it entirely

## Tools

| File | What it covers |
|---|---|
| `tools/retro-scaffold.ts` | Create retro with timeline: `bun run tools/retro-scaffold.ts --since "2 weeks ago"` |
| `../tools/report-scaffold.ts` | Generate skeleton: `bun run ../tools/report-scaffold.ts retro <topic>` |
| `../tools/source-collector.ts` | Gather git history: `bun run ../tools/source-collector.ts --git-log --since <period>` |
