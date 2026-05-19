---
name: release-readiness
description: Writes release readiness documents from the project-docs template. Use when the user asks for release readiness, wants a ship or hold checklist, needs launch risk and rollback evidence, or is filling release-readiness.md.
---

# Release Readiness
Use this skill to collect the evidence for a ship, hold, or phased rollout decision before a release changes user or operational reality.

## Decision tree
- What is the user asking for?
  - **A new release readiness doc** -> read `../../README.md` and `references/template.md`, then draft the release check in the requested destination.
  - **Feature behavior is still being defined** -> use the `feature-spec` skill first and link to it from release readiness.
  - **Test evidence is missing** -> use `testing-strategy` for expected layers and record the actual release evidence here.
  - **A post-ship review** -> use the `post-release-review` skill after the release ships, stalls, rolls back, or is abandoned.
  - **Something else** -> ask what release, feature, service change, library version, CLI update, or infrastructure change is being evaluated.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `references/template.md` before drafting or editing.
3. Gather release summary, user-facing scope, operational scope, known risks, test coverage, support docs, privacy, security, legal checks, rollout, rollback, and launch decision.
4. Use tables for risks, rollout phases, rollback steps, and evidence gaps.
5. Do not hide missing evidence. A readiness doc can recommend hold when that is the honest result.
6. Link project brief, feature specs, testing strategy, platform dependency docs, decision records, changelog, and release issues.

## Document contract
- **When to write**: Before shipping a release, feature, service change, library version, CLI update, or infrastructure change.
- **How many**: One per release or launch decision.
- **Owns**: Ship scope, operational scope, known risks, test evidence, support and docs checks, privacy or security checks, rollout, rollback, and launch decision.
- **Link instead of duplicating**: Product behavior belongs in feature specs; testing expectations belong in testing strategy; lessons learned belong in post-release reviews.
