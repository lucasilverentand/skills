# Actions, States, and Safety
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 13. Actions, feedback, and long-running operations

### 13.1 Action hierarchy
Use:

- one primary action per task area;
- secondary actions for useful alternatives;
- tertiary/link actions for navigation or low-emphasis operations;
- a separated danger action for destructive operations.

Button text SHOULD name the result:

- “Create database”
- “Roll back to v2.14.3”
- “Assign 12 conversations”
- “Save routing rule”

Avoid vague labels such as “Submit,” “OK,” or “Proceed” when a specific result is known.

### 13.2 Feedback placement
|Feedback type|Best location|
|---|---|
|Field validation|At the field, plus summary when needed|
|Section-level failure|Within the affected section|
|Whole-page outage or permission issue|Banner near page top|
|Successful small reversible action|Toast with undo|
|Background job started|Toast plus durable jobs center|
|Persistent degraded state|Inline status/banner, not a transient toast|
|Destructive result|Dedicated result state with recovery information|

### 13.3 Optimistic updates
Use optimistic UI only when:

- success is highly likely;
- rollback is safe;
- conflict risk is low;
- the UI can clearly revert on failure.

Do not optimistically claim completion for:

- database creation;
- access-policy propagation;
- deployment;
- backup restore;
- bulk mutation across many records;
- external integration setup.

For these, acknowledge that the operation started and show durable progress.

### 13.4 Long-running job model
Every long-running operation SHOULD have:

```yaml
job:
  id: job_01J...
  type: database_restore
  target: db-prod-eu-2
  initiated_by: user_123
  started_at: 2026-06-19T10:41:00+02:00
  state: running
  progress:
    percent: 64
    phase: applying_wal
  cancellable: false
  logs_url: /jobs/job_01J/logs
  result_url: null
```

UI requirements:

- persistent job center or activity drawer;
- queued/running/succeeded/failed/cancelled states;
- current phase, not a fake percentage when progress is unknowable;
- start time and elapsed time;
- target resource;
- initiator;
- cancellation rules;
- logs or diagnostic detail;
- retry only when safe and idempotent;
- final result and next action.

### 13.5 Partial success
Bulk and distributed actions may partially succeed.

Never summarize partial success as simply “Done.” Show:

```text
Change completed for 87 of 100 databases.
10 were skipped because they already used the target version.
3 failed because maintenance windows were locked.

[View failed items] [Download results] [Retry eligible failures]
```

### 13.6 Real-time updates
Live updates MUST not:

- steal focus;
- close a menu or dialog;
- clear input;
- reset scroll;
- reorder the row being acted on;
- replace a user-selected time range;
- silently change the active record.

Buffer or visually mark incoming items when necessary. Let the user apply a refresh deliberately during detailed work.

---

## 14. Empty, loading, stale, error, and partial states
Empty states are not one condition. Carbon identifies empty states as moments when there is no data, including first use, deletion, or unavailability.[^carbon-empty]

### 14.1 State matrix
|State|Meaning|Required response|
|---|---|---|
|**First use**|Nothing has been created|Explain value and provide creation/onboarding action|
|**Valid empty**|Zero items is expected|Confirm the good or neutral state|
|**Filtered empty**|Data exists, current filters match none|Show filters and clear/edit action|
|**No permission**|Data may exist but user cannot view it|Explain required role or request-access path|
|**Not configured**|Data source or integration missing|Explain setup and consequences|
|**Loading**|Request is pending|Preserve layout and context|
|**Delayed/stale**|Last result is old|Retain last known data, mark stale, explain|
|**Partial**|Some sources or regions succeeded|Show coverage and affected scope|
|**Error**|Request failed|Explain what failed, preserve context, offer retry|
|**Unsupported**|Feature does not apply|Explain why; avoid a generic blank state|

### 14.2 Loading
Use skeletons when the final layout is known. Use a spinner for small isolated actions or when structure is not yet available.

For dashboard loading:

- render the page shell immediately;
- load independent panels independently;
- avoid blocking the entire page for one slow widget;
- preserve prior data during refresh when safe;
- display a subtle refresh state rather than replacing all content with skeletons.

### 14.3 Error messages
A useful error says:

- what failed;
- which scope is affected;
- whether existing data is retained;
- whether the action may have partially applied;
- what the user can do;
- how to obtain a support/debug identifier.

Bad:

> Something went wrong.

Better:

> Query results could not be loaded for `production / eu-west` after 10:41. The chart still shows data through 10:40. Retry, change the time range, or open diagnostics with request ID `req_83F2`.

### 14.4 Unknown is not healthy
If monitoring stops, the interface MUST not show green because no errors arrived. Use an unknown/stale state.

---

## 15. Permissions, safety, secrets, and auditability
Operational dashboards are security-sensitive control planes. Visual permission checks are not sufficient; authorization must be enforced on every request. OWASP recommends least privilege, deny-by-default behavior, and permission validation for every request.[^owasp-authz]

### 15.1 Role model
A useful baseline:

|Role|Typical capability|
|---|---|
|**Viewer**|Read status, metrics, logs permitted by scope|
|**Operator**|Acknowledge, assign, retry, restart, execute approved runbooks|
|**Editor**|Change non-critical configuration|
|**Admin**|Manage resources, access, and high-impact configuration|
|**Security admin**|Access policies, secrets, audit, security controls|
|**Billing admin**|Plans, invoices, budgets, payment methods|
|**Owner**|Organization-wide destructive and ownership actions|

Real products may use attributes and relationships in addition to roles—for example environment, team ownership, region, tenant, and resource sensitivity.

### 15.2 Hide versus disable
- **Hide** an action when revealing it adds no value or would leak sensitive capability.
- **Disable with explanation** when seeing the action helps the user understand the workflow or request access.
- **Show read-only state** when the user needs visibility into effective configuration.

Never imply that a disabled button is the only enforcement mechanism.

### 15.3 Production safety
For production-changing pages:

- display an environment badge in the header;
- repeat environment and target in confirmations;
- visually distinguish production without relying only on color;
- prevent accidental scope changes during an open form;
- require fresh permission evaluation on submit;
- support maintenance windows or approvals where appropriate;
- log actor, target, before/after, source, and result.

### 15.4 Impersonation and support access
If staff may impersonate a customer or tenant:

- display a persistent impersonation banner;
- show the real actor and impersonated identity;
- limit duration and scope;
- require a reason;
- prohibit or elevate highly sensitive actions;
- log every action as both identities;
- provide an obvious exit.

### 15.5 Audit log requirements
Audit events SHOULD include:

- immutable event ID;
- actor and authentication context;
- action;
- target type and ID;
- organization/environment scope;
- timestamp and timezone;
- request source/IP where appropriate;
- before/after values with secrets redacted;
- reason, ticket, or approval reference;
- result and error;
- correlation/request ID.

---
