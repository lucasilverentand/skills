# Persist preferences and reuse them
Persistence is part of setup, not a recurring discovery task. Read the saved profile at the start of a new task, reuse it within the task, and refresh only fields affected by new instructions, a changed project, a conflict, or an actual access/availability error.

## Storage and scope
Use the user's already-configured preferences home. For a local host without another choice, propose `~/.config/seventwo-team/profile.md` (or the host's established user-configuration location). Obtain approval for that home once, only when a reusable choice exists to save, preferably in the same question that resolves it. After approval, save explicit reusable answers and corrections there without asking permission for every field. Existing host permissions still apply.

For a host without filesystem access, use an explicitly approved existing memory/settings or documentation record and retain its exact locator in the host's supported persistent settings. Do not assume arbitrary conversation text persists between sessions. If no durable home is available or the user opts out, keep the agreement in the current conversation and disclose that cross-session persistence is unavailable; do not repeatedly offer the same declined storage option.

Keep personal defaults outside the plugin and outside shared repositories. Add a small project map in the user profile only for projects the user has actually configured. Key entries by canonical host/owner/repository identity or an explicit project ID, not a temporary checkout path, branch name or repository basename alone. Remove credentials from any stored remote identity. Forks and upstreams are distinct projects unless the user explicitly maps them together.

Project-specific overrides can live in a linked user-private project file (for example a `projects/` subdirectory beside the profile) or existing approved project guidance. Put them in a shared repository only when the user authorizes sharing them. Do not create a separate file for every task or duplicate a project's entire documentation.

## Load → resolve → act
1. Resolve the profile in this order: an explicit locator in current host instructions/settings, then the accessible default `~/.config/seventwo-team/profile.md`; for a nonlocal host, use its already-configured persistent locator. If found, load it and skip first-use questions for established fields. Read only the matching project's overrides and linked guidance relevant to this task, plus the checkout's applicable instructions. Do not search every workspace again to rediscover known destinations.
2. Apply the current request and valid scoped overrides within host/repository rules. A task-specific preference stays task-specific unless the user makes it durable. Do not let a cached preference bypass an enforced protection or substitute for authorization to push, spend or publish.
3. Use saved exact tracker/project and knowledge-home locators for targeted access when needed. Treat `none`, `repository docs` and `conversation-only` as intentional values, distinct from unknown. Never turn a missing field into a silently confirmed default.
4. Discover only consequential missing or conflicting fields. Ask one short bundled question if necessary; keep independent work moving. Do not ask returning users to repeat established VCS, model or documentation preferences.
5. Confirm live executable capabilities only when needed for the action. A preferred provider is not proof of access, current quota or valid model IDs. Recheck stale routes on a relevant error or evidence of change, not by repeatedly enumerating all accounts or reading every linked document.

A concrete destination in a user profile does not automatically own every new repository or fork. For a project without a matching entry, reuse it only when its applicability is explicitly global and the actual target is unambiguous. Otherwise confirm the home once before the first external write and save that project's mapping. Continue independent work meanwhile; never route an unrelated project into a private business workspace by inheritance.

## Save → verify
After explicit setup answers, save a concise patch to the approved profile with scope and source/date. Save a correction as a replacement of the relevant value, not another contradictory journal entry. Preserve unrelated settings. Distinguish confirmed choices from unresolved or inferred values; do not store guesses as preferences.

A compact profile contains:

```text
Profile format: 1
Scope: current user or canonical project identity
Updated: date of the last accepted preference change
Defaults:
  VCS/review workflow and conventions: accepted choice or guidance locator
  Work-tracking home: exact destination or none
  Current-system documentation home: exact destination or repository docs
  Provider/role/effort preferences and durable budget constraints
  Consequential review/quorum policy and accepted alternatives
  User-reserved decisions and design/tone preferences
Projects:
  canonical identity -> scoped overrides or approved profile/guidance locator
Unresolved: only consequential choices that still need an answer
```

Read the existing record immediately before editing. Use a guarded/atomic local write where supported, or the service's update/concurrency mechanism, and fetch/read back the saved values once. If a concurrent edit conflicts, reconcile it instead of overwriting. If the save fails, continue with the session agreement, retain the pending delta, and say it was not persisted; never claim it will be remembered.

Read existing freeform or older profiles as they are; the format above is a guide, not a reason to repeat onboarding or discard settings. Add structure only when an accepted change next warrants editing, preserve existing meaning and sources, and leave unconfirmed fields unresolved.

Do not store credentials, authentication material, transient remaining usage, a connector's current failure as a permanent opt-out, broad authorization inferred from a preference, or raw conversation transcripts. A profile is configuration, not a run report.

## Change and portability
Persist an explicit “from now on” correction at its stated scope. Ask about scope only when it is ambiguous and consequential. Profile age alone does not invalidate preferences or justify recurring onboarding. Refresh factual access and enforcement when the task requires it, keeping accepted preferences distinct from observations.

Skill/plugin updates must leave profiles intact. Never bundle profiles into releases. Another machine can use the user's chosen private sync or the same authorized remote preferences home; local storage alone does not automatically sync accounts or devices. Share project practices selectively, not personal profiles by default.
