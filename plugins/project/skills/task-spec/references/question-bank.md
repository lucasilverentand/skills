# Question Bank
Use these as source material, not as a script. Pick the few questions whose answers would most change the brief.

## Universal
- What should be true after this task that is not true now?
- What is the smallest version that would still be useful?
- What is out of scope even if it is nearby?
- What is the user-visible behavior, if any?
- What would make you reject the result?
- What previous attempt, decision, bug, or discussion should shape this?
- What part is highest risk: correctness, UX, data, security, performance, reliability, migration, or coordination?
- Is there a hard deadline, external dependency, or sequencing constraint?
- Where should the final spec or issue live?

## Issue Creation
- Is this a bug, feature, chore, refactor, research task, or follow-up?
- Who is the issue for: you, another engineer, design, product, support, or a future agent?
- What project, initiative, milestone, or parent issue should it connect to?
- What evidence should be included: logs, screenshots, repro steps, customer examples, links, metrics?
- What labels, priority, team, or component are already known?
- What would count as resolved enough to close the issue?
- Should the issue include implementation guidance, or only describe the problem and acceptance criteria?
- Is any context sensitive enough to keep out of a public GitHub issue?

## Code Implementation
- Which files, modules, routes, screens, packages, or APIs are likely in scope?
- Are there existing patterns the implementation must follow?
- What should stay backward compatible?
- What data migrations, feature flags, config changes, or rollout steps might be needed?
- What tests should prove this works: unit, integration, e2e, snapshot, contract, manual?
- Are there performance, accessibility, security, privacy, or observability requirements?
- How should errors, loading states, empty states, or partial failures behave?
- What is the acceptable blast radius if something goes wrong?

## Bug Fix
- What is the expected behavior and the actual behavior?
- Can the issue be reproduced? If yes, what are the exact steps?
- When did it start? Was there a recent deploy, dependency change, migration, or data import?
- Is it affecting all users, one segment, one environment, or one account?
- What logs, stack traces, screenshots, recordings, or IDs identify the failure?
- What workaround exists today?
- What regression test should fail before the fix and pass after?

## Product or UX
- What user job is this supporting?
- What is the primary action on the screen or flow?
- What information must be visible before the user can act?
- What states need design: loading, empty, error, disabled, partial success, permissions, offline?
- What existing UI should this match?
- What is the mobile/desktop expectation?
- What copy or terminology is settled, and what can be rewritten?
- What should analytics or qualitative feedback tell us after launch?

## Data, API, or Integration
- What are the source of truth and ownership boundaries?
- What are the core entities and identifiers?
- What reads and writes happen most often?
- What consistency is required? Are stale reads acceptable anywhere?
- What happens when the dependency is slow, unavailable, or returns partial data?
- What auth, rate limits, retries, idempotency, or webhook behavior matters?
- What data must not be logged or exposed?
- What migration, backfill, or rollback path is needed?

## Refactor or Cleanup
- What pain is the current shape causing?
- What behavior must remain identical?
- What can change publicly: APIs, file paths, exported names, command names, UI, data shape?
- What code should not be touched because it is risky or owned elsewhere?
- How will we know the refactor did not change behavior?
- Is this preparing for a known follow-up? If yes, what does that follow-up need?
- What is the acceptable amount of churn?

## Research or Investigation
- What question needs an answer?
- What decision will the answer unlock?
- What sources are acceptable: code, logs, docs, web, production data, interviews?
- What counts as enough evidence?
- Should the output be a recommendation, options table, risk list, repro, or issue?
- What assumptions should not be made without proof?

## Delegation
- Who or what will receive this brief?
- What context can they assume, and what must be included?
- What files or ownership areas are off limits?
- What authority do they have: propose, edit, test, create an issue, open a PR?
- What should they report back: diff summary, test output, risks, questions, or links?
- What is the handoff format?
