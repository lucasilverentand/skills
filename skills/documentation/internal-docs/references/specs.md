# Technical Specification

## When to use

Writing a detailed technical design for a feature, system, or component before implementation. A spec answers "how will this work?" with enough detail that someone could implement it.

## Template

```markdown
# Spec: <feature/system name>

**Date:** <date>
**Author:** <name>
**Status:** Draft | In Review | Approved | Superseded
**Reviewers:** <who should review>

## Summary

<!-- 2-3 sentences: what this spec proposes and why -->

## Background

<!-- Context the reader needs. What exists today? What problem does this solve? -->

## Goals and Non-Goals

### Goals
- <What this spec aims to achieve>

### Non-Goals
- <What this spec explicitly does NOT address>

## Design

### Overview

<!-- High-level description of the approach -->

### Architecture

<!-- System diagram (Mermaid), component interactions, data flow -->

### Data Model

<!-- Schema changes, new tables/collections, data structures -->

### API Design

<!-- Endpoints, request/response formats, error handling -->

### Key Decisions

<!-- Important design choices with reasoning -->

| Decision | Choice | Reasoning |
|---|---|---|
| <what was decided> | <what was chosen> | <why> |

## Alternatives Considered

### <Alternative A>

**Description:** <how it would work>
**Pros:** <advantages>
**Cons:** <disadvantages>
**Why rejected:** <reasoning>

## Implementation Plan

| Phase | Description | Effort | Dependencies |
|---|---|---|---|
| 1 | <what> | S/M/L | <what it depends on> |
| 2 | <what> | S/M/L | Phase 1 |

## Testing Strategy

- Unit tests: <what to test>
- Integration tests: <what to test>
- E2E tests: <what to test>

## Rollout Plan

<!-- How this gets deployed. Feature flags? Gradual rollout? Migration? -->

## Open Questions

- [ ] <Unresolved question that needs input>
- [ ] <Another open question>
```

## Section Guidance

### Summary
The reader who stops here should know what's being proposed and whether they need to read the full spec. Lead with the "what" and "why", not the "how".

### Goals and Non-Goals
Non-goals are as important as goals. They prevent scope creep and set reviewer expectations. "Support multi-tenancy" as a non-goal saves pages of design discussion.

### Design
The core of the spec. Write enough detail that an engineer unfamiliar with the codebase could implement it. Include diagrams — a Mermaid flowchart or sequence diagram is worth paragraphs of prose.

### Alternatives Considered
Show your reasoning. For each alternative, explain what it would look like and why the proposed design was chosen instead. Reviewers will think of these alternatives — addressing them upfront speeds up review.

### Implementation Plan
Break the work into phases with estimated effort. This helps reviewers assess feasibility and helps project managers plan.

## Anti-patterns

- **Spec as wish list** — a spec describes how something will work, not a list of desired features. Be concrete
- **Missing alternatives** — if you didn't consider alternatives, you haven't done enough design thinking
- **No non-goals** — without non-goals, scope discussions will happen in review instead of design
- **Implementation detail without rationale** — don't just say "use Redis". Say why Redis over alternatives
- **Spec after implementation** — write specs before building. A retroactive spec is documentation, not design
