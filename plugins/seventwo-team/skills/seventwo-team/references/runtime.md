# Delegation adapters
Read this before the first delegation. Host instructions and discovered tool schemas take precedence. A skill describes behavior; it does not install tools, grant model access, or bypass approvals.

For model and effort selection, use [models-and-usage.md](models-and-usage.md). The catalog determines callable settings; API documentation must not be used to invent host options or billing entitlements.

## T3 Code
Last verified 2026-11-05; if the live schema differs, it wins.

- Discover the locally applicable `orchestrator_capabilities` tool before the first `delegate_task`. Its catalog supplies provider IDs, model IDs, and supported effort values. Put effort and other model settings in `target.options` using that schema.
- Use the native agent tool for a supported model of the current provider when no settings beyond the inherited ones are needed and host rules allow it. Use `delegate_task` for another provider, explicit effort or other settings beyond inherited ones, background work, or host-managed worktree isolation. Do not launch top-level threads as subagents.
- A delegated task receives no parent history: include a self-contained brief and relevant artifact locations. Keep task IDs and returned links. Never put secrets in briefs.
- Follow the returned `next` instruction. If completion wakes the thread, yield and resume on completion; do not poll or sleep. Use synchronous wait mode only when the current turn needs the result and the host permits it.
- Each new delegated review or re-check uses a fresh `delegate_task`; use small briefs and actual artifacts. Do not reuse a review thread through a messaging tool when the host forbids it. Fix small findings in the lead.
- Use the host cancellation tool for replaced or unnecessary delegates. Respect tool-specific link and approval requirements.

## Model settings and limits
Validate model IDs and supported options against the applicable live tool schema. In T3, model settings belong in `target.options`; Codex exposes `reasoningEffort`, while Claude exposes `effort`. Native schemas can differ. User choices apply to their stated scope (lead, named role, or whole team), not automatically to every child.

Do not select modes that start their own orchestration (ultra-style modes) for delegated specialists. Special thinking modes can differ between native and host option schemas. Do not infer special-mode semantics from a generic API effort table or treat enum ordering as an escalation ladder. Preserve explicit settings and follow host rules.

Use only exposed authorized usage information. Subscription allowance, API charges, context capacity, and rate limits are different constraints; do not infer one from another or change billing/authentication to bypass a limit. Missing telemetry does not prove exhaustion. Follow host retry guidance and preserve completed work on quota errors.

## Claude Code
Last verified 2026-11-05; if the live schema differs, it wins.

- Delegate with the `Agent` tool. Put the full brief in `prompt`; the child sees no parent history unless it is a fork.
- Pick the model with the `model` parameter from the values its schema lists, matching [models-and-usage.md](models-and-usage.md). Set an effort value only when the user or project instructions ask for a specific level; otherwise the agent's default applies.
- `subagent_type` selects an agent definition: a general-purpose type for workers, a read-only search type for discovery. Presets stay in the prompt; they are not registered types.
- Run advisors you need before planning in the foreground (`run_in_background: false`) and send independent ones in one message so they run concurrently. Background workers notify on completion; do not poll or sleep.
- Use `isolation: "worktree"` when a worker needs its own checkout. Otherwise give parallel workers disjoint files in the shared checkout.
- Continue a finished agent with its messaging tool rather than relaunching, and stop unneeded background agents with the host's stop tool.

## Codex
Last verified 2026-11-05; if the live schema differs, it wins.

- Start a child with `spawn_agent` (namespaced as `collaboration.*` in some builds; a task name and a self-contained message; optional model and reasoning effort from its schema).
- Send scoped follow-ups with `send_message` or `followup_task`; the latter can restart an idle agent.
- Wait for results with `wait_agent`; stop an unneeded turn with `interrupt_agent`. No close tool may be exposed, so leave finished agents idle.

## Other native hosts
Inspect the exposed agent tools and their model and effort settings; use only listed model IDs and values. Keep the current thread as mediator and send scoped follow-ups only where supported. Native agents may be limited to their own provider; cross-provider work requires a connector that explicitly supports it. Do not use a CLI, API key or another account to work around an unavailable provider without authorization.

Resolve deferred tools by the host's loading rules before concluding they are unavailable. If delegation is unavailable, apply SKILL.md §4: say so and continue directly.
