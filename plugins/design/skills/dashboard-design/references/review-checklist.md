# Dashboard Review Checklist
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 24. Review checklist

### 24.1 Purpose and architecture
- [ ] The primary user and job are explicit.
- [ ] The decision horizon is explicit.
- [ ] The page has one primary archetype.
- [ ] A dashboard is actually the right surface.
- [ ] Global scope is visually distinct from local filters.
- [ ] Drill-downs preserve valid scope, time, and filters.
- [ ] Navigation reflects the user’s domain model.

### 24.2 Information hierarchy
- [ ] Urgent exceptions appear before lower-priority detail.
- [ ] The primary action is obvious.
- [ ] Metrics have definitions, units, windows, and comparisons.
- [ ] Status includes text and handles unknown/stale data.
- [ ] Data freshness is visible.
- [ ] No panel exists only to fill space.

### 24.3 Charts
- [ ] Each chart answers a stated question.
- [ ] Chart type matches the comparison.
- [ ] Axes, units, scope, and time are clear.
- [ ] Missing/partial data is not disguised.
- [ ] Color is not the only encoding.
- [ ] Critical data has a textual or tabular alternative.
- [ ] Events are annotated where they help diagnosis.

### 24.4 Tables and queues
- [ ] Default sort matches urgency or task.
- [ ] Identity, status, and primary comparison fields are visible.
- [ ] Row navigation and checkbox selection are distinct.
- [ ] Bulk actions show count, scope, and partial results.
- [ ] Filters are visible and clearable.
- [ ] Empty states distinguish no data, no match, no access, and error.
- [ ] Live updates do not destabilize user interaction.

### 24.5 Forms
- [ ] The form container matches complexity, context, and risk.
- [ ] Labels are persistent and specific.
- [ ] Fields are grouped by user concept.
- [ ] Defaults are safe and transparent.
- [ ] Units and valid ranges are visible.
- [ ] Errors explain how to recover and preserve input.
- [ ] Save behavior is consistent.
- [ ] Unsaved changes and conflicts are handled.
- [ ] Consequential actions have review and appropriate confirmation.
- [ ] Secrets are never repopulated or exposed.

### 24.6 Actions and jobs
- [ ] Action labels state the result.
- [ ] Permission is enforced server-side.
- [ ] Production target and environment are repeated for risky actions.
- [ ] Long-running actions have durable job status.
- [ ] Partial success is represented honestly.
- [ ] Retry and cancellation semantics are defined.
- [ ] Audit events contain actor, target, time, result, and safe diff.

### 24.7 Accessibility and responsive behavior
- [ ] Keyboard order and focus behavior are specified.
- [ ] Targets meet minimum size/spacing requirements.
- [ ] Forms have labels, instructions, and text errors.
- [ ] Status does not depend only on color.
- [ ] Tables and charts have accessible alternatives.
- [ ] Narrow-screen priority is explicit.
- [ ] Primary-detail becomes a usable single-pane flow on mobile.
- [ ] Timezone, locale, and long translated labels are supported.

### 24.8 Trust and safety
- [ ] Unknown data is not shown as healthy or zero.
- [ ] Estimates and forecasts are labeled.
- [ ] Sensitive data is redacted by role and context.
- [ ] Destructive actions expose impact and recovery options.
- [ ] Impersonation/support access is persistent and audited.
- [ ] High-risk changes support approval or reauthentication where required.

---
