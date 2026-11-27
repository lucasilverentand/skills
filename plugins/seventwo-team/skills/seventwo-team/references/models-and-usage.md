# Choosing models and effort
Choose from the current user's authorized providers and available models, respecting scoped preferences discovered through [context-setup.md](context-setup.md). This guide chooses work and effort; runtime mechanics stay in [runtime.md](runtime.md). No provider is assumed superior, available, cheaper on this account, or endowed with spare quota.

## Subagent model ceiling
Subagents, delegated tasks, background agents and automated reviews may use, without asking, models up to the Claude Opus tier or the OpenAI Sol tier (for example `claude-opus-5-5`, `claude-sonnet-5-5`, `gpt-6.2-sol`). Anything more expensive needs the user's explicit approval in the current conversation before launch: a higher model family such as Claude Fable, any model whose tier relative to Opus or Sol is unclear, and paid speed or priority settings (fast mode, `priority` or `ultrafast` service tiers). Ask once, naming the model, the setting and why the ceiling is not enough; otherwise stay within it. Approval covers the named assignment only. The ceiling never raises a stricter user rule, such as keeping Fable for the user's own chats.

## Match capabilities to work
|Work|Starting capability and effort|When to change|
|---|---|---|
|Extraction, discovery, log summaries, mechanical edits|Economical capable model, low effort|Medium for synthesis or meaningful uncertainty|
|Baseline advocate, efficiency planner, scope guard|Economical capable model, low for narrow briefs; medium for tradeoffs|Start with stronger judgment for consequential advice|
|Easy or already-planned coding and tests|Proven coding model, medium; low for truly mechanical work|Escalate new architecture uncertainty or a hard failure, keeping settled work in place|
|Git/history/review-message checks|Economical capable model, low for clear conventions; medium for complex/stacked changes|Return implementation uncertainty to the developer; formatting alone needs no premium model|
|Writing, documentation, visual inspection|Model suited to writing or visual evidence, medium|Stronger reasoning for unresolved consequential synthesis|
|Focused architecture or bounded difficult implementation|Strong coding/reasoning model, medium|High for ambiguity, interactions or expensive failure|
|Complex architecture, difficult implementation, hard debugging|Strong coding/reasoning model, high|Xhigh or equivalent only for a narrowed hard problem|
|Independent second opinion|Independently briefed capable model, medium for narrow review; high for substantial risk|Add the required distinct provider/human perspective rather than duplicating the author|

Capability fit and completed-task results matter more than labels or per-token price. A clear implementation plan settles behavior, interfaces, constraints and checks, not every line of code. Multi-file work can stay with an economical coding model when the design is settled. Keep genuinely difficult code with a strong developer when splitting it would increase rework.

Assign providers according to this user’s accepted preferences and observed task fit. A user may prefer different providers for architecture, execution or review, or use only one. Do not inherit the original author’s allocation or account assumptions.

Provider examples, checked 2026-11-04: [OpenAI guidance](https://learn.chatgpt.com/docs/models) distinguishes focused, coding/reasoning and writing/visual workloads; [Claude effort guidance](https://platform.claude.com/docs/en/build-with-claude/effort) explains effort tradeoffs by model. Re-check these links when the date is more than about six months old. Resolve concrete model IDs against live access, not this file. Do not research every provider on every task.

## Choose effort deliberately
- **Low:** narrow task, clear evidence, cheap objective check. Poor for open-ended investigation.
- **Medium:** ordinary multi-step work, settled implementation or a focused judgment with limited uncertainty.
- **High:** consequential reasoning, interacting constraints, subtle bugs or substantive independent review. Start here when difficulty is evident instead of buying a predictable failed cheap attempt.
- **Xhigh or equivalent:** specific unresolved hard problem with evidence explaining what deeper reasoning must resolve.
- **Max:** exceptional depth with proportionate expected value, or explicitly requested. Not a standing default.

Use only supported settings; labels are not equivalent across providers or generations. More effort cannot repair missing evidence or unclear acceptance. Faster service is a latency choice, not a quality upgrade. Orchestration modes are not automatic effort escalations.

## Conserve the scarce resource
Identify which capability, account allowance, latency or budget is actually constrained. Use real exposed data when available; unknown allowance is not spare capacity. Do not buy subscriptions, enable paid overflow, switch authentication or silently replace an explicitly assigned provider.

Prepare compact relevant evidence for expensive reasoning, batch related questions, and keep one owner for related hard decisions. When that decision is settled, move routine execution and checks to a suitable economical model. Do not reapprove every step, run identical premium roles, or inflate scope to use available capacity. Keep the current lead rather than launching a duplicate coordinator.

Before escalating, identify whether the bottleneck is evidence, plan clarity, domain knowledge or reasoning. Fix the real bottleneck. Compare total quality, retries, handoffs and actual usage on comparable work; do not promise savings from model names alone.

## Choose concurrency for time to completion
Use this when deciding whether to split meaningful work. Optimize time until the integrated result meets acceptance, not time until the first worker finishes. Elapsed time and total model/resource effort differ: independent agents can finish sooner while consuming more total effort. The fewest agents are not always fastest; the most agents are not always useful. Respect the user's latency/cost priorities and actual budget; do not invent a preference when it would change a material tradeoff.

Before dispatch, compare the plausible serial route with the proposed parallel route. Identify the longest dependency chain through preparation, execution, integration, review and verification: this is the critical path. A parallel phase waits for its slowest required branch, not the average branch. Include startup, briefing, queue delays, handoffs and likely rework in the comparison; use rough ranges only when supported, label estimates and say when timing is unknown. Tiny tasks need no timing model.

- **Split useful independent work:** launch ready branches together when their interfaces and ownership are settled. The lead can prepare fixtures, gather evidence or perform another bounded deliverable while advice or workers run. Keep spare capacity for required review and integration rather than filling every slot. Several independent bounded slices may justify increasing the default worker count within host limits when expected completion improves.
- **Keep dependent work ordered:** more agents cannot accelerate a decision everyone needs first. Resolve that uncertainty, then fan out. A reviewer may prepare acceptance checks early, but final review must inspect the actual integrated revision. Shared-file edits, serial migrations and a single integration owner can erase apparent parallel gains; partition ownership or keep those steps sequential.
- **Check shared bottlenecks:** agents can compete for provider concurrency/rate limits, local memory/CPU/disk, a simulator, a test database or the lead's attention. Background execution does not create capacity. Launching more agents may queue work, slow each worker or produce a review backlog. Use available observations and host limits, not assumptions of linear speedup or independent provider capacity.
- **Reassess at useful checkpoints:** if workers queue, conflict, repeat context or leave the lead overloaded, reduce concurrency or regroup the next assignments. If a ready critical-path branch is idle and capacity is available, start it. Reuse completed work; do not restart agents merely to rebalance the roster. Follow host wait/resume and cancellation rules rather than polling for timing telemetry.

For example, two independent adapters with a settled interface may benefit from parallel owners, followed by integration and shared checks. If both depend on an unresolved schema, parallel implementation risks rework; settle the schema first. A single shared-device verification step stays serial even when implementation runs concurrently. Required security, disclosure and independent review gates remain part of completion, never optional overhead to omit for speed.

When concurrency materially affects the plan, give the expected benefit, main bottleneck and uncertainty briefly. Use observed completion, queues and rework to improve the next split; never promise a speedup merely from agent count or manufacture a separate timing report.

## Independent perspectives
Review and quorum policy lives in SKILL.md §5. For model choice: the reviewer should be independently briefed and, where provider diversity is called for, on a different provider from the author; pick its effort from the table above.
