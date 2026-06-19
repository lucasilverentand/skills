# Domain Blueprint: Application Operations
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 17. Domain blueprint: application operations
Application operations combines monitoring, alerting, investigation, deployment, and mitigation. OpenTelemetry organizes observability around signals such as metrics, traces, and logs, with context used to correlate them.[^otel-signals] Google SRE recommends that service dashboards answer basic service questions and prominently cover latency, traffic, errors, and saturation—the four golden signals.[^google-sre-monitoring]

### 17.1 Product-area information architecture
```text
Apps
├─ Overview
├─ Services
├─ Deployments
├─ Incidents
├─ Alerts
├─ Logs
├─ Traces
├─ Metrics / Explore
├─ Jobs / Queues
└─ Settings
```

### 17.2 Operations home
Primary users: on-call engineers and service owners.

Recommended structure:

```text
Production · All regions · Live                 Last update 10:42:11

[1 active incident: Checkout failures in EU] [Open incident]

[Availability] [Error rate] [p95 latency] [Traffic] [Saturation]

Service health
[Service | Status | SLO burn | Error rate | p95 | Last deploy | Owner]

Recent changes                    Alerts needing action
[Deployments / config / flags]    [Severity / age / service / status]
```

MUST include:

- customer-impact status;
- active incidents;
- SLO/SLI status where available;
- recent changes;
- actionable alerts;
- scope and freshness;
- direct links to evidence.

### 17.3 Service detail
Header:

```text
checkout-api  Degraded
Production · eu-west · Team Commerce
Version v2.14.3 · deployed 34 min ago
[Open incident] [View logs] [Roll back] [More]
```

Overview sections:

1. SLO and error-budget status.
2. Golden signals.
3. Dependency health.
4. Recent deployments/config changes.
5. Active alerts and incidents.
6. Top errors or endpoints.
7. Runbooks and owner/contact.

Use data links that preserve service, labels, and time range when moving from a chart to detail. Grafana explicitly supports data links/actions that carry variables such as labels and time range.[^grafana-data-links]

### 17.4 Alert UX
An alert row SHOULD show:

- severity;
- state: firing, pending, acknowledged, resolved, silenced;
- customer impact or SLO relevance;
- service/resource;
- start time and duration;
- current value and threshold;
- owner/on-call route;
- related incident;
- recent correlated change;
- primary next action.

Alert detail SHOULD include:

- plain-language condition;
- query and evaluation window;
- no-data/error behavior;
- firing instances;
- notification history;
- runbook;
- linked dashboard with preserved context;
- silence/acknowledge rules;
- change history.

Most dashboards SHOULD be reachable from alerts, and browsing should be guided by links rather than requiring users to guess where to look.[^grafana-best-practices]

### 17.5 Incident workspace
```text
SEV-1 · Checkout failures in EU        [Change status] [Add responder]
Started 10:17 · Commander Sam · Customer impact confirmed

[Summary] [Timeline] [Evidence] [Responders] [Postmortem]

Current impact / hypothesis / mitigation

Timeline ---------------------- | Actions / runbook
10:17 alert fired               | [Roll back v2.14.3]
10:20 incident opened           | [Disable feature flag]
10:24 deploy correlated         | [Post status update]

Metrics / logs / traces with incident time window
```

MUST:

- preserve a shared incident time window;
- show ownership and current status;
- distinguish fact, hypothesis, and action;
- record timeline events automatically and manually;
- link changes to outcomes;
- make customer communication status visible;
- preserve evidence after resolution.

### 17.6 Deployment dashboard
Fleet/list fields:

- app/service;
- environment;
- version/commit;
- actor/source pipeline;
- started/finished;
- rollout stage;
- health checks;
- affected regions/instances;
- current status;
- rollback eligibility.

Deployment detail:

- artifact and commit diff;
- rollout plan;
- health gates;
- logs;
- related alerts/incidents;
- previous version;
- pause/resume/rollback actions;
- audit trail.

Do not label a deployment “successful” solely because the pipeline ended. Distinguish technical completion from post-deploy health.

### 17.7 Logs, traces, and metrics
Provide correlation paths:

- metric spike → exemplars/traces or scoped logs;
- trace → related logs and service metrics;
- log record → trace ID, deployment, host/container, customer/tenant when permitted;
- incident → all signals with shared time/scope.

Traces represent the path of a request through an application; correlated context allows signals to be connected across distributed components.[^otel-traces][^otel-context]

### 17.8 Jobs and queues
Show:

- queue depth;
- oldest item age;
- throughput;
- success/failure rate;
- retry/dead-letter counts;
- worker saturation;
- estimated drain time;
- top failure reasons;
- affected tenants.

Prefer outcome and work metrics over a page dominated by CPU/memory. Resource metrics are supporting evidence unless capacity is the immediate problem.

---
