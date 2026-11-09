# Runbooks
Use for: on-call playbooks, deployment and rollback procedures, escalation paths, troubleshooting trees and recovery procedures. The reader is interrupted and under pressure, so every step must work exactly as written.

## Gather first
- **Trigger:** the alert (name, condition, link to its definition), reported symptom or scheduled operation. Write one runbook per trigger or procedure; link related ones instead of merging them.
- **Real operating facts:** commands, queries, dashboards, consoles, environments, thresholds and escalation routes, taken from code, configuration, existing docs or the people who operate the system. Never invent one. Mark anything you could not confirm as unverified and return it to the lead.
- **Risk:** the access each step needs, its blast radius, and whether it can be undone.

## Structure
1. **Summary:** what the runbook covers, when to use it, user impact and severity.
2. **Before you start:** required access and tools, plus a safety check that the reader is in the right environment.
3. **Diagnose:** symptom → check → what the result means. Branch on what the reader observes. With more than two branches, use a decision table, or a Mermaid flowchart if the destination renders it.
4. **Remediate:** numbered steps with one action each. Give the exact command with placeholders such as `<SERVICE_NAME>`, the expected output and how long to wait.
5. **Verify recovery:** the metric, health check or query that proves the system is healthy again.
6. **Roll back or stop:** how to undo each risky step, and the point at which to stop and escalate.
7. **Escalate:** when, to whom (by role or rotation) and through which channel.
8. **References:** alert definition, dashboards, owning team, related runbooks.

## Rules
- Write imperative steps, not narrative. Put each warning before the step it applies to.
- Before any destructive or irreversible step, name the blast radius and add a check to confirm it.
- Commands run as pasted once the marked placeholders are replaced; say where each value comes from. Don't include shell prompts, and state the environment explicitly.
- Reference the secret store or access process; never paste secrets, tokens or personal contact details.
- Record owner and last-verified date in the destination's native fields when it has them. Do not impose a footer the destination lacks.
- Deployment procedures add pre-checks, a post-deploy verification and an explicit rollback trigger.

## Check before handing back
- Every diagnosis branch ends in recovery, rollback or escalation, with no dead ends.
- Run read-only diagnostics only where the brief permits. Never run remediation or destructive steps to test them unless explicitly authorized. Report which steps were executed, which were only read, and which remain unverified.
- Someone new to the system could follow it without asking the author. For a consequential runbook, ask the lead for an independent read under the review rules in SKILL.md.

## Boundaries
Document the procedure as it exists. Label suggested procedure, alert or infrastructure changes as proposals and return them to the lead; do not make them while writing. Save the runbook in the project's operating-procedure home ([knowledge-and-planning.md](../knowledge-and-planning.md)), and update an existing runbook rather than creating a parallel one.
