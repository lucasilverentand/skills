# Filters, Search, Scope, and Time
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 11. Filters, search, scope, and time

### 11.1 Distinguish four concepts
|Concept|Meaning|Example|
|---|---|---|
|**Scope**|The universe being viewed|Organization, environment, service, inbox|
|**Filter**|A subset within that universe|Status = critical, owner = platform|
|**Search**|Match a known or partially known item|Database name, customer email, trace ID|
|**Query**|An explicit analytical expression|`status:error AND latency_ms > 500`|

Treating all four as generic filter chips makes the UI confusing.

### 11.2 Global versus local controls
Global controls affect the entire page and SHOULD appear in a stable context bar. Local controls belong near the component they affect.

Example:

```text
Global: Workspace · Production · All regions · Last 6 hours
Local chart: Group by service · p95
Local table: Status · Owner · Search
```

A control’s visual placement MUST match its scope.

### 11.3 Time controls
A time picker SHOULD support:

- useful presets;
- custom start/end;
- timezone;
- relative versus fixed ranges;
- compare-to-previous or compare-to-baseline when relevant;
- live mode for real-time operations;
- clear indication when different widgets have different windows.

For incident investigation, preserve an absolute time window when sharing a link. “Last 30 minutes” should not silently become a different incident window when opened later.

### 11.4 URL and saved-state behavior
Meaningful dashboard state SHOULD be shareable:

- resource scope;
- time range;
- filters;
- search query;
- selected tab;
- comparison mode;
- optionally selected record.

Do not put secrets, raw customer PII, or sensitive queries into URLs.

### 11.5 Saved views
Saved views are useful when users repeatedly apply the same scope, filters, sort, columns, and grouping.

Specify:

- private versus shared;
- owner;
- default view;
- permission to edit shared views;
- behavior when fields are removed;
- whether the view includes time range;
- last updated and usage.

### 11.6 Filter result states
Distinguish:

- no records exist;
- records exist but no filters match;
- the user lacks access;
- data is still loading;
- the query failed;
- the source is delayed.

A filtered-empty state SHOULD show active filters and a direct clear or edit action.

---
