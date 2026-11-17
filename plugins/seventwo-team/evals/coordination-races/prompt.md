---
name: coordination-races
tags: [coordination, concurrency, ownership]
max_turns: 25
timeout_seconds: 480
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---
Use SevenTwo Team. Repair this fictional execution plan only. Do not implement, launch workers, send messages to the fictional agents or contact services.

Two workers are implementing internal adapters against an already-agreed interface in one shared checkout. A owns src/import/a.ts; B owns src/import/b.ts. Their current briefs also both allow edits to src/import/registry.ts and src/generated/catalog.ts. The lead wants to edit registry.ts directly while they run. A says a generator that writes catalog.ts is still in flight. B reports unexpected edits in registry.ts that were not present when B read it. Nobody has yet inspected or attributed those edits.

Both workers want to run acceptance in the same test harness; each run resets its fixtures. They also propose staging everything and committing their individual results. The user authorized local edits and checks only, no commits. A replacement worker has been proposed for A, but A has received only a stop message: there is no confirmation that A or its generator has stopped.

There are no changed product decisions, public contracts, permissions or sensitive data. Keep the independent adapter work moving where safe, preserve existing work, and give a compact ownership/dependency map plus the recovery, handoff and final verification order. Explain what must be confirmed before a replacement or the lead can take over shared writes. Treat the scenario as supplied evidence; do not inspect real accounts or start tooling for it.
