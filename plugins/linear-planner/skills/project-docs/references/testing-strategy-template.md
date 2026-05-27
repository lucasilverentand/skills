---
title: Testing strategy
status: Active
owner: Luca Silverentand
last_updated: 2026-05-15
related:
  - technical-design.md
  - release-readiness.md
---

# Testing strategy
<!-- Prompt: Use this once per app, product area, package, service, or repo when the team needs a shared testing contract. This document sets the test layers, confidence model, tools, data approach, and CI expectations for the whole project. Per-feature testing plans in technical-design.md should reference this strategy and only add the checks needed for that specific change. -->

<!-- Relationship guide for planners/AI: This is the project-wide testing source of truth. It does not replace the technical design's Testing plan section, which should map feature-specific risks to checks. Release readiness should use this strategy to judge whether the evidence gathered for a release is enough. -->

## 1. Summary
<!-- Prompt: In one short paragraph, define the project, repo, product area, or app this strategy covers. State the testing goal in plain terms: what confidence the team needs before merging, releasing, or accepting operational risk. Name any important constraints such as supported platforms, offline behavior, regulated data, small team size, slow environments, or expensive dependencies. -->

---

## 2. Confidence model
<!-- Prompt: Describe how the team thinks about confidence across the whole project. Avoid saying "more tests are better." Say which risks must be caught quickly during development, which risks need realistic integration, which risks require end-to-end proof, and which risks still need human judgment. If a layer is intentionally weak or absent, say what risk the team accepts. -->

|Confidence question|Owned by|Why this belongs there|
|---|---|---|
|<!-- Example: Does one pure unit of behavior work for normal and edge input? -->|<!-- Example: Unit tests -->|<!-- Example: Fast feedback, narrow failure, no external systems. -->|
|<!-- Example: Do two or more project-owned parts agree on their contract? -->|<!-- Example: Integration tests -->|<!-- Example: Catches wiring, serialization, persistence, and boundary assumptions. -->|
|<!-- Example: Can a user, client, or operator complete a critical path? -->|<!-- Example: End-to-end or manual release checks -->|<!-- Example: Proves the real flow, not every branch. -->|

---

## 3. Test layers
<!-- Prompt: Fill this table with the layers this project will actually maintain. Delete rows that do not apply and add project-specific layers such as contract tests, snapshot tests, accessibility checks, migration tests, performance tests, visual regression checks, security tests, device tests, simulator tests, package smoke tests, or operational drills. The point is to commit to which layer owns which kind of confidence, not to copy a generic pyramid. -->

|Layer|What it proves|Use it for|Do not use it for|Expected speed or cadence|Owner|
|---|---|---|---|---|---|
|Unit|<!-- Prompt: The smallest useful behavior works without real external systems. -->|<!-- Prompt: Pure logic, validation, state transitions, error mapping, and edge cases where setup should be cheap. -->|<!-- Prompt: Cross-service behavior, browser or device behavior, persistence guarantees, or confidence that depends on real infrastructure. -->|<!-- Prompt: Runs locally and in CI on every change, unless this project chooses differently. -->|<!-- Prompt: Role or team responsible for keeping these useful. -->|
|Integration|<!-- Prompt: Project-owned parts agree on contracts and data shape. -->|<!-- Prompt: Persistence, API boundaries, adapters, job queues, serialization, permissions, or dependency wrappers. -->|<!-- Prompt: Full user journeys, third-party production behavior, or visual polish. -->|<!-- Prompt: Name the local and CI cadence. -->|<!-- Prompt: Role or team. -->|
|End-to-end|<!-- Prompt: The critical path works through the real user, client, CLI, API, or operator surface. -->|<!-- Prompt: A small set of merge or release gates that prove high-value flows. -->|<!-- Prompt: Exhaustive edge cases, every UI state, or logic that can be tested lower down. -->|<!-- Prompt: Name when these run and what blocks merge or release. -->|<!-- Prompt: Role or team. -->|
|Manual|<!-- Prompt: Human judgment confirms what automation cannot cheaply prove. -->|<!-- Prompt: Exploratory checks, copy review, judgment-heavy UI states, app store behavior, hardware quirks, or one-off release validation. -->|<!-- Prompt: Repeatable regressions that should move into automation after they matter twice. -->|<!-- Prompt: Name when manual checks are required and how evidence is recorded. -->|<!-- Prompt: Role or team. -->|

---

## 4. Coverage expectations
<!-- Prompt: Define where coverage matters and where it does not. Be specific by module, package, feature class, risk class, or layer. Avoid a global percentage unless the project has a real reason to enforce one. Name the code or behavior that must have strong automated coverage, the code that only needs smoke coverage, and the code that is acceptable to verify manually. -->

|Area or behavior|Expected coverage|Reason|Evidence|
|---|---|---|---|
|<!-- Prompt: Example: Billing calculation, sync conflict resolver, public API parser, onboarding flow. -->|<!-- Prompt: High unit coverage, integration coverage, E2E smoke, manual only, etc. -->|<!-- Prompt: Why this risk deserves that level of proof. -->|<!-- Prompt: Test file pattern, CI job, checklist, dashboard, or release note link. -->|

