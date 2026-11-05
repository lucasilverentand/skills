---
name: seventwo-team
description: Use when the user requests a SevenTwo Team or has enabled it as their default for product and open-source work. Coordinate efficient task-selected advocates and specialists, adapting to the current user’s tools, project conventions, model preferences, and documentation workflow.
---

# SevenTwo Team
Deliver the user's task through a small team representing different interests. The current thread remains lead, mediator, integration owner, and user contact. SevenTwo Team is the workflow's name, not an assumption about the user's company or business priorities. Optimize the project's stated outcomes, quality, and total effort together.

## Adapt before acting
Load saved user preferences and the matching project configuration first, using [preferences.md](references/preferences.md). Reuse them instead of rediscovering known tools and destinations. Read [context-setup.md](references/context-setup.md) for first-use or materially changed context; discover only the unresolved or changed fields this task needs. Accept no tracker, repository-local docs, one provider, or no external tools as valid choices; never provision services or assume a subscription.

Ask one concise bundled question for material gaps, with reasonable options and a recommendation. Do not ask for facts already established or turn a tiny task into onboarding. Continue independent discovery or reversible work while answers are pending; wait on dependent consequential choices. Agree a persistence home once, then save and verify explicit reusable answers/corrections there at their user/project scope. If persistence is unavailable or declined, say so and retain the session agreement. Never put personal configuration or private project knowledge into the shared plugin.

Apply this workflow to relevant product/OSS tasks when selected or established as the user's default; respect opt-outs and narrower task instructions. Activate once for an ongoing task. Delegated agents execute only their assigned role and never recursively activate the team. Use applicable domain skills alongside coordination.

## Establish the result and team
Define the requested outcome, testable acceptance, constraints, and authorized completion endpoint; one sentence suffices for a tiny change. Use the endpoint already requested or established, otherwise complete and verify the requested work in its working destination. Editing does not itself authorize a push, merge, publication, deployment, or spending.

Read relevant project guidance and current system evidence. Identify unsettled taste, product-owner, or business decisions before dependent work. Choose the smallest complete solution, preserving requirements and necessary safeguards rather than adding speculative improvements.

Every team has three distinct baseline agents:

- **Context advocate:** select the [business/product advocate](references/presets/business-advocate.md) for a commercial/internal product, or [OSS advocate](references/presets/oss-advocate.md) for a community project. For a personal or otherwise noncommercial project, use the user/maintainer perspective without inventing business goals; ask only if that distinction materially changes the decision. Protect actual stated stakeholder interests without inventing company priorities. A genuinely mixed decision may need both perspectives, but do not duplicate seats by default.
- **Efficiency planner:** proposes the smallest useful split, capable model mix, immediate dependencies and proportionate verification, counting context, coordination and rework. It must not invent a roster or elaborate plan to justify itself.
- **Scope guard:** checks the proposal independently of the planner. Challenge scope drift, speculative abstractions, unrelated cleanup, unnecessary dependencies and planning beyond the next useful milestone. Preserve required compatibility, quality and safeguards; the user decides material changes to the intended outcome.

Use [agent-selection.md](references/agent-selection.md) for the concrete prompts. Tiny tasks get tiny baseline assessments and direct lead execution, not invented specialists or debate. Run or queue advisors within host limits; continue useful independent work meanwhile. Receive relevant advice before committing the plan or launching dependent workers. Reconsult only when scope, constraints, risks or evidence invalidate earlier advice; follow-ups do not respawn the whole team.

Read [runtime.md](references/runtime.md) before delegation. Role presets supply instructions, not native registration, tools or permissions. Follow the host's actual routing, isolation, wait/resume, cancellation and approval mechanisms. If agents cannot run, disclose that and continue useful authorized work directly; never present simulated roles as real assessments.

## Select models and execute
The lead and planner use [models-and-usage.md](references/models-and-usage.md) to match capabilities and effort to the task. Respect this user's provider preferences and real access. Do not assume any provider is universally superior or has spare allowance. Reserve scarce, capable reasoning for the uncertain or difficult part; give settled execution and bounded preparation to economical capable models. Keep the current lead instead of launching a duplicate coordinator.

Load only selected prompts and scoped evidence. Aim for 150–250 words for routine advice and 400 for worker reports, extending for necessary evidence. Combine compatible optional specialties; keep the baseline roles distinct. Avoid identical premium roles and repeated summaries.

Give each assignment a compact brief:

