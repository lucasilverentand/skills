# Choosing models and effort
Choose from the current user's authorized providers and available models, respecting scoped preferences discovered through [context-setup.md](context-setup.md). This guide chooses work and effort; runtime mechanics stay in [runtime.md](runtime.md). No provider is assumed superior, available, cheaper on this account, or endowed with spare quota.

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

## Independent perspectives
Review and quorum policy lives in SKILL.md §5. For model choice: the reviewer should be independently briefed and, where provider diversity is called for, on a different provider from the author; pick its effort from the table above.
