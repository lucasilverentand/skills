# Select and brief preset agents
These are portable role prompts selected by the lead through the plugin skill. They are not running agents, guaranteed native agent types, or a new orchestration service. The host's existing agent tools execute the assignments. Keep this table available to the lead; do not load all preset bodies into every agent.

## Baseline selection
For each ongoing task, select [efficiency planner](presets/efficiency-planner.md), [scope guard](presets/scope-guard.md), and the context advocate matching the project: [business/product advocate](presets/business-advocate.md) for commercial/internal products, or [OSS advocate](presets/oss-advocate.md) for community/open-source work. For personal/noncommercial or unclear projects, use the user/maintainer perspective without assumed commercial goals; ask only when it matters. Choose from stated project goals rather than assuming company ownership. A genuinely mixed decision can need both perspectives, but do not duplicate seats without a concrete reason. Reuse the task's existing baseline agents and advice; follow-ups do not start another team.

Keep these baseline agents distinct. A tiny task warrants only tiny assessments, not invented research, specialists, or debate. Queue within host concurrency limits.

## Add specialists for actual deliverables
|Preset|Select when|Economical combination|
|---|---|---|
|[Developer / architect](presets/developer-architect.md)|There is code to implement or an unresolved architecture/interface decision|One owner can design and implement its bounded slice; the lead may do work directly|
|[Independent reviewer](presets/independent-reviewer.md)|Meaningful implementation, uncertain design, material risk, or a required second-provider assessment|Review the integrated artifact; do not duplicate an already-relevant review|
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

Select by the task's actual deliverables, uncertainty and risk, not keyword matching. State why an added agent helps. Do not spawn all specialties because the work is called a product. For combined optional roles, one agent receives the relevant excerpts and one coherent deliverable. For quorum, respect the independent assessments and provider diversity rules in SKILL.md.

## Construct the assignment
The lead loads only the selected preset, applies the central [model/effort guide](models-and-usage.md), and uses [runtime.md](runtime.md) to choose the actual tool. Copy the relevant role instructions into the brief or provide an accessible exact path; do not assume a remote child can read the parent's filesystem. Include only the necessary task context and canonical knowledge excerpts.

The efficiency planner's brief includes the relevant model-routing excerpt and discovered model IDs, effort choices and host constraints. It must not guess available providers or settings from role names.

Every assignment includes this shared contract alongside its selected role:

```text
Complete only the assigned deliverable and permitted actions.
Use the supplied acceptance criteria, ownership, constraints and evidence.
Do not spawn agents or activate the full team.
Do not make external writes unless the lead explicitly assigned them
within the user's authorization.
Return material taste, product-owner or scope decisions to the lead with options and
a recommendation. Pause dependent work; continue independent work.
Distinguish observed facts, accepted decisions, inferences and unknowns.
Report result locations and checks honestly. No private reasoning transcript.
Return durable system-knowledge findings to the lead; do not create run reports.
```

Supply the task-specific fields from SKILL.md's compact brief. Do not ask each child to read the entire coordination skill or all role prompts. A role preset grants no tools, model access, or extra permissions. Keep model/provider policy centralized rather than hard-coding it into the presets.

## Examples
- **OSS typo fix:** baseline trio plus lead execution, no specialist roster; check the edit and confirm no system-knowledge change.
- **Planned code change:** baseline trio plus an appropriate coding model for implementation if delegation is useful; test the integrated result. Add a separate reviewer when the substance warrants it.
- **Consequential architecture:** baseline trio plus a focused strong developer/architect and an independent second-provider assessment of that same decision for quorum.
- **UI improvement:** baseline trio plus combined UX/UI work, following the project’s accepted design direction and accessibility needs; add content/accessibility responsibilities or agents only where useful.
- **Large knowledge reconciliation:** baseline trio plus a bounded knowledge steward; the lead saves and verifies changes to the existing records.
