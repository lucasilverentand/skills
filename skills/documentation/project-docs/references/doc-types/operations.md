# Doc Type: Operations (`docs/operations.md`)

```markdown
# Operations

## Health checks
Endpoints or commands to verify the service is healthy.

## Monitoring
What's monitored, where dashboards live, key metrics to watch.

## Alerts
What alerts exist, what they mean, and what to do when they fire.

## Logging
Where logs go, how to access them, how to search for specific events.

## Runbooks
For each common operational scenario:
- **Symptom** — what you see
- **Diagnosis** — how to investigate
- **Resolution** — step-by-step fix
- **Prevention** — how to avoid it next time

## Incident response
Who to contact, escalation path, how to communicate status.

## Scaling
How to scale the service up/down. Auto-scaling policies if they exist.
```

**Guidance:**
- Runbooks should be written for someone woken up at 3am — clear, step-by-step, no ambiguity
- Link to actual dashboard URLs, not just "check the dashboard"
- Incident response should include contact methods, not just names
