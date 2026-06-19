# Agent Execution Algorithm
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 22. Agent execution algorithm
The agent SHOULD follow this algorithm.

### Step 1: identify the job
Write one sentence:

> `[User] needs to [decision/action] within [time] using [scope/data], because [consequence].`

### Step 2: classify the surface
Choose:

- decision horizon;
- primary archetype;
- secondary archetype, if necessary;
- dashboard, report, explorer, workbench, resource detail, settings, wizard, or audit.

### Step 3: model the domain
List:

- entities;
- relationships;
- states;
- events;
- metrics;
- actions;
- permissions;
- risk levels;
- data sources and freshness.

### Step 4: rank information
Use this score:

```text
priority = decision_relevance × urgency × confidence × actionability
```

This is a prioritization aid, not a literal requirement to compute a number.

Remove information that does not change a decision or establish trust.

### Step 5: choose the structure
Map the primary task:

|Task|Structure|
|---|---|
|Monitor state|Command center or overview|
|Process items|Queue/workbench|
|Compare resources|Fleet table|
|Operate one resource|Resource detail|
|Diagnose|Investigation workspace|
|Configure|Full-page form or configuration hub|
|Create safely|Wizard + review|
|Prove history|Audit timeline|
|Review outcomes|Scorecard/report|

### Step 6: define drill-downs
For every summary, answer:

- What detail opens?
- Is scope preserved?
- Is time preserved?
- Is the next action available?
- Can the user return without losing state?

### Step 7: define forms and actions
For every mutation:

- container;
- validation;
- permission;
- impact;
- confirmation strength;
- reversibility;
- progress model;
- audit event;
- partial-failure behavior.

### Step 8: enumerate states
At page and component level:

- initial loading;
- refresh;
- first-use empty;
- filtered empty;
- stale;
- partial;
- error;
- no permission;
- saving;
- conflict;
- job running;
- success;
- partial success;
- failure.

### Step 9: design responsive priority
Create an explicit narrow-screen order. Do not rely on automatic wrapping alone.

### Step 10: audit accessibility and safety
Check:

- keyboard/focus;
- labels/errors;
- color-independent status;
- target size;
- chart alternatives;
- exact scope;
- least privilege;
- secrets;
- production safety;
- auditability.

### Step 11: output implementation-ready detail
The output MUST specify:

- page hierarchy;
- component inventory;
- data contract;
- actions and states;
- responsive behavior;
- accessibility notes;
- analytics/telemetry for UX success;
- open assumptions.

---
