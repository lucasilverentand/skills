# Adapt to the current user and project
The distributed plugin contains practices and role prompts, not one author's environment. Keep the workflow name; never infer company affiliation, identity, available subscriptions, tools, or authority from it.

## Load before discovering
Follow [preferences.md](preferences.md): read the saved current-user profile and only the matching project's overrides before searching sources or asking questions. A returning user's known destinations and provider preferences are configuration to reuse, not questions to rediscover each session.

Read the current request, applicable repository/contribution guidance, and only the unresolved context needed for this task. Do not enumerate unrelated accounts or private workspaces. A connector proves capability, not that its workspace is the right destination or writes are authorized. Keep scoped project rules from becoming global defaults.

## Ask only what matters now
If evidence leaves consequential gaps, ask one concise bundled question, using the host question tool when available. Offer the choices appropriate to the task, including none or repository-local destinations. Do not require the user to choose every field below before a simple edit.

- **Source/review workflow:** Which repository, VCS and host? What is the delivery endpoint and approved review/merge/signing convention? Infer these from the checkout and project rules where possible. GitHub, GitLab, Forgejo and non-Git workflows are possibilities, not defaults to provision.
- **Planning and documentation:** Where does actionable work belong, and where should current-system knowledge live? Examples include the host's issues plus repository docs, a separate tracker/wiki, or no external tracker. Determine the exact project/page/source, not just a service brand. Respect knowledge already owned by code or another canonical home.
- **Model and review preferences:** Which exposed providers may be used, which should handle difficult development versus routine work, and which have real budget constraints? What independent/cross-provider or human review is required for consequential decisions? Ask about permission or preference, never request secrets or a new subscription through chat.

Ask only unresolved questions at the point they affect action. Do not invent brand direction, budget, identity, preferred merge strategy, or extra usage. Defer optional choices and continue independent work. If the user declines external tools, use the approved existing workflow; that choice is not a synchronization failure.

## Persist the accepted setup
Agree a durable preferences home once, then save confirmed reusable choices and scoped project mappings with the save → verify lifecycle in [preferences.md](preferences.md), which also covers what never to store and what to do when saving fails or is declined. Shared project guidance is written only to an approved project home. Do not repeat a declined onboarding or storage question.
