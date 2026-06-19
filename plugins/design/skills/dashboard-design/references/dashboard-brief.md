# Dashboard Brief
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 5. The dashboard brief an agent must create first
Before generating UI, the agent MUST produce a brief containing the following.

```yaml
dashboard_brief:
  name: "Production overview"
  primary_user: "On-call application engineer"
  secondary_users:
    - "Service owner"
    - "Support escalation engineer"

  primary_job: >
    Detect customer-impacting degradation, identify the affected service,
    and reach the correct investigation or mitigation action quickly.

  decisions:
    - "Is there active customer impact?"
    - "Which service, region, tenant, or release is involved?"
    - "Should I acknowledge, escalate, roll back, or investigate?"

  decision_horizon: "minutes"
  archetype: "monitor"
  secondary_archetype: "incident queue"

  scope_dimensions:
    - environment
    - region
    - service
    - tenant
  default_scope:
    environment: production
    region: all

  entities:
    - service
    - deployment
    - incident
    - alert
    - region

  freshness:
    target: "60 seconds"
    stale_after: "3 minutes"
    behavior_when_stale: "Show stale badge and retain last known values"

  key_metrics:
    - name: "Availability SLI"
      definition: "Successful eligible requests / all eligible requests"
      unit: "%"
      window: "rolling 30 days"
      comparison: "SLO target"

  critical_actions:
    - "Open incident"
    - "Acknowledge alert"
    - "Open runbook"
    - "View logs/traces"
    - "Roll back deployment"

  risk_level: "high"
  permissions:
    viewer: ["view"]
    operator: ["view", "acknowledge", "open_incident"]
    admin: ["view", "acknowledge", "open_incident", "rollback"]

  device_priority:
    desktop: "primary"
    mobile: "triage and acknowledgement only"

  success_criteria:
    - "A user can locate the highest-impact active issue within 10 seconds"
    - "Every alert has a clear investigation path"
    - "Production-changing actions show scope and impact before confirmation"
```

### 5.1 Required questions
The brief MUST answer:

- Who is using the surface?
- What recurring job are they doing?
- What decision will the information change?
- How quickly must they decide?
- What is the cost of a wrong action?
- What entities and relationships matter?
- Which scope is global and which is local?
- How fresh must the data be?
- What happens if data is missing or stale?
- What actions are allowed for each role?
- Which tasks must work on a narrow screen?
- How will success be measured?

If these answers are unknown, the agent SHOULD state assumptions explicitly rather than silently inventing them.

---
