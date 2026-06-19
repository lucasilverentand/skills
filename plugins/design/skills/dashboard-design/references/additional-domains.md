# Additional Dashboard Domains
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 20. Additional dashboard possibilities

### 20.1 Security operations
Primary archetypes: command center + investigation + queue.

Show:

- active detections by severity and confidence;
- affected assets/users;
- investigation status and owner;
- attack timeline;
- correlated events;
- containment actions;
- evidence preservation;
- false-positive and suppression workflow;
- audit trail.

Avoid severity-only sorting. Include confidence, blast radius, asset criticality, and recency.

### 20.2 Access and identity administration
Primary archetypes: fleet + resource detail + configuration.

Show:

- users, groups, service accounts;
- roles and effective permissions;
- inherited access;
- privileged access;
- stale accounts/keys;
- last activity;
- pending access reviews;
- audit events.

Permission changes SHOULD have before/after diff and effective-access preview.

### 20.3 Billing, cost, and usage
Primary archetypes: tactical scorecard + analytical drill-down.

Show:

- current spend;
- forecast;
- budget/threshold;
- cost by product/team/environment;
- usage drivers;
- anomalies;
- commitments/credits;
- invoices;
- optimization opportunities with confidence and trade-offs.

Always distinguish actual, estimated, forecast, and invoiced amounts.

### 20.4 Product analytics and growth
Primary archetypes: scorecard + explorer.

Show:

- activation;
- retention/cohorts;
- funnel conversion;
- feature adoption;
- engagement frequency;
- experiment results;
- segment comparison;
- data-quality coverage.

Do not combine incomparable cohorts or hide experiment uncertainty behind a green badge.

### 20.5 Content and moderation
Primary archetypes: queue/workbench + audit.

Show:

- content preview;
- policy category;
- model score and reasons;
- reporter context;
- user history where permitted;
- severity and reach;
- decision actions;
- appeal status;
- reviewer notes;
- policy version;
- audit trail.

The interface SHOULD distinguish model suggestion from policy decision and human judgment.

### 20.6 Commerce and fulfillment
Primary archetypes: operational monitor + queue + resource detail.

Show:

- order backlog;
- payment failures;
- inventory risk;
- fulfillment exceptions;
- carrier delays;
- returns/refunds;
- customer impact;
- margin/cost context.

Actionable exceptions should link to the affected order, customer, warehouse, or payment attempt.

### 20.7 AI/ML and agent operations
Primary archetypes: monitor + investigation + review queue.

Show:

- request volume;
- latency;
- error rate;
- token/compute cost;
- model/version distribution;
- quality/evaluation score;
- safety-policy events;
- tool-call success;
- fallback/escalation rate;
- human review outcomes;
- drift and data coverage;
- trace of model, prompt, tools, and final action.

MUST distinguish:

- measured quality from proxy metrics;
- offline evaluation from production behavior;
- model error from tool/integration error;
- suggestion from autonomous action;
- raw user content from redacted evaluation data.

### 20.8 Internal administration
Examples:

- employee/service desk;
- procurement;
- finance operations;
- compliance evidence;
- project portfolio;
- facilities;
- asset management.

Choose archetypes according to the job. A finance close process is a workflow/queue; an executive finance view is a scorecard; expense investigation is a table/detail workbench.

---
