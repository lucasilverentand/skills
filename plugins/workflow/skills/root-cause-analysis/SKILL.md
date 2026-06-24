---
name: root-cause-analysis
description: Investigates incidents, failures, regressions, production issues, flaky behavior, surprising test results, and unexpected outcomes to identify the most likely root cause from evidence. Use when the user asks for RCA, root cause, incident analysis, why something failed, contributing factors, corrective actions, prevention, or a concise post-incident causal analysis.
---

# Root Cause Analysis
Use this skill to explain why a problem happened and what should change so it is less likely to happen again.

## Investigation rules
- Start from observed facts, not theories.
- Separate confirmed evidence, assumptions, missing data, symptoms, contributing factors, and root cause.
- Prefer the simplest causal chain that explains all known facts.
- Do not blame people. Identify system, process, tooling, dependency, design, or communication failures.
- If evidence is incomplete, say exactly what is unknown and what would resolve it.

## Workflow
1. **Problem**
   - State what happened, where, when, impact, and current status.
2. **Evidence**
   - Gather logs, metrics, traces, commits, deploys, config changes, alerts, test output, user reports, and reproduction steps.
   - Mark each item as confirmed, inferred, or missing.
3. **Causal chain**
   - Connect symptoms to immediate causes, then repeatedly ask why until the chain reaches a durable underlying cause.
   - Consider code behavior, data shape, dependency behavior, environment, deployment, monitoring, ownership, and process.
4. **Root cause**
   - Name the most likely root cause and explain why competing explanations are less likely.
   - Include contributing factors only when they materially increased likelihood or impact.
5. **Corrective actions**
   - Separate short-term mitigation from long-term prevention.
   - Recommend tests, monitors, alerts, docs, ownership changes, deployment safeguards, or design changes when they address the cause.

## Output format
Use this compact structure unless the user requests another format:

1. Problem
2. Evidence
3. Contributing factors
4. Root cause
5. Corrective actions
6. Prevention
