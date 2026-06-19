# Research Basis and References
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 26. Research basis and references
This playbook combines established dashboard, enterprise-application, design-system, accessibility, observability, database, support, and security guidance. The sources below are starting points rather than substitutes for user research in the target product.

[^nng-dashboard]: Nielsen Norman Group, [Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/).

[^powerbi-dashboard]: Microsoft Learn, [Introduction to dashboards for Power BI designers](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards).

[^powerbi-design]: Microsoft Learn, [Tips for designing a great Power BI dashboard](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips).

[^qlik-types]: Qlik, [Dashboard Design: Best Practices and Dashboard Types](https://www.qlik.com/us/dashboard-examples/dashboard-design).

[^nng-chart-types]: Nielsen Norman Group, [Choosing Chart Types: Consider Context](https://www.nngroup.com/articles/choosing-chart-types/).

[^nng-tables]: Nielsen Norman Group, [Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/).

[^carbon-chart]: IBM Carbon Design System, [Chart anatomy](https://v10.carbondesignsystem.com/data-visualization/chart-anatomy/).

[^carbon-status]: IBM Carbon Design System, [Status indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/).

[^carbon-empty]: IBM Carbon Design System, [Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/).

[^carbon-forms]: IBM Carbon Design System, [Forms pattern](https://v10.carbondesignsystem.com/patterns/forms-pattern/).

[^patternfly-forms]: Red Hat PatternFly, [Form design guidelines](https://www.patternfly.org/components/forms/form/design-guidelines).

[^patternfly-primary-detail]: Red Hat PatternFly, [Primary-detail design guidelines](https://www.patternfly.org/patterns/primary-detail/design-guidelines).

[^patternfly-data-list]: Red Hat PatternFly, [Data list design guidelines](https://www.patternfly.org/components/data-list/design-guidelines).

[^govuk-question]: GOV.UK Design System, [Question pages](https://design-system.service.gov.uk/patterns/question-pages/).

[^govuk-check]: GOV.UK Design System, [Check answers](https://design-system.service.gov.uk/patterns/check-answers/).

[^wcag22]: W3C Web Accessibility Initiative, [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/).

[^wcag-forms]: W3C WAI, [Understanding error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) and [labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html).

[^wcag-target]: W3C WAI, [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

[^wcag-redundant]: W3C WAI, [Understanding Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html).

[^wcag-error-prevention]: W3C WAI, [Understanding Error Prevention (All)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html).

[^grafana-best-practices]: Grafana Labs, [Grafana dashboard best practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/).

[^grafana-data-links]: Grafana Labs, [Configure data links and actions](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-data-links/).

[^otel-signals]: OpenTelemetry, [Signals](https://opentelemetry.io/docs/concepts/signals/).

[^otel-traces]: OpenTelemetry, [Traces](https://opentelemetry.io/docs/concepts/signals/traces/).

[^otel-context]: OpenTelemetry, [Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/).

[^google-sre-monitoring]: Google, [Site Reliability Engineering — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/).

[^postgres-monitoring]: PostgreSQL Global Development Group, [Monitoring Database Activity](https://www.postgresql.org/docs/current/monitoring.html).

[^postgres-maintenance]: PostgreSQL Global Development Group, [Routine Database Maintenance Tasks](https://www.postgresql.org/docs/current/maintenance.html).

[^aws-rds-monitoring]: Amazon Web Services, [Monitoring metrics in an Amazon RDS instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_Monitoring.html).

[^aws-fleet]: Amazon Web Services, [Viewing the Fleet Health Dashboard for CloudWatch Database Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights-Fleet-Health-Dashboard.html).

[^zendesk-dashboard]: Zendesk, [Overview of the Zendesk Support dashboard](https://support.zendesk.com/hc/en-us/articles/4408835985434-Overview-of-the-Zendesk-Support-dashboard).

[^intercom-dashboard]: Intercom, [Real-time Dashboard](https://www.intercom.com/help/en/articles/5784131-real-time-dashboard) and [Monitoring team workload and capacity](https://www.intercom.com/help/en/articles/6560699-monitoring-your-team-s-workload-and-capacity).

[^owasp-authz]: OWASP Cheat Sheet Series, [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

---

## Compact rule set for an agent prompt
```text
Design the dashboard as a decision-and-action system, not a chart gallery.

1. Identify the primary user, recurring job, decision horizon, risk, scope,
   and successful next action.
2. Choose one primary archetype: monitor, queue/workbench, fleet,
   resource detail, investigation, configuration, wizard, scorecard, or audit.
3. Put identity, environment, status, urgent exceptions, and primary action
   before secondary analytics.
4. Give every metric a definition, unit, time window, comparison, scope,
   freshness, and missing-data behavior.
5. Use basic charts selected by the question; use tables for actionable records.
6. Preserve scope, time, filters, and list position across drill-downs.
7. Map forms to complexity, context, and risk. Use persistent labels,
   grouped sections, clear units, recovery-oriented errors, and explicit save behavior.
8. For high-risk actions, show target, impact, dependencies, reversibility,
   permission, review, confirmation, progress, and audit result.
9. Specify loading, empty, filtered-empty, stale, partial, permission,
   error, saving, conflict, success, and partial-success states.
10. Meet WCAG 2.2 AA, support keyboard and narrow screens, never rely on
    color alone, and never present missing telemetry as healthy.
```
