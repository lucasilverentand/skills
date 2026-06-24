---
title: Release readiness
status: Active
owner: Luca Silverentand
last_updated: 2026-05-15
related:
  - project-brief.md
  - feature-spec.md
  - platform-dependency.md
  - testing-strategy.md
  - post-release-review.md
---

# Release readiness
<!-- Prompt: Use this before shipping a product, app release, feature launch, service change, library version, CLI update, or infrastructure change. The document should collect evidence for a release decision, not vague approvals. If something is unknown, write the unknown plainly and decide whether it blocks release. -->

<!-- Relationship guide for planners/AI: Use this as the pre-ship evidence bundle. Pull scope from the project brief and feature specs, dependency risk from platform docs, and decision context from decision records. The post-release review should compare actual results against this document. -->

## 1. Release summary
<!-- Prompt: What is being released, to whom, and through what channel. Include version, build, deployment, package, flag, store release, or rollout identifier where one exists. One short paragraph. -->

---

## 2. User-facing scope
<!-- Prompt: What users, developers, operators, or customers will notice. Include new behavior, changed behavior, removed behavior, migration impact, and anything intentionally invisible but user-affecting. Link the feature specs or project brief rather than repeating them. -->

---

## 3. Operational scope
<!-- Prompt: What changes behind the scenes: database migrations, feature flags, jobs, queues, permissions, dependencies, monitoring, deployment topology, package distribution, support tooling, or manual operations. Include owner and current state for each item that must be true at release time. -->

---

## 4. Known risks
<!-- Prompt: The risks we are knowingly carrying into release. For each, include impact, likelihood, mitigation, detection signal, and whether it blocks release. Be specific: "old clients may read a missing field" is useful; "backwards compatibility risk" is not. -->

---

## 5. Test coverage
<!-- Prompt: Evidence that the release works. Include automated checks, manual QA, device or browser coverage, migration dry runs, load checks, accessibility checks, security checks, and test gaps. For each check, include the result or link to the run. If a check was skipped, say why. -->

---

## 6. Support and documentation
<!-- Prompt: What users or operators need to understand the release. Include release notes, help docs, migration guides, runbooks, support macros, known-issue notes, internal handoff, and who is prepared to answer questions. -->

---

## 7. Privacy, security, and legal checks
<!-- Prompt: Confirm whether the release changes data collection, data retention, permissions, authentication, authorization, encryption, third-party processors, public claims, licensing, export restrictions, or terms. Link the review or state why no review is needed. -->

---

## 8. Rollout plan
<!-- Prompt: How the release reaches people or systems. Include phases, percentage or audience gates, timing dependencies, owner, monitoring window, promotion criteria, and the condition for stopping. For libraries and CLIs, describe publication and adoption path instead of staged rollout if that fits better. -->

---

## 9. Rollback plan
<!-- Prompt: How to undo or contain the release. Include kill switch, revert, package yank, feature flag, database rollback or forward-fix plan, cache clearing, communications, and data cleanup. If rollback is impossible or partial, say that and name the fallback. -->

---

## 10. Launch decision
<!-- Prompt: The final decision and evidence behind it. Use one of: Ship, Ship with conditions, Hold, or Cancel. List the conditions if any. Name the person making the call and the date. -->
