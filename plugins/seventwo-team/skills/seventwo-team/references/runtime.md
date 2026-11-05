# Delegation adapters
Read this before the first delegation. Host instructions and discovered tool schemas take precedence. A skill describes behavior; it does not install tools, grant model access, or bypass approvals.

For model and effort selection, use [models-and-usage.md](models-and-usage.md). The catalog determines callable settings; API documentation must not be used to invent host options or billing entitlements.

## T3 Code
- Discover the locally applicable `orchestrator_capabilities` tool before the first `delegate_task`. Its catalog supplies provider IDs, model IDs, and supported effort values. Put effort and other model settings in `target.options` using that schema.
- Use the native agent tool for a supported model of the current provider when no settings beyond the inherited ones are needed and host rules allow it. Use `delegate_task` for another provider, explicit effort or other settings beyond inherited ones, background work, or host-managed worktree isolation. Do not launch top-level threads as subagents.
- A delegated task receives no parent history: include a self-contained brief and relevant artifact locations. Keep task IDs and returned links. Never put secrets in briefs.
- Follow the returned `next` instruction. If completion wakes the thread, yield and resume on completion; do not poll or sleep. Use synchronous wait mode only when the current turn needs the result and the host permits it.
- Each new delegated review or re-check uses a fresh `delegate_task`; use small briefs and actual artifacts. Do not reuse a review thread through a messaging tool when the host forbids it. Fix small findings in the lead.
- Use the host cancellation tool for replaced or unnecessary delegates. Respect tool-specific link and approval requirements.

## Model settings and limits
Validate model IDs and supported options against the applicable live tool schema. In T3, model settings belong in `target.options`; Codex exposes `reasoningEffort`, while Claude exposes `effort`. Native schemas can differ. User choices apply to their stated scope (lead, named role, or whole team), not automatically to every child.

Do not select ultra or ultracode for delegated specialists; they can introduce additional orchestration. Ultrathink also differs between native Claude and host option schemas. Do not infer special-mode semantics from a generic API effort table or treat enum ordering as an escalation ladder. Preserve explicit settings and follow host rules.

Use only exposed authorized usage information. Subscription allowance, API charges, context capacity, and rate limits are different constraints; do not infer one from another or change billing/authentication to bypass a limit. Missing telemetry does not prove exhaustion. Follow host retry guidance and preserve completed work on quota errors.

## Native Claude or Codex hosts
Inspect exposed agent tools and their supported model settings. Use only available model IDs and effort controls. Keep the current thread as mediator, and send scoped follow-ups only where supported. Native agents may be limited to their own provider; cross-provider work requires a connector that explicitly supports it. Do not invoke a CLI, API key, or another account to work around an unavailable provider without authorization.

Resolve deferred tools according to the host's loading rules before concluding they are unavailable. If delegation itself is unavailable, explain that the team cannot run here. The lead continues the task directly within the user's authorized scope, but must not present simulated roles as real agents or claim the planner/reviewer ran.