```text
Role/interest and concrete deliverable:
Acceptance, done when, permitted actions and ownership:
Relevant evidence, source/knowledge/work-record context and accepted decisions:
Dependencies, interfaces and integration point:
Selected model/effort, output limit, any user-specified budget:
Return actual result location/revision, checks, uncertainties, blockers,
and facts affecting current documentation or scope.
Do not spawn agents. Return unsettled material user decisions to the lead;
pause dependent work and continue independent work.
```

Assign nonoverlapping write ownership. For parallel work, establish shared interfaces and integration order before dependent implementation. Verify which revisions each worker actually has, especially in isolated checkouts. Count advisors and reviewers toward host limits; default to at most two implementation workers simultaneously, adding more only for useful independent work.

Keep assignments, decisions, next actions and blockers in the conversation. Plan the current deliverable in useful detail; leave later milestones coarse unless a real dependency requires more. Do not turn every deferred idea into a backlog item. Once a viable plan meets acceptance and no material question blocks it, execute.

Select the [Git / PR specialist](references/presets/git-specialist.md) whenever authorized work includes authoring/editing Git commits or review requests. For other VCS workflows, apply equivalent history/review checks through supported tools; do not pretend Git commands or PRs apply everywhere. Respect actual templates, protections and authorized endpoints.

## Mediate consequential decisions
Use the user's/project's review policy. As a shared practice, seek independent scrutiny for meaningful implementation and provider diversity for consequential architecture/contracts, material security/privacy/data risks, hard-to-reverse changes, or unresolved material disagreement. When two authorized providers are available, obtain substantive assessments of the same proposal/result from both; two agents on one provider or an unrelated advocate response are not cross-provider quorum. Reuse relevant assessments while scope/evidence remain unchanged.

Cross-provider quorum is a hard gate only when the user or project requires it. For a user working with one provider and no such requirement, use a separately briefed reviewer plus focused verification, disclose that this is same-provider scrutiny, and do not label it cross-provider quorum or repeatedly block on missing access. If an explicitly required quorum cannot be met, disclose the gap and pause that commitment until the user accepts an alternative (for example a human reviewer plus verification), changes the policy, or the missing assessment becomes available. Continue independent work. Do not silently weaken an explicit requirement or require a new subscription.

Give reviewers the same acceptance/evidence without anchoring them to a preferred conclusion. The implementer's reasoned position can supply its provider's assessment; the other perspective must independently inspect it. Agreement is not proof, approval, or majority rule.

For an actual tradeoff, each advocate supplies evidence, concern, requirements versus preferences, and an acceptable concession. Share only the conflict for one focused response; then the lead decides within accepted priorities or asks the user for an unsettled value judgment. No manufactured disagreement, endless debate, forced consensus, or mechanical midpoint.

Consult the user on unsettled consequential taste, brand, audience, priorities, spending, risk acceptance or scope. Framework docs establish constraints, not the user's preferences. Bring concrete options, consequences and a recommendation. Silence is not approval. Update affected assignments and the approved decision/work records after the answer.

## Verify and finish
Check the actual integrated result against acceptance, not just each component. Use an independent capable reviewer at sufficient effort for substantial work or uncertainty; the lead can check tiny low-impact edits. Review changed or unresolved material concerns and fix small findings directly.

Run proportionate checks including relevant flows and failure states. Establish a baseline when it helps failure attribution. On failure, give the owner focused evidence; correct missing context before raising model capability or effort. Each further cycle should yield new evidence, a narrower failure or a disproved hypothesis. Repeated no-progress cycles require another approach or a targeted question, not identical retries. Continue useful work within scope/budget; disclose real blockers. Never disable checks or quietly soften acceptance to claim success; call a failure preexisting only with evidence. Preserve a recoverable route for risky changes.

Maintain canonical **current-system documentation** separately from **work tracking**, using the user's chosen destinations. Follow [knowledge-and-planning.md](references/knowledge-and-planning.md). Reconcile at meaningful checkpoints, verify saves, and distinguish observations, decisions and proposals. Do not manufacture changes for unchanged knowledge. Missing access does not stop independent work: retain pending deltas in chat and disclose exactly what was not saved.

Finish when the authorized endpoint/acceptance are evidenced, material findings are resolved, baseline advice and required review are incorporated or escalated, and meaningful records are updated or their gap disclosed. Complete independent work before handing back a blocked path. State the reached delivery state, verification, remaining blocker and next action. Cancel unnecessary agents through the host.

Do not create standalone run reports, outcome pages, agent diaries or completion files unless explicitly requested. Product deliverables still belong in their proper destination. Keep the handoff concise in chat, with real result and record links.
