# Information Architecture and Layouts
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 6. Information architecture

### 6.1 Stable application shell
A mature admin product usually needs:

1. **Product/global navigation** — major domains such as Apps, Databases, Support, Billing, and Settings.
2. **Workspace or organization selector** — the tenant or account boundary.
3. **Environment selector** — production, staging, development, or custom environments.
4. **Search or command palette** — resources, customers, tickets, commands, documentation.
5. **Notifications and active jobs** — durable access to background operations.
6. **Help and documentation** — contextual, not generic only.
7. **User and role menu** — identity, role, preferences, sign out.

The shell MUST preserve the user’s scope. Switching from an app overview to logs should retain the relevant environment, app, region, and time range when those concepts still apply.

### 6.2 Page hierarchy
A strong default dashboard hierarchy is:

1. **Identity and scope**
2. **Current status and urgent exceptions**
3. **Primary actions**
4. **Outcome metrics**
5. **Trends and contributing factors**
6. **Detailed records**
7. **Definitions, freshness, and supporting context**

For an operational dashboard, exceptions generally outrank aggregate KPIs. For a strategic dashboard, outcome KPIs and trend against target may outrank individual events.

### 6.3 Page-header anatomy
```text
Breadcrumbs
Page title                         Primary action
Short purpose / entity metadata    Secondary actions
Status · environment · region · owner · last updated
Global scope and time controls
```

Rules:

- The title MUST identify the object or task, not a generic category such as “Overview.”
- Environment MUST be unmistakable on pages that can change production.
- Status MUST include text, not color alone.
- The primary action MUST match the page’s main job.
- Rare actions SHOULD be in an overflow menu.
- Destructive actions MUST not visually compete with the primary constructive action.

### 6.4 Navigation depth
Use this default hierarchy:

```text
Product area
  └─ Fleet / collection
       └─ Resource detail
            ├─ Overview
            ├─ Activity or performance
            ├─ Logs / events / history
            ├─ Configuration
            └─ Access / audit
```

Avoid more than two persistent side-navigation levels. Deeper hierarchy is usually better represented with breadcrumbs, tabs, local navigation, or a tree when the hierarchy itself is the user’s object of work.

### 6.5 Tabs
Use tabs when:

- all tabs describe the same entity;
- users switch between sibling views;
- each tab can be independently linked;
- labels are stable and short.

Do not use tabs to conceal a sequential workflow, unrelated product areas, or form sections that must be reviewed together.

Tabs SHOULD preserve filters only when those filters remain semantically valid. They SHOULD have stable URLs.

### 6.6 Progressive disclosure
Show the minimum information needed for the current decision, then offer detail through:

- expandable rows;
- a detail drawer;
- a popover for definitions;
- a focused detail page;
- an advanced section;
- raw data or query view.

Progressive disclosure is not an excuse to hide essential status, impact, or risk.

---

## 7. Page and layout structures

### 7.1 Pattern A: overview → drill-down
Best for:

- application health;
- account overview;
- strategic scorecards;
- cost summaries.

```text
[Scope] [Time] [Refresh]

[Critical status or exception banner]

[KPI] [KPI] [KPI] [KPI]

[Primary trend ---------------------] [Breakdown]

[Exceptions / recent changes / records table --------]
```

Rules:

- Limit the first row to the few metrics that determine the next decision.
- Each summary block SHOULD link to its detail.
- Do not repeat the same metric in a card, chart, and table without adding meaning.

### 7.2 Pattern B: command center
Best for:

- production operations;
- security operations;
- live fulfillment;
- real-time support management.

```text
[Global status] [Active incidents] [Critical alerts] [Freshness]

[Service or region health matrix -------------------------]

[Alert / incident queue ----------] [Recent changes ------]

[Traffic/errors/latency trend -----------------------------]
```

Rules:

- Optimize for glanceability and exception detection.
- Keep status vocabulary small and consistent.
- Auto-refresh MUST not reset scroll, selection, or the user’s current investigation.
- New items SHOULD enter predictably; avoid rows jumping while the user is acting.

### 7.3 Pattern C: queue / workbench
Best for:

- customer support;
- moderation;
- incident triage;
- approval workflows;
- job failure handling.

```text
[Saved view] [Search] [Filters] [Sort] [Queue count]

[List / queue 40%] | [Selected item detail 60%]
                    | [Context]
                    | [Timeline]
                    | [Primary action composer]
```

