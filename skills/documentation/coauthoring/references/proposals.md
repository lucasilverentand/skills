# Proposal

## When to use

Pitching a project, initiative, or significant investment of resources. A proposal answers "should we do this?" — it makes the case, defines success, and asks for a decision.

## How proposals differ from specs and RFCs

- **Specs** describe how to build something (implementation-focused)
- **RFCs** seek input on a technical direction (discussion-focused)
- **Proposals** make a business case for doing something (decision-focused)

## Template

```markdown
# Proposal: <title>

**Date:** <date>
**Author:** <name>
**Audience:** <decision-makers>
**Decision needed by:** <date>

## TL;DR

<!-- 1-2 sentences: what you're proposing and what you need (approval, resources, budget) -->

## Problem

<!-- What problem exists? Who is affected? What's the cost of not solving it? -->

### Evidence

<!-- Data, user feedback, metrics, or incidents that demonstrate the problem -->

## Proposed Solution

<!-- What you want to do, at a high level -->

### Scope

- **In scope:** <what this covers>
- **Out of scope:** <what this doesn't cover>

### Success Criteria

| Metric | Current | Target | How Measured |
|---|---|---|---|
| <metric> | <baseline> | <goal> | <measurement method> |

## Cost and Resources

| Resource | Amount | Duration | Notes |
|---|---|---|---|
| Engineering time | <person-weeks> | <timeline> | <who> |
| Infrastructure | <cost> | <ongoing/one-time> | <details> |
| External | <cost> | <timeline> | <vendor, tool, etc.> |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| <risk> | Low/Med/High | Low/Med/High | <plan> |

## Alternatives

### <Alternative A>
**Cost:** <resources>
**Pros:** <advantages>
**Cons:** <disadvantages>

### Do Nothing
**Cost:** <ongoing cost of the status quo>
**Consequence:** <what happens if we don't act>

## Timeline

| Phase | Duration | Deliverable |
|---|---|---|
| Phase 1 | <weeks> | <what's delivered> |
| Phase 2 | <weeks> | <what's delivered> |

## Ask

<!-- What specific decision or action you need from the audience -->
```

## Section Guidance

### TL;DR
Write this for the decision-maker who has 30 seconds. State what you want and what it costs. "Requesting 3 engineer-weeks to migrate auth to Better Auth, eliminating the compliance risk flagged by legal."

### Problem
Ground the problem in evidence. User quotes, metrics, incident counts, or time-spent analysis. Don't assume the reader feels the problem as acutely as you do.

### Success Criteria
Define what "done" looks like before starting. Measurable criteria prevent scope creep and make it possible to evaluate the project after completion.

### Cost and Resources
Be honest about the cost. Underestimating to get approval leads to trust erosion when the real cost emerges. Include opportunity cost — what won't get done if this is prioritized.

### Ask
End with a clear, specific ask. "Please approve this proposal by March 15" not "Let me know what you think."

## Anti-patterns

- **Solution looking for a problem** — start with the problem, not the technology you want to use
- **No success criteria** — without measurable goals, you can't prove the project succeeded
- **Hidden costs** — always include opportunity cost. What doesn't get built if this is approved?
- **No "Do Nothing" option** — if the status quo is fine, the proposal isn't needed
- **Vague ask** — "Thoughts?" is not an ask. "Approve 3 engineer-weeks starting April 1" is
