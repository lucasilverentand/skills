# RFC (Request for Comments)

## When to use

Proposing a significant change that needs broad input — new architecture patterns, cross-team standards, process changes, or any decision that affects multiple teams or has long-term consequences. An RFC invites discussion before committing to a direction.

## How RFCs differ from specs

- **Specs** describe _how_ to build something — they're implementation-focused and typically owned by one team
- **RFCs** propose _what_ should change and _why_ — they're decision-focused and seek input from multiple stakeholders

## Template

```markdown
# RFC: <title>

**RFC #:** <number>
**Date:** <date>
**Author:** <name>
**Status:** Draft | Open for Comments | Accepted | Rejected | Withdrawn
**Comment deadline:** <date>

## Summary

<!-- 2-3 sentences: what this RFC proposes and what it changes -->

## Motivation

<!-- Why this change is needed. What problem exists today? What's the cost of inaction? -->

## Proposal

<!-- The concrete change being proposed. Be specific enough for reviewers to evaluate -->

### Details

<!-- Implementation-level details where needed to assess feasibility -->

## Trade-offs

| Aspect | Current State | After RFC | Risk |
|---|---|---|---|
| <aspect> | <how it works now> | <how it would work> | <what could go wrong> |

## Alternatives

### <Alternative A>
**What:** <description>
**Why not:** <reasoning>

### Do Nothing
**What:** Keep the current approach
**Why not:** <cost of inaction>

## Migration / Adoption

<!-- How do existing systems, teams, or processes transition? Is it backwards-compatible? -->

## Unresolved Questions

- <Question that reviewers should help answer>
- <Another open question>

## References

- <Link to related RFC, spec, or discussion>
```

## Lifecycle

1. **Draft** — author writes the RFC, gets informal feedback from close collaborators
2. **Open for Comments** — published to a broader group with a comment deadline (typically 1-2 weeks)
3. **Revision** — author addresses feedback, updates the RFC, may do another round
4. **Decision** — accepted, rejected, or withdrawn with documented reasoning
5. **Implementation** — if accepted, a spec or implementation plan follows

## Section Guidance

### Motivation
The most important section for getting buy-in. Don't assume the reader sees the same problem you do. Quantify the cost of inaction where possible: "We spend ~10 hours/week on manual deploys" is more compelling than "deploys are painful."

### Proposal
Be specific enough for reviewers to evaluate, but don't over-specify implementation. The goal is to agree on the direction, not the code.

### Alternatives
Always include "Do Nothing" as an option. If doing nothing is fine, the RFC probably isn't needed. For each alternative, give a fair description and an honest reason for rejection.

### Migration / Adoption
Often the hardest part. A great proposal fails if migration is impossible. Address backwards compatibility, transition period, and who does the work.

## Anti-patterns

- **RFC for trivial changes** — if one team can decide and implement it without affecting others, a spec or PR is enough
- **Fait accompli RFC** — publishing an RFC after the decision is already made defeats the purpose. If the decision is made, write a decision doc instead
- **No deadline** — RFCs without a comment deadline stay open forever. Set a deadline and stick to it
- **Ignoring feedback** — if reviewers raise concerns, address them in the RFC text. "Discussed in meeting" is not a response
- **Missing "Do Nothing" alternative** — always justify why the status quo isn't acceptable
