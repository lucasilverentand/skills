# Dashboard Foundations and Taxonomy
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 1. How to use this playbook
This document uses three levels of guidance:

- **MUST** — the default requirement. Deviate only when a documented user need requires it.
- **SHOULD** — the expected choice in most cases.
- **MAY** — an optional pattern that depends on context.

The numbers in this guide—such as field counts or suggested breakpoints—are **decision heuristics, not universal laws**. Complexity, risk, user expertise, device constraints, and data volume matter more than a fixed count.

An agent should use the playbook in this order:

1. Define the user, decision, action, and time horizon.
2. Classify the surface and dashboard archetype.
3. Model entities, states, permissions, and data freshness.
4. Choose a page structure.
5. Map information and actions into components.
6. Specify all non-happy-path states.
7. Review safety, accessibility, responsiveness, and data trust.

Do not begin with a chart library, a card grid, or a visual style. Those are implementation choices, not the product model.

---

## 2. The core idea: a dashboard is a decision surface
A dashboard is a compact collection of related information that helps a person understand a situation and decide what to do next. Classic dashboard guidance emphasizes at-a-glance information and actionability.[^nng-dashboard] Modern BI products similarly describe dashboards as single-page highlights that lead to deeper reports.[^powerbi-dashboard]

For operational software, however, a useful dashboard is rarely just a wall of charts. It is usually part of a broader **decision-and-action loop**:

> **Observe → understand → prioritize → act → verify**

Every dashboard should answer at least one of these questions:

1. **What is the current state?**
2. **What changed?**
3. **What needs attention?**
4. **Why is it happening?**
5. **What action should I take?**
6. **Did the action work?**

A dashboard that answers none of them is decoration.

### 2.1 Design around decisions, not available data
Bad starting point:

> “We have 42 metrics. Put them on a page.”

Good starting point:

> “An on-call engineer needs to decide within two minutes whether an alert is customer-impacting, identify the affected service and recent change, and open the correct investigation view.”

The second statement immediately determines:

- audience;
- urgency;
- required freshness;
- information priority;
- drill-down path;
- relevant actions;
- acceptable density;
- failure cost.

### 2.2 The action-distance rule
The UI SHOULD minimize the distance between a signal and its appropriate action.

Examples:

- A firing alert links to the affected service, runbook, logs, traces, and incident action.
- A database storage warning links to growth history, largest tables, cleanup guidance, and resize controls.
- An SLA-breaching support queue opens the affected conversations with the relevant filter already applied.
- A failed deployment links to build output, changed version, rollback eligibility, and the prior healthy release.

A number without a next step is usually a report, not an operational control.

---

## 3. Dashboard taxonomy
There are two useful ways to classify dashboards:

1. **By decision horizon** — how quickly and how often a decision is made.
2. **By interaction mode** — whether the user is monitoring, triaging, investigating, configuring, or reviewing.

The familiar business taxonomy includes strategic, tactical, operational, and analytical dashboards.[^qlik-types] It is useful, but incomplete for software administration. Product teams also need queues, workbenches, resource details, fleet views, and configuration hubs.

### 3.1 Classification by decision horizon
|Type|Primary question|Decision horizon|Typical users|Data freshness|Interaction depth|Typical output|
|---|---|---:|---|---|---|---|
|**Operational**|What needs action now?|Seconds to hours|Operators, agents, on-call staff|Live to minutes|Fast triage and direct action|Resolve, reroute, acknowledge, restart, roll back|
|**Tactical**|Where should the team focus next?|Days to weeks|Team leads, service owners, managers|Hourly to daily|Segment, compare, plan|Reallocate capacity, fix recurring issues, prioritize work|
|**Strategic**|Are we progressing toward goals?|Weeks to quarters|Executives, directors, owners|Daily to monthly|Low-to-medium depth|Change strategy, budget, goals, policy|
|**Analytical**|Why did this happen and what patterns exist?|Ad hoc|Analysts, engineers, specialists|Depends on source|High exploration|Hypothesis, diagnosis, forecast, recommendation|

