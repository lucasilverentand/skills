---
name: design-system
description: Create, audit, document, and evolve digital design systems from the bundled universal design-system guide. Use when the user says "create a design system", "write a system brief", "audit our design system", "define tokens", "make a component spec", "plan adoption", "write release notes", "create governance", "build a design-system roadmap", or asks about foundations, color, typography, spacing, motion, media, data visualization, content voice, accessibility, component APIs, component libraries, patterns, templates, themes, modes, multi-brand architecture, platform support, engineering architecture, design tooling, source-of-truth rules, documentation, contribution, deprecation, migration, testing, quality gates, metrics, maturity, templates, or readiness checklists.
---

# Design System
Use this skill to create design systems as durable products: shared language, reusable materials, operating model, and quality standard.

This skill is based on `references/universal-guide-*.md`, which is the provided universal digital design-system guide split by section range for progressive disclosure. Treat those reference files as canonical. Load the relevant guide sections before making design-system decisions.

## Workflow
1. Identify the requested artifact:
   - Strategy or alignment: system brief, scope, non-goals, archetype, success measures, audit, principles, quality criteria.
   - Foundations: token architecture, color, typography, spacing, layout, shape, depth, motion, icons, illustration, photography, media, data visualization, content, accessibility.
   - Components and patterns: component API, component library, state matrix, pattern specification, templates, theming, modes, brands, platforms.
   - Implementation: engineering architecture, CSS/component strategy, source-of-truth map, design tooling, documentation, handoff.
   - Operations: governance, contribution lanes, RFCs, decision records, exceptions, versioning, releases, deprecation, adoption, migration, support.
   - Quality and evolution: testing, quality gates, metrics, team model, maturity, roadmap, failure-mode review, readiness checklist.
2. Load `references/universal-guide-00-introduction-and-toc.md` for the table of contents when the task is broad or ambiguous.
3. Load the smallest set of matching guide references from the routing table below.
4. Build the requested artifact from the guide's methods and templates.
5. Validate the output against the relevant readiness checklist, quality model, and common failure modes from the guide.

## Guide Routing
- `references/universal-guide-00-introduction-and-toc.md`: guide overview and full table of contents.
- `references/universal-guide-01-framing-scope-audit-principles.md`: sections 1-5; what a design system is, archetypes, boundaries, lifespan, variation model, non-goals, system brief, audit, principles, and quality criteria.
- `references/universal-guide-02-architecture-operations-foundations-tokens.md`: sections 6-9; layer architecture, decision versus delivery layers, shared core and extensions, operating model, foundations, states, and token architecture.
- `references/universal-guide-03-visual-foundations-and-media.md`: sections 10-15; color, typography, spacing, sizing, layout, shape, borders, elevation, depth, motion, icons, illustration, photography, video, audio, and asset delivery.
- `references/universal-guide-04-data-content-accessibility.md`: sections 16-18; data visualization, content design, voice, terminology, localization, content models, accessibility, keyboard, focus, forms, zoom, reflow, assistive technology, and inclusive defaults.
- `references/universal-guide-05-components-patterns-themes.md`: sections 19-22; component APIs, anatomy, behavior contracts, variants, composition, slots, state, events, component library, patterns, templates, themes, modes, brands, white-labeling, platform parity, locale, and direction modes.
- `references/universal-guide-06-engineering-tooling-documentation.md`: sections 23-25; delivery boundaries, repository strategy, CSS architecture, implementation shape, DOM contracts, SSR, performance, dependencies, native/email delivery, security, automation, design tooling, source of truth, parity, handoff, and documentation.
- `references/universal-guide-07-governance-release-adoption-quality-metrics.md`: sections 26-30; governance, intake, shared/local decisions, contribution lanes, reviews, RFCs, ADRs, exceptions, versioning, releases, deprecation, adoption, migration, support, testing, quality gates, and metrics.
- `references/universal-guide-08-team-roadmap-failure-modes.md`: sections 31-33; roles, responsibility matrix, capacity, sponsorship, maturity levels, roadmap categories, scoring, build versus buy, backlog hygiene, and common failure modes.
- `references/universal-guide-09-templates-checklists-examples-glossary.md`: sections 34-38; component proposal, component specification, RFC, token proposal, pattern specification, contribution PR, design review, exception request, release notes, deprecation notice, audit worksheet, accessibility report, adoption plan, readiness checklists, example repo structures, implementation plan, minimal viable systems, glossary, and closing rule set.

## Output Rules
- Start by naming the system archetype, boundary, users, non-goals, constraints, expected lifespan, and success outcomes when those affect the decision.
- Treat the design system as a product with users, jobs, roadmap, support, release notes, quality targets, adoption metrics, feedback, maintenance cost, and deprecation policy.
- Separate language, materials, operations, and evidence. Do not reduce a system to a Figma file, component package, brand PDF, or style guide unless the scope is intentionally that small.
- Define stable semantic meaning separately from variable expression. Keep conceptual architecture independent from any single design tool, framework, or platform delivery adapter.
- Prefer the smallest effective system. Add components, tokens, variants, and governance only when they solve repeated evidenced problems.
- Make contracts explicit: ownership, customization boundaries, accessibility guarantees, supported platforms, source of truth, release process, exception policy, and consumer responsibilities.
- Include accessibility, localization, responsive behavior, themes/modes, reduced motion, testing, migration, and quality gates when the artifact can affect shipped UI.
- Use the guide's section 34 templates for formal artifacts instead of inventing new formats unless the user requests a different format.
- Mark unknowns and assumptions. Do not fill missing organizational facts such as owners, councils, tools, or support channels with invented details.

## Final Check
- Did the output answer the user's requested artifact, not just summarize the guide?
- Did it use the relevant guide section files?
- Are principles connected to practical implications, acceptance criteria, and ownership?
- Are materials and operations both covered when the system will be maintained?
- Are failure modes from section 33 avoided or called out as risks?
- Are readiness checklist gaps from section 35 listed as follow-up work?
