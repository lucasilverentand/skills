# Chaining Decision Trees

## When a single tree isn't enough

A single decision tree handles one decision well. But many real problems involve multiple decisions in sequence, where the answer to one changes the landscape for the next. Examples:

- **Incident response**: triage (what's broken?) → diagnosis (why is it broken?) → remediation (how do we fix it?) → verification (did the fix work?)
- **Architecture selection**: requirements gathering → technology evaluation → integration design → migration planning
- **Code review triage**: classify the change → assess risk → choose review depth → verify post-merge

Each of these has branching logic at every phase, and the phases build on each other. Stuffing them all into one tree either blows past the depth limit or produces a tree so wide it's unusable.

## Chain anatomy

A chain has three parts:

### 1. Chain overview

A numbered list of phases that shows the full flow at a glance. Placed above all the trees.

```markdown
## Incident response chain

1. **Triage** — classify severity and affected systems → produces: severity level, affected component
2. **Diagnosis** — identify root cause within the affected component → produces: root cause description
3. **Remediation** — apply the fix for the identified root cause → produces: fix applied, deploy status
4. **Verification** — confirm the fix resolved the incident → produces: all-clear or escalation
```

Each entry names the phase, describes what it does, and states what it **produces** — the context that carries forward to the next tree.

### 2. Individual trees

Each tree lives under its own heading and follows the standard format from `format.md`. Trees are numbered or named to match the overview.

### 3. Handoffs

Leaf actions that continue the chain use a `→ continue with` pattern:

```markdown
- **Pod is OOMKilled** → continue with **Diagnosis** — the affected component is the API pod, failure mode is OOM
```

The handoff includes:
- **Which tree to go to** — by name or number
- **What context to carry** — the conclusions from this tree that the next one needs

## Full example: deployment failure chain

### Chain overview

1. **Classify** — determine what kind of failure occurred → produces: failure category (build / rollout / post-deploy)
2. **Diagnose** — find the root cause within the failure category → produces: specific cause and evidence
3. **Fix** — apply the appropriate remediation → produces: fix applied
4. **Verify** — confirm the fix worked → produces: all-clear or loop back to Classify

---

### Tree 1: Classify

```markdown
- Did the deployment pipeline complete?
  - **No, it failed during the build stage** (CI logs show a build step failure before any deploy step ran)
    → continue with **Diagnose** — failure category: build
  - **No, it failed during rollout** (build succeeded, but pods/containers didn't reach healthy state)
    → continue with **Diagnose** — failure category: rollout
  - **Yes, deployment completed but something is wrong** (pipeline green, but alerts firing or user reports)
    → continue with **Diagnose** — failure category: post-deploy regression
  - **Not sure** → check the CI dashboard: `gh run list --limit 5`. If the latest run failed, check which step. If it passed, the failure is post-deploy.
```

### Tree 2: Diagnose

```markdown
- What is the failure category? (carried from Classify)
  - **Build failure** → what does the build log say?
    - **Dependency resolution error** (lockfile conflict, registry unreachable, version mismatch)
      → continue with **Fix** — cause: dependency resolution, evidence: [paste the error line]
    - **Compilation error** (type errors, syntax errors, missing imports)
      → continue with **Fix** — cause: compilation, evidence: [paste the error line]
    - **Resource limit** (OOM during build, disk full, timeout)
      → continue with **Fix** — cause: build resource limit, evidence: [paste the error line]
    - **Something else** → read the full log top-to-bottom, find the first error (cascading failures mislead)
  - **Rollout failure** → what's the pod status? Run `kubectl get pods -l app=<app>`
    - **CrashLoopBackOff** → check crash logs: `kubectl logs <pod> --previous`
      → continue with **Fix** — cause: application crash on startup, evidence: [paste crash output]
    - **Pending / Unschedulable** → check events: `kubectl describe pod <pod>`
      → continue with **Fix** — cause: scheduling failure, evidence: [paste events]
    - **Running but not Ready** → check health endpoint and readiness probe config
      → continue with **Fix** — cause: health check failure, evidence: [paste probe config and response]
  - **Post-deploy regression** → what symptoms are being reported?
    - **Error rate spike** → compare error logs before/after deploy: check the diff of deployed commits for likely culprits
      → continue with **Fix** — cause: code regression, evidence: [suspect commit + error pattern]
    - **Latency increase** → check resource utilization and recent query/API changes
      → continue with **Fix** — cause: performance regression, evidence: [metrics]
    - **Feature not working** → check feature flags and config for the deployed environment
      → continue with **Fix** — cause: configuration mismatch, evidence: [config diff]
```

### Tree 3: Fix

```markdown
- What is the cause? (carried from Diagnose)
  - **Dependency resolution** → run `bun install` locally. If it fails, fix the lockfile. If it passes locally, check if the CI environment has registry access. Push the fix.
    → continue with **Verify**
  - **Compilation** → run `bun run typecheck` locally, fix reported errors, push.
    → continue with **Verify**
  - **Build resource limit** → increase limits in CI config (memory/timeout), push.
    → continue with **Verify**
  - **Application crash on startup** → read the crash log. Fix the code or config that causes the crash, push.
    → continue with **Verify**
  - **Scheduling failure** → check cluster capacity. Either scale the node pool or reduce resource requests.
    → continue with **Verify**
  - **Health check failure** → fix the health endpoint or update the probe config to match the actual endpoint.
    → continue with **Verify**
  - **Code regression** → revert the suspect commit or fix forward. Push.
    → continue with **Verify**
  - **Performance regression** → profile the change, optimize or revert. Push.
    → continue with **Verify**
  - **Configuration mismatch** → sync environment config with expected values. Redeploy.
    → continue with **Verify**
```

### Tree 4: Verify

```markdown
- Did the fix deploy successfully? Check CI: `gh run list --limit 1`
  - **Yes, pipeline passed** → is the original symptom resolved?
    - **Yes** → all clear. Document the incident.
    - **No, same symptom** → the fix didn't address the root cause. Loop back to **Classify** with the additional context that the initial diagnosis was wrong.
    - **No, different symptom** → the fix may have introduced a new issue. Loop back to **Classify** for the new symptom.
  - **No, pipeline failed again** → is it the same failure?
    - **Yes, same error** → the fix was incomplete. Return to **Fix** with more context.
    - **No, different error** → the fix introduced a new build problem. Loop back to **Classify**.
```

## Chain patterns

### Linear chain

Most common. Each tree feeds into the next in order. The deployment example above is linear.

```
Classify → Diagnose → Fix → Verify
```

### Chain with loops

When verification can fail and loop back to an earlier phase. Include a loop limit to prevent infinite cycles — if you've looped back twice, escalate instead of continuing.

```
Classify → Diagnose → Fix → Verify
                              ↓ (if failed)
                         back to Classify (max 2 loops, then escalate)
```

### Branching chain

When different branches of one tree lead to entirely different follow-up trees rather than a single shared next phase.

```
Classify → Frontend issue → Frontend Diagnosis → Frontend Fix
         → Backend issue  → Backend Diagnosis  → Backend Fix
         → Infra issue    → Infra Diagnosis    → Infra Fix
```

Use branching chains when the phases are genuinely different across branches — different tools, different expertise, different verification. If the phases are structurally similar, use a single chain with branch conditions inside each tree instead.

### Converging chain

Multiple entry trees feed into a shared resolution tree. Useful when different triggers lead to the same resolution process.

```
Alert triage    →
Customer report → Shared Diagnosis → Fix → Verify
Monitoring flag →
```

## Writing handoffs

A handoff is the most critical part of a chain — it's where information can be lost. Every handoff must include:

1. **Destination** — which tree to continue with, by name
2. **Carry-forward context** — the specific conclusions from this tree. Not "see above" — state them explicitly. The next tree should be followable without scrolling back.
3. **Confidence level** (optional but valuable for agents) — "confident this is a dependency issue" vs. "likely a dependency issue but could be a registry problem". If confidence is low, the next tree should verify before acting.

Bad handoff:
```markdown
→ continue with Diagnosis
```

Good handoff:
```markdown
→ continue with **Diagnosis** — failure category: rollout, pod status: CrashLoopBackOff, namespace: production
```

## Agent behavior at handoffs

When an agent reaches a handoff:

1. **Pause and summarize** — before entering the next tree, restate the carry-forward context in its own words. This is a comprehension check — if the summary doesn't match the handoff, something was lost.
2. **Enter at the root** — always start the next tree from the top, even if the carry-forward context seems to shortcut some branches. The pro/con evaluation protocol still applies at every node.
3. **Reference prior conclusions** — when evaluating conditions in later trees, cite evidence from earlier trees. "This is a rollout failure (established in Classify)" rather than re-deriving it.
4. **Track loop count** — if the chain loops back, increment a counter. After 2 loops without resolution, stop and escalate to the user rather than looping indefinitely.