---

## 5. Tools and frameworks
<!-- Prompt: Name the tools the project commits to using. This template should not pick a stack for the project. Fillers like "Jest or Vitest" are not enough; choose the real runner, assertion library, browser/device tool, coverage reporter, fixture builder, mocking strategy, and CI service where they apply. For each choice, include why it fits and what would justify replacing it later. -->

|Purpose|Tool or framework|Applies to|Why this choice|Replacement trigger|
|---|---|---|---|---|
|Test runner|<!-- Prompt: Chosen runner, command, or service. -->|<!-- Prompt: Layers or packages. -->|<!-- Prompt: Why this is the project default. -->|<!-- Prompt: What problem would make the team revisit it. -->|
|Assertions and helpers|<!-- Prompt: Chosen assertion library, helpers, matchers, or test utilities. -->|<!-- Prompt: Layers or packages. -->|<!-- Prompt: Why this stays consistent. -->|<!-- Prompt: Revisit trigger. -->|
|Browser, device, or external-system checks|<!-- Prompt: Chosen tool, simulator, emulator, local service, sandbox, or manual process. -->|<!-- Prompt: Layers or release checks. -->|<!-- Prompt: Why this gives the needed confidence. -->|<!-- Prompt: Revisit trigger. -->|
|Coverage and reporting|<!-- Prompt: Chosen reporter, threshold tool, dashboard, or intentionally none. -->|<!-- Prompt: Layers or risk areas. -->|<!-- Prompt: Why this signal is worth tracking. -->|<!-- Prompt: Revisit trigger. -->|

---

## 6. Test data and fixtures
<!-- Prompt: Explain how test data is created, stored, named, reset, and reviewed. Cover factories, fixtures, snapshots, seed data, generated data, mocked external responses, golden files, anonymized production samples, and local test accounts only where they apply. Say which data is allowed in the repo and which must stay out. -->

|Data type|Source|Used by|Reset or cleanup rule|Privacy or maintenance rule|
|---|---|---|---|---|
|<!-- Prompt: Example: domain factories, HTTP fixtures, sample documents, seed database, fake users, media assets. -->|<!-- Prompt: Generated, checked-in, sandbox, local builder, etc. -->|<!-- Prompt: Test layers or tools. -->|<!-- Prompt: How stale state is avoided. -->|<!-- Prompt: What cannot be stored, logged, or copied. -->|

---

## 7. CI integration
<!-- Prompt: Define which checks run in CI, what blocks merge, what runs after merge, and what is release-only. Include local commands that match CI so contributors can reproduce failures. If some checks are too slow or expensive for every PR, name the schedule or trigger and the risk this accepts. -->

|Check|Command or workflow|Trigger|Blocks merge?|Failure owner|
|---|---|---|---|---|
|<!-- Prompt: Example: unit tests, lint, typecheck, integration tests, E2E smoke, coverage, package build, migration dry run. -->|<!-- Prompt: Local command, CI job, or manual checklist link. -->|<!-- Prompt: PR, main, nightly, release branch, tag, manual dispatch. -->|<!-- Prompt: Yes, no, or conditional. -->|<!-- Prompt: Who investigates first. -->|

---

## 8. Flaky test handling
<!-- Prompt: Define what counts as flaky, how it is reported, and how long a flaky test may stay in the suite. Include quarantine rules, retries, labels, issue creation, ownership, and the standard for deleting or rewriting low-value tests. Do not let retry settings hide the problem; say what signal still fails loudly. -->

|Scenario|Immediate action|Follow-up owner|Time limit|Merge or release impact|
|---|---|---|---|---|
|New flake on a required check|<!-- Prompt: Example: rerun once, inspect logs, file issue, mark owner. -->|<!-- Prompt: Role or team. -->|<!-- Prompt: Same PR, same day, sprint, etc. -->|<!-- Prompt: Whether merge is blocked. -->|
|Known flake|<!-- Prompt: Example: quarantine, skip with issue link, lower priority, or remove. -->|<!-- Prompt: Role or team. -->|<!-- Prompt: Expiry date or review cadence. -->|<!-- Prompt: Whether release is blocked or risk is accepted. -->|
|Test with poor signal|<!-- Prompt: Example: rewrite lower in the stack, delete if it only checks implementation details, replace with a better check. -->|<!-- Prompt: Role or team. -->|<!-- Prompt: Review cadence. -->|<!-- Prompt: Merge or release impact. -->|

---

## 9. Manual and exploratory testing
<!-- Prompt: Name the human checks the project still expects and why automation does not own them yet. Include devices, browsers, operating systems, accessibility passes, copy review, install or upgrade paths, external integrations, destructive operations, or operator workflows. Link the checklist location if it lives outside this document. -->

---

## 10. Out of scope
<!-- Prompt: List the testing topics this strategy intentionally does not cover. Good out-of-scope items include per-feature test cases, release-specific evidence, production incident response, performance budgets owned elsewhere, compliance audits, or experiments that need their own plan. For each boundary, point to the document or issue type that owns it instead. -->
