# Metrics, Status, and Charts
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 8. Metrics, status, and data trust

### 8.1 Metric contract
Every metric used in a product SHOULD have a contract:

```yaml
metric:
  id: support.first_response_time.p50
  label: Median first response time
  definition: >
    Median elapsed business time from conversation creation to the first
    human or qualifying automated response.
  unit: minutes
  aggregation: p50
  window: rolling_24_hours
  comparison: previous_equivalent_period
  filters:
    - inbox
    - channel
    - priority
  exclusions:
    - spam
    - test_conversations
  source: support_warehouse
  expected_lag: 15_minutes
  owner: support_analytics
```

Without a definition, users will infer one. Different teams often infer different ones.

### 8.2 KPI card anatomy
A useful KPI card may contain:

```text
Metric label                    Status or info
Current value + unit
Delta + comparison basis
Small trend or target progress
Window · scope · freshness
```

MUST:

- show the unit;
- state the comparison basis for a delta;
- identify the time window;
- distinguish zero from missing;
- expose a definition;
- link to detail when the number can be investigated.

SHOULD:

- show target or threshold when one exists;
- show directionality only when “higher” or “lower” is truly better;
- avoid presenting excessive precision;
- use consistent formatting for the same metric across the product.

Avoid:

- a percentage with no denominator or definition;
- a green upward arrow when an increase is actually bad;
- “+12%” with no baseline;
- a sparkline with no time window;
- a large number chosen because it looks impressive rather than because it changes a decision.

### 8.3 Status model
Use a small, documented vocabulary. A useful operational set is:

|State|Meaning|Expected treatment|
|---|---|---|
|**Healthy**|Operating within expected bounds|Neutral-positive; no urgent action|
|**Degraded**|Service continues with reduced quality or elevated risk|Explain impact and next step|
|**Critical**|Active or imminent severe impact|Prominent, actionable, owned|
|**Maintenance**|Intentional service change or limited availability|Show window and owner|
|**Paused / disabled**|Deliberately not operating|Do not classify as healthy|
|**Unknown**|No trustworthy current signal|Show missing/stale reason|

Status indicators help users notice changes and prioritized issues, but they must be chosen for context and communicated consistently.[^carbon-status]

MUST:

- include a text label;
- not rely on red/green alone;
- define how the state is calculated;
- display unknown or stale states honestly;
- align aggregate status with child states according to a documented rule.

### 8.4 Freshness and staleness
Every live or near-live surface SHOULD expose:

- last successful update;
- expected update cadence;
- current refresh or streaming state;
- stale threshold;
- partial-source warnings;
- timezone.

Do not replace stale values with zero. Retain the last known value, mark it stale, and explain what is unavailable.

### 8.5 Data quality states
A metric may be:

- current;
- delayed;
- partial;
- sampled;
- estimated;
- backfilled;
- unavailable;
- invalid due to configuration;
- inaccessible due to permissions.

These states SHOULD be represented explicitly. A generic “No data” message hides operationally important distinctions.

### 8.6 Aggregation and scope
Always clarify:

- average versus percentile;
- sum versus rate;
- point-in-time versus cumulative;
- event time versus ingestion time;
- local versus global scope;
- timezone and business-hours behavior;
- whether retries, bots, tests, or internal traffic are included.

---

## 9. Charts and data visualization
A dashboard is not improved by maximizing chart variety. Nielsen Norman Group recommends basic charts—especially bars, lines, and scatterplots—for most UX contexts because chart choice should serve the question.[^nng-chart-types]

### 9.1 Chart-selection matrix
|User question|Preferred representation|Notes|
|---|---|---|
|What is the current value?|Number + context|Add target, window, and freshness|
|How has it changed over time?|Line chart|Use consistent interval and annotate events|
|Which category is larger?|Horizontal bar chart|Sort meaningfully; start quantitative bars at zero|
|How do two periods compare?|Paired bars or two lines|State exact comparison periods|
|How is a total composed?|Stacked bar|Use a table when precise values matter|
|What is the distribution?|Histogram, box plot, percentile table|Avoid reducing skewed data to an average|
|Are two variables related?|Scatterplot|Include units and sample size|
|Where are values geographically located?|Map only when location matters|Provide a table/list alternative|
|What is the state across many resources?|Status table, heatmap, matrix|Text labels and accessible detail required|
|What is the sequence of events?|Timeline|Preserve exact timestamps|
|What is the hierarchy?|Tree, indented list, sunburst only for expert analysis|Prefer navigable structures over decorative treemaps|
|Which records need action?|Table or queue|Do not turn actionable records into a chart|

### 9.2 Chart anatomy
A chart SHOULD include the elements necessary to interpret it:[^carbon-chart]

- clear title that states the measure;
- optional subtitle with scope or question;
- axes and units;
- legend when direct labels are not possible;
- tooltip or accessible detail;
- time range;
- source/freshness when relevant;
- annotation for deployments, incidents, campaigns, policy changes, or other causal candidates.

### 9.3 Visual hierarchy
Use visual prominence for:

1. urgent exceptions;
2. the primary outcome;
3. meaningful comparisons;
4. supporting context.

Do not make every chart equal-sized. Equal size suggests equal importance.

### 9.4 Color
Use color to communicate a defined semantic or to distinguish a small number of series.

MUST:

- pair status color with text, icon, pattern, or position;
- maintain sufficient contrast;
- use the same semantic color for the same meaning;
- include hover, focus, selected, disabled, and high-contrast states;
- avoid a rainbow palette for ordered data.

SHOULD:

- reserve strong status colors for status;
- use neutral colors for context;
- direct-label series where possible;
- provide a non-chart table or textual summary for critical data.

### 9.5 Scales and baselines
- Bar charts SHOULD generally start at zero because length encodes value.
- Line charts MAY use a non-zero baseline when the range is made explicit and the design is not misleading.
- Log scales MUST be labeled clearly.
- Dual axes SHOULD be avoided unless the relationship is essential and unmistakable.
- Threshold bands MUST explain who set the threshold and what it means.
- Percentages SHOULD state the denominator when ambiguity is possible.

### 9.6 Missing and partial data
Do not draw a continuous line across a period with missing data unless interpolation is deliberate and disclosed.

Use:

- gaps;
- dashed estimated segments;
- shaded incomplete windows;
- explicit “data delayed” annotation;
- coverage percentage.

### 9.7 Chart interaction
Interactions MAY include:

- hover and keyboard-focus details;
- click-to-filter;
- click-to-drill down;
- brushing a time window;
- zoom;
- compare mode;
- event overlays;
- open raw records.

Every interaction SHOULD have a visible affordance. Hover-only behavior is insufficient for touch and keyboard users.

### 9.8 Avoid these visualization choices
- 3D charts;
- gauges used for ordinary percentages;
- many small donuts;
- pie charts with many slices;
- treemaps chosen for visual novelty;
- unlabeled sparklines used as evidence;
- red/green-only heatmaps;
- charts where a sorted table would answer the question faster;
- animated transitions that delay urgent understanding.

---
