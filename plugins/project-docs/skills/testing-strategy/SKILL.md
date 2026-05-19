---
name: testing-strategy
description: Writes testing strategy documents from the project-docs template. Use when the user asks for a testing strategy, wants a shared test plan, needs CI or coverage expectations across a project, or is filling testing-strategy.md.
---

# Testing Strategy
Use this skill to define the project-wide confidence model that feature specs, technical designs, release readiness docs, and PRs can reference.

## Decision tree
- What is the user asking for?
  - **A new testing strategy** -> read `../../README.md` and `references/template.md`, then draft the strategy for the requested project or repo.
  - **A feature-level test plan** -> prefer the `technical-design` skill for implementation-specific tests, and link back to the testing strategy for shared layers and CI expectations.
  - **A release confidence check** -> prefer the `release-readiness` skill, using the testing strategy as the source for expected evidence.
  - **Changes to tools, coverage, fixtures, CI, or flaky-test handling** -> update the matching section and call out downstream docs that should link to it.
  - **Something else** -> ask whether the user needs a project-wide testing contract or a narrower feature test plan.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `references/template.md` before drafting or editing.
3. Gather the project type, test frameworks, CI provider, release risk, data model, and manual testing needs.
4. Define test layers by responsibility. Avoid naming a tool unless the project actually uses it or is choosing it now.
5. State what evidence reviewers should expect before a feature or release is considered ready.
6. Record known gaps honestly, including flaky tests, manual-only checks, and unowned coverage.

## Document contract
- **When to write**: When a project needs one shared testing contract across features, packages, services, and releases.
- **How many**: One per app, product area, repo, or long-running project.
- **Owns**: Test layers, coverage expectations, tools, fixtures, CI integration, flaky-test handling, and manual checks.
- **Link instead of duplicating**: Feature-specific implementation tests belong in technical designs; launch evidence belongs in release readiness docs.
