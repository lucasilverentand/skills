---
name: dashboard-design
description: Designs decision-first dashboards, admin consoles, operational workbenches, database management interfaces, support queues, analytics surfaces, settings hubs, and internal tools. Use for advisory conversations with a person asking for dashboard UX advice and for autonomous agent work when creating, redesigning, reviewing, or implementing dashboard-like product UI. Trigger when choosing dashboard archetypes, layout, metrics, charts, tables, filters, forms, actions, states, permissions, accessibility, or domain-specific dashboard patterns; or when the user asks for "dashboard UX", "admin UI", "ops console", "management dashboard", "support workbench", "database console", or similar.
---

# Dashboard Design
Use this skill to design dashboards as decision-and-action surfaces, not decorative card grids. A dashboard should help a specific person observe state, understand what changed, prioritize, act, and verify the result.

## Usage Modes
- **Advisory conversation**: Use when the user wants help thinking through a dashboard, wants critique, or asks what the product surface should do. Ask only the clarifying questions that change the recommendation. Explain the decision model, trade-offs, and recommended pattern in plain language. Do not jump to implementation details unless the user asks to build.
- **Autonomous build or review**: Use when the user asks the agent to create, modify, or review dashboard UI. Infer the dashboard brief from the repo, product context, existing UI, data model, and user request. If important context is missing, state assumptions and keep moving when the risk is low; ask before making high-impact product, security, or data-model assumptions. Produce implementation-ready structure, states, and validation notes before editing UI.
- **Mixed mode**: Start conversationally when the user is still deciding, then switch to autonomous build mode once the desired surface, audience, and primary action are clear.

## Core Workflow
1. Choose advisory conversation mode, autonomous build/review mode, or mixed mode from the user's request.
2. Read `references/dashboard-defaults.md`, `references/foundations-and-taxonomy.md`, and `references/dashboard-brief.md` before proposing structure or UI. Produce, ask for, or infer the dashboard brief: user, decision, action, time horizon, scope, entities, data freshness, permissions, and failure cost.
3. Classify the surface before choosing a layout:
   - **Dashboard** for at-a-glance status and branching.
   - **Workbench or queue** for repeated operational processing.
   - **Resource detail** for one entity with status, history, and contextual operations.
   - **Explorer** for open-ended investigation.
   - **Settings hub or wizard** for configuration and risky setup.
   - **Report or scorecard** for stable review and communication.
4. Choose one primary archetype. Secondary patterns are allowed only when they support the dominant task model.
5. Load the narrow references for the surface, components, and domain being designed.
6. Specify non-happy-path states before finishing: empty, loading, stale, partial, error, permission denied, unsafe action, long-running job, and data-quality uncertainty.
7. Review the output against `references/review-checklist.md` and `references/common-antipatterns.md`.

## Routing
|Need|Read|
|---|---|
|Strong default preferences for dashboard product shape, visual tone, data trust, and build/advice behavior|`references/dashboard-defaults.md`|
|Core decision model, taxonomy, product-surface choice|`references/foundations-and-taxonomy.md`|
|Required dashboard brief and clarifying questions|`references/dashboard-brief.md`|
|Navigation, page hierarchy, headers, tabs, responsive layout patterns|`references/information-architecture-and-layouts.md`|
|Metric contracts, KPI cards, status, freshness, charts, visualization choices|`references/metrics-status-and-charts.md`|
|Tables, lists, queues, row actions, bulk actions, pagination, inline editing|`references/tables-lists-and-queues.md`|
|Scope, filters, search, time controls, URLs, saved views, filter result states|`references/filters-search-scope-and-time.md`|
|Forms, settings UX, input choice, validation, save models, secrets, destructive flows|`references/forms-and-configuration.md`|
|Action hierarchy, feedback, optimistic updates, jobs, empty/loading/error states, permissions, auditability|`references/actions-states-and-safety.md`|
|Keyboard, focus, targets, table accessibility, chart accessibility, localization|`references/accessibility-and-internationalization.md`|
|Application operations, services, incidents, deployments, logs, jobs|`references/application-operations.md`|
|Database fleets, database detail, query workbenches, schema browsing, backups, replication, destructive flows|`references/database-management.md`|
|Support inboxes, reply composers, customer context, manager dashboards, SLA, routing, sensitive data|`references/customer-support.md`|
|Security, identity, billing, product analytics, moderation, commerce, AI/ML operations, internal admin|`references/additional-domains.md`|
|Tokens, dashboard components, component states, density, card usage, content style|`references/component-system.md`|
|Agent design algorithm|`references/agent-execution.md`|
|Recommended output structure and minimal wireframe output|`references/dashboard-output-specification.md`|
|Final review checklist|`references/review-checklist.md`|
|Common anti-patterns to reject|`references/common-antipatterns.md`|
|Research basis and source links|`references/research-basis.md`|

## Design Rules
- Start from the decision. Do not begin with chart libraries, KPI cards, decorative cards, or visual style.
- Keep the distance between a signal and its appropriate action short. A warning should lead to the affected object, evidence, and next safe operation.
- Treat metrics as contracts: name, definition, scope, source, time window, freshness, thresholds, permissions, and empty/error behavior.
- Prefer dense but organized operational UI over marketing composition. Admin surfaces should scan well, preserve context, and support repeat use.
- Make scope and time visible. Hidden tenant, environment, region, segment, or date range choices make dashboards untrustworthy.
- Use charts only when visual comparison helps. Tables, queues, timelines, or status lists are often better for operational work.
- Build tables for real data volume: sorting, filtering, column priority, row actions, bulk actions, pagination or virtualization, and narrow-screen behavior.
- Choose form containers deliberately. Avoid large settings forms in modals; use pages, drawers, wizards, or review screens when complexity or risk requires it.
- Mark unknown, stale, partial, and delayed data honestly. Never let missing telemetry look healthy.
- Pair risky actions with eligibility, consequences, audit trail, permission handling, and post-action verification.

## Default Preferences
- Treat `references/dashboard-defaults.md` as strong default guidance whenever product context does not clearly point elsewhere.
- Default to decision/action-first, dense operational surfaces with restrained system UI, visible scope/freshness, capable tables, and preserved drill-down context.
- Use cards sparingly, charts only when they change the decision, and saved views for repeated operational filter/sort/column setups.
- Keep risky actions explicit and auditable, copy concrete and terse, and empty states specific to the reason nothing is shown.
- Let product-specific design systems override visual tone, but not decision/action clarity, data trust, or safety without a clear reason.

## Expected Outputs
For advisory conversations, include the dashboard brief, recommended archetype, key trade-offs, questions that still matter, and the next decision the person should make.

When designing, reviewing, or building a dashboard, include:

1. Dashboard brief.
2. Primary archetype and any secondary pattern.
3. Information hierarchy and page structure.
4. Component plan for metrics, charts, tables, filters, forms, actions, and states.
5. Responsive and accessibility behavior.
6. Safety, permission, audit, and data-trust handling.
7. Wireframe or implementation notes when the user is building UI.
8. Review findings or anti-patterns found when auditing existing work.

For implementation tasks, convert the plan into the target framework using the existing project design system. Keep this skill responsible for dashboard product structure; use companion frontend or platform skills for framework-specific code conventions when needed.
