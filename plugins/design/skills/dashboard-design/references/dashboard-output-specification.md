# Dashboard Output Specification
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 23. Agent output specification
Use this template for a generated dashboard design.

Use this field contract for a generated dashboard design:

|Field|What to specify|
|---|---|
|`title`|Name of the surface, such as `Database fleet`.|
|`purpose`|The decision or action the surface supports.|
|`users`|Primary user and secondary users.|
|`classification`|Decision horizon, product surface, primary archetype, and secondary archetype if any.|
|`scope`|Global controls, local controls, and defaults such as workspace, environment, region, or time range.|
|`layout`|Header content, section order, component placement, and drill-down behavior.|
|`metrics`|Metric contracts, thresholds, freshness, and click-through behavior.|
|`table_or_queue`|Default sort, columns, row navigation, row actions, bulk actions, and pagination or virtualization.|
|`interactions`|Trigger, result, state preservation, and failure behavior for each important interaction.|
|`forms`|Container, fields, validation, save model, review step, and job model for every mutation.|
|`permissions`|What each role can view or change, plus disabled or hidden-action behavior.|
|`states`|Loading, loaded, empty, filtered empty, stale, partial, permission denied, and error states.|
|`accessibility`|Keyboard, focus, semantic table, chart summary, status text, and target-size requirements.|
|`responsive`|Narrow-screen priority order and detail behavior.|
|`telemetry`|Success events, guardrail metrics, and audit events.|
|`assumptions`|Data volume, freshness expectations, missing product context, and unresolved decisions.|

Compact example:

```text
title: Database fleet
purpose: Find unhealthy or risky databases and reach corrective action.
primary user: Database platform operator
classification: operational dashboard, fleet + primary-detail
scope: workspace, environment, region; default production and all regions
layout: header with title, purpose, freshness, create action; risk summary before fleet table
table: sort by severity, impact, name; columns include status, load, storage, backup, owner
interactions: status summaries filter the table; selecting a row opens a detail drawer
forms: create database uses a high-risk wizard with review and async job state
permissions: viewers read; operators run approved actions; admins create and delete
states: loading, filtered empty, stale, partial region failure, permission denied, error
responsive: preserve status, name, storage risk, backup state, and primary action first
telemetry: issue opened, summary filter applied, corrective action started
assumptions: fleet data arrives within two minutes
```

### 23.1 Minimal wireframe output
An agent SHOULD also provide a text wireframe:

```text
┌ Database fleet ─ Production ─ All regions ─ Updated 10:42 ┐
│ 3 critical  │ 7 storage risks │ 2 backup failures          │
├────────────────────────────────────────────────────────────┤
│ Search  Status  Engine  Region  Owner  Saved view   Create │
├────────────────────────────────────────────────────────────┤
│ Name        Status   Load   Storage   Repl.   Backup  Owner │
│ orders      Critical 92%    4% left   8m      1h ago  Core  │
│ analytics   Healthy  34%    61%       0s      2h ago  Data  │
└────────────────────────────────────────────────────────────┘
```

---
