---
name: cross-tool-recovery
tags: [planning, tools, efficiency]
max_turns: 25
timeout_seconds: 480
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---
Use SevenTwo Team. Give me the next-step plan only; do not implement or write to any service.

We are finishing an internal formatter update. The existing issue TOOL-42 owns delivery and acceptance; repository docs/usage.md owns the behavior specification; the existing PR is still open and has passed its local checks. No live deployment is in scope. There are no security or public-contract changes.

The documentation save succeeded and was read back. The attempt to link the PR on TOOL-42 timed out; we do not know whether the link was saved. A colleague suggests retrying the write immediately, making a fresh issue to ensure tracking, copying the delivery checklist into the wiki, and closing TOOL-42 as superseded.

I want a lean route to review readiness. I have not approved any new tracker records, and I must accept the result before the issue is marked done. Explain what you would check, what can proceed independently and what would block completion. Use the supplied state as a scenario; do not discover or contact real accounts.
