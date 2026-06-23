# Issue complexity scale
Use this reference to assign issue points as metadata. Do not estimate time.

## Core rule
Score by the implementation complexity required to satisfy the acceptance criteria. Then bump the score one level when meaningful uncertainty, dependency risk, or validation risk would make the issue materially harder to execute safely.

## Workflow
1. Inspect the issue title, body, acceptance criteria, implementation notes, links, dependencies, and metadata before assigning points.
2. If acceptance criteria are missing or vague, infer practical criteria only when the issue remains honest and useful; otherwise mark the issue as not ready.
3. Choose the lowest point value that honestly covers the implementation complexity.
4. Bump one level for meaningful uncertainty, dependency risk, or validation risk.
5. Store the score in the destination's estimate or points field when available.
6. If the issue is larger than 16 points, do not assign 32 or 64. Mark it as needing decomposition and describe the split that would make the child issues scoreable.

## Scale
Work through the scale in this order before choosing a point value:

1. Is this direct implementation work?
   - If the issue only tracks, coordinates, groups, or reminds, avoid creating it unless a human planner explicitly wants a tracker.
   - If it has a direct deliverable, continue.
2. Is the deliverable tiny, isolated, and obvious?
   - If one small change satisfies clear criteria with minimal regression risk, score 1.
   - If there is more than one meaningful step, continue.
3. Is the path mostly known?
   - If the change is straightforward, local, and has obvious edge cases, score 2.
   - If the implementer must understand an existing workflow or coordinate several criteria, continue.
4. Is the work bounded but multi-part?
   - If the issue has several moving parts but a clear shape and limited uncertainty, score 4.
   - If the issue crosses areas, integrations, states, or unknown behavior, continue.
5. Does validation need more than the happy path?
   - If the issue has meaningful uncertainty, regression risk, or cross-cutting behavior, score 8.
   - If it is broader than that but still one coherent reviewable outcome, continue.
6. Is this the largest coherent issue worth keeping together?
   - If careful design, validation, rollout thinking, or multiple affected systems are needed but one issue still makes sense, score 16.
   - If the issue cannot be reviewed as one coherent outcome, mark it oversized and recommend decomposition.

|Points|Use when|
|---|---|
|1|Tiny, obvious, isolated change with clear acceptance criteria and almost no uncertainty.|
|2|Straightforward change with limited investigation, a small number of touched areas, and obvious edge cases.|
|4|Moderate bounded work with multiple moving parts, several acceptance criteria, or an existing workflow to understand.|
|8|Substantial work with meaningful uncertainty, cross-cutting behavior, integrations, multiple states, or higher regression risk.|
|16|Largest acceptable coherent issue. Broad but still reviewable as one outcome, likely requiring careful design, validation, or multiple affected systems.|

## Oversized issues
If an issue appears larger than 16 points, treat it as too large for one implementation issue. Recommend breaking it into smaller issues with clear acceptance criteria and metadata. Do not create a tracker issue by default.

## Output
When reporting a score, include:
- The chosen point value.
- Whether the score was bumped for uncertainty, dependency risk, or validation risk.
- The acceptance criteria used for scoring, including inferred criteria if they were safe to infer.
- Any decomposition recommendation if the issue is too broad.