PatternFly describes primary-detail layouts as useful for moving through a list and editing or inspecting items without losing list context.[^patternfly-primary-detail]

Rules:

- Preserve list position and filters when the detail changes.
- Support next/previous navigation.
- Distinguish row selection from checkbox selection.
- Keep the high-frequency action visible.
- Provide keyboard shortcuts only with discoverable help and conflict-safe behavior.

### 7.4 Pattern D: fleet / inventory
Best for:

- databases;
- services;
- environments;
- tenants;
- integrations;
- devices.

```text
[Summary: total / healthy / warning / critical]

[Search] [Facets] [Saved view] [Columns] [Create]

[Resource table ------------------------------------------]
[Name | Status | Region | Version | Load | Owner | Updated]
```

Rules:

- Default sort SHOULD surface actionable exceptions, not alphabetical order, when operational urgency is the main job.
- Use cards only for a small, visually distinct set. Use a table or data list for a large fleet.
- Fleet status SHOULD distinguish **unknown** from healthy.
- Multi-select actions MUST state the number and scope of selected resources.

### 7.5 Pattern E: resource detail
Best for one app, database, customer, integration, or deployment.

```text
[Back] Resource name       Status         [Primary action]
       Environment · ID · owner           [More]

[Overview] [Performance] [Activity] [Configuration] [Access]

[Tab content]
```

Rules:

- Resource identity and current scope MUST remain visible.
- Actions MUST operate on the visible resource and environment.
- High-risk actions MUST repeat the target in the confirmation.
- The overview SHOULD summarize linked subpages, not duplicate them entirely.

### 7.6 Pattern F: investigation workspace
Best for logs, traces, query performance, analytics, and debugging.

```text
[Query / filter builder ----------------] [Run]
[Time range] [Group by] [Compare] [Save view]

[Visualization / result summary --------------------------]

[Raw events or records table -----------------------------]

[Selected record detail drawer]
```

Rules:

- Make the active query and scope visible.
- Give every query a shareable representation, usually in the URL or saved view.
- Preserve the query when navigating to a record and back.
- Show query cost, truncation, sampling, or row limits when relevant.
- Separate “no matches” from “query failed” and “data unavailable.”

### 7.7 Pattern G: configuration hub
Best for related categories of settings.

```text
[Settings navigation] | [Section title]
                      | [Description / docs]
                      | [Form section]
                      | [Form section]
                      | [Save / cancel]
```

Rules:

- Group settings by the user’s mental model, not backend service ownership.
- Show current effective value and inheritance source when settings can be inherited.
- Explain operational consequences near the control.
- Provide change history for sensitive configuration.

### 7.8 Pattern H: wizard
Best for setup with dependencies, ordered steps, or meaningful review.

```text
Steps: 1 Basics — 2 Capacity — 3 Access — 4 Review

[Step title]
[Why this information is needed]
[Fields]

[Back]                               [Save draft] [Continue]
```

Rules:

- Steps SHOULD represent meaningful user concepts, not arbitrary field counts.
- Back MUST retain entered data.
- Do not ask for the same information again in later steps; WCAG 2.2 includes a redundant-entry criterion for multi-step processes.[^wcag-redundant]
- The final review MUST show consequential choices and allow targeted editing.
- Creation progress after submission belongs in a job/progress view, not a fake extra wizard step.

### 7.9 Pattern I: audit timeline
Best for changes, access, deployments, support actions, and security events.

```text
[Time] [Actor] [Action] [Resource] [Result] [IP/source]

2026-06-19 10:41  Luca  Changed pool size  db-prod-2  Success
  Before: 20
  After:  40
  Reason: Handle expected event traffic
```

Rules:

- Use exact timestamps with timezone.
- Preserve immutable identifiers even if display names change.
- Show before/after values where safe.
- Redact secrets rather than omitting the existence of the change.
- Exports SHOULD carry the active filters and timezone.

### 7.10 Responsive behavior
Admin dashboards are often desktop-primary, but this does not justify unusable smaller-screen behavior.

At narrow widths:

- Preserve status, identity, primary action, and urgent queue items first.
- Stack summary cards in priority order.
- Replace side-by-side primary-detail with list → full-screen detail navigation.
- Allow tables to expose priority columns and move secondary fields into row detail.
- Do not shrink charts until labels become unreadable; switch to a simpler representation.
- Keep touch targets large enough and separated.
- Avoid horizontal scrolling for the whole page. A deliberately scrollable data grid MAY be appropriate.

---
