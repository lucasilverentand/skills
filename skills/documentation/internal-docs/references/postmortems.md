# Postmortem

## When to use

After an incident, outage, or significant failure. A postmortem documents what happened, why, and what will prevent it from happening again. The goal is learning, not blame.

## How postmortems differ from retrospectives

- **Postmortems** are incident-focused — something broke, and this documents the failure, root cause, and prevention
- **Retrospectives** (`documentation/reports` → `references/retro.md`) are period-focused — they review a sprint, project, or release for process improvements

## Template

```markdown
# Postmortem: <incident title>

**Date of incident:** <date>
**Date of postmortem:** <date>
**Author:** <name>
**Severity:** SEV1 | SEV2 | SEV3
**Status:** Draft | Review | Final

## Summary

<!-- 2-3 sentences: what happened, how long it lasted, what the impact was -->

## Impact

- **Duration:** <start time> to <end time> (UTC)
- **Detection time:** <how long before the issue was noticed>
- **Resolution time:** <how long to fix>
- **Users affected:** <number or percentage>
- **Revenue impact:** <if applicable>
- **Data loss:** <if applicable>

## Timeline

All times in UTC.

| Time | Event |
|---|---|
| HH:MM | <what happened — trigger, detection, escalation, fix, verification> |
| HH:MM | <next event> |

## Root Cause

<!-- The systemic cause, not the surface symptom. Use the "5 whys" technique. -->

### Surface cause
<What appeared to go wrong>

### Contributing factors
- <Factor 1 — e.g., missing monitoring>
- <Factor 2 — e.g., no rollback mechanism>

### Root cause
<The underlying systemic issue>

## What Went Well

- <Things that worked during the incident response>
- <Processes or tools that helped>

## What Went Poorly

- <Things that made the incident worse or slower to resolve>
- <Gaps in process, tooling, or knowledge>

## Action Items

| # | Action | Type | Owner | Deadline | Priority |
|---|---|---|---|---|---|
| 1 | <specific prevention measure> | Prevent | @name | <date> | High |
| 2 | <detection improvement> | Detect | @name | <date> | High |
| 3 | <response improvement> | Respond | @name | <date> | Medium |

## Lessons Learned

<!-- Broader takeaways beyond the specific action items -->

- <Lesson that applies beyond this incident>
```

## Blameless Postmortem Principles

1. **Focus on systems, not people** — "The deploy process has no rollback mechanism" not "Bob deployed without testing"
2. **Assume good intentions** — everyone involved was trying to do their job well given the information they had
3. **Ask "how did the system allow this?" not "who did this?"** — if a human error caused an outage, the system should have prevented it
4. **Share openly** — the value of a postmortem comes from others learning from it

## Section Guidance

### Timeline
Factual, chronological, in UTC. Every significant event: trigger, detection, first response, escalation, attempted fixes, resolution, verification. Include communication events too (when the status page was updated, when customers were notified).

### Root Cause
Use the "5 whys" technique. Keep asking "why?" until you reach a systemic cause:
- Why did users see errors? → The API returned 500s
- Why did the API return 500s? → The database connection pool was exhausted
- Why was the pool exhausted? → A query was holding connections open for 30+ seconds
- Why wasn't this caught? → No query timeout or connection pool monitoring
- **Root cause:** Missing database query timeouts and connection pool observability

### Action Items
Categorize each action by type:
- **Prevent** — stop this class of incident from happening
- **Detect** — catch it faster next time
- **Respond** — handle it better when it does happen

Limit to 3-5 high-priority items. Each must be specific, owned, and time-bound.

## Severity Classification

| Severity | Definition | Example |
|---|---|---|
| SEV1 | Customer-facing outage, data loss, or security breach | API completely down for 30+ minutes |
| SEV2 | Degraded service, partial outage, or significant performance impact | API P95 latency > 10s, some features unavailable |
| SEV3 | Internal impact only, no customer-facing effect | CI/CD pipeline broken, internal tool down |

## Anti-patterns

- **Blame-oriented language** — any sentence that names a person as the cause is a red flag. Rewrite to focus on the system
- **No action items** — a postmortem without prevention actions is just storytelling
- **Vague action items** — "Be more careful" or "improve monitoring" are not actions. "Add connection pool alerting at 80% threshold" is
- **Writing it months later** — details fade. Write the postmortem within a week of the incident
- **Skipping "what went well"** — incident response usually has things that worked. Recognizing them matters
- **No follow-through** — track action items and review them. Unresolved action items mean the postmortem was wasted
