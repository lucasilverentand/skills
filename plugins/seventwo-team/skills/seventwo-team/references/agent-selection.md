# Select and brief preset agents
These are portable role prompts the lead selects. They are not running agents or native agent types; the host's agent tools execute the assignments. Keep this index available to the lead, and load only the preset bodies an assignment needs.

## Baseline roles by tier
Use the tier table in SKILL.md §3; tiny tasks use no baseline agents.

- **Standard:** one advisor receives the [efficiency planner](presets/efficiency-planner.md) and [scope guard](presets/scope-guard.md) presets together and returns one combined assessment: tier challenge, split, models, checks, keep/cut/defer. SKILL.md §3 says when to split it or add the context advocate.
- **Consequential:** the efficiency planner, scope guard and context advocate ([business/product](presets/business-advocate.md) or [OSS](presets/oss-advocate.md)) run as distinct agents so the scope check stays independent of the plan.

Choose the context advocate from stated project goals, not assumed company ownership. A genuinely mixed decision can use both advocates. Reuse the task's existing advisors and their advice; follow-ups do not start another team.

## Add specialists for actual deliverables
|Preset|Select when|Economical combination|
|---|---|---|
|[Developer / architect](presets/developer-architect.md)|There is code to implement or an unresolved architecture/interface decision|One owner can design and implement its bounded slice; the lead may do work directly|
|[Independent reviewer](presets/independent-reviewer.md)|Required by SKILL.md §5 (consequential, sensitive, or behavior not covered by passing checks), including a required second-provider assessment|Review the integrated artifact; do not duplicate an already-relevant review|
|[Git / PR specialist](presets/git-specialist.md)|Any commit or PR the team will author or edit; commit/PR convention problems|One focused pass over the real diff and exact messages; reuse advice until scope or metadata changes|
|[UX expert](presets/ux-expert.md)|Flows, navigation, user friction, states, or research interpretation change|Combine with UI/content on small surfaces|
|[UI designer](presets/ui-designer.md)|Visual composition, components, responsive layouts or design consistency change|Combine with UX for focused UI work|
|[Content / UX writer](presets/content-writer.md)|Copy or terminology is a distinct deliverable|Add the role to the UX brief when small|
|[Accessibility reviewer](presets/accessibility-reviewer.md)|Changed interactions create accessibility uncertainty or explicit validation needs|Include relevant checks in UX/UI unless independent scrutiny warrants a separate agent|
|[Security / privacy reviewer](presets/security-privacy-reviewer.md)|A scoped security task or material affected trust/data risk needs specialist scrutiny|Follow applicable security skills; ordinary changes do not imply a full scan|
|[Performance / reliability engineer](presets/performance-reliability.md)|Latency, cost, scale or failure/recovery behavior is materially at issue|Combine with verification for a narrow measured change|
|[QA / verification specialist](presets/qa-verifier.md)|Acceptance verification is complex, laborious, or integration-sensitive|Lead/implementer handles simple checks; preserve independence where warranted|
|[Product analyst](presets/product-analyst.md)|Real options, product ambiguity or metric definitions need analysis|Avoid duplicating the context advocate's assessment|
|[Knowledge steward](presets/knowledge-steward.md)|Significant evidence needs reconciliation across existing records|Lead handles small documentation/tracker updates directly|

Select by actual deliverables, uncertainty and risk, not keywords, and state why each added agent helps. When combining optional roles, give one agent the relevant excerpts and one coherent deliverable. Quorum rules live in SKILL.md §5.

## Construct the assignment
Load only the selected preset, apply [models-and-usage.md](models-and-usage.md), and pick the tool with [runtime.md](runtime.md). Copy the role instructions into the brief, or give an exact path the child can actually read; a remote or cross-provider child may not share the parent's filesystem. Include only necessary task context and knowledge excerpts. The planner's brief also includes the discovered model IDs, effort values and host limits, so it never guesses them.

Every assignment carries this shared contract next to its role:

```text
Complete only the assigned deliverable and permitted actions.
Use the supplied acceptance criteria, ownership, constraints and evidence.
Do not spawn agents or activate the full team.
Make no external writes unless the lead explicitly assigned them
within the user's authorization.
Return material taste, product-owner or scope decisions to the lead with
options and a recommendation. Pause dependent work; continue independent work.
Distinguish observed facts, accepted decisions, inferences and unknowns.
Report result locations and checks honestly. No private reasoning transcript.
Return durable system-knowledge findings to the lead; create no run
reports unless the lead assigns one at the user's request.
```

Fill the task-specific fields from SKILL.md's brief template. Do not ask a child to read the whole coordination skill or every preset. A preset grants no tools, model access or permissions, and model/provider policy stays centralized rather than in presets.

## Examples
- **Typo fix (tiny):** lead edits, checks the rendered result, confirms no documentation change. No agents.
- **Planned code change (standard):** one combined planner/scope advisor on an economical model; the lead or one coding worker implements; a separately briefed reviewer checks the integrated diff when SKILL.md §5 requires it.
- **UI improvement (standard):** combined advisor plus one UX/UI specialist following the accepted design direction; add accessibility or content responsibilities to that brief rather than more agents.
- **Consequential architecture:** full trio, a strong developer/architect, and an independent second-provider assessment of the same decision for quorum.
- **Large knowledge reconciliation (consequential when records conflict):** full trio plus a bounded knowledge steward; the lead saves and verifies the record changes.

### Worked brief: combined advisor for a standard task
```text
Role: combined efficiency planner + scope guard (presets attached below).
Deliverable: execution split and keep/cut/defer list, at most 200 words.
Acceptance: the PR adds a `--json` flag to the internal `cli status` command
(no outside consumers of its output); existing output unchanged; tests cover
both modes. Read-only; no edits, no agents.
Evidence: src/cli/status.ts, tests/status.test.ts, CONTRIBUTING.md (tests required).
Dependencies: none; the lead integrates.
Models available: <IDs from the live catalog>; no user budget.
Return: is "standard" right (no auth, data or outside-consumer contract)?;
split with model/effort and one-line reasons; keep/cut/defer; one material
uncertainty.
[shared contract]
[efficiency-planner.md body]
[scope-guard.md body]
```
