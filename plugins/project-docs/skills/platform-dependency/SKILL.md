---
name: platform-dependency
description: Writes platform dependency documents from the project-docs template. Use when the user asks for a platform dependency doc, wants vendor or API risk analysis, needs external framework constraints documented, or is filling platform-dependency.md.
---

# Platform Dependency
Use this skill to document an external system that shapes what the product can build, ship, monitor, or exit from.

## Decision tree
- What is the user asking for?
  - **A new platform dependency doc** -> read `../../README.md` and `references/template.md`, then draft the dependency analysis in the requested destination.
  - **Evidence about the dependency** -> use the `research-brief` skill for focused source trails and link it from this document.
  - **A product decision to adopt or reject the dependency** -> use the `decision-record` skill and link to this document for limits, risks, costs, and exit strategy.
  - **Feature behavior using the dependency** -> use the `feature-spec` skill and link to this document for shared dependency truth.
  - **Something else** -> ask which external API, OS framework, hardware, vendor, service, or standard is load-bearing.

## Workflow
1. Read `../../README.md` for shared conventions and relationship rules.
2. Read `references/template.md` before drafting or editing.
3. Gather the dependency, capabilities, limits, interfaces, versions, observed behavior, costs, fallback path, monitoring, risks, and exit strategy.
4. Verify current vendor or platform details from primary sources when they could have changed.
5. State how the project should degrade when the dependency is unavailable or behaves differently than expected.
6. Link feature specs, technical designs, and release docs that rely on this dependency.

## Document contract
- **When to write**: When the product builds on something external, such as an API, OS framework, hardware capability, vendor, model, or protocol.
- **How many**: One per load-bearing dependency.
- **Owns**: Capabilities, limits, interface shape, versions, behavior, cost, fallback, monitoring, risks, and exit strategy.
- **Link instead of duplicating**: Product scope belongs in the project brief; feature behavior belongs in feature specs; adoption rationale belongs in decision records.
