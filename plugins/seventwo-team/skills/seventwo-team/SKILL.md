---
name: seventwo-team
description: Use when the user requests a SevenTwo Team or has enabled it as their default for product and open-source work. Coordinate efficient task-selected advocates and specialists, adapting to the current user’s tools, project conventions, model preferences, and documentation workflow.
---

# SevenTwo Team
Deliver the user's task with a team sized to the task. The current thread is the lead: it plans, mediates, integrates, owns external writes and talks to the user. SevenTwo Team is the workflow's name, not an assumption about the user's company or priorities. Optimize the project's stated outcome, quality and total effort together.

Activate once per ongoing task, when the user selects this workflow or has made it their default; respect opt-outs and narrower instructions. Delegated agents do only their assigned role and never activate a team themselves. Use applicable domain skills alongside this one.

## 1. Adapt before acting
1. Load the saved profile and matching project overrides with [preferences.md](references/preferences.md). Reuse known tools, destinations and provider preferences instead of rediscovering them.
2. For first use or materially changed context, follow [context-setup.md](references/context-setup.md) and discover only the fields this task needs. No tracker, repository-local docs, one provider or no external tools are valid setups. Never provision services or assume a subscription.
3. If a consequential gap remains, ask one bundled question with options and a recommendation. Keep independent, reversible work moving while waiting.

## 2. Define the result
State the outcome, testable acceptance, constraints and authorized endpoint; one sentence is enough for a tiny change. Without a stated endpoint, complete and verify the work where it lives. Editing never by itself authorizes a push, merge, publication, deployment or spending.

Read the relevant project guidance and current evidence. Surface unsettled taste, product-owner or business decisions before dependent work. Choose the smallest complete solution; keep required safeguards and skip speculative improvements.

## 3. Size the team
Pick the smallest tier that fits. When unsure, start smaller and move up when evidence shows real risk or disagreement.

|Tier|Typical task|Team|
|---|---|---|
|**Tiny**|One obvious, low-risk change with a cheap check (typo, config value, small doc fix)|Lead executes directly. No advisors; the lead does a one-line efficiency/scope self-check.|
|**Standard**|Multi-step but settled and reversible work (planned feature slice, focused refactor, docs pass)|One combined advisor covering efficiency and scope. Add the context advocate only when a stakeholder tradeoff is live. Add specialists for actual deliverables.|
|**Consequential**|Several workstreams, architecture or contracts, security/privacy/data risk, hard-to-reverse changes, unclear product direction|Full baseline trio as distinct agents, plus specialists and independent review.|

Baseline roles, used per tier above:

- **Efficiency planner** ([preset](references/presets/efficiency-planner.md)): smallest useful split, model mix, dependencies and proportionate checks, counting briefing, coordination and rework.
- **Scope guard** ([preset](references/presets/scope-guard.md)): checks the plan independently for drift, speculative abstractions, unrelated cleanup and over-planning, without weakening required quality.
- **Context advocate:** [business/product advocate](references/presets/business-advocate.md) for commercial or internal products, [OSS advocate](references/presets/oss-advocate.md) for community projects. For personal projects, use the maintainer's perspective without inventing business goals.

[agent-selection.md](references/agent-selection.md) has the specialist catalog, shared contract and worked examples. Receive advice before committing the plan or launching dependent workers. Reconsult only when scope, constraints, risk or evidence change; follow-ups reuse the existing team.

## 4. Delegate
Read [runtime.md](references/runtime.md) before the first delegation and follow the host's actual tools, isolation, waiting, cancellation and approvals. Presets are instructions, not registered agents, tools or permissions. If agents cannot run, say so and do the work directly. Never present a simulated role as a real assessment.

Choose models and effort with [models-and-usage.md](references/models-and-usage.md): scarce strong reasoning for the uncertain or difficult part, economical capable models for settled execution and preparation. Respect the user's provider preferences and real access, and keep the current lead rather than starting another coordinator.

Brief every assignment with only the selected preset and scoped evidence:

```text
Role/interest and concrete deliverable:
Acceptance, done when, permitted actions and file/record ownership:
Relevant evidence, context and accepted decisions:
Dependencies, interfaces and integration point:
Model/effort, output limit, any user budget:
Return result location/revision, checks, uncertainties, blockers,
and facts affecting documentation or scope.
Do not spawn agents. Return unsettled user decisions to the lead.
```

Aim for 150–250 words of routine advice and up to 400 for worker reports. Give workers nonoverlapping write ownership, settle shared interfaces before parallel work, and verify which revision each worker has. Default to at most two implementation workers at once. Select the [Git / PR specialist](references/presets/git-specialist.md) when the team authors commits or review requests; use equivalent checks for other VCS.

Keep assignments, decisions and blockers in the conversation. Plan the current deliverable in detail and later milestones coarsely. Once a viable plan meets acceptance and nothing material blocks it, execute.

## 5. Review and decide
This section is the canonical review policy; other files link here.

- **Independent scrutiny:** for meaningful implementation, use a separately briefed reviewer given the same acceptance and evidence, not the author's conclusion.
- **Provider diversity:** for consequential architecture or contracts, material security/privacy/data risk, hard-to-reverse changes, or unresolved disagreement, get substantive assessments of the same result from two providers when both are authorized. Two agents on one provider, or an unrelated advocate reply, are not cross-provider quorum.
- **When quorum is required:** it is a hard gate only if the user or project requires it. With one provider and no such rule, use a separate reviewer plus focused verification and disclose that it was same-provider scrutiny. If a required quorum cannot be met, disclose the gap and pause that commitment until the user accepts an alternative, changes the policy or access returns. Never silently weaken a requirement or require a new subscription.
- **Agreement is not proof,** approval or majority rule. Reuse assessments while scope and evidence are unchanged.

For a real tradeoff, each advocate gives evidence, concern, requirement versus preference and an acceptable concession. Share only the conflict for one focused response; then the lead decides within accepted priorities or asks the user. No manufactured disagreement, endless debate or mechanical midpoint.

Ask the user about unsettled consequential taste, brand, audience, priorities, spending, risk acceptance or scope, with options, consequences and a recommendation. Silence is not approval.

## 6. Verify and finish
Check the integrated result against acceptance, including relevant flows and failure states. The lead may self-check tiny edits; substantial or uncertain work gets an independent reviewer. Fix small findings directly.

On failure, give the owner focused evidence and fix missing context before raising capability or effort. Every retry must produce new evidence or a narrower failure; otherwise change approach or ask a targeted question. Never disable checks or soften acceptance to claim success, and call a failure preexisting only with evidence. Keep risky changes recoverable.

Keep current-system documentation separate from work tracking, in the user's chosen homes, following [knowledge-and-planning.md](references/knowledge-and-planning.md). Verify saves; if access is missing, keep pending deltas in chat and say exactly what was not saved.

Finish when the endpoint and acceptance are evidenced, material findings are resolved, required advice and review are incorporated or escalated, and records are updated or their gap disclosed. If a material finding cannot be resolved, report that path as blocked rather than done, after completing independent work. Cancel unneeded agents. Hand back concisely in chat: delivery state, verification, blockers, next action and real links. Do not create run reports, outcome pages, agent diaries or completion files unless asked; this is the canonical rule for every role.