### 3.2 Classification by interaction mode
|Archetype|Main job|Best default structure|Common examples|
|---|---|---|---|
|**Monitor / command center**|Maintain awareness and spot exceptions|Status summary + alerts + trends + recent changes|Production health, NOC, security operations|
|**Queue / workbench**|Process items in priority order|Filterable list + detail pane + actions|Support inbox, moderation queue, incident triage|
|**Fleet / inventory**|Compare and manage many resources|Summary + table/grid + primary-detail|Databases, services, workers, tenants, devices|
|**Resource detail**|Understand and operate one entity|Header + status + tabs/sections + contextual actions|One app, database, customer, deployment|
|**Investigation / explorer**|Form and test hypotheses|Query/filter controls + visual results + raw evidence|Logs, traces, query analysis, product analytics|
|**Configuration hub**|Inspect and change system behavior|Categorized settings + forms + change history|App settings, routing rules, connection pools|
|**Workflow / wizard**|Complete a multi-step task safely|Ordered steps + validation + review|Create database, restore backup, onboard integration|
|**Scorecard / review**|Track outcomes against targets|KPI hierarchy + trends + explanations|Executive, cost, reliability, support performance|
|**Audit / timeline**|Establish who changed what and when|Searchable event stream + details + export|Security audit, deployment history, admin activity|
|**Personal home**|Resume work and see relevant changes|Assigned work + recent items + shortcuts|Agent home, developer home, team overview|

### 3.3 Choose one primary archetype
A page MAY contain a secondary pattern, but it MUST have one dominant task model.

Good combinations:

- Fleet table + primary-detail drawer.
- Monitor summary + incident list.
- Resource detail + small investigation panel.
- Queue + customer context sidebar.

Bad combinations:

- Executive scorecard + full log explorer + settings form + bulk admin table on one page.
- Eight unrelated mini-dashboards arranged by whichever card fits the grid.

### 3.4 Mapping domain needs to archetypes
|Domain need|Primary archetype|Secondary archetype|Avoid|
|---|---|---|---|
|Watch production health|Monitor|Resource detail|Dense editable settings on the overview|
|Handle active incidents|Queue/workbench|Investigation|Hiding incident actions below charts|
|Manage many databases|Fleet|Primary-detail|One card per database when there are dozens|
|Tune a slow database|Resource detail|Investigation|Mixing fleet-wide and instance-specific scope|
|Answer customer conversations|Queue/workbench|Customer detail|KPI cards dominating the agent workspace|
|Manage support staffing|Operational monitor|Tactical scorecard|Showing individual-agent rankings without context|
|Configure routing or automation|Configuration hub|Wizard|Modal containing a large rules builder|
|Review quarterly reliability|Strategic scorecard|Analytical drill-down|Live alert noise in the executive view|

---

## 4. Choose the right product surface before choosing a layout
Many products call every authenticated page a “dashboard.” This creates poor UX because different jobs require different structures.

|Surface|Best for|Distinguishing behavior|Usually not appropriate for|
|---|---|---|---|
|**Dashboard**|At-a-glance status and priorities|Summarizes; links outward|Deep editing or long investigation|
|**Report**|Stable, reviewable output|Defined metrics, period, and grouping|Real-time operations|
|**Explorer**|Open-ended analysis|Flexible query, filter, grouping, comparison|Novice users needing a clear next action|
|**Workbench**|Repeated operational processing|Dense queue, keyboard flow, direct actions|Executive communication|
|**Resource detail**|One entity|Persistent identity, state, history, operations|Comparing a large fleet|
|**Settings page**|Configuration|Explicit save model, validation, permissions|Monitoring current health|
|**Wizard**|Ordered, risky, or dependent setup|Step state, back/next, review|Frequent expert editing|
|**Audit log**|Immutable history|Search, actors, timestamps, before/after|Current-state monitoring|

### 4.1 Dashboard versus report
Use a dashboard when the user needs to **monitor and branch**. Use a report when the user needs to **review, communicate, or archive** a defined result.

A dashboard SHOULD link to reports or explorers for detail rather than trying to contain every breakdown. Microsoft’s dashboard guidance recommends keeping the essential story on one screen and using related reports for detail.[^powerbi-design]

### 4.2 Dashboard versus workbench
A support agent resolving conversations needs a workbench, not a managerial KPI dashboard. The primary content should be the queue and the active conversation. Metrics can appear as compact workload context, not as the visual center.

Likewise, an incident commander needs an incident workspace with timeline, ownership, status, evidence, and actions—not merely a service-health dashboard.

---
