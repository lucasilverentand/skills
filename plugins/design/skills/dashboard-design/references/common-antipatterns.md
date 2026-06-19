# Common Dashboard Anti-Patterns
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 25. Common anti-patterns

### 25.1 The KPI wall
**Symptom:** Many equally sized cards with numbers and arrows.

**Why it fails:** No decision hierarchy, no causal context, no obvious action.

**Fix:** Keep only decision-driving KPIs, group by outcome, add target/context, and link to exceptions or detail.

### 25.2 The chart zoo
**Symptom:** A donut, gauge, treemap, radar chart, and area chart on one page.

**Why it fails:** Visual novelty replaces comparability.

**Fix:** Use a small chart vocabulary and choose by question.

### 25.3 Every page is called a dashboard
**Symptom:** Settings forms, raw logs, and queues are forced into card grids.

**Why it fails:** The structure conflicts with the task.

**Fix:** Name and design the surface as a workbench, explorer, detail page, settings page, or wizard.

### 25.4 Hidden scope
**Symptom:** The user cannot tell whether data is production, staging, one region, or all tenants.

**Why it fails:** Decisions and actions can be dangerously misapplied.

**Fix:** Keep scope in the header/context bar and repeat it for consequential actions.

### 25.5 Green because data stopped
**Symptom:** Monitoring silence appears healthy.

**Why it fails:** Missing evidence is treated as evidence of health.

**Fix:** Use unknown/stale status with last successful update.

### 25.6 Auto-refresh chaos
**Symptom:** Rows reorder while the user is clicking; charts reset zoom; a selected item disappears.

**Why it fails:** Live data destroys task continuity.

**Fix:** Stabilize selection and sorting, buffer updates, and preserve user state.

### 25.7 Modal as default form container
**Symptom:** A large settings form or rule builder is placed in a modal.

**Why it fails:** Poor space, weak navigation, fragile error handling, and lost context.

**Fix:** Use a drawer for moderate contextual editing or a full page/wizard for complex work.

### 25.8 Placeholder-only forms
**Symptom:** Inputs are unlabeled once typing begins.

**Why it fails:** Users lose context and assistive technology support suffers.

**Fix:** Persistent labels, helper text, and explicit units.

### 25.9 Switches that secretly submit
**Symptom:** A switch appears to change immediately but actually requires a hidden Save button, or changes a critical setting instantly.

**Why it fails:** The control’s behavioral model is unclear.

**Fix:** Use switches for immediate, independent state only when safe; otherwise use a checkbox or explicit form save.

### 25.10 Confirmation fatigue
**Symptom:** Every trivial action opens “Are you sure?”

**Why it fails:** Users click through automatically and miss genuinely dangerous confirmations.

**Fix:** Use undo for reversible actions and reserve strong confirmation for real risk.

### 25.11 Destructive action as a red primary button
**Symptom:** “Delete database” is the most prominent action on the page.

**Why it fails:** Visual hierarchy encourages the wrong action.

**Fix:** Separate destructive actions and reveal them through an appropriate risk flow.

### 25.12 Permission theater
**Symptom:** Buttons are hidden in the UI, but the backend accepts unauthorized requests.

**Why it fails:** UI is not an authorization boundary.

**Fix:** Enforce authorization for every request and treat UI behavior as explanation, not protection.

### 25.13 “No data” for every failure
**Symptom:** Empty, permission, delayed, and failed states look identical.

**Why it fails:** Users cannot diagnose or recover.

**Fix:** Model and message each state separately.

### 25.14 Metrics without contracts
**Symptom:** Two dashboards show different “resolution time” values.

**Why it fails:** Definitions, exclusions, windows, or timezones differ.

**Fix:** Central metric definitions with source, owner, and freshness.

### 25.15 Action without verification
**Symptom:** The user restarts, rolls back, or changes a setting, but the UI only says “Success.”

**Why it fails:** Request acceptance is confused with operational outcome.

**Fix:** Show job result and post-action health verification.

---
