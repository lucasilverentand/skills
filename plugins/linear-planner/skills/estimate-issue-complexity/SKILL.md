---
name: estimate-issue-complexity
description: Assigns Linear issue points using Luca's complexity-only scale. Use when the user asks to grade, estimate, score, point, size, triage, compare, normalize, or audit Linear issues by complexity, especially when they mention points, estimates, acceptance criteria, issue sizing, or avoiding time estimates.
---

# Estimate Issue Complexity
Use this skill to assign Linear issue points by complexity only. Do not estimate time.

## Core rule
Score the issue by complexity, uncertainty, scope, risk, dependencies, and validation burden. Do not use hours, days, sprint length, calendar duration, or words like "quick" and "long" as the basis for the score.

## Workflow
1. Inspect the issue title, description, linked context, comments, labels, dependencies, and acceptance criteria before assigning points.
2. If acceptance criteria are missing or vague, infer practical acceptance criteria from the issue and use those inferred criteria while scoring.
3. Choose the lowest point value that honestly covers the complexity needed to satisfy the acceptance criteria.
4. Explain the score in terms of scope, uncertainty, risk, dependencies, and validation.
5. If the issue is larger than 16 points, do not assign 32 or 64. Mark it as needing decomposition and describe the split that would make the child issues scoreable.

## Scale
|Points|Use when|
|---|---|
|0|Tracking, placeholder, parent, administrative, or coordination-only issue with no direct deliverable. Use 0 rarely and only when the issue is not itself execution work.|
|1|Tiny, obvious, isolated change with clear verification and almost no uncertainty. The expected outcome is directly testable and the blast radius is minimal.|
|2|Straightforward change with limited investigation, a small number of touched areas, and obvious edge cases. The path is mostly known.|
|4|Moderate bounded work with multiple moving parts, several acceptance criteria, or an existing workflow to understand before changing it.|
|8|Substantial work with meaningful uncertainty, cross-cutting behavior, integrations, multiple states, or higher regression risk. Validation should cover more than the happy path.|
|16|Largest acceptable coherent issue. Broad but still reviewable as one outcome, likely requiring careful design, validation, rollout thinking, or multiple affected systems.|

## Oversized issues
If an issue appears larger than 16 points, treat it as too large for one execution issue. Recommend breaking it into smaller Linear issues with clear acceptance criteria. A parent or tracking issue may receive 0 points if it only coordinates those child issues.

## Output
When reporting a score, include:
- The chosen point value.
- The acceptance criteria used for scoring, including inferred criteria if the issue did not provide them.
- The complexity reasons, without time language.
- Any decomposition recommendation if the issue is too broad.
